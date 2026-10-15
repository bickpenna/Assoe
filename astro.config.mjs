import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://volontariato.assoe.it',
  image: {
    domains: ['cdn.sanity.io'],
    responsiveStyles: true,
  },
});
