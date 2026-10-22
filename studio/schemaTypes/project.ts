import { defineField, defineType } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';
import { CONTENT_SLUG_MAX_LENGTH, slugError } from '../../shared/slug';
import { validateEditorialImageSize } from './editorialImage';
import { imageDescription } from './imageDescriptions';
import { validateUniqueSlug } from './slugValidation';

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
      options: { source: 'name', maxLength: CONTENT_SLUG_MAX_LENGTH },
      validation: (rule) => rule.required()
        .custom((value) => slugError(value?.current) ?? true)
        .custom(validateUniqueSlug),
    }),
    defineField({ name: 'description', title: 'Descrizione', type: 'richText' }),
    defineField({
      name: 'image',
      title: 'Immagine',
      type: 'image',
      description: imageDescription('Se il file ha bordi bianchi, ritagliali nell’editor dell’immagine prima di pubblicare.'),
      options: { hotspot: true },
      validation: (rule) => rule.custom(validateEditorialImageSize),
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
