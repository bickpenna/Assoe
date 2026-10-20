import { createClient } from '@sanity/client';
import { toHTML } from '@portabletext/to-html';
import { facebookPostUrlOrUndefined } from '../../utils/facebook';
import { sanitizeRichTextHtml } from '../../utils/sanitizeHtml';
import { httpsUrlOrUndefined } from '../../../shared/url';
import { validIbanOrUndefined } from '../../../shared/iban';
import { initiativeImageUrl, type SanityImage } from './sanityImage';
import type {
  ArticleDetail,
  ArticleSummary,
  AssociationInfo,
  ContentRepository,
  EventDetail,
  EventSummary,
  EventStatus,
  PersonRole,
  InitiativeDetail,
  InitiativeSummary,
} from '../types';

interface SanityProject {
  _id: string;
  name: string;
  slug: string;
  image: SanityImage | null;
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
  imageUrl: string | null;
}

interface SanityArticleDetail extends SanityArticle {
  body: Array<{ _type: string; _key?: string }> | null;
  galleryImageUrls: Array<string | null> | null;
  facebookPostUrl: string | null;
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
  facebookPostUrl: string | null;
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
  aboutText: string | null;
  aboutImageUrl: string | null;
  taxCode: string | null;
  bankDetails: {
    iban: string | null;
    accountHolder: string | null;
    bankName: string | null;
  } | null;
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

const initiativeImageProjection = `"image": image {
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  crop
}`;

// The stored Sanity type and reference field names stay "project"/"projects"
// so existing documents, ranks, and relationships remain readable.
const initiativesQuery = `*[
  _type == "project" &&
  active == true &&
  defined(name) &&
  defined(slug.current)
] | order(defined(orderRank) desc, orderRank asc, order asc, name asc) {
  _id,
  name,
  "slug": slug.current,
  ${initiativeImageProjection}
}`;

const initiativeBySlugQuery = `*[
  _type == "project" &&
  active == true &&
  defined(name) &&
  slug.current == $slug
][0] {
  _id,
  name,
  "slug": slug.current,
  description,
  ${initiativeImageProjection}
}`;

const articlesByInitiativeQuery = `*[
  _type == "article" &&
  references($initiativeId) &&
  defined(title) &&
  defined(slug.current) &&
  defined(publishedAt)
] | order(publishedAt desc) {
  _id, title, "slug": slug.current, summary, publishedAt,
  "imageUrl": mainImage.asset->url
}`;

const eventsByInitiativeQuery = `*[
  _type == "event" &&
  references($initiativeId) &&
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
  "imageUrl": mainImage.asset->url,
  body,
  facebookPostUrl,
  "galleryImageUrls": gallery[].asset->url,
  "projects": projects[]-> {
    _id, name, "slug": slug.current, active, ${initiativeImageProjection}
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
  facebookPostUrl,
  "galleryImageUrls": gallery[].asset->url,
  "projects": projects[]-> {
    _id, name, "slug": slug.current, active, ${initiativeImageProjection}
  }
}`;

const peopleQuery = `*[
  _type == "person" &&
  visible == true &&
  defined(firstName) &&
  defined(lastName) &&
  defined(role)
] | order(defined(orderRank) desc, orderRank asc, order asc, lastName asc, firstName asc) {
  _id,
  firstName,
  lastName,
  role,
  "photoUrl": photo.asset->url
}`;

const associationQuery = `*[_type == "siteSettings" && defined(associationName)][0] {
  associationName,
  "logoUrl": logo.asset->url,
  aboutText,
  "aboutImageUrl": aboutImage.asset->url,
  taxCode,
  bankDetails { iban, accountHolder, bankName },
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
  return blocks?.length ? sanitizeRichTextHtml(toHTML(blocks)) : undefined;
}

function toArticleSummary(article: SanityArticle): ArticleSummary {
  return {
    id: article._id,
    title: article.title,
    slug: article.slug,
    summary: article.summary ?? undefined,
    publishedAt: article.publishedAt,
    imageUrl: article.imageUrl ?? undefined,
  };
}

function toInitiativeSummary(project: SanityProject): InitiativeSummary {
  return {
    id: project._id,
    name: project.name,
    slug: project.slug,
    imageUrl: initiativeImageUrl(project.image),
  };
}

function toRelatedInitiatives(projects: Array<SanityRelatedProject | null> | null): InitiativeSummary[] {
  return (projects ?? [])
    .filter((project): project is SanityRelatedProject =>
      Boolean(project?.active && project.name && project.slug),
    )
    .map(toInitiativeSummary);
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

  const listInitiatives = cachePromise(async () => {
    const projects = await client.fetch<SanityProject[]>(initiativesQuery);
    return projects.map(toInitiativeSummary);
  });

  const listArticles = cachePromise(async () => {
    const articles = await client.fetch<SanityArticle[]>(articlesQuery);
    return articles.map(toArticleSummary);
  });

  const listEvents = cachePromise(async () => {
    const events = await client.fetch<SanityEvent[]>(eventsQuery);
    return events.map(toEventSummary);
  });

  const listPeople = cachePromise(async () => {
    const people = await client.fetch<SanityPerson[]>(peopleQuery);
    return people.map(({ _id, firstName, lastName, role, photoUrl }) => ({
      id: _id,
      firstName,
      lastName,
      role,
      photoUrl: photoUrl ?? undefined,
    }));
  });

  const getAssociationInfo = cachePromise(async (): Promise<AssociationInfo | null> => {
    const info = await client.fetch<SanityAssociation | null>(associationQuery);

    if (!info) return null;

    const iban = validIbanOrUndefined(info.bankDetails?.iban);
    const accountHolder = info.bankDetails?.accountHolder?.trim();

    return {
      name: info.associationName,
      logoUrl: info.logoUrl ?? undefined,
      aboutText: info.aboutText?.trim() || undefined,
      aboutImageUrl: info.aboutImageUrl ?? undefined,
      taxCode: info.taxCode ?? undefined,
      bankDetails: iban && accountHolder ? {
        iban,
        accountHolder,
        bankName: info.bankDetails?.bankName?.trim() || undefined,
      } : undefined,
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
        const safeUrl = httpsUrlOrUndefined(url);
        return platform && safeUrl ? [{ name: platform, url: safeUrl }] : [];
      }),
      documents: {
        statuteUrl: info.statuteUrl ?? undefined,
        regulationUrl: info.regulationUrl ?? undefined,
        privacyPolicyUrl: info.privacyPolicyUrl ?? undefined,
        cookiePolicyUrl: info.cookiePolicyUrl ?? undefined,
      },
    };
  });

  return {
    listInitiatives,

    async getInitiativeBySlug(slug: string): Promise<InitiativeDetail | null> {
      const project = await client.fetch<SanityProjectDetail | null>(initiativeBySlugQuery, { slug });

      if (!project) return null;

      const [articles, events] = await Promise.all([
        client.fetch<SanityArticle[]>(articlesByInitiativeQuery, { initiativeId: project._id }),
        client.fetch<SanityEvent[]>(eventsByInitiativeQuery, { initiativeId: project._id }),
      ]);

      return {
        ...toInitiativeSummary(project),
        descriptionHtml: renderRichText(project.description),
        relatedArticles: articles.map(toArticleSummary),
        relatedEvents: events.map(toEventSummary),
      };
    },

    listArticles,

    async getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
      const article = await client.fetch<SanityArticleDetail | null>(articleBySlugQuery, { slug });

      if (!article) return null;

      return {
        ...toArticleSummary(article),
        bodyHtml: renderRichText(article.body),
        discussionUrl: facebookPostUrlOrUndefined(article.facebookPostUrl),
        galleryImageUrls: (article.galleryImageUrls ?? []).filter(
          (url): url is string => typeof url === 'string',
        ),
        relatedInitiatives: toRelatedInitiatives(article.projects),
        relatedEvent: hasPublicEventFields(article.event)
          ? toEventSummary(article.event)
          : undefined,
      };
    },

    listEvents,

    async getEventBySlug(slug: string): Promise<EventDetail | null> {
      const event = await client.fetch<SanityEventDetail | null>(eventBySlugQuery, { slug });

      if (!event) return null;

      return {
        ...toEventSummary(event),
        descriptionHtml: renderRichText(event.description),
        discussionUrl: facebookPostUrlOrUndefined(event.facebookPostUrl),
        galleryImageUrls: (event.galleryImageUrls ?? []).filter(
          (url): url is string => typeof url === 'string',
        ),
        relatedInitiatives: toRelatedInitiatives(event.projects),
      };
    },

    listPeople,

    getAssociationInfo,
  };
}

function cachePromise<T>(factory: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | undefined;

  return () => {
    // Keep builds consistent, but let the dev server pick up edits made in Studio.
    if (import.meta.env.DEV) return factory();
    cached ??= factory().catch((error: unknown) => {
      cached = undefined;
      throw error;
    });
    return cached;
  };
}
