import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

function App() {
  return (
    <main className="love-page">
      <div className="glow glow--one" />
      <div className="glow glow--two" />

      <div className="floating-hearts" aria-hidden="true">
        <span>♥</span>
        <span>♥</span>
        <span>♥</span>
        <span>♥</span>
        <span>♥</span>
        <span>♥</span>
      </div>

      <section className="love-card" aria-labelledby="love-title">
        <div className="heart-badge" aria-hidden="true">
          <span>♥</span>
        </div>
        <p className="eyebrow">Sonsuza kadar seninle</p>
        <h1 id="love-title">
          Seloşum,
          <span>seni çok seviyorum</span>
        </h1>
        <div className="divider" aria-hidden="true">
          <i />
          <span>♥</span>
          <i />
        </div>
        <p className="note">
          İyi ki varsın, iyi ki hayatımdasın.
          <br />
          Her günüm seninle daha güzel.
        </p>
        <p className="signature">Yavuz’dan, tüm kalbiyle</p>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
