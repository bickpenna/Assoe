/** Destinazioni condivise: le etichette possono variare per contesto, non gli URL. */
const navigation = {
  home: { href: '/', label: 'Home' },
  projects: { href: '/progetti/', label: 'Progetti' },
  events: { href: '/eventi/', label: 'Eventi' },
  articles: { href: '/articoli/', label: 'Articoli' },
  about: { href: '/chi-siamo/', label: 'Chi siamo' },
  contacts: { href: '/contatti/', label: 'Contatti' },
} as const;

export const siteNavigation = Object.values(navigation);

export const footerNavigation = [
  { ...navigation.events, label: 'Eventi e archivio' },
  navigation.articles,
  navigation.projects,
  { ...navigation.about, label: 'L’associazione' },
];
