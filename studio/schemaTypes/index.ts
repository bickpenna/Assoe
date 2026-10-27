import type { SchemaTypeDefinition } from 'sanity';
import { article } from './article';
import { event } from './event';
import { homeSettings } from './homeSettings';
import { person } from './person';
import { initiative } from './initiative';
import { richText, siteContacts, socialLink } from './objects';
import { siteSettings } from './siteSettings';

export const schemaTypes: SchemaTypeDefinition[] = [
  richText,
  socialLink,
  siteContacts,
  siteSettings,
  homeSettings,
  initiative,
  article,
  event,
  person,
];
