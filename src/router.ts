import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('./views/HomeView.vue') },
  { path: '/minitv', component: () => import('./views/AppView.vue'), props: { slug: 'minitv' } },
  { path: '/minitv/playlists', component: () => import('./views/MiniTvPlaylistsView.vue') },
  { path: '/minitv/crea-playlist', component: () => import('./views/MiniTvCreatePlaylistView.vue') },
  { path: '/racemap', component: () => import('./views/AppView.vue'), props: { slug: 'racemap' } },
  { path: '/curalink', component: () => import('./views/AppView.vue'), props: { slug: 'curalink' } },
  { path: '/spese-immobili', component: () => import('./views/AppView.vue'), props: { slug: 'spese-immobili' } },
  { path: '/404', component: () => import('./views/NotFoundView.vue') },
  { path: '/:pathMatch(.*)*', component: () => import('./views/NotFoundView.vue') },
]
