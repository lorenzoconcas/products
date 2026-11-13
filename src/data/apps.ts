import minitvIcon from '../assets/apps/minitv.png'
import racemapIcon from '../assets/apps/racemap.png'
import curalinkIcon from '../assets/apps/curalink.png'
import speseIcon from '../assets/apps/spese-immobili.png'

import minitvPrivacy from '../content/privacy/minitv.html?raw'
import racemapPrivacy from '../content/privacy/racemap.html?raw'
import curalinkPrivacy from '../content/privacy/curalink.html?raw'
import spesePrivacyIt from '../content/privacy/spese-immobili.it.html?raw'
import spesePrivacyEn from '../content/privacy/spese-immobili.en.html?raw'
import spesePrivacyFr from '../content/privacy/spese-immobili.fr.html?raw'
import spesePrivacyDe from '../content/privacy/spese-immobili.de.html?raw'
import spesePrivacyEs from '../content/privacy/spese-immobili.es.html?raw'
import spesePrivacyPt from '../content/privacy/spese-immobili.pt.html?raw'

export const CONTACT_EMAIL = 'lore.appstore@outlook.com'
const base = import.meta.env.BASE_URL

export type StoreKind = 'ios' | 'mac' | 'apk' | 'web'

export interface Store { kind: StoreKind; href: string }
export interface PrivacyDoc { lang: string; label: string; heading: string; html: string }

export interface AppInfo {
  slug: string
  name: string
  title: string
  summary: string // card in home
  lead: string // pagina app
  icon: string
  color: string
  platforms: string[]
  version?: string
  features: { title: string; text: string }[]
  stores: Store[]
  notes: string[]
  privacy: PrivacyDoc[]
  homeLinks: { label: string; href: string; external?: boolean }[]
}

export const apps: AppInfo[] = [
  {
    slug: 'minitv',
    name: 'MiniTV',
    title: 'MiniTV – Player per radio e video in streaming per iOS, macOS e Android',
    summary: "Player leggero per radio e video in streaming. Aggiungi le tue playlist e organizza i canali in una griglia pulita e veloce.",
    lead: "Aggiungi le tue playlist M3U/M3U8 o JSON, organizza i canali a modo tuo e guarda in modo fluido con un'interfaccia pulita e veloce.",
    icon: minitvIcon,
    color: '#ef4d44',
    platforms: ['iOS', 'macOS', 'Android', 'Web'],
    version: '2.0',
    features: [
      { title: 'Import facile', text: 'Supporto a URL remoti e file locali. Riconosce M3U/M3U8 e il formato JSON.' },
      { title: 'Riproduzione stabile', text: 'Player di sistema con VLC come alternativa automatica, passaggio rapido tra canali.' },
      { title: 'I canali a modo tuo', text: 'Schede con logo e colori, ordine alfabetico, manuale o per gruppo; puoi personalizzare o nascondere ogni canale.' },
    ],
    stores: [
      { kind: 'ios', href: 'https://apps.apple.com/it/app/minitv/id6751760709' },
      { kind: 'mac', href: 'https://apps.apple.com/it/app/minitv/id6751760709' },
    ],
    notes: [
      "Nota: l'app non include canali preinstallati. Usa solo sorgenti di cui possiedi i diritti di visione/redistribuzione.",
    ],
    privacy: [{ lang: 'it', label: 'Italiano', heading: 'Privacy Policy', html: minitvPrivacy }],
    homeLinks: [{ label: 'App Store', href: 'https://apps.apple.com/it/app/minitv/id6751760709', external: true }],
  },
  {
    slug: 'racemap',
    name: 'RaceMap',
    title: 'RaceMap – App Formula 1 per iOS ed Apple Watch',
    summary: 'Calendario, classifiche piloti e costruttori della Formula 1, anche su Apple Watch.',
    lead: 'Segui tutte le gare di Formula 1 con calendario completo, classifiche piloti e costruttori aggiornate in tempo reale.',
    icon: racemapIcon,
    color: '#e5484d',
    platforms: ['iOS', 'Apple Watch'],
    version: '1.0.0',
    features: [
      { title: 'Calendario completo', text: 'Date ufficiali, orari delle sessioni e dettagli di ogni Gran Premio.' },
      { title: 'Classifiche aggiornate', text: 'Piloti e costruttori con punti, vittorie e posizione in tempo reale.' },
      { title: 'Supporto Apple Watch', text: 'Consulta rapidamente le informazioni principali direttamente dal polso.' },
    ],
    stores: [{ kind: 'ios', href: 'https://apps.apple.com/it/app/racemap/id6753078610' }],
    notes: ["Nota: l’app fornisce esclusivamente informazioni pubbliche relative al campionato di Formula 1."],
    privacy: [{ lang: 'it', label: 'Italiano', heading: 'Privacy Policy', html: racemapPrivacy }],
    homeLinks: [{ label: 'App Store', href: 'https://apps.apple.com/it/app/racemap/id6753078610', external: true }],
  },
  {
    slug: 'curalink',
    name: 'CuraLink',
    title: 'CuraLink – Comunica col tuo medico',
    summary: 'Prepara in pochi secondi le richieste di farmaci e terapie da inviare al tuo medico. I dati restano sul dispositivo.',
    lead: 'CuraLink aiuta a preparare messaggi da inviare al proprio medico riguardo farmaci e terapie, mantenendo tutti i dati esclusivamente sul dispositivo.',
    icon: curalinkIcon,
    color: '#3b9cf0',
    platforms: ['iOS'],
    version: '1.0.0',
    features: [
      { title: 'Messaggi pronti in pochi secondi', text: 'Organizza i farmaci e prepara facilmente richieste da inviare al medico.' },
      { title: 'Privacy totale', text: 'Tutti i dati rimangono salvati esclusivamente sul dispositivo.' },
      { title: 'Invio tramite le tue app preferite', text: 'CuraLink prepara il messaggio e lo invia tramite email o app di messaggistica già presenti sul dispositivo.' },
    ],
    stores: [{ kind: 'ios', href: 'https://apps.apple.com/it/app/curalink/id6766103993' }],
    notes: ["Nota: CuraLink non fornisce consigli medici, diagnosi o prescrizioni. L'app aiuta esclusivamente a preparare messaggi destinati al proprio medico."],
    privacy: [{ lang: 'it', label: 'Italiano', heading: 'Privacy Policy', html: curalinkPrivacy }],
    homeLinks: [{ label: 'App Store', href: 'https://apps.apple.com/it/app/curalink/id6766103993', external: true }],
  },
  {
    slug: 'spese-immobili',
    name: 'Spese Immobili',
    title: 'Spese Immobili – Spese e quote di immobili in comproprietà',
    summary: 'Spese, quote e vendita di immobili in comproprietà: chi ha pagato, chi deve cosa a chi e come dividere il ricavato.',
    lead: 'Spese, quote e vendita di immobili in comproprietà: chi ha pagato, chi deve soldi a chi e come dividere il prezzo di vendita tra i proprietari.',
    icon: speseIcon,
    color: '#3aa384',
    platforms: ['Web', 'iOS e Android in arrivo'],
    features: [
      { title: 'Funziona anche senza account', text: 'Senza accedere, i dati restano esclusivamente sul tuo dispositivo.' },
      { title: 'Sincronizzazione e condivisione facoltative', text: 'Con l’accesso Google puoi usare più dispositivi e condividere una casa con altre persone, in modifica o sola lettura.' },
      { title: 'I tuoi dati, sotto il tuo controllo', text: "Puoi esportarli e, dall'app, eliminare l'account con tutti i dati nel cloud." },
    ],
    stores: [{ kind: 'web', href: 'https://estate-expense-manager.web.app' }],
    notes: [
      'Presto in arrivo anche per iOS e Android.',
      'Nota: i calcoli sono indicativi e non sono consulenza legale, fiscale o professionale.',
    ],
    privacy: [
      { lang: 'it', label: 'Italiano', heading: 'Privacy Policy', html: spesePrivacyIt },
      { lang: 'en', label: 'English', heading: 'Privacy Policy', html: spesePrivacyEn },
      { lang: 'fr', label: 'Français', heading: 'Politique de confidentialité', html: spesePrivacyFr },
      { lang: 'de', label: 'Deutsch', heading: 'Datenschutzerklärung', html: spesePrivacyDe },
      { lang: 'es', label: 'Español', heading: 'Política de privacidad', html: spesePrivacyEs },
      { lang: 'pt', label: 'Português', heading: 'Política de privacidade', html: spesePrivacyPt },
    ],
    homeLinks: [{ label: "Apri l'app web", href: 'https://estate-expense-manager.web.app', external: true }],
  },
]

export const bySlug = (slug: string) => apps.find((a) => a.slug === slug)!
export const privacyPath = (a: AppInfo) => `/${a.slug}#${a.privacy.length > 1 ? 'privacy-it' : 'privacy'}`
