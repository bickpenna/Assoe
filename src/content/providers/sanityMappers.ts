import { toHTML } from '@portabletext/to-html';
import { articlePublicSlug } from '../../utils/articleSlug.ts';
import { sanitizeRichTextHtml } from '../../utils/sanitizeHtml.ts';
import {
  emailAddressOrUndefined,
  httpsUrlOrUndefined,
  phoneNumberOrUndefined,
  sanityAssetUrlOrUndefined,
} from '../../../shared/url.ts';
import { validIbanOrUndefined } from '../../../shared/iban.ts';
import { initiativeImageUrl } from './sanityImage.ts';
import {
  isSanityRelatedProject,
  toPortableTextBlocks,
  type SanityArticle,
  type SanityAssociation,
  type SanityEvent,
  type SanityProject,
  type SanityRelatedProject,
} from './sanityValidation.ts';
import type {
  ArticleSummary,
  AssociationInfo,
  EventSummary,
  InitiativeSummary,
} from '../types.ts';

export function renderRichText(blocks: unknown): string | undefined {
  const validBlocks = toPortableTextBlocks(blocks);
  return validBlocks?.length ? sanitizeRichTextHtml(toHTML(validBlocks)) : undefined;
}

export function toArticleSummary(article: SanityArticle): ArticleSummary {
  return {
    id: article._id,
    title: article.title,
    slug: articlePublicSlug(article.slug, article.publishedAt),
    summary: article.summary ?? undefined,
    publishedAt: article.publishedAt,
    imageUrl: sanityAssetUrlOrUndefined(article.imageUrl),
  };
}

export function toInitiativeSummary(project: SanityProject): InitiativeSummary {
  return {
    id: project._id,
    name: project.name,
    slug: project.slug,
    imageUrl: initiativeImageUrl(project.image),
  };
}

export function toRelatedInitiatives(projects: Array<SanityRelatedProject | null> | null): InitiativeSummary[] {
  return (projects ?? [])
    .filter((project): project is SanityRelatedProject => Boolean(project?.active && isSanityRelatedProject(project)))
    .map(toInitiativeSummary);
}

export function toEventSummary(event: SanityEvent): EventSummary {
  return {
    id: event._id,
    title: event.title,
    slug: event.slug,
    date: event.date,
    place: event.place ?? undefined,
    status: event.status,
    imageUrl: sanityAssetUrlOrUndefined(event.imageUrl),
  };
}

export function safeSanityAssetUrls(urls: Array<string | null> | null): string[] {
  return (urls ?? []).flatMap((url) => {
    const safeUrl = sanityAssetUrlOrUndefined(url);
    return safeUrl ? [safeUrl] : [];
  });
}

export function toAssociationInfo(info: SanityAssociation): AssociationInfo {
  const iban = validIbanOrUndefined(info.bankDetails?.iban);
  const accountHolder = info.bankDetails?.accountHolder?.trim();

  return {
    name: info.associationName,
    logoUrl: sanityAssetUrlOrUndefined(info.logoUrl),
    aboutText: info.aboutText?.trim() || undefined,
    aboutImageUrl: sanityAssetUrlOrUndefined(info.aboutImageUrl),
    taxCode: info.taxCode ?? undefined,
    bankDetails: iban && accountHolder ? {
      iban,
      accountHolder,
      bankName: info.bankDetails?.bankName?.trim() || undefined,
    } : undefined,
    registryInfo: info.registryInfo ?? undefined,
    copyright: info.copyright ?? undefined,
    contacts: {
      email: emailAddressOrUndefined(info.contacts?.email),
      phone: phoneNumberOrUndefined(info.contacts?.phone),
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
      statuteUrl: sanityAssetUrlOrUndefined(info.statuteUrl),
      regulationUrl: sanityAssetUrlOrUndefined(info.regulationUrl),
      privacyPolicyUrl: sanityAssetUrlOrUndefined(info.privacyPolicyUrl),
      cookiePolicyUrl: sanityAssetUrlOrUndefined(info.cookiePolicyUrl),
    },
  };
}

