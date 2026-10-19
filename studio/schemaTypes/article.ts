import { defineField, defineType } from 'sanity';
import { facebookPostField } from './facebookPostField';

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
    facebookPostField,
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
