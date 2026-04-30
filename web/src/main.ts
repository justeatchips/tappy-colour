import './styles/global.css'
import { injectFonts } from './util/fonts'
import { Router } from './router'
import { ArtworkStore } from './model/ArtworkStore'

injectFonts()

const app = document.getElementById('app')!
const store = new ArtworkStore()

window.addEventListener('tappy-storage-error', (event) => {
  const detail = (event as CustomEvent<{ message?: string }>).detail
  const toast = document.createElement('div')
  toast.textContent = detail?.message ?? 'Could not save your latest progress.'
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--tc-ink-black);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 999;
    max-width: 90vw;
    text-align: center;
  `
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 3500)
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + 'service-worker.js')
      .catch(err => console.warn('SW registration failed:', err))
  })
}

const router = new Router(app, store)
router.start()
