import React, { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

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
            <span className="reveal-piece reveal-piece--bouquet" aria-hidden="true">
              <img src="/wedding-bouquet.png" alt="" />
            </span>
            <span className="reveal-piece reveal-piece--photo" aria-hidden="true">
              <img src="/6F1B7121.jpg" alt="" />
            </span>
            <span className="invitation-card">
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
          {isOpen ? <><span>Aşağı kaydır</span><i aria-hidden="true">⌄</i></> : 'Zarfı açmak için dokun'}
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
              <span>Konum bilgisi</span><i aria-hidden="true">⌄</i>
            </button>
          </section>

          <section className="location-page" id="location">
            <div className="location-block">
            <p className="kicker">Buluşma noktası</p>
            <h3>Düğün Mekânı</h3>
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
              <span aria-hidden="true">◇</span> Yol Tarifi Al
            </a>
            </div>

            <footer><span>Selda</span><i>&amp;</i><span>Yavuz</span><small>26 · 09 · 2026</small></footer>
          </section>
        </>
      )}
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode><Invitation /></StrictMode>,
)
