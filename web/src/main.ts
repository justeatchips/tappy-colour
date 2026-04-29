import './styles/global.css'
import { injectFonts } from './util/fonts'
import { Router } from './router'
import { ArtworkStore } from './model/ArtworkStore'

injectFonts()

const app = document.getElementById('app')!
const store = new ArtworkStore()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + 'service-worker.js')
      .catch(err => console.warn('SW registration failed:', err))
  })
}

const router = new Router(app, store)
router.start()
