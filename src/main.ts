import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'
import './style.css'

export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
    scrollBehavior(to, from, saved) {
      if (saved) return saved
      if (to.hash && !to.hash.startsWith('#privacy-')) return { el: to.hash, top: 80, behavior: 'smooth' }
      if (to.path !== from.path) return { top: 0 }
    },
  },
)
