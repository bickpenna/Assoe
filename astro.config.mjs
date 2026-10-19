import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://volontariato.assoe.it',
  redirects: {
    '/5x1000': '/sostienici/#cinque-per-mille',
  },
  image: {
    domains: ['cdn.sanity.io'],
    responsiveStyles: true,
  },
});
