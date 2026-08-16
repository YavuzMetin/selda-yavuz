const MAX_FILE_SIZE = 15 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])

function getCredential(name) {
  return String(process.env[name] || '').trim().replace(/^(['"])(.*)\1$/, '$2')
}

function send(response, status, body) {
  response.status(status).json(body)
}

async function readBody(request) {
  const chunks = []
  let size = 0

  for await (const chunk of request) {
    size += chunk.length
    if (size > MAX_FILE_SIZE) throw new Error('FILE_TOO_LARGE')
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

async function getAccessToken() {
  const clientId = getCredential('GOOGLE_CLIENT_ID')
  const clientSecret = getCredential('GOOGLE_CLIENT_SECRET')
  const refreshToken = getCredential('GOOGLE_REFRESH_TOKEN')
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const details = await response.json().catch(() => ({}))
    console.error('Google OAuth failed:', {
      status: response.status,
      error: details.error,
      description: details.error_description,
      credentialShape: {
        clientIdLength: clientId.length,
        clientIdHasExpectedSuffix: clientId.endsWith('.apps.googleusercontent.com'),
        clientSecretLength: clientSecret.length,
        clientSecretHasExpectedPrefix: clientSecret.startsWith('GOCSPX-'),
        refreshTokenLength: refreshToken.length,
      },
    })
    throw new Error(`GOOGLE_AUTH_FAILED:${details.error || response.status}`)
  }
  return (await response.json()).access_token
}

async function uploadToDrive(file, fileName, mimeType) {
  const accessToken = await getAccessToken()
  const boundary = `selda-yavuz-${crypto.randomUUID()}`
  const metadata = JSON.stringify({
    name: `${Date.now()}-${fileName}`,
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
  })
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    file,
    Buffer.from(`\r\n--${boundary}--`),
  ])

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': String(body.length),
    },
    body,
  })

  if (!response.ok) throw new Error('DRIVE_UPLOAD_FAILED')
  return response.json()
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return send(response, 405, { error: 'Method not allowed' })
  }

  const requiredVariables = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'GOOGLE_DRIVE_FOLDER_ID']
  if (requiredVariables.some((key) => !process.env[key])) {
    return send(response, 503, { error: 'Upload service is not configured' })
  }

  const mimeType = String(request.headers['content-type'] || '').split(';')[0].toLowerCase()
  if (!ALLOWED_TYPES.has(mimeType)) return send(response, 415, { error: 'Unsupported image type' })

  let fileName = 'fotograf.jpg'
  try {
    fileName = decodeURIComponent(String(request.headers['x-file-name'] || fileName))
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(-120)
    const file = await readBody(request)
    if (!file.length) return send(response, 400, { error: 'Empty file' })

    await uploadToDrive(file, fileName, mimeType)
    return send(response, 201, { ok: true })
  } catch (error) {
    if (error.message === 'FILE_TOO_LARGE') return send(response, 413, { error: 'File is too large' })
    console.error('Photo upload failed:', error.message)
    return send(response, 502, { error: 'Photo could not be uploaded' })
  }
}
