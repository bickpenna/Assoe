import { defineField, defineType } from 'sanity';
import { validIbanOrUndefined } from '../../shared/iban';

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
    defineField({
      name: 'aboutText',
      title: 'Chi siamo · testo',
      description: 'Racconta in breve cosa fa l’associazione. Separa i paragrafi con una riga vuota; non serve copiare il testo dello statuto.',
      type: 'text',
      rows: 8,
      validation: (rule) => rule.max(2500),
    }),
    defineField({
      name: 'aboutImage',
      title: 'Chi siamo · foto',
      description: 'Facoltativa. Usa una foto rappresentativa dell’associazione e verifica il consenso delle persone riconoscibili.',
      type: 'image',
    }),
    defineField({ name: 'taxCode', title: 'Codice fiscale', type: 'string' }),
    defineField({
      name: 'bankDetails',
      title: 'Donazioni con bonifico',
      description: 'Pubblica le coordinate solo dopo averle verificate con l’associazione. Servono IBAN e intestatario; la banca è facoltativa.',
      type: 'object',
      fields: [
        defineField({
          name: 'iban',
          title: 'IBAN',
          type: 'string',
          validation: (rule) => rule.required().custom((value) =>
            !value || validIbanOrUndefined(value) ? true : 'Controlla l’IBAN: formato o cifre di controllo non validi.',
          ),
        }),
        defineField({
          name: 'accountHolder',
          title: 'Intestatario del conto',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({ name: 'bankName', title: 'Banca', type: 'string' }),
      ],
    }),
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
