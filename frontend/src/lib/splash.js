// Splash di index.html tampil seketika saat situs dibuka. Ia keluar setelah dua syarat terpenuhi:
// 1. halaman sungguhan sudah tampil (tidak ada lagi kerangka loading), dan
// 2. logo sudah tampil utuh selama FULL_LOGO_MS (dihitung sejak logo selesai terbentuk).
const ASSEMBLE_MS = 1260 // pembentukan logo di index.html (lapisan + segel)
const ASSEMBLE_REDUCED_MS = 240 // versi prefers-reduced-motion: logo cukup memudar
const FULL_LOGO_MS = 1000
// Fase keluar di index.html: logo mengecil (460 ms), latar terbuka melingkar mulai 220 ms selama 680 ms.
const EXIT_MS = 900
const FALLBACK_MS = 8000 // jaga-jaga: jangan pernah menahan pengguna lebih lama dari ini
const LOADING = '[aria-label="Memeriksa sesi"], [aria-label="Memuat halaman"]'

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

let hidden = false

function exit(el) {
  el.classList.add('is-hiding')
  // Elemen dihapus setelah keluar: semua animasi (termasuk yang berulang) ikut berhenti.
  setTimeout(() => el.remove(), reduceMotion() ? 220 : EXIT_MS + 40)
}

/** Tunggu sampai logo utuh sudah tampil FULL_LOGO_MS, lalu keluar. */
function hide({ force = false } = {}) {
  if (hidden) return
  const el = document.getElementById('splash')
  if (!el) return

  const readyAt = Number(el.dataset.readyAt)
  if (!readyAt && !force) {
    // Gambar logo belum siap: tunggu rangkaian dimulai dulu.
    const observer = new MutationObserver(() => {
      if (el.dataset.readyAt) { observer.disconnect(); hide() }
    })
    observer.observe(el, { attributes: true, attributeFilter: ['data-ready-at'] })
    return
  }

  hidden = true
  const fullAt = readyAt + (reduceMotion() ? ASSEMBLE_REDUCED_MS : ASSEMBLE_MS) + FULL_LOGO_MS
  const wait = force || !readyAt ? 0 : Math.max(0, fullAt - performance.now())
  setTimeout(() => exit(el), wait)
}

/** Pantau isi #root; keluarkan splash begitu halaman sungguhan sudah dirender. */
export function hideSplashWhenReady() {
  const root = document.getElementById('root')
  if (!root || !document.getElementById('splash')) return

  const ready = () => root.childElementCount > 0 && !root.querySelector(LOADING)
  const observer = new MutationObserver(() => {
    if (ready()) { observer.disconnect(); hide() }
  })
  observer.observe(root, { childList: true, subtree: true })
  setTimeout(() => { observer.disconnect(); hide({ force: true }) }, FALLBACK_MS)
}
