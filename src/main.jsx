import React, { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const PHOTO_UPLOAD_URL = import.meta.env.VITE_PHOTO_UPLOAD_URL || '/api/photos'
const MAX_UPLOAD_SIZE = 4 * 1024 * 1024
const MAX_SOURCE_SIZE = 15 * 1024 * 1024
const MAX_IMAGE_EDGE = 3000
const MAX_PHOTO_COUNT = 25
const SUCCESS_VISIBLE_MS = 4000

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('IMAGE_COMPRESSION_FAILED'))),
      'image/jpeg',
      quality,
    )
  })
}

async function compressPhoto(file) {
  if (file.size <= MAX_UPLOAD_SIZE) return file

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  let scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height))
  let quality = 0.9

  try {
    while (scale >= 0.35) {
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      const context = canvas.getContext('2d')
      context.fillStyle = '#fff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

      const blob = await canvasToBlob(canvas, quality)
      if (blob.size <= MAX_UPLOAD_SIZE) {
        const name = file.name.replace(/\.[^.]+$/, '') || 'fotograf'
        return new File([blob], `${name}.jpg`, { type: 'image/jpeg', lastModified: file.lastModified })
      }

      if (quality > 0.62) quality -= 0.08
      else scale *= 0.82
    }
  } finally {
    bitmap.close()
  }

  throw new Error('IMAGE_TOO_LARGE_AFTER_COMPRESSION')
}

const invitation = {
  bride: 'Selda',
  groom: 'Yavuz',
  date: '26 Eylül 2026',
  time: '19.00',
  venue: 'İstanbul',
}

const weddingDate = new Date('2026-09-26T19:00:00+03:00')

function getTimeLeft() {
  const distance = Math.max(0, weddingDate.getTime() - Date.now())
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  }
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const units = [
    ['Gün', timeLeft.days],
    ['Saat', timeLeft.hours],
    ['Dakika', timeLeft.minutes],
    ['Saniye', timeLeft.seconds],
  ]

  return (
    <div className="countdown" aria-label="Düğüne kalan süre" role="timer">
      {units.map(([label, value]) => (
        <div className="countdown-unit" key={label}>
          <strong>{String(value).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

function Invitation() {
  const [isOpen, setIsOpen] = useState(false)
  const concealedEnvelopeContentStyle = isOpen ? undefined : { visibility: 'hidden', opacity: 0 }

  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (event) => event.key === 'Escape' && setIsOpen(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return (
    <main className={`invitation-page${isOpen ? ' is-open' : ''}`}>
      <div className="paper-noise" aria-hidden="true" />
      <section className="envelope-hero">
        <div className="botanical botanical--left" aria-hidden="true">❧</div>
        <div className="botanical botanical--right" aria-hidden="true">❧</div>

        <header className="intro">
          <p className="kicker">Birlikte yazacağımız hikâyeye</p>
          <h1>Davetlisiniz</h1>
        </header>

        <button
          className="envelope-scene"
          type="button"
          aria-label={isOpen ? 'Davetiyeyi kapat' : 'Davetiyeyi aç'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
        >
          <span className="envelope-shadow" aria-hidden="true" />
          <span className="envelope">
            <span className="reveal-piece reveal-piece--bouquet" aria-hidden="true" style={concealedEnvelopeContentStyle}>
              <img src="/wedding-bouquet.png" alt="" />
            </span>
            <span className="reveal-piece reveal-piece--photo reveal-piece--photo-top" aria-hidden="true" style={concealedEnvelopeContentStyle}>
              <img src="/2.jpg" alt="" />
            </span>
            <span className="reveal-piece reveal-piece--photo reveal-piece--photo-left" aria-hidden="true" style={concealedEnvelopeContentStyle}>
              <img src="/1.jpg" alt="" />
            </span>
            <span className="reveal-piece reveal-piece--photo reveal-piece--photo-right" aria-hidden="true" style={concealedEnvelopeContentStyle}>
              <img src="/3.jpg" alt="" />
            </span>
            <span className="invitation-card" style={concealedEnvelopeContentStyle}>
              <span className="card-art" aria-hidden="true" />
              <span className="card-content">
                <span className="card-overline">Düğün Davetiyesi</span>
                <span className="names">
                  <i>{invitation.bride}</i>
                  <b>&amp;</b>
                  <i>{invitation.groom}</i>
                </span>
                <span className="card-copy">Bu mutlu günümüzde<br />sizleri de aramızda görmekten<br />onur duyarız.</span>
                <span className="card-rule" aria-hidden="true">✦</span>
                <span className="date">{invitation.date}</span>
                <span className="details">Saat {invitation.time}<br />{invitation.venue}</span>
              </span>
            </span>
            <span className="envelope-back" aria-hidden="true" />
            <span className="envelope-pocket" aria-hidden="true" />
            <span className="envelope-flap" aria-hidden="true" />
            <span className="wax-seal" aria-hidden="true"><i>S</i><b>&amp;</b><i>Y</i></span>
          </span>
        </button>

        <button
          className="after-note"
          type="button"
          disabled={!isOpen}
          onClick={() => document.querySelector('#wedding-details')?.scrollIntoView({ behavior: 'smooth' })}
        >
          {isOpen ? <><span>Detaylar için kaydır</span><i aria-hidden="true">⌄</i></> : 'Zarfı açmak için dokun'}
        </button>
      </section>

      {isOpen && (
        <>
          <section className="wedding-details" id="wedding-details">
            <div className="section-flower" aria-hidden="true">✦</div>
            <p className="kicker">O güne geri sayım</p>
            <h2>Mutluluğumuza<br /><i>çok az kaldı</i></h2>
            <Countdown />

            <div className="detail-label"><i /><span>Tarih</span><i /></div>
            <div className="event-card">
              <p className="event-date"><span>26</span><b>Eylül</b><small>2026 · Cumartesi</small></p>
              <div className="event-divider" aria-hidden="true" />
              <p className="event-time"><span>19.00</span><small>Düğün Töreni</small></p>
            </div>

            <a className="photo-share-card" href="/photos">
              <span aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M4 6.5h3l1.4-2h7.2l1.4 2h3v12H4z" /><circle cx="12" cy="12.5" r="3.5" /></svg>
              </span>
              <div><small>Sizin gözünüzden</small><strong>Düğün fotoğraflarını paylaş</strong></div>
              <i aria-hidden="true">→</i>
            </a>

            <div className="detail-label detail-label--address"><i /><span>Adres</span><i /></div>
            <div className="venue-note">
              <strong>Onur Kır Bahçesi</strong>
              <p>Yakupköy, Köyaltı Mevkii No:204 10185,<br />10100 Altıeylül - Balıkesir</p>
            </div>

            <button
              className="page-cue"
              type="button"
              onClick={() => document.querySelector('#location')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Konum için kaydır</span><i aria-hidden="true">⌄</i>
            </button>
          </section>

          <section className="location-page" id="location">
            <div className="location-block">
            <p className="kicker">Buluşma noktası</p>
            <h3>Bu Güzel Günün Konumu</h3>
            <p>Yol tarifi ve konum bilgisi için haritayı açabilirsiniz.</p>
            <a
              className="map-preview"
              href="https://maps.app.goo.gl/JE2YZW8E69W2DB379"
              target="_blank"
              rel="noreferrer"
              aria-label="Düğün mekânını Google Maps'te aç"
            >
              <svg viewBox="0 0 420 240" preserveAspectRatio="none" aria-hidden="true">
                <path d="M-20 48 C56 28 75 98 132 72 S218 15 269 56 358 105 442 56" />
                <path d="M-18 190 C48 153 91 219 154 178 S238 124 292 164 375 220 445 170" />
                <path d="M70-15 C92 50 43 91 91 129 S134 207 112 258" />
                <path d="M332-20 C296 42 350 87 318 126 S290 203 342 262" />
              </svg>
              <span className="map-green map-green--one" aria-hidden="true" />
              <span className="map-green map-green--two" aria-hidden="true" />
              <span className="map-pin" aria-hidden="true"><i /></span>
              <span className="map-action" aria-hidden="true">➤</span>
              <small>Google Maps</small>
            </a>
            <a className="directions-button" href="https://maps.app.goo.gl/JE2YZW8E69W2DB379" target="_blank" rel="noreferrer">
              <span aria-hidden="true">➤</span> Yol Tarifi Al
            </a>
            </div>

            <footer><span>Selda</span><i>&amp;</i><span>Yavuz</span><small>26 · 09 · 2026</small></footer>
          </section>
        </>
      )}
    </main>
  )
}

function Photos() {
  const [photos, setPhotos] = useState([])
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState({ uploaded: 0, total: 0 })
  const photosRef = useRef(photos)
  const cleanupTimersRef = useRef([])

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => () => {
    cleanupTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.preview))
  }, [])

  useEffect(() => {
    if (status !== 'uploading') return undefined
    const warnBeforeLeaving = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [status])

  function removeUploadedPhoto(id) {
    setPhotos((current) => {
      const uploaded = current.find((photo) => photo.id === id && photo.uploadStatus === 'success')
      if (!uploaded) return current
      URL.revokeObjectURL(uploaded.preview)
      return current.filter((photo) => photo.id !== id)
    })
  }

  function scheduleUploadedPhotoCleanup(id) {
    const timer = window.setTimeout(() => removeUploadedPhoto(id), SUCCESS_VISIBLE_MS)
    cleanupTimersRef.current.push(timer)
  }

  function addPhotos(event) {
    const selected = Array.from(event.target.files || [])
    event.target.value = ''

    if (!selected.length) return
    if (photos.length + selected.length > MAX_PHOTO_COUNT) {
      setMessage(`Tek seferde en fazla ${MAX_PHOTO_COUNT} fotoğraf ekleyebilirsiniz.`)
      return
    }

    const invalid = selected.find((file) => !file.type.startsWith('image/') || file.size > MAX_SOURCE_SIZE)
    if (invalid) {
      setMessage('Fotoğraflar JPG, PNG veya HEIC olmalı ve her biri 15 MB’tan küçük olmalı.')
      return
    }

    setMessage('')
    setStatus('idle')
    setProgress({ uploaded: 0, total: 0 })
    setPhotos((current) => [
      ...current,
      ...selected.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        uploadStatus: 'pending',
        uploadNote: file.size > MAX_UPLOAD_SIZE ? 'Yüklemeden önce küçültülecek' : 'Yüklemeye hazır',
      })),
    ])
  }

  function removePhoto(id) {
    setPhotos((current) => {
      const removed = current.find((photo) => photo.id === id)
      if (removed) URL.revokeObjectURL(removed.preview)
      return current.filter((photo) => photo.id !== id)
    })
  }

  async function uploadPhotos() {
    const waitingPhotos = photos.filter((photo) => photo.uploadStatus !== 'success')
    if (!waitingPhotos.length) return
    if (!PHOTO_UPLOAD_URL) {
      setStatus('error')
      setMessage('Yükleme bağlantısı henüz yapılandırılmadı.')
      return
    }

    setStatus('uploading')
    setMessage('Fotoğraflarınız sırayla yükleniyor…')
    setProgress({ uploaded: 0, total: waitingPhotos.length })
    let failedCount = 0

    for (const photo of waitingPhotos) {
      try {
        const needsCompression = photo.file.size > MAX_UPLOAD_SIZE
        setPhotos((current) => current.map((item) => (
          item.id === photo.id
            ? { ...item, uploadStatus: needsCompression ? 'preparing' : 'uploading', uploadNote: needsCompression ? 'Fotoğraf küçültülüyor…' : 'Yükleniyor…' }
            : item
        )))

        const file = await compressPhoto(photo.file)
        setPhotos((current) => current.map((item) => (
          item.id === photo.id ? { ...item, uploadStatus: 'uploading', uploadNote: 'Yükleniyor…' } : item
        )))

        const response = await fetch(PHOTO_UPLOAD_URL, {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
            'X-File-Name': encodeURIComponent(file.name),
          },
          body: file,
        })
        if (!response.ok) throw new Error('Upload failed')
        setPhotos((current) => current.map((item) => (
          item.id === photo.id ? { ...item, uploadStatus: 'success', uploadNote: 'Yüklendi' } : item
        )))
        setProgress((current) => ({ ...current, uploaded: current.uploaded + 1 }))
        scheduleUploadedPhotoCleanup(photo.id)
      } catch {
        failedCount += 1
        setPhotos((current) => current.map((item) => (
          item.id === photo.id ? { ...item, uploadStatus: 'error', uploadNote: 'Yüklenemedi · Tekrar deneyin' } : item
        )))
      }
    }

    if (failedCount === 0) {
      setStatus('success')
      setMessage('Teşekkürler! Fotoğraflarınız bize ulaştı.')
    } else {
      setStatus('error')
      setMessage(`${failedCount} fotoğraf yüklenemedi. Yalnızca başarısız olanları tekrar deneyebilirsiniz.`)
    }
  }

  const waitingCount = photos.filter((photo) => photo.uploadStatus !== 'success').length

  return (
    <main className="photos-page">
      <div className="photos-noise" aria-hidden="true" />
      <section className="photos-card">
        <p className="kicker">Anılarımızı birlikte biriktirelim</p>
        <h1>Gözünüzden<br /><i>bizim hikâyemiz</i></h1>
        <p className="photos-intro">Bu güzel günden yakaladığınız kareleri bizimle paylaşın. Yüklediğiniz fotoğrafları yalnızca Selda ve Yavuz görebilir.</p>

        <div className="photo-actions">
          <label className={`photo-action photo-action--camera${status === 'uploading' ? ' photo-action--disabled' : ''}`}>
            <span className="photo-action-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M4 6.5h3l1.4-2h7.2l1.4 2h3v12H4z" /><circle cx="12" cy="12.5" r="3.5" /></svg>
            </span>
            <strong>Fotoğraf Çek</strong>
            <small>Kameranı aç</small>
            <input type="file" accept="image/*" capture="environment" disabled={status === 'uploading'} onChange={addPhotos} />
          </label>
          <label className={`photo-action${status === 'uploading' ? ' photo-action--disabled' : ''}`}>
            <span className="photo-action-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="1.5" /><circle cx="14.5" cy="9.5" r="1.5" /><path d="m6 17 4-4 3 3 2-2 3 3" /><path d="M3 8v11a2 2 0 0 0 2 2h11" /></svg>
            </span>
            <strong>Galeriden Seç</strong>
            <small>En fazla 25 fotoğraf</small>
            <input type="file" accept="image/*,.heic,.heif" multiple disabled={status === 'uploading'} onChange={addPhotos} />
          </label>
        </div>

        {photos.length > 0 && (
          <div className="photo-selection">
            <div className="selection-heading"><strong>Seçilenler</strong><span>{photos.length}/{MAX_PHOTO_COUNT}</span></div>
            <div className="photo-grid">
              {photos.map((photo) => (
                <figure key={photo.id}>
                  <img src={photo.preview} alt="Yüklenecek fotoğraf önizlemesi" />
                  <span className={`photo-status photo-status--${photo.uploadStatus}`} aria-label={photo.uploadNote}>
                    {photo.uploadStatus === 'success' ? '✓' : photo.uploadStatus === 'error' ? '!' : photo.uploadStatus === 'pending' ? '' : '···'}
                  </span>
                  <figcaption>{photo.uploadNote}</figcaption>
                  {photo.uploadStatus !== 'success' && (
                    <button type="button" disabled={status === 'uploading'} onClick={() => removePhoto(photo.id)} aria-label="Fotoğrafı kaldır">×</button>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}

        {progress.total > 0 && (
          <div className="upload-progress" role="progressbar" aria-valuemin="0" aria-valuemax={progress.total} aria-valuenow={progress.uploaded}>
            <div><strong>{progress.uploaded} / {progress.total} yüklendi</strong><span>{Math.round((progress.uploaded / progress.total) * 100)}%</span></div>
            <i><span style={{ width: `${(progress.uploaded / progress.total) * 100}%` }} /></i>
          </div>
        )}

        {message && <p className={`upload-message upload-message--${status}`} role="status">{message}</p>}
        <button className={`upload-button${waitingCount ? ' upload-button--ready' : ''}`} type="button" disabled={!waitingCount || status === 'uploading'} onClick={uploadPhotos}>
          {status === 'uploading' ? 'Sırayla yükleniyor…' : waitingCount ? `Fotoğrafları Gönder (${waitingCount})` : 'Tüm fotoğraflar yüklendi'}
        </button>
        <p className="privacy-note"><span aria-hidden="true">♢</span> Fotoğraflar herkese açık bir galeride yayınlanmaz.</p>
      </section>
    </main>
  )
}

function App() {
  return window.location.pathname.replace(/\/$/, '') === '/photos' ? <Photos /> : <Invitation />
}

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>,
)
