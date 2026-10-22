import { defineArrayMember, defineField, defineType } from 'sanity';
import { MAX_GALLERY_IMAGES } from '../../shared/imageSize';
import { validateEditorialImageSize } from './editorialImage';
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
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'description', title: 'Descrizione', type: 'richText' }),
    facebookPostField,
    defineField({
      name: 'date',
      title: 'Data e ora',
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
      name: 'projects',
      title: 'Iniziative collegate',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
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
