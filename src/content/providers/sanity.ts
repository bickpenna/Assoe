import { createClient } from '@sanity/client';
import { toHTML } from '@portabletext/to-html';
import type {
  ArticleDetail,
  ArticleSummary,
  AssociationInfo,
  ContentRepository,
  EventDetail,
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

interface SanityRelatedProject extends SanityProject {
  active: boolean | null;
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

interface SanityArticleDetail extends SanityArticle {
  body: Array<{ _type: string; _key?: string }> | null;
  galleryImageUrls: Array<string | null> | null;
  projects: Array<SanityRelatedProject | null> | null;
  event: SanityEvent | null;
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

interface SanityEventDetail extends SanityEvent {
  description: Array<{ _type: string; _key?: string }> | null;
  galleryImageUrls: Array<string | null> | null;
  projects: Array<SanityRelatedProject | null> | null;
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

const articlesByProjectQuery = `*[
  _type == "article" &&
  references($projectId) &&
  defined(title) &&
  defined(slug.current) &&
  defined(publishedAt)
] | order(publishedAt desc) {
  _id, title, "slug": slug.current, summary, publishedAt, featured,
  "imageUrl": mainImage.asset->url
}`;

const eventsByProjectQuery = `*[
  _type == "event" &&
  references($projectId) &&
  defined(title) &&
  defined(slug.current) &&
  defined(date) &&
  defined(status)
] | order(date desc) {
  _id, title, "slug": slug.current, date, place, status,
  "imageUrl": poster.asset->url
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

const articleBySlugQuery = `*[
  _type == "article" &&
  defined(title) &&
  defined(publishedAt) &&
  slug.current == $slug
][0] {
  _id,
  title,
  "slug": slug.current,
  summary,
  publishedAt,
  featured,
  "imageUrl": mainImage.asset->url,
  body,
  "galleryImageUrls": gallery[].asset->url,
  "projects": projects[]-> {
    _id, name, "slug": slug.current, active, "imageUrl": image.asset->url
  },
  "event": event-> {
    _id, title, "slug": slug.current, date, place, status,
    "imageUrl": poster.asset->url
  }
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

const eventBySlugQuery = `*[
  _type == "event" &&
  defined(title) &&
  defined(date) &&
  defined(status) &&
  slug.current == $slug
][0] {
  _id, title, "slug": slug.current, date, place, status,
  "imageUrl": poster.asset->url,
  description,
  "galleryImageUrls": gallery[].asset->url,
  "projects": projects[]-> {
    _id, name, "slug": slug.current, active, "imageUrl": image.asset->url
  }
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

function renderRichText(blocks: Array<{ _type: string; _key?: string }> | null): string | undefined {
  return blocks?.length ? toHTML(blocks) : undefined;
}

function toArticleSummary(article: SanityArticle): ArticleSummary {
  return {
    id: article._id,
    title: article.title,
    slug: article.slug,
    summary: article.summary ?? undefined,
    publishedAt: article.publishedAt,
    featured: article.featured === true,
    imageUrl: article.imageUrl ?? undefined,
  };
}

function toProjectSummary(project: SanityProject): ProjectSummary {
  return {
    id: project._id,
    name: project.name,
    slug: project.slug,
    imageUrl: project.imageUrl ?? undefined,
  };
}

function toRelatedProjects(projects: Array<SanityRelatedProject | null> | null): ProjectSummary[] {
  return (projects ?? [])
    .filter((project): project is SanityRelatedProject =>
      Boolean(project?.active && project.name && project.slug),
    )
    .map(toProjectSummary);
}

function toEventSummary(event: SanityEvent): EventSummary {
  return {
    id: event._id,
    title: event.title,
    slug: event.slug,
    date: event.date,
    place: event.place ?? undefined,
    status: event.status,
    imageUrl: event.imageUrl ?? undefined,
  };
}

function hasPublicEventFields(event: SanityEvent | null): event is SanityEvent {
  return Boolean(event?.title && event.slug && event.date && event.status);
}

function httpUrlOrUndefined(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

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

      return projects.map(toProjectSummary);
    },

    async getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
      const project = await client.fetch<SanityProjectDetail | null>(projectBySlugQuery, { slug });

      if (!project) return null;

      const [articles, events] = await Promise.all([
        client.fetch<SanityArticle[]>(articlesByProjectQuery, { projectId: project._id }),
        client.fetch<SanityEvent[]>(eventsByProjectQuery, { projectId: project._id }),
      ]);

      return {
        ...toProjectSummary(project),
        descriptionHtml: renderRichText(project.description),
        relatedArticles: articles.map(toArticleSummary),
        relatedEvents: events.map(toEventSummary),
      };
    },

    async listArticles(): Promise<ArticleSummary[]> {
      const articles = await client.fetch<SanityArticle[]>(articlesQuery);

      return articles.map(toArticleSummary);
    },

    async getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
      const article = await client.fetch<SanityArticleDetail | null>(articleBySlugQuery, { slug });

      if (!article) return null;

      return {
        ...toArticleSummary(article),
        bodyHtml: renderRichText(article.body),
        galleryImageUrls: (article.galleryImageUrls ?? []).filter(
          (url): url is string => typeof url === 'string',
        ),
        relatedProjects: toRelatedProjects(article.projects),
        relatedEvent: hasPublicEventFields(article.event)
          ? toEventSummary(article.event)
          : undefined,
      };
    },

    async listEvents(): Promise<EventSummary[]> {
      const events = await client.fetch<SanityEvent[]>(eventsQuery);

      return events.map(toEventSummary);
    },

    async getEventBySlug(slug: string): Promise<EventDetail | null> {
      const event = await client.fetch<SanityEventDetail | null>(eventBySlugQuery, { slug });

      if (!event) return null;

      return {
        ...toEventSummary(event),
        descriptionHtml: renderRichText(event.description),
        galleryImageUrls: (event.galleryImageUrls ?? []).filter(
          (url): url is string => typeof url === 'string',
        ),
        relatedProjects: toRelatedProjects(event.projects),
      };
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
        socialLinks: (info.socialLinks ?? []).flatMap(({ platform, url }) => {
          const safeUrl = httpUrlOrUndefined(url);
          return platform && safeUrl ? [{ name: platform, url: safeUrl }] : [];
        }),
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
