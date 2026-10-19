/** Destinazioni condivise: le etichette possono variare per contesto, non gli URL. */
interface NavigationItem {
  href: string;
  label: string;
  featured?: boolean;
}

const navigation = {
  home: { href: '/', label: 'Home' },
  projects: { href: '/progetti/', label: 'Progetti' },
  events: { href: '/eventi/', label: 'Eventi' },
  articles: { href: '/articoli/', label: 'Articoli' },
  about: { href: '/chi-siamo/', label: 'Chi siamo' },
  people: { href: '/associati/', label: 'Associati' },
  contacts: { href: '/contatti/', label: 'Contatti' },
  support: { href: '/sostienici/', label: 'Sostienici', featured: true },
} as const;

export const siteNavigation: readonly NavigationItem[] = [
  navigation.home,
  navigation.projects,
  navigation.events,
  navigation.articles,
  navigation.about,
  navigation.contacts,
  navigation.support,
];

export const footerNavigation = [
  { ...navigation.events, label: 'Eventi e archivio' },
  navigation.articles,
  navigation.projects,
  { ...navigation.about, label: 'L’associazione' },
  navigation.people,
];
