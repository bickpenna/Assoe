import { defineField, defineType } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';
import { PERSON_ROLE_GROUPS, personRoleLabel, type PersonRole } from '../../shared/personRoles';
import { validateEditorialImageSize } from './editorialImage';
import { imageDescription } from './imageDescriptions';

export const person = defineType({
  name: 'person',
  title: 'Persona',
  type: 'document',
  fields: [
    defineField({
      name: 'firstName',
      title: 'Nome',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lastName',
      title: 'Cognome',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Foto',
      type: 'image',
      description: imageDescription(),
      options: { hotspot: true },
      validation: (rule) => rule.custom(validateEditorialImageSize),
    }),
    defineField({
      name: 'role',
      title: 'Ruolo',
      type: 'string',
      options: {
        list: PERSON_ROLE_GROUPS.map(({ label, role }) => ({ title: label, value: role })),
      },
      validation: (rule) => rule.required(),
    }),
    orderRankField({ type: 'person' }),
    // Keep existing values for unranked documents; editors now drag within each role.
    defineField({ name: 'order', title: 'Ordine precedente', type: 'number', hidden: true }),
    defineField({ name: 'visible', title: 'Visibile sul sito', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      role: 'role',
      media: 'photo',
    },
    prepare({ firstName, lastName, role, media }) {
      return {
        title: `${firstName ?? ''} ${lastName ?? ''}`.trim(),
        subtitle: role ? personRoleLabel(role as PersonRole) : undefined,
        media,
      };
    },
  },
});
