import { defineArrayMember, defineField, defineType } from 'sanity';
import { CONTENT_SLUG_MAX_LENGTH, EVENT_RESERVED_SLUGS, slugError } from '../../shared/slug';
import { MAX_GALLERY_IMAGES } from '../../shared/imageSize';
import { validateEditorialImageSize } from './editorialImage';
import { validateUniqueSlug } from './slugValidation';
import { galleryDescription, imageDescription } from './imageDescriptions';
import { GalleryInput } from './GalleryInput';
import { facebookPostField } from './facebookPostField';

export const event = defineType({
  name: 'event',
  title: 'Evento',
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
      options: { source: 'title', maxLength: CONTENT_SLUG_MAX_LENGTH },
      validation: (rule) => rule.required()
        .custom((value) => slugError(value?.current, { reserved: EVENT_RESERVED_SLUGS }) ?? true)
        .custom(validateUniqueSlug),
    }),
    defineField({ name: 'description', title: 'Descrizione', type: 'richText' }),
    facebookPostField,
    defineField({
      name: 'date',
      title: 'Data e ora',
      description: 'Il sito sposta automaticamente l’evento nell’archivio dal giorno successivo, nel fuso italiano, alla nuova build. Lo stato non impedisce l’archiviazione.',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'place', title: 'Luogo', type: 'string' }),
    defineField({
      name: 'poster',
      title: 'Locandina',
      type: 'image',
      description: imageDescription(),
      options: { hotspot: true },
      validation: (rule) => rule.custom(validateEditorialImageSize),
    }),
    defineField({
      name: 'gallery',
      title: 'Galleria',
      type: 'array',
      description: galleryDescription(),
      components: { input: GalleryInput },
      of: [defineArrayMember({ type: 'image', options: { hotspot: true }, validation: (rule) => rule.custom(validateEditorialImageSize) })],
      validation: (rule) => rule.max(MAX_GALLERY_IMAGES),
    }),
    defineField({
      name: 'status',
      title: 'Stato',
      type: 'string',
      options: {
        list: [
          { title: 'Programmato', value: 'scheduled' },
          { title: 'In corso', value: 'ongoing' },
          { title: 'Concluso', value: 'completed' },
          { title: 'Annullato', value: 'cancelled' },
        ],
      },
      initialValue: 'scheduled',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'initiatives',
      title: 'Iniziative collegate',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'initiative' }] }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'date',
      media: 'poster',
    },
  },
});
