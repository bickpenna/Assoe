import { defineField, defineType } from 'sanity';

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
    defineField({ name: 'photo', title: 'Foto', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'role',
      title: 'Ruolo',
      type: 'string',
      options: {
        list: [
          { title: 'Presidente', value: 'president' },
          { title: 'Vicepresidente', value: 'vicePresident' },
          { title: 'Segretario', value: 'secretary' },
          { title: 'Consigliere', value: 'boardMember' },
          { title: 'Volontario', value: 'volunteer' },
          { title: 'Volontario servizio civile', value: 'civilServiceVolunteer' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'order', title: 'Ordine', type: 'number', initialValue: 0 }),
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
        subtitle: role,
        media,
      };
    },
  },
});
