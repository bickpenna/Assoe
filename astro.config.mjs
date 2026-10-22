import { defineConfig } from 'astro/config';

const base = process.env.SITE_BASE || '/';
const redirectBase = base === '/' ? '' : `/${base.replace(/^\/+|\/+$/g, '')}`;

export default defineConfig({
  site: process.env.SITE_URL || 'https://volontariato.assoe.it',
  base,
  redirects: {
    '/5x1000': `${redirectBase}/sostienici/`,
    '/contatti': `${redirectBase}/chi-siamo/#contatti`,
  },
  image: {
    domains: ['cdn.sanity.io'],
    responsiveStyles: true,
  },
});
