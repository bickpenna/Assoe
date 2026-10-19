import { defineField } from 'sanity';
import { facebookPostUrlOrUndefined } from '../../shared/url';

export const facebookPostField = defineField({
  name: 'facebookPostUrl',
  title: 'Post Facebook',
  description: 'Facoltativo. Incolla il link a un post pubblico dove si possono leggere o lasciare commenti.',
  type: 'url',
  validation: (rule) => rule.custom((value) => {
    if (!value) return true;

    return facebookPostUrlOrUndefined(value)
      ? true
      : 'Inserisci un link HTTPS a un post di Facebook senza credenziali.';
  }),
});
