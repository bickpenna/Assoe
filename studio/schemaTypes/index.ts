import type { SchemaTypeDefinition } from 'sanity';
import { article } from './article';
import { event } from './event';
import { person } from './person';
import { project } from './project';
import { richText, siteContacts, socialLink } from './objects';
import { siteSettings } from './siteSettings';

export const schemaTypes: SchemaTypeDefinition[] = [
  richText,
  socialLink,
  siteContacts,
  siteSettings,
  project,
  article,
  event,
  person,
];
