/** Destinazioni condivise: le etichette possono variare per contesto, non gli URL. */
const navigation = {
  home: { href: '/', label: 'Home' },
  projects: { href: '/progetti/', label: 'Progetti' },
  events: { href: '/eventi/', label: 'Eventi' },
  articles: { href: '/articoli/', label: 'Articoli' },
  support: { href: '/sostienici/', label: 'Sostienici' },
  about: { href: '/chi-siamo/', label: 'Chi siamo' },
  people: { href: '/associati/', label: 'Associati' },
  contacts: { href: '/contatti/', label: 'Contatti' },
} as const;

export const siteNavigation = [
  navigation.home,
  navigation.projects,
  navigation.events,
  navigation.articles,
  navigation.support,
  navigation.about,
  navigation.contacts,
];

export const footerNavigation = [
  { ...navigation.events, label: 'Eventi e archivio' },
  navigation.articles,
  navigation.projects,
  { ...navigation.about, label: 'L’associazione' },
  navigation.people,
];
