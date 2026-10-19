import { defineField } from 'sanity';

export const facebookPostField = defineField({
  name: 'facebookPostUrl',
  title: 'Post Facebook',
  description: 'Facoltativo. Incolla il link a un post pubblico dove si possono leggere o lasciare commenti.',
  type: 'url',
  validation: (rule) => rule.uri({ scheme: ['https'] }).custom((value) => {
    if (!value) return true;

    try {
      const hostname = new URL(value).hostname.toLowerCase();
      return hostname === 'facebook.com' || hostname.endsWith('.facebook.com') || hostname === 'fb.watch'
        ? true
        : 'Inserisci un link a un post di Facebook.';
    } catch {
      return 'Inserisci un link valido a un post di Facebook.';
    }
  }),
});
