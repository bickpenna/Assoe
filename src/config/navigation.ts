/** Destinazioni condivise: le etichette possono variare per contesto, non gli URL. */
interface NavigationItem {
  href: string;
  label: string;
  featured?: boolean;
}

const navigation = {
  home: { href: '/', label: 'Home' },
  initiatives: { href: '/iniziative/', label: 'Iniziative' },
  events: { href: '/eventi/', label: 'Eventi' },
  articles: { href: '/articoli/', label: 'Articoli' },
  about: { href: '/chi-siamo/', label: 'Chi siamo' },
  people: { href: '/associati/', label: 'Associati' },
  support: { href: '/sostienici/', label: 'Sostienici', featured: true },
} as const;

export const siteNavigation: readonly NavigationItem[] = [
  navigation.home,
  navigation.initiatives,
  navigation.events,
  navigation.articles,
  navigation.about,
  navigation.support,
];

export const footerNavigation = [
  { ...navigation.events, label: 'Eventi e archivio' },
  navigation.articles,
  navigation.initiatives,
  { ...navigation.about, label: 'L’associazione' },
  navigation.people,
];
