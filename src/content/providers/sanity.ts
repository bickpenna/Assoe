import { createClient } from '@sanity/client';
import { toHTML } from '@portabletext/to-html';
import type {
  ArticleSummary,
  AssociationInfo,
  ContentRepository,
  EventSummary,
  EventStatus,
  PersonSummary,
  PersonRole,
  ProjectDetail,
  ProjectSummary,
} from '../types';

interface SanityProject {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

interface SanityProjectDetail extends SanityProject {
  description: Array<{ _type: string; _key?: string }> | null;
}

interface SanityArticle {
  _id: string;
  title: string;
  slug: string;
  summary: string | null;
  publishedAt: string;
  featured: boolean | null;
  imageUrl: string | null;
}

interface SanityEvent {
  _id: string;
  title: string;
  slug: string;
  date: string;
  place: string | null;
  status: EventStatus;
  imageUrl: string | null;
}

interface SanityPerson {
  _id: string;
  firstName: string;
  lastName: string;
  role: PersonRole;
  photoUrl: string | null;
}

interface SanityAssociation {
  associationName: string;
  logoUrl: string | null;
  taxCode: string | null;
  registryInfo: string | null;
  copyright: string | null;
  contacts: {
    email: string | null;
    phone: string | null;
    address: string | null;
    postalCode: string | null;
    city: string | null;
    province: string | null;
  } | null;
  socialLinks: Array<{ platform: string; url: string }> | null;
  statuteUrl: string | null;
  regulationUrl: string | null;
  privacyPolicyUrl: string | null;
  cookiePolicyUrl: string | null;
}

interface SanityConfig {
  projectId: string;
  dataset: string;
}

const projectsQuery = `*[
  _type == "project" &&
  active == true &&
  defined(name) &&
  defined(slug.current)
] | order(order asc, name asc) {
  _id,
  name,
  "slug": slug.current,
  "imageUrl": image.asset->url
}`;

const projectBySlugQuery = `*[
  _type == "project" &&
  active == true &&
  defined(name) &&
  slug.current == $slug
][0] {
  _id,
  name,
  "slug": slug.current,
  description,
  "imageUrl": image.asset->url
}`;

const articlesQuery = `*[
  _type == "article" &&
  defined(title) &&
  defined(slug.current) &&
  defined(publishedAt)
] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  summary,
  publishedAt,
  featured,
  "imageUrl": mainImage.asset->url
}`;

const eventsQuery = `*[
  _type == "event" &&
  defined(title) &&
  defined(slug.current) &&
  defined(date) &&
  defined(status)
] | order(date desc) {
  _id,
  title,
  "slug": slug.current,
  date,
  place,
  status,
  "imageUrl": poster.asset->url
}`;

const peopleQuery = `*[
  _type == "person" &&
  visible == true &&
  defined(firstName) &&
  defined(lastName) &&
  defined(role)
] | order(order asc, lastName asc) {
  _id,
  firstName,
  lastName,
  role,
  "photoUrl": photo.asset->url
}`;

const associationQuery = `*[_type == "siteSettings" && defined(associationName)][0] {
  associationName,
  "logoUrl": logo.asset->url,
  taxCode,
  registryInfo,
  copyright,
  contacts {
    email,
    phone,
    address,
    postalCode,
    city,
    province
  },
  socialLinks[] { platform, url },
  "statuteUrl": statute.asset->url,
  "regulationUrl": regulation.asset->url,
  "privacyPolicyUrl": privacyPolicy.asset->url,
  "cookiePolicyUrl": cookiePolicy.asset->url
}`;

export function createSanityRepository({
  projectId,
  dataset,
}: SanityConfig): ContentRepository {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2026-03-01',
    perspective: 'published',
    useCdn: false,
  });

  return {
    async listProjects(): Promise<ProjectSummary[]> {
      const projects = await client.fetch<SanityProject[]>(projectsQuery);

      return projects.map(({ _id, name, slug, imageUrl }) => ({
        id: _id,
        name,
        slug,
        imageUrl: imageUrl ?? undefined,
      }));
    },

    async getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
      const project = await client.fetch<SanityProjectDetail | null>(projectBySlugQuery, { slug });

      if (!project) return null;

      return {
        id: project._id,
        name: project.name,
        slug: project.slug,
        imageUrl: project.imageUrl ?? undefined,
        descriptionHtml: project.description?.length ? toHTML(project.description) : undefined,
      };
    },

    async listArticles(): Promise<ArticleSummary[]> {
      const articles = await client.fetch<SanityArticle[]>(articlesQuery);

      return articles.map(({ _id, title, slug, summary, publishedAt, featured, imageUrl }) => ({
        id: _id,
        title,
        slug,
        summary: summary ?? undefined,
        publishedAt,
        featured: featured === true,
        imageUrl: imageUrl ?? undefined,
      }));
    },

    async listEvents(): Promise<EventSummary[]> {
      const events = await client.fetch<SanityEvent[]>(eventsQuery);

      return events.map(({ _id, title, slug, date, place, status, imageUrl }) => ({
        id: _id,
        title,
        slug,
        date,
        place: place ?? undefined,
        status,
        imageUrl: imageUrl ?? undefined,
      }));
    },

    async listPeople(): Promise<PersonSummary[]> {
      const people = await client.fetch<SanityPerson[]>(peopleQuery);

      return people.map(({ _id, firstName, lastName, role, photoUrl }) => ({
        id: _id,
        firstName,
        lastName,
        role,
        photoUrl: photoUrl ?? undefined,
      }));
    },

    async getAssociationInfo(): Promise<AssociationInfo | null> {
      const info = await client.fetch<SanityAssociation | null>(associationQuery);

      if (!info) return null;

      return {
        name: info.associationName,
        logoUrl: info.logoUrl ?? undefined,
        taxCode: info.taxCode ?? undefined,
        registryInfo: info.registryInfo ?? undefined,
        copyright: info.copyright ?? undefined,
        contacts: {
          email: info.contacts?.email ?? undefined,
          phone: info.contacts?.phone ?? undefined,
          address: info.contacts?.address ?? undefined,
          postalCode: info.contacts?.postalCode ?? undefined,
          city: info.contacts?.city ?? undefined,
          province: info.contacts?.province ?? undefined,
        },
        socialLinks: (info.socialLinks ?? []).map(({ platform, url }) => ({ name: platform, url })),
        documents: {
          statuteUrl: info.statuteUrl ?? undefined,
          regulationUrl: info.regulationUrl ?? undefined,
          privacyPolicyUrl: info.privacyPolicyUrl ?? undefined,
          cookiePolicyUrl: info.cookiePolicyUrl ?? undefined,
        },
      };
    },
  };
}
