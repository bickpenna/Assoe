# Asso è… La Strada ci Insegna ODV

Sito web dell'associazione, sviluppato con Astro e alimentato dai contenuti pubblicati su Sanity. Il sito è statico: Astro genera le pagine durante la build, mentre i volontari aggiornano testi, immagini e dati dell'associazione nello Studio Sanity.

## Struttura del progetto

| Percorso | Responsabilità |
| --- | --- |
| `src/pages/`, `src/components/`, `src/styles/` | Pagine, componenti e stile del sito Astro |
| `src/content/types.ts` | Contratto dei contenuti, indipendente dal CMS |
| `src/content/providers/` | Adattatore Sanity e trasformazione dei dati |
| `studio/` | Studio Sanity e schemi dei contenuti, con dipendenze proprie |
| `shared/` | Validazioni riutilizzate da sito e Studio |
| `docs/class.puml` | Diagramma del modello dei contenuti |

Le pagine usano il contratto in `src/content/types.ts`, non le strutture di Sanity. Per cambiare CMS occorre creare un nuovo adattatore e migrare i contenuti, ma non riscrivere le pagine.

## Avvio locale

Serve Node.js 24 e npm. Per il sito con i contenuti reali:

```bash
npm ci
npm run dev
```

Prima di avviare il server, se `.env` non esiste crearne uno a partire da `.env.example` e inserire il `PUBLIC_SANITY_PROJECT_ID` del progetto Sanity. `PUBLIC_SANITY_DATASET` vale `production` se non specificato. Se `.env` esiste già, mantenerlo: non occorre ricrearlo cambiando branch. Il file `.env` non va pubblicato nel repository.

### Lavorare senza modificare il sito online

La branch `main` è la versione destinata a GitHub Pages. Per sviluppare e vedere le modifiche in locale:

```bash
git switch develop
npm run dev
```

Aprire l'indirizzo mostrato da Astro nel terminale (di solito `http://localhost:4321/`). Il server locale usa i contenuti **reali e pubblicati** del dataset Sanity configurato nel proprio `.env`. Le modifiche al codice su `develop` non cambiano il sito online. I push su `develop` eseguono i controlli CI, ma il workflow Pages è limitato a `main`. Quando una modifica è pronta, aprire una pull request verso `main`, verificarla e unirla; poi avviare il workflow Pages su `main` per pubblicare il nuovo codice.

Attenzione: `develop` e il sito online leggono lo **stesso dataset Sanity**. Pubblicare o modificare contenuti nello Studio può quindi aggiornare anche il sito online tramite il webhook di ricostruzione già configurato. La branch isola il codice, non i contenuti; per provare contenuti senza renderli pubblici servirebbe un dataset separato.

Lo Studio ha un'installazione separata:

```bash
cd studio
cp .env.example .env
npm ci
npm run dev
```

Impostare `SANITY_STUDIO_PROJECT_ID` e `SANITY_STUDIO_DATASET` in `studio/.env` con gli stessi valori del frontend. Lo Studio locale è indipendente dalla distribuzione dello Studio online: le modifiche agli schemi vanno distribuite anche lì.

## Contenuti e pubblicazione

Sanity gestisce **Informazioni associazione**, iniziative, articoli, eventi e persone. Struttura delle pagine, navigazione e grafica restano nel codice Astro.

- **Informazioni associazione** è una scheda unica: contiene logo, racconto di Chi siamo, contatti, social, dati per 5×1000 e donazioni, oltre ai PDF disponibili. Verificare dati bancari e documenti prima di pubblicarli.
- **Iniziative**: le prime quattro nell'ordine dello Studio compaiono in home. Per riordinarle si trascinano nella lista; per le iniziative già esistenti senza posizione, usare **Reset Order** una sola volta prima di iniziare a riordinare.
- **Eventi**: in home compare solo un prossimo evento non annullato. L'archivio separa futuri e passati in ordine cronologico.
- **Articoli ed eventi** possono rimandare a un post Facebook pubblico per la conversazione, senza incorporare Facebook nel sito.
- **URL degli articoli**: nello Studio si inserisce solo la parte breve dell’indirizzo (per esempio `benedizione-nuova-sede`); il sito aggiunge automaticamente la data di pubblicazione e crea `/articoli/2026-10-22-benedizione-nuova-sede/`. Non scrivere la data nel campo slug. Questa regola vale anche per gli articoli già presenti; dopo la pubblicazione, cambiare data o parte breve modifica l’indirizzo pubblico.
- **Persone**: i profili visibili sono raggruppati per ruolo nella pagina Associati; il direttivo compare anche in Chi siamo. Pubblicare foto di persone solo con il consenso necessario.

Gli URL pubblici delle iniziative sono `/iniziative/` e `/iniziative/<slug>/`; i precedenti URL `/progetti/` rimandano alle nuove pagine, incluse quelle di dettaglio e le pagine dell’archivio. In Sanity il tipo di documento resta internamente `project` e i riferimenti di articoli/eventi restano `projects`: sono chiavi già salvate, mantenute per non perdere contenuti, ordinamento e collegamenti. Non rinominarle senza una migrazione dei dati.

Il sito pubblico usa solo contenuti pubblicati. Il webhook Sanity configurato nel progetto avvia una nuova build Pages su `main` dopo le modifiche ai contenuti. Il passaggio di un evento da futuro a passato, invece, non è di per sé una modifica nel CMS: per aggiornare le pagine a quella data serve una nuova build manuale o una pianificazione periodica.

## Palette e immagini

I valori di riferimento sono i token in [`src/styles/global.css`](src/styles/global.css):

| Uso | Colore |
| --- | --- |
| Verde principale | `#156A28` |
| Verde scuro (header e footer) | `#0C4D1D` |
| Verde chiaro | `#D7EDDA` |
| Giallo lime (5×1000 e richiami) | `#D7ED62` |
| Sfondo | `#F4F9F3` |
| Sfondo secondario | `#E9F3E9` |
| Schede | `#FFFFFF` |
| Testo | `#18231C` |
| Testo secondario | `#4B5B50` |
| Bordi | `#D6E4D7` |

Le immagini caricate su Sanity vengono elaborate da Astro durante la build in formati e dimensioni adatti al layout. Foto delle schede e ritratti possono essere ritagliati; logo, locandine e immagini di galleria mantengono le proporzioni. Se una foto di iniziativa ha bordi indesiderati, ritagliarla nello Studio prima di pubblicarla.

## Verifiche e distribuzione

Dalla radice del repository:

```bash
npm run check
npm test
npm run test:coverage
npm run build
npm run check:build
```

`check:build` controlla i file statici prodotti dall'ultima build. `npm run build` genera il sito con i contenuti reali e richiede un progetto Sanity raggiungibile. Anche la CI usa Sanity per la build; per verificarla deve essere configurata la variabile GitHub `PUBLIC_SANITY_PROJECT_ID`. Per verificare la build dello Studio: `cd studio && npm run build`.

Il workflow in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) esegue i controlli di sito e Studio anche su `develop`. [`.github/workflows/pages.yml`](.github/workflows/pages.yml) pubblica **il sito con i contenuti reali di Sanity** su GitHub Pages solo quando è eseguito su `main`: si può avviare manualmente da **Actions → Publish Astro to GitHub Pages → Run workflow**, selezionando `main`, oppure tramite il webhook Sanity già configurato. Un push del solo codice su `main` non avvia automaticamente il deploy: dopo il merge va lanciato manualmente il workflow.

L'indirizzo dell'anteprima pubblica è `https://bickpenna.github.io/Assoe/`. In **Settings → Pages**, la sorgente deve essere **GitHub Actions**. In **Settings → Secrets and variables → Actions → Variables** serve `PUBLIC_SANITY_PROJECT_ID`; `PUBLIC_SANITY_DATASET` è facoltativa e, se assente, vale `production`. Il Project ID non è una credenziale; non aggiungere token Sanity al sito statico. La build fallisce se manca il Project ID. L'anteprima pubblica aggiunge `noindex` ai motori di ricerca, ma **resta accessibile a chiunque abbia il link**.

Il workflow imposta `SITE_URL` e `SITE_BASE` per il percorso `/Assoe/`. Per provare in locale esattamente quel percorso:

```bash
SITE_URL=https://bickpenna.github.io SITE_BASE=/Assoe/ npm run build
SITE_BASE=/Assoe/ npm run check:build
```

Quando il repository passerà all'account dell'associazione, l'indirizzo GitHub Pages cambierà con il proprietario della repo; il workflow usa automaticamente il nuovo account. Per usare invece `volontariato.assoe.it` serviranno una configurazione DNS e un aggiornamento di `SITE_URL`/`SITE_BASE` nel workflow, senza cambiare i link nei componenti. **Non puntare il dominio prima di decidere quando sostituire il vecchio sito.**

### Aggiornare lo Studio Sanity

La build dello Studio nella CI verifica il codice, ma non aggiorna lo Studio ospitato da Sanity. Lo Studio esistente è su **https://assoe.sanity.studio/**; il suo `appId` è fissato in `studio/sanity.cli.ts`, così i prossimi deploy aggiornano proprio questa installazione. Sul proprio computer autenticarsi e distribuirlo:

```bash
cd studio
npx sanity login
npm run deploy
```

Se viene proposto un hostname nuovo inatteso, fermarsi: si rischia di creare un secondo Studio. Il deploy aggiorna interfaccia e schemi, non migra né cancella i documenti. La sessione di login è locale e non va copiata in GitHub. Il webhook per ricostruire Pages dopo le modifiche ai contenuti è gestito nelle impostazioni di Sanity, non in questo repository.
