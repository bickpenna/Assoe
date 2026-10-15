import { defineField, defineType } from 'sanity';

export const richText = defineType({
  name: 'richText',
  title: 'Testo',
  type: 'array',
  of: [{ type: 'block' }],
});

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Profilo social',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Nome social',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Link social',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'platform',
      subtitle: 'url',
    },
  },
});

export const siteContacts = defineType({
  name: 'siteContacts',
  title: 'Contatti',
  type: 'object',
  fields: [
    defineField({ name: 'email', title: 'Email', type: 'email' }),
    defineField({ name: 'phone', title: 'Telefono', type: 'string' }),
    defineField({ name: 'address', title: 'Indirizzo', type: 'string' }),
    defineField({ name: 'postalCode', title: 'CAP', type: 'string' }),
    defineField({ name: 'city', title: 'Città', type: 'string' }),
    defineField({ name: 'province', title: 'Provincia', type: 'string' }),
  ],
});
