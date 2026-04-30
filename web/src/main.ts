import './styles/global.css'
import { injectFonts } from './util/fonts'
import { Router } from './router'
import { ArtworkStore } from './model/ArtworkStore'
import { createToast } from './ui/pixel'

injectFonts()

const app = document.getElementById('app')!
const store = new ArtworkStore()

window.addEventListener('tappy-storage-error', (event) => {
  const detail = (event as CustomEvent<{ message?: string }>).detail
  const toast = createToast(detail?.message ?? 'Could not save your latest progress.')
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
