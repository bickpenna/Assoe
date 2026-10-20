import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://volontariato.assoe.it',
  redirects: {
    '/5x1000': '/sostienici/#cinque-per-mille',
    '/contatti': '/chi-siamo/#contatti',
    '/progetti': '/iniziative/',
    '/progetti/[slug]': '/iniziative/[slug]',
    '/progetti/pagina/[page]': '/iniziative/pagina/[page]',
  },
  image: {
    domains: ['cdn.sanity.io'],
    responsiveStyles: true,
  },
});
