# Asso è… La Strada ci Insegna ODV

Sito web dell’associazione **Asso è… La Strada ci Insegna ODV**. Presenta le attività, le iniziative, gli eventi e le notizie dell’associazione, con informazioni per associarsi e sostenerne i progetti.

Il sito è sviluppato con [Astro](https://astro.build/) e TypeScript. I contenuti sono gestiti con [Sanity](https://www.sanity.io/) attraverso uno Studio dedicato, incluso nel repository.

## Come funziona

Astro genera il sito statico usando i contenuti pubblicati su Sanity. Il browser dei visitatori riceve le pagine già generate, senza interrogare il CMS.

Lo Studio permette di gestire informazioni dell’associazione, avvisi della homepage, iniziative, articoli, eventi e profili delle persone. Le bozze restano escluse dal sito pubblico. Per rendere visibili gli aggiornamenti pubblicati nel CMS è necessaria una nuova build del sito.

## Requisiti

- Node.js 24 e npm.
- Identificativo del progetto Sanity e nome del dataset.
- Accesso al progetto Sanity per utilizzare lo Studio e modificare i contenuti.

Il sito e lo Studio hanno dipendenze e file di configurazione separati.

## Sviluppo locale

### Sito

Dalla radice del repository:

```bash
cp .env.example .env
npm ci
```

Configurare `.env` con l’identificativo del progetto Sanity e il dataset da utilizzare:

```dotenv
PUBLIC_SANITY_PROJECT_ID=<id-progetto>
PUBLIC_SANITY_DATASET=production
```

Avviare il server di sviluppo:

```bash
npm run dev
```

### Studio Sanity

In un terminale separato:

```bash
cd studio
cp .env.example .env
npm ci
```

Configurare `studio/.env` con il progetto e il dataset da gestire:

```dotenv
SANITY_STUDIO_PROJECT_ID=<id-progetto>
SANITY_STUDIO_DATASET=production
```

Avviare lo Studio:

```bash
npm run dev
```

Per lavorare sugli stessi contenuti, sito e Studio devono puntare allo stesso progetto e dataset. Le modifiche pubblicate dallo Studio locale aggiornano il dataset configurato: utilizzare un dataset separato per contenuti di prova.

I file `.env` sono esclusi da Git. Credenziali, token e dati riservati devono restare fuori dal repository e dalle variabili esposte al browser.

## Struttura del repository

| Percorso | Contenuto |
| --- | --- |
| `src/pages/` | Pagine e percorsi del sito |
| `src/layouts/` | Struttura condivisa delle pagine |
| `src/components/` | Componenti dell’interfaccia |
| `src/styles/` | Stili globali e responsive |
| `src/config/` | Configurazione del sito e della navigazione |
| `src/content/` | Modello dei contenuti e integrazione con Sanity |
| `src/utils/` | Funzioni di supporto al frontend |
| `shared/` | Funzioni e validazioni condivise con lo Studio |
| `studio/` | Configurazione, schemi e interfaccia dello Studio Sanity |
| `scripts/` | Verifiche dell’output e generazione degli avvisi di licenza |
| `tests/` | Test automatici |

Il modello dei contenuti è definito in [`src/content/types.ts`](src/content/types.ts). Query, validazione e conversione dei documenti Sanity sono raccolte in [`src/content/providers/`](src/content/providers/).

## Verifiche e build

I comandi seguenti si eseguono dalla radice del repository, dopo aver installato le dipendenze.

| Comando | Funzione |
| --- | --- |
| `npm run check` | Controlla tipi e componenti Astro |
| `npm test` | Esegue i test automatici |
| `npm run test:coverage` | Verifica la copertura dei test e le soglie configurate |
| `npm run build` | Genera il sito statico in `dist/` |
| `npm run check:build` | Verifica pagine, collegamenti e struttura dell’ultima build |
| `npm run preview` | Serve in locale l’ultima build |

La generazione del sito richiede la configurazione Sanity e una connessione di rete per leggere i contenuti e scaricare le immagini. Le immagini sono ottimizzate durante la build.

Per verificare lo Studio, con le sue dipendenze già installate:

```bash
npm --prefix studio run build
npm --prefix studio run audit:high
```

## Pubblicazione

Il workflow [Quality checks](.github/workflows/ci.yml) esegue le verifiche del sito e dello Studio sui push e sulle pull request.

Il workflow [Publish Astro to GitHub Pages](.github/workflows/pages.yml) genera e pubblica il sito dai contenuti di `main`, su push, avvio manuale o pianificazione quotidiana. Usa le variabili GitHub Actions `PUBLIC_SANITY_PROJECT_ID` e `PUBLIC_SANITY_DATASET`, con `production` come dataset predefinito. La configurazione degli indirizzi di pubblicazione è definita nel workflow e in [`astro.config.mjs`](astro.config.mjs).

Lo Studio viene distribuito separatamente. Da una sessione autenticata a Sanity:

```bash
npm --prefix studio run deploy
```

Le modifiche agli schemi e all’interfaccia dello Studio richiedono un nuovo deploy dello Studio; la pubblicazione del sito resta gestita dal workflow GitHub Pages.

## Diritti e licenze

Il codice originale, la documentazione originale, il nome, i loghi e i contenuti dell’associazione sono di titolarità di **Asso è… La Strada ci Insegna ODV**, con tutti i diritti riservati. Le condizioni sono riportate in [LICENSE](LICENSE).

I componenti di terze parti mantengono le rispettive licenze. I relativi avvisi sono descritti in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) e inclusi nelle build del sito e dello Studio.
