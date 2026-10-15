/** Destinazioni principali del sito, condivise da header e footer. */
export const siteNavigation = [
  { href: '/', label: 'Home' },
  { href: '/progetti/', label: 'Progetti' },
  { href: '/eventi/', label: 'Eventi' },
  { href: '/articoli/', label: 'Articoli' },
  { href: '/chi-siamo/', label: 'Chi siamo' },
  { href: '/contatti/', label: 'Contatti' },
] as const;

export const footerNavigation = siteNavigation.filter(
  ({ href }) => href !== '/' && href !== '/contatti/',
);
