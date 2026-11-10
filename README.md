# Lorenzo Concas – App

Showcase delle mie app. Vue 3 + Vite + Tailwind CSS 4 + [Vue Bits](https://vue-bits.dev), pre-renderizzato (vite-ssg) e pubblicato su GitHub Pages.

```sh
npm install
npm run dev       # sviluppo locale: http://localhost:5173
npm run build     # build statica in dist/ (base /products/)
npm run preview   # anteprima della build: http://localhost:4173/products/
```

- Dati delle app: `src/data/apps.ts`
- Testi delle privacy policy: `src/content/privacy/`
- Componenti Vue Bits (copiati nel progetto): `src/components/vuebits/`
- File statici serviti così come sono (MiniTV Web, APK, playlist): `public/`
- Script di utilità (non pubblicati): `tools/`

Deploy: GitHub Actions (`.github/workflows/deploy.yml`) a ogni push su `main`.
Su GitHub: Settings → Pages → Source → **GitHub Actions**.
Per un dominio personalizzato: `BASE_PATH=/ npm run build`.
