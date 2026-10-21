/** Destinazioni condivise: le etichette possono variare per contesto, non gli URL. */
import { sitePath } from '@/utils/sitePath';

interface NavigationItem {
  href: string;
  label: string;
  featured?: boolean;
}

const navigation = {
  home: { href: sitePath('/'), label: 'Home' },
  initiatives: { href: sitePath('/iniziative/'), label: 'Iniziative' },
  events: { href: sitePath('/eventi/'), label: 'Eventi' },
  articles: { href: sitePath('/articoli/'), label: 'Articoli' },
  about: { href: sitePath('/chi-siamo/'), label: 'Chi siamo' },
  support: { href: sitePath('/sostienici/'), label: 'Sostienici', featured: true },
} as const;

export const siteNavigation: readonly NavigationItem[] = [
  navigation.home,
  navigation.initiatives,
  navigation.events,
  navigation.articles,
  navigation.about,
  navigation.support,
];
