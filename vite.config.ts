import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages (project site): https://<user>.github.io/products/
// In sviluppo la base è "/", in produzione "/products/" (la build Flutter di MiniTV Web la richiede).
export default defineConfig(({ command }) => ({
  base: command === 'serve' && !process.argv.includes('preview') ? '/' : (process.env.BASE_PATH ?? '/products/'),
  plugins: [vue(), tailwindcss()],
  ssgOptions: { script: 'async', formatting: 'minify', dirStyle: 'nested' },
}))
