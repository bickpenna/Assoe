# Asso è… La Strada ci Insegna ODV

Nuovo sito dell'associazione, costruito con Astro e Sanity.

## Architettura

Il repository contiene due applicazioni indipendenti:

- `src/`: frontend Astro pubblico;
- `studio/`: Sanity Studio per la gestione dei contenuti;
- `docs/class.puml`: diagramma del modello dei contenuti;

Astro gestisce pagine, componenti e layout. Sanity gestisce esclusivamente i contenuti modificabili dai volontari: impostazioni del sito, progetti, articoli, eventi e persone.

Nel frontend le pagine leggono i contenuti tramite `src/content/index.ts` e il contratto in `src/content/types.ts`. Le query GROQ e la conversione dei dati Sanity sono isolate in `src/content/providers/sanity.ts`. Per passare a un altro CMS si implementa lo stesso contratto in un nuovo provider e si cambia la scelta in `src/content/index.ts`; pagine e componenti non devono conoscere il CMS. Il contratto verrà ampliato quando saranno realizzate le altre pagine.

Il contratto espone per ora gli elenchi di progetti, articoli, eventi e persone visibili, oltre alle informazioni dell'associazione (contatti, social e link ai documenti). Immagini e PDF sono restituiti come URL, senza oggetti specifici di Sanity. I testi formattati e i dettagli dei singoli contenuti saranno definiti insieme alle pagine che li useranno, evitando di imporre ora un formato legato al CMS.

Questo riduce le modifiche al codice, ma non elimina la migrazione dei contenuti: testi, immagini, file e riferimenti andranno esportati da Sanity e importati nel nuovo sistema. Per i contenuti complessi, come il testo formattato, servirà anche una conversione del formato.

`siteSettings` è un documento unico: nello Studio compare una sola voce "Informazioni associazione", modificabile senza crearne altre copie. Ogni profilo social ha un nome libero e un link.

Le pagine istituzionali e la struttura grafica restano nel codice Astro finché non emergerà la necessità di renderle modificabili dal CMS.

## Sviluppo del frontend

```bash
npm install
npm run dev
```

Prima di avviare Astro, copiare `.env.example` in `.env` nella radice del repository e impostare `PUBLIC_SANITY_PROJECT_ID`. Il dataset predefinito è `production`. La build legge i contenuti pubblicati dal CMS, quindi richiede l'accesso a Sanity durante la compilazione.

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
