import { defineField, defineType } from 'sanity';

export const article = defineType({
  name: 'article',
  title: 'Articolo',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'summary', title: 'Sommario', type: 'text', rows: 3 }),
    defineField({ name: 'body', title: 'Testo', type: 'richText' }),
    defineField({
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
    }),
    defineField({
      name: 'mainImage',
      title: 'Immagine principale',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'gallery',
      title: 'Galleria',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data pubblicazione',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'featured', title: 'In evidenza', type: 'boolean', initialValue: false }),
    defineField({
      name: 'projects',
      title: 'Progetti collegati',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
    defineField({
      name: 'event',
      title: 'Evento raccontato',
      type: 'reference',
      to: [{ type: 'event' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'publishedAt',
      media: 'mainImage',
    },
  },
});
