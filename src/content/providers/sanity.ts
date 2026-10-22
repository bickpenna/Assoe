import { createClient } from '@sanity/client';
import { facebookPostUrlOrUndefined } from '../../utils/facebook';
import { articlePublicSlug } from '../../utils/articleSlug';
import { assertUniqueSlugs } from '../../utils/content';
import { sanityAssetUrlOrUndefined } from '../../../shared/url';
import {
  articleByIdQuery,
  articlesByInitiativeQuery,
  articlesQuery,
  associationQuery,
  eventBySlugQuery,
  eventsByInitiativeQuery,
  eventsQuery,
  initiativeBySlugQuery,
  initiativesQuery,
  peopleQuery,
} from './sanityQueries';
import {
  isSanityArticle,
  isSanityArticleDetail,
  isSanityAssociation,
  isSanityEvent,
  isSanityEventDetail,
  isSanityPerson,
  isSanityInitiative,
  isSanityInitiativeDetail,
} from './sanityValidation';
import {
  renderRichText,
  safeSanityAssetUrls,
  toArticleSummary,
  toAssociationInfo,
  toEventSummary,
  toInitiativeSummary,
  toRelatedInitiatives,
} from './sanityMappers';
import type {
  AssociationInfo,
  ContentRepository,
  ArticleDetail,
  EventDetail,
  InitiativeDetail,
} from '../types';

interface SanityConfig {
  projectId: string;
  dataset: string;
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
    const initiatives = await client.fetch<unknown>(initiativesQuery);
    const summaries = (Array.isArray(initiatives) ? initiatives : []).filter(isSanityInitiative).map(toInitiativeSummary);
    assertUniqueSlugs(summaries, 'Le iniziative');
    return summaries;
  });

  const listArticles = cachePromise(async () => {
    const articles = await client.fetch<unknown>(articlesQuery);
    const summaries = (Array.isArray(articles) ? articles : []).filter(isSanityArticle).map(toArticleSummary);
    assertUniqueSlugs(summaries, 'Gli articoli');
    return summaries;
  });

  const listEvents = cachePromise(async () => {
    const events = await client.fetch<unknown>(eventsQuery);
    const summaries = (Array.isArray(events) ? events : []).filter(isSanityEvent).map(toEventSummary);
    assertUniqueSlugs(summaries, 'Gli eventi');
    return summaries;
  });

  const listPeople = cachePromise(async () => {
    const people = await client.fetch<unknown>(peopleQuery);
    return (Array.isArray(people) ? people : []).filter(isSanityPerson).map(({ _id, firstName, lastName, role, photoUrl }) => ({
      id: _id,
      firstName,
      lastName,
      role,
      photoUrl: sanityAssetUrlOrUndefined(photoUrl),
    }));
  });

  const getAssociationInfo = cachePromise(async (): Promise<AssociationInfo | null> => {
    const info = await client.fetch<unknown>(associationQuery);

    if (!isSanityAssociation(info)) return null;

    return toAssociationInfo(info);
  });

  return {
    listInitiatives,

    async getInitiativeBySlug(slug: string): Promise<InitiativeDetail | null> {
      const initiative = await client.fetch<unknown>(initiativeBySlugQuery, { slug });

      if (!isSanityInitiativeDetail(initiative)) return null;

      const [articles, events] = await Promise.all([
        client.fetch<unknown>(articlesByInitiativeQuery, { initiativeId: initiative._id }),
        client.fetch<unknown>(eventsByInitiativeQuery, { initiativeId: initiative._id }),
      ]);

      return {
        ...toInitiativeSummary(initiative),
        descriptionHtml: renderRichText(initiative.description),
        relatedArticles: (Array.isArray(articles) ? articles : []).filter(isSanityArticle).map(toArticleSummary),
        relatedEvents: (Array.isArray(events) ? events : []).filter(isSanityEvent).map(toEventSummary),
      };
    },

    listArticles,

    async getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
      const summary = (await listArticles()).find((article) => article.slug === slug);
      if (!summary) return null;

      const article = await client.fetch<unknown>(articleByIdQuery, { id: summary.id });

      if (!isSanityArticleDetail(article)) return null;
      if (articlePublicSlug(article.slug, article.publishedAt) !== slug) return null;

      return {
        ...toArticleSummary(article),
        bodyHtml: renderRichText(article.body),
        discussionUrl: facebookPostUrlOrUndefined(article.facebookPostUrl),
        galleryImageUrls: safeSanityAssetUrls(article.galleryImageUrls),
        relatedInitiatives: toRelatedInitiatives(article.initiatives),
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
        galleryImageUrls: safeSanityAssetUrls(event.galleryImageUrls),
        relatedInitiatives: toRelatedInitiatives(event.initiatives),
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
