import { createClient } from '@sanity/client';
import { toHTML } from '@portabletext/to-html';
import { facebookPostUrlOrUndefined } from '../../utils/facebook';
import { sanitizeRichTextHtml } from '../../utils/sanitizeHtml';
import { httpsUrlOrUndefined } from '../../../shared/url';
import { validIbanOrUndefined } from '../../../shared/iban';
import { initiativeImageUrl } from './sanityImage';
import {
  isSanityArticle,
  isSanityArticleDetail,
  isSanityAssociation,
  isSanityEvent,
  isSanityEventDetail,
  isSanityPerson,
  isSanityProject,
  isSanityProjectDetail,
  isSanityRelatedProject,
  toPortableTextBlocks,
  type SanityArticle,
  type SanityEvent,
  type SanityProject,
  type SanityRelatedProject,
} from './sanityValidation';
import type {
  ArticleDetail,
  ArticleSummary,
  AssociationInfo,
  ContentRepository,
  EventDetail,
  EventSummary,
  InitiativeDetail,
  InitiativeSummary,
} from '../types';

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

function renderRichText(blocks: unknown): string | undefined {
  const validBlocks = toPortableTextBlocks(blocks);
  return validBlocks?.length ? sanitizeRichTextHtml(toHTML(validBlocks)) : undefined;
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
    .filter((project): project is SanityRelatedProject => Boolean(project?.active && isSanityRelatedProject(project)))
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
    const projects = await client.fetch<unknown>(initiativesQuery);
    return (Array.isArray(projects) ? projects : []).filter(isSanityProject).map(toInitiativeSummary);
  });

  const listArticles = cachePromise(async () => {
    const articles = await client.fetch<unknown>(articlesQuery);
    return (Array.isArray(articles) ? articles : []).filter(isSanityArticle).map(toArticleSummary);
  });

  const listEvents = cachePromise(async () => {
    const events = await client.fetch<unknown>(eventsQuery);
    return (Array.isArray(events) ? events : []).filter(isSanityEvent).map(toEventSummary);
  });

  const listPeople = cachePromise(async () => {
    const people = await client.fetch<unknown>(peopleQuery);
    return (Array.isArray(people) ? people : []).filter(isSanityPerson).map(({ _id, firstName, lastName, role, photoUrl }) => ({
      id: _id,
      firstName,
      lastName,
      role,
      photoUrl: photoUrl ?? undefined,
    }));
  });

  const getAssociationInfo = cachePromise(async (): Promise<AssociationInfo | null> => {
    const info = await client.fetch<unknown>(associationQuery);

    if (!isSanityAssociation(info)) return null;

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
      socialLinks: (info.socialLinks ?? []).flatMap((socialLink) => {
        if (!socialLink) return [];
        const safeUrl = httpsUrlOrUndefined(socialLink.url);
        return socialLink.platform && safeUrl ? [{ name: socialLink.platform, url: safeUrl }] : [];
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
      const project = await client.fetch<unknown>(initiativeBySlugQuery, { slug });

      if (!isSanityProjectDetail(project)) return null;

      const [articles, events] = await Promise.all([
        client.fetch<unknown>(articlesByInitiativeQuery, { initiativeId: project._id }),
        client.fetch<unknown>(eventsByInitiativeQuery, { initiativeId: project._id }),
      ]);

      return {
        ...toInitiativeSummary(project),
        descriptionHtml: renderRichText(project.description),
        relatedArticles: (Array.isArray(articles) ? articles : []).filter(isSanityArticle).map(toArticleSummary),
        relatedEvents: (Array.isArray(events) ? events : []).filter(isSanityEvent).map(toEventSummary),
      };
    },

    listArticles,

    async getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
      const article = await client.fetch<unknown>(articleBySlugQuery, { slug });

      if (!isSanityArticleDetail(article)) return null;

      return {
        ...toArticleSummary(article),
        bodyHtml: renderRichText(article.body),
        discussionUrl: facebookPostUrlOrUndefined(article.facebookPostUrl),
        galleryImageUrls: (article.galleryImageUrls ?? []).filter(
          (url): url is string => typeof url === 'string',
        ),
        relatedInitiatives: toRelatedInitiatives(article.projects),
        relatedEvent: isSanityEvent(article.event)
          ? toEventSummary(article.event)
          : undefined,
      };
    },

    listEvents,

    async getEventBySlug(slug: string): Promise<EventDetail | null> {
      const event = await client.fetch<unknown>(eventBySlugQuery, { slug });

      if (!isSanityEventDetail(event)) return null;

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
