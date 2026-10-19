# Asso è… La Strada ci Insegna ODV

Nuovo sito dell'associazione, costruito con Astro e Sanity.

## Architettura

Il repository contiene due applicazioni indipendenti:

- `src/`: frontend Astro pubblico;
- `studio/`: Sanity Studio per la gestione dei contenuti;
- `docs/class.puml`: diagramma del modello dei contenuti;

Astro gestisce pagine, componenti e layout. Sanity gestisce esclusivamente i contenuti modificabili dai volontari: informazioni dell'associazione, progetti, articoli, eventi e persone.

Nel frontend le pagine leggono i contenuti tramite `src/content/index.ts` e il contratto in `src/content/types.ts`. Le query GROQ e la conversione dei dati Sanity sono isolate in `src/content/providers/sanity.ts`. Per passare a un altro CMS si implementa lo stesso contratto in un nuovo provider e si cambia la scelta in `src/content/index.ts`; pagine e componenti non devono conoscere il CMS.

Il contratto espone elenchi e dettagli di progetti, articoli ed eventi, le persone visibili e le informazioni dell'associazione (contatti, social e link ai documenti). Immagini e PDF sono restituiti come URL, senza oggetti specifici di Sanity. Le relazioni tra contenuti vengono risolte nell'adattatore: sul sito appaiono solo link a contenuti pubblicati e raggiungibili.

I progetti sono il primo percorso completo: `/progetti/` mostra quelli attivi e pubblicati, mentre `/progetti/[slug]/` mostra il singolo progetto. Il testo formattato di Sanity viene convertito in HTML nell'adattatore, prima di arrivare alla pagina Astro. Se non ci sono progetti pubblicati, l'elenco mostra un messaggio e non vengono generate pagine di dettaglio.

Anche gli articoli hanno elenco e dettaglio su `/articoli/` e `/articoli/[slug]/`: mostrano data, sommario, testo, immagini e collegamenti a progetti ed eventi quando presenti. Il testo formattato viene convertito nell'adattatore.

Gli eventi hanno elenco e dettaglio su `/eventi/` e `/eventi/[slug]/`, con data, luogo, stato, descrizione, immagini e progetti collegati. I dettagli dei progetti rimandano agli articoli ed eventi associati.

`/chi-siamo/` e `/contatti/` sono pagine istituzionali definite in Astro: non sono documenti modificabili nel CMS. Mostrano rispettivamente dati e documenti dell'associazione; contatti e social. `/associati/` raccoglie le persone visibili, divise per ruolo, con foto, nome e ruolo. I campi opzionali assenti non producono sezioni vuote. Il layout condivide navigazione, nome dell'associazione e footer tra tutte le pagine.

Il logo delle Informazioni associazione è usato nell'header, nel footer e nella homepage tramite `SiteBrand` e `ContentImage`; se non è ancora presente compare il marchio testuale. Le voci di navigazione sono definite una volta in `src/config/navigation.ts` e riutilizzate nei menu e nel footer. Nome e marchio testuali sono centralizzati in `src/config/site.ts`.

La homepage segue la direzione visiva dei mockup Stitch forniti, adattata ai soli dati disponibili: un evento in programma (o il più recente), progetti, articoli e un riquadro 5×1000 prima del footer. Non contiene statistiche, orari o inviti a diventare volontari inventati dal prototipo. `/5x1000/` offre indicazioni generali e rimanda all'Agenzia delle Entrate; il codice fiscale dell'associazione non viene mostrato finché non è confermato.

La palette attiva del frontend è definita in `src/styles/global.css`: verde principale `#156A28`, verde scuro `#0C4D1D`, giallo caldo `#F4DC78`, fondo `#F4F9F3` e testo `#18231C`. Il giallo è l'accento del riquadro 5×1000; l'ambra e l'arancione presenti nei mockup non fanno parte della palette attiva. Il contorno di focus usa il verde scuro per restare leggibile anche sui fondi chiari.

Le immagini del CMS sono elaborate durante la build da Astro e pubblicate in WebP con dimensioni responsive. Le fotografie nelle card e nei ritratti hanno un ritaglio controllato; locandine, logo e immagini di galleria conservano le proporzioni originali, rilevate da Astro, per non tagliare testi o deformare file di forme diverse. L'host delle immagini autorizzato è configurato in `astro.config.mjs`; in caso di cambio CMS andrà aggiornato insieme al provider.

Questo riduce le modifiche al codice, ma non elimina la migrazione dei contenuti: testi, immagini, file e riferimenti andranno esportati da Sanity e importati nel nuovo sistema. Per i contenuti complessi, come il testo formattato, servirà anche una conversione del formato.

`siteSettings` è un documento unico: nello Studio compare una sola voce "Informazioni associazione", modificabile senza crearne altre copie. Ogni profilo social ha un nome libero e un link.

Le pagine istituzionali e la struttura grafica restano nel codice Astro finché non emergerà la necessità di renderle modificabili dal CMS.

## Sviluppo del frontend

```bash
npm install
npm run dev
```

Prima di avviare Astro, copiare `.env.example` in `.env` nella radice del repository e impostare `PUBLIC_SANITY_PROJECT_ID`. Il dataset predefinito è `production`. La build legge i contenuti pubblicati dal CMS, quindi richiede l'accesso a Sanity durante la compilazione.

Il frontend è statico: per rendere visibili nuovi progetti o modifiche ai contenuti pubblicati bisogna eseguire una nuova build e distribuire il risultato. L'aggiornamento automatico dopo la pubblicazione nel CMS non è ancora configurato.

Controlli e build:

```bash
npm run check
npm run build
```

## Sviluppo dello Studio Sanity

```bash
cd studio
npm install
npm run dev
```

Prima di avviare lo Studio, copiare `studio/.env.example` in `studio/.env` e impostare `SANITY_STUDIO_PROJECT_ID` e `SANITY_STUDIO_DATASET` con gli stessi valori usati dal frontend.

## Principi

- `docs/class.puml` documenta il modello dei contenuti;
- il CMS non controlla il layout del sito;
- i campi obbligatori e i limiti vengono validati nello schema Sanity;
- le pagine Astro dipendono dal contratto dei contenuti, non dal client Sanity;
- i contenuti pubblici devono essere verificati prima della pubblicazione.
