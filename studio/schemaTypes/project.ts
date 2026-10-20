import { defineField, defineType } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';

// Keep the stored type name: existing documents and references use "project".
export const project = defineType({
  name: 'project',
  title: 'Iniziativa',
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
    defineField({
      name: 'image',
      title: 'Immagine',
      type: 'image',
      description: 'Se il file ha bordi bianchi, ritagliali nell’editor dell’immagine prima di pubblicare.',
      options: { hotspot: true },
    }),
    orderRankField({ type: 'project' }),
    defineField({ name: 'active', title: 'Attivo', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
});
