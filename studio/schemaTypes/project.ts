import { defineField, defineType } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'Progetto',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nome',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'description', title: 'Descrizione', type: 'richText' }),
    defineField({ name: 'image', title: 'Immagine', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'order', title: 'Ordine', type: 'number', initialValue: 0 }),
    defineField({ name: 'active', title: 'Attivo', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
});
