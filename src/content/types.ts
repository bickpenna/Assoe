/** Dati che il sito usa, indipendenti dalla forma scelta dal CMS. */
export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

export interface ProjectDetail extends ProjectSummary {
  /** HTML prodotto dal provider, senza formati specifici del CMS. */
  descriptionHtml?: string;
  relatedArticles: ArticleSummary[];
  relatedEvents: EventSummary[];
}

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  publishedAt: string;
  imageUrl?: string;
}

export interface ArticleDetail extends ArticleSummary {
  bodyHtml?: string;
  galleryImageUrls: string[];
  /** Link esterno facoltativo per continuare la conversazione. */
  discussionUrl?: string;
  relatedProjects: ProjectSummary[];
  relatedEvent?: EventSummary;
}

export type EventStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export interface EventSummary {
  id: string;
  title: string;
  slug: string;
  date: string;
  place?: string;
  status: EventStatus;
  imageUrl?: string;
}

export interface EventDetail extends EventSummary {
  descriptionHtml?: string;
  galleryImageUrls: string[];
  discussionUrl?: string;
  relatedProjects: ProjectSummary[];
}

export type PersonRole =
  | 'president'
  | 'vicePresident'
  | 'secretary'
  | 'boardMember'
  | 'volunteer'
  | 'civilServiceVolunteer';

export interface PersonSummary {
  id: string;
  firstName: string;
  lastName: string;
  role: PersonRole;
  photoUrl?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  province?: string;
}

export interface AssociationInfo {
  name: string;
  logoUrl?: string;
  taxCode?: string;
  registryInfo?: string;
  copyright?: string;
  contacts: ContactInfo;
  socialLinks: Array<{ name: string; url: string }>;
  documents: {
    statuteUrl?: string;
    regulationUrl?: string;
    privacyPolicyUrl?: string;
    cookiePolicyUrl?: string;
  };
}

/** Le pagine dipendono da questo contratto, non da un client CMS. */
export interface ContentRepository {
  listProjects(): Promise<ProjectSummary[]>;
  getProjectBySlug(slug: string): Promise<ProjectDetail | null>;
  listArticles(): Promise<ArticleSummary[]>;
  getArticleBySlug(slug: string): Promise<ArticleDetail | null>;
  listEvents(): Promise<EventSummary[]>;
  getEventBySlug(slug: string): Promise<EventDetail | null>;
  listPeople(): Promise<PersonSummary[]>;
  getAssociationInfo(): Promise<AssociationInfo | null>;
}
