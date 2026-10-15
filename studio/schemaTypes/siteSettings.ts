import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Informazioni associazione',
  type: 'document',
  fields: [
    defineField({
      name: 'associationName',
      title: 'Nome associazione',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'logo', title: 'Logo', type: 'image' }),
    defineField({ name: 'taxCode', title: 'Codice fiscale', type: 'string' }),
    defineField({ name: 'registryInfo', title: 'Dati del registro', type: 'string' }),
    defineField({ name: 'copyright', title: 'Copyright', type: 'string' }),
    defineField({
      name: 'contacts',
      title: 'Contatti',
      type: 'siteContacts',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social',
      type: 'array',
      of: [{ type: 'socialLink' }],
    }),
    defineField({
      name: 'statute',
      title: 'Statuto PDF',
      type: 'file',
      options: { accept: 'application/pdf' },
    }),
    defineField({
      name: 'regulation',
      title: 'Regolamento PDF',
      type: 'file',
      options: { accept: 'application/pdf' },
    }),
    defineField({
      name: 'privacyPolicy',
      title: 'Privacy policy',
      type: 'file',
      options: { accept: 'application/pdf' },
    }),
    defineField({
      name: 'cookiePolicy',
      title: 'Cookie policy',
      type: 'file',
      options: { accept: 'application/pdf' },
    }),
  ],
  preview: {
    select: {
      title: 'associationName',
    },
  },
});
