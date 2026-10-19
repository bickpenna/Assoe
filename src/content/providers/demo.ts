import { SITE_NAME } from '@/config/site';
import type {
  ArticleDetail,
  ArticleSummary,
  AssociationInfo,
  ContentRepository,
  EventDetail,
  EventSummary,
  PersonSummary,
  ProjectDetail,
  ProjectSummary,
} from '../types';

/** Solo anteprima locale: questi contenuti non descrivono attività reali dell'associazione. */
interface ProjectSeed {
  name: string;
  slug: string;
  summary: string;
}

interface ArticleSeed {
  title: string;
  slug: string;
  summary: string;
  projectSlug: string;
  eventSlug?: string;
}

interface EventSeed {
  title: string;
  slug: string;
  daysFromToday: number;
  projectSlug: string;
}

const projectSeeds: ProjectSeed[] = [
  { name: 'Spazi di quartiere', slug: 'spazi-di-quartiere', summary: 'Un luogo di incontro in cui conoscersi, condividere idee e costruire attività insieme.' },
  { name: 'Laboratori creativi', slug: 'laboratori-creativi', summary: 'Occasioni per sperimentare, imparare e mettere in comune capacità diverse.' },
  { name: 'Orti condivisi', slug: 'orti-condivisi', summary: 'Un esempio di cura degli spazi verdi e di collaborazione tra persone.' },
  { name: 'Storie in cammino', slug: 'storie-in-cammino', summary: 'Passeggiate e racconti per guardare il territorio da nuove prospettive.' },
  { name: 'Biblioteca aperta', slug: 'biblioteca-aperta', summary: 'Libri, letture e conversazioni come punto di partenza per stare insieme.' },
  { name: 'Piccoli gesti', slug: 'piccoli-gesti', summary: 'Idee semplici per prendersi cura dei luoghi e delle relazioni quotidiane.' },
  { name: 'Musica insieme', slug: 'musica-insieme', summary: 'La musica come occasione di ascolto, espressione e partecipazione.' },
  { name: 'Mappe di comunità', slug: 'mappe-di-comunita', summary: 'Raccogliere luoghi, ricordi e suggerimenti per immaginare nuove iniziative.' },
  { name: 'Mani in movimento', slug: 'mani-in-movimento', summary: 'Attività pratiche e manuali da scoprire in compagnia.' },
];

const articleSeeds: ArticleSeed[] = [
  { title: 'Una mattina di idee condivise', slug: 'una-mattina-di-idee-condivise', summary: 'Come potrebbe nascere un nuovo spazio di incontro a partire dalle proposte di tutti.', projectSlug: 'spazi-di-quartiere', eventSlug: 'incontro-di-quartiere' },
  { title: 'Creare insieme, passo dopo passo', slug: 'creare-insieme', summary: 'Materiali semplici e idee aperte per un laboratorio alla portata di tutti.', projectSlug: 'laboratori-creativi', eventSlug: 'laboratorio-di-collage' },
  { title: 'Coltivare relazioni', slug: 'coltivare-relazioni', summary: 'Un piccolo orto può diventare un pretesto per incontrarsi e collaborare.', projectSlug: 'orti-condivisi' },
  { title: 'Le storie che abitano una strada', slug: 'storie-di-una-strada', summary: 'Camminare lentamente aiuta a notare dettagli e racconti spesso trascurati.', projectSlug: 'storie-in-cammino' },
  { title: 'Un libro da leggere insieme', slug: 'un-libro-da-leggere-insieme', summary: 'La lettura condivisa apre domande, ricordi e nuove conversazioni.', projectSlug: 'biblioteca-aperta' },
  { title: 'La forza dei piccoli gesti', slug: 'la-forza-dei-piccoli-gesti', summary: 'Prendersi cura di un luogo comincia spesso da azioni molto semplici.', projectSlug: 'piccoli-gesti' },
  { title: 'Ascoltare il ritmo degli altri', slug: 'ascoltare-il-ritmo', summary: 'Un’attività musicale immaginata per fare spazio a voci ed esperienze diverse.', projectSlug: 'musica-insieme' },
  { title: 'Disegnare una mappa comune', slug: 'disegnare-una-mappa-comune', summary: 'Luoghi, parole e ricordi diventano punti su una mappa di comunità.', projectSlug: 'mappe-di-comunita' },
  { title: 'Imparare facendo', slug: 'imparare-facendo', summary: 'Le attività manuali sono un modo concreto per conoscersi e scambiarsi competenze.', projectSlug: 'mani-in-movimento' },
];

const eventSeeds: EventSeed[] = [
  { title: 'Incontro di quartiere', slug: 'incontro-di-quartiere', daysFromToday: 5, projectSlug: 'spazi-di-quartiere' },
  { title: 'Laboratorio di collage', slug: 'laboratorio-di-collage', daysFromToday: 12, projectSlug: 'laboratori-creativi' },
  { title: 'Una mattina nell’orto', slug: 'una-mattina-nell-orto', daysFromToday: 19, projectSlug: 'orti-condivisi' },
  { title: 'Passeggiata delle storie', slug: 'passeggiata-delle-storie', daysFromToday: 27, projectSlug: 'storie-in-cammino' },
  { title: 'Letture ad alta voce', slug: 'letture-ad-alta-voce', daysFromToday: -4, projectSlug: 'biblioteca-aperta' },
  { title: 'Pomeriggio di musica', slug: 'pomeriggio-di-musica', daysFromToday: -6, projectSlug: 'musica-insieme' },
  { title: 'Tavolo delle idee', slug: 'tavolo-delle-idee', daysFromToday: -9, projectSlug: 'mappe-di-comunita' },
  { title: 'Un gesto per il quartiere', slug: 'un-gesto-per-il-quartiere', daysFromToday: -17, projectSlug: 'piccoli-gesti' },
  { title: 'Giornata del fare', slug: 'giornata-del-fare', daysFromToday: -26, projectSlug: 'mani-in-movimento' },
];

const people: PersonSummary[] = [
  { id: 'demo-person-1', firstName: 'Anna', lastName: 'Esempio', role: 'president' },
  { id: 'demo-person-2', firstName: 'Marco', lastName: 'Esempio', role: 'vicePresident' },
  { id: 'demo-person-3', firstName: 'Sara', lastName: 'Esempio', role: 'secretary' },
  { id: 'demo-person-4', firstName: 'Luca', lastName: 'Esempio', role: 'boardMember' },
  { id: 'demo-person-5', firstName: 'Giulia', lastName: 'Esempio', role: 'boardMember' },
  { id: 'demo-person-6', firstName: 'Davide', lastName: 'Esempio', role: 'volunteer' },
  { id: 'demo-person-7', firstName: 'Elena', lastName: 'Esempio', role: 'volunteer' },
  { id: 'demo-person-8', firstName: 'Paolo', lastName: 'Esempio', role: 'civilServiceVolunteer' },
];

const association: AssociationInfo = {
  name: SITE_NAME,
  contacts: {
    email: 'contatti@esempio.invalid',
    address: 'Indirizzo di esempio, 1',
    city: 'Città di esempio',
  },
  socialLinks: [],
  documents: {},
};

function dateFromToday(days: number): string {
  const date = new Date();
  date.setUTCHours(10, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function paragraph(text: string): string {
  return `<p>${text}</p>`;
}

export function createDemoRepository(): ContentRepository {
  const projects: ProjectSummary[] = projectSeeds.map(({ name, slug }) => ({ id: `demo-project-${slug}`, name, slug }));
  const events: EventSummary[] = eventSeeds.map(({ title, slug, daysFromToday }) => ({
    id: `demo-event-${slug}`,
    title,
    slug,
    date: dateFromToday(daysFromToday),
    status: daysFromToday > 0 ? 'scheduled' : 'completed',
  }));
  const articles: ArticleSummary[] = articleSeeds.map(({ title, slug, summary }, index) => ({
    id: `demo-article-${slug}`,
    title,
    slug,
    summary,
    publishedAt: dateFromToday(-index * 7 - 2),
    featured: index === 0,
  }));

  const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
  const articleBySlug = new Map(articles.map((article) => [article.slug, article]));
  const eventBySlug = new Map(events.map((event) => [event.slug, event]));

  return {
    async listProjects() { return projects; },
    async getProjectBySlug(slug): Promise<ProjectDetail | null> {
      const project = projectBySlug.get(slug);
      const seed = projectSeeds.find((item) => item.slug === slug);
      if (!project || !seed) return null;
      return {
        ...project,
        descriptionHtml: paragraph(seed.summary) + paragraph('Questa è una descrizione dimostrativa. Qui potranno comparire obiettivi, attività e aggiornamenti del progetto quando saranno inseriti nel CMS.'),
        relatedArticles: articleSeeds.filter((item) => item.projectSlug === slug).flatMap((item) => {
          const article = articleBySlug.get(item.slug);
          return article ? [article] : [];
        }),
        relatedEvents: eventSeeds.filter((item) => item.projectSlug === slug).flatMap((item) => {
          const event = eventBySlug.get(item.slug);
          return event ? [event] : [];
        }),
      };
    },
    async listArticles() { return articles; },
    async getArticleBySlug(slug): Promise<ArticleDetail | null> {
      const article = articleBySlug.get(slug);
      const seed = articleSeeds.find((item) => item.slug === slug);
      if (!article || !seed) return null;
      const project = projectBySlug.get(seed.projectSlug);
      return {
        ...article,
        bodyHtml: paragraph(seed.summary) + paragraph('Testo di esempio per verificare l’impaginazione di un articolo completo. Il racconto definitivo verrà scritto e pubblicato dai volontari nel CMS.'),
        galleryImageUrls: [],
        relatedProjects: project ? [project] : [],
        relatedEvent: seed.eventSlug ? eventBySlug.get(seed.eventSlug) : undefined,
      };
    },
    async listEvents() { return events; },
    async getEventBySlug(slug): Promise<EventDetail | null> {
      const event = eventBySlug.get(slug);
      const seed = eventSeeds.find((item) => item.slug === slug);
      if (!event || !seed) return null;
      const project = projectBySlug.get(seed.projectSlug);
      return {
        ...event,
        descriptionHtml: paragraph('Evento dimostrativo: data e attività sono inventate per provare il layout. Le informazioni reali verranno pubblicate nel CMS.') + paragraph('Questa pagina può ospitare descrizione, luogo, locandina, fotografie e collegamenti ai progetti.'),
        galleryImageUrls: [],
        relatedProjects: project ? [project] : [],
      };
    },
    async listPeople() { return people; },
    async getAssociationInfo() { return association; },
  };
}
