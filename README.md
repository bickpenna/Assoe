# Asso è… La Strada ci Insegna ODV

Nuovo sito dell'associazione, costruito con Astro e Sanity.

## Architettura

Il repository contiene due applicazioni indipendenti:

- `src/`: frontend Astro pubblico;
- `studio/`: Sanity Studio per la gestione dei contenuti;
- `docs/class.puml`: diagramma del modello dei contenuti;

Astro gestisce pagine, componenti e layout. Sanity gestisce esclusivamente i contenuti modificabili dai volontari: informazioni dell'associazione, progetti, articoli, eventi e persone.

Nel frontend le pagine leggono i contenuti tramite `src/content/index.ts` e il contratto in `src/content/types.ts`. Le query GROQ e la conversione dei dati Sanity sono isolate in `src/content/providers/sanity.ts`. Per passare a un altro CMS si implementa lo stesso contratto in un nuovo provider e si cambia la scelta in `src/content/index.ts`; pagine e componenti non devono conoscere il CMS.

Il contratto espone elenchi e dettagli di progetti, articoli ed eventi, le persone visibili e le informazioni dell'associazione (contatti, social, coordinate bancarie e link ai documenti). Immagini e PDF sono restituiti come URL, senza oggetti specifici di Sanity. Le relazioni tra contenuti vengono risolte nell'adattatore: sul sito appaiono solo link a contenuti pubblicati e raggiungibili.

I progetti sono il primo percorso completo: `/progetti/` mostra quelli attivi e pubblicati in una griglia di schede condivisa con la home e i progetti correlati ad articoli ed eventi, mentre `/progetti/[slug]/` mostra il singolo progetto. La griglia funziona anche senza immagini e diventa a colonna singola sugli schermi piccoli. Il testo formattato di Sanity viene convertito in HTML nell'adattatore, prima di arrivare alla pagina Astro. Se non ci sono progetti pubblicati, l'archivio mostra un messaggio e non vengono generate pagine di dettaglio.

Anche gli articoli hanno elenco e dettaglio su `/articoli/` e `/articoli/[slug]/`: mostrano data, sommario, testo, immagini e collegamenti a progetti ed eventi quando presenti. Il testo formattato viene convertito nell'adattatore.

Articoli ed eventi possono avere un link facoltativo a un post Facebook pubblico: nello Studio si compila **Post Facebook** con l'URL del post nella scheda desiderata. In fondo alla pagina compare un invito a leggere i commenti e partecipare alla conversazione, senza incorporare Facebook nel sito. Se il campo è vuoto, il richiamo non compare. Il racconto e le immagini principali devono comunque restare sul sito: il post esterno potrebbe non essere accessibile a tutti. Il campo è indipendente dal riferimento **Evento raccontato** dell'articolo: quest'ultimo crea un link interno alla pagina dell'evento, non al post Facebook. Per vedere il campo nello Studio online va distribuita la nuova build dello Studio; per vedere il link sul sito statico va ricompilato il frontend dopo la pubblicazione del contenuto.

Gli eventi hanno elenco e dettaglio su `/eventi/` e `/eventi/[slug]/`, con data, luogo, stato, descrizione, immagini e progetti collegati. I dettagli dei progetti rimandano agli articoli ed eventi associati.

`/chi-siamo/` è una pagina istituzionale con struttura definita in Astro: non è un documento libero nel CMS. Il racconto dell'associazione e una foto facoltativa si modificano nelle **Informazioni associazione** di Sanity; finché il testo non è pubblicato, la sezione del racconto resta nascosta. La pagina riunisce anche sede, contatti, social e documenti e mostra il direttivo con un link a `/associati/`, che raccoglie tutte le persone visibili divise per ruolo, con foto, nome e ruolo. Il vecchio `/contatti/` reindirizza alla sezione contatti di Chi siamo. I campi opzionali assenti non producono schede vuote. Il layout condivide navigazione, nome dell'associazione e footer tra tutte le pagine.

Il logo delle Informazioni associazione è usato nell'header, nel footer e nella homepage tramite `SiteBrand` e `ContentImage`; se non è ancora presente compare il marchio testuale. Le voci di navigazione sono definite una volta in `src/config/navigation.ts` e riutilizzate nei menu e nel footer. Nome e marchio testuali sono centralizzati in `src/config/site.ts`.

La homepage segue la direzione visiva dei mockup Stitch forniti, adattata ai soli dati disponibili: il prossimo evento in programma (la sezione scompare se non ce ne sono), i primi quattro progetti nell'ordine impostato in Sanity, articoli e un riquadro 5×1000 prima del footer. Le raccolte `/progetti/`, `/articoli/` e `/eventi/` mostrano sei contenuti per pagina; le pagine successive usano URL come `/progetti/pagina/2/`. Nell'archivio eventi, quelli futuri sono dal più vicino al più lontano e quelli passati dal più recente al più vecchio, con accesso diretto a entrambe le sezioni anche quando iniziano su pagine diverse. Gli eventi annullati restano visibili con il loro stato, ma non vengono presentati nella homepage. Essendo il sito statico, il passaggio di un evento da futuro a passato richiede una nuova build: una distribuzione automatica programmata non è ancora configurata. Non contiene statistiche, orari o inviti a diventare volontari inventati dal prototipo. `/sostienici/` contiene una sezione 5×1000 con il codice fiscale delle Informazioni associazione e una sezione donazioni con le coordinate bancarie, mostrate solo se IBAN e intestatario sono validi e presenti. Il vecchio `/5x1000/` reindirizza alla sezione dedicata. Il 5×1000 rimanda anche alle istruzioni aggiornate dell'Agenzia delle Entrate; il sito non riprende le vecchie affermazioni sui benefici fiscali.

La palette attiva del frontend è definita in `src/styles/global.css`: verde principale `#156A28`, verde scuro `#0C4D1D`, giallo lime `#D7ED62`, fondo `#F4F9F3` e testo `#18231C`. Il giallo è lo sfondo del riquadro 5×1000; l'ambra e l'arancione presenti nei mockup non fanno parte della palette attiva. Il contorno di focus usa il verde scuro per restare leggibile anche sui fondi chiari.

Le immagini del CMS sono elaborate durante la build da Astro e pubblicate in WebP con dimensioni responsive. Le fotografie nelle card e nei ritratti hanno un ritaglio controllato; locandine, logo e immagini di galleria conservano le proporzioni originali, rilevate da Astro, per non tagliare testi o deformare file di forme diverse. Per i progetti, il ritaglio manuale scelto nell'editor immagini di Sanity viene rispettato dal provider prima dell'ottimizzazione di Astro: utile quando un file contiene già bordi bianchi. L'host delle immagini autorizzato è configurato in `astro.config.mjs`; in caso di cambio CMS andrà aggiornato insieme al provider.

Questo riduce le modifiche al codice, ma non elimina la migrazione dei contenuti: testi, immagini, file e riferimenti andranno esportati da Sanity e importati nel nuovo sistema. Per i contenuti complessi, come il testo formattato, servirà anche una conversione del formato.

`siteSettings` è un documento unico: nello Studio compare una sola voce "Informazioni associazione", modificabile senza crearne altre copie. I campi **Chi siamo · testo** e **Chi siamo · foto** alimentano il racconto introduttivo: il testo è semplice, con paragrafi separati da una riga vuota, e la foto è facoltativa. Ogni profilo social ha un nome libero e un link. La sezione **Donazioni con bonifico** contiene IBAN, intestatario e banca facoltativa: non ricopiare le coordinate dal vecchio sito senza verificarle. Lo Studio valida l'IBAN e il frontend rifiuta coordinate incomplete o formalmente errate. Dopo la pubblicazione dei dati in Sanity, ricompilare il frontend statico e distribuire la nuova build. Per vedere i nuovi campi nello Studio online occorre distribuire anche lo Studio aggiornato.

Le pagine istituzionali e la struttura grafica restano nel codice Astro finché non emergerà la necessità di renderle modificabili dal CMS.

## Sviluppo del frontend

```bash
npm install
npm run dev
```

Prima di avviare Astro, copiare `.env.example` in `.env` nella radice del repository e impostare `PUBLIC_SANITY_PROJECT_ID`. Il dataset predefinito è `production`. La build legge i contenuti pubblicati dal CMS, quindi richiede l'accesso a Sanity durante la compilazione.

Per vedere il sito pieno mentre i contenuti reali sono ancora pochi, usa `npm run dev:demo`: mostra contenuti fittizi locali per progetti, articoli, eventi e associati, senza modificare Sanity e senza richiedere un project ID. Ogni pagina espone un avviso che identifica l'anteprima. `npm run build:demo` genera una build statica dimostrativa, utile per verificare gli archivi e la paginazione, **da non distribuire come sito ufficiale**. I comandi ordinari `npm run dev` e `npm run build` continuano a usare esclusivamente Sanity.

Il frontend è statico: per rendere visibili nuovi progetti o modifiche ai contenuti pubblicati bisogna eseguire una nuova build e distribuire il risultato. L'aggiornamento automatico dopo la pubblicazione nel CMS non è ancora configurato.

Controlli e build:

```bash
npm run check
npm run build
npm test
npm run test:coverage
npm run build:demo
npm run check:build
```

`test:coverage` verifica le funzioni di utilità con soglie minime del 95% sulle linee, 90% sui rami e 100% sulle funzioni. `check:build` controlla l’output statico dopo una build demo o reale: ogni pagina deve avere title, description e un solo H1, senza URL non sicuri.

## Sviluppo dello Studio Sanity

```bash
cd studio
npm install
npm run dev
```

Prima di avviare lo Studio, copiare `studio/.env.example` in `studio/.env` e impostare `SANITY_STUDIO_PROJECT_ID` e `SANITY_STUDIO_DATASET` con gli stessi valori usati dal frontend.

Nella sezione **Progetti** dello Studio puoi trascinare le righe per cambiarne l'ordine. Al primo utilizzo, se i progetti esistenti non hanno ancora una posizione, apri il menu della lista e scegli **Reset Order**: assegna una posizione a tutti, poi puoi riordinarli trascinandoli. Non usare di nuovo **Reset Order** dopo aver definito l'ordine desiderato, perché lo rigenera. Finché i vecchi progetti non hanno una posizione, il sito mantiene come criterio di riserva il precedente campo numerico `order` e poi il nome. In sviluppo, ricarica la pagina Astro per vedere il nuovo ordine; sul sito statico è necessaria una nuova build dopo ogni riordino.

## Principi

- `docs/class.puml` documenta il modello dei contenuti;
- il CMS non controlla il layout del sito;
- i campi obbligatori e i limiti vengono validati nello schema Sanity;
- le pagine Astro dipendono dal contratto dei contenuti, non dal client Sanity;
- i contenuti pubblici devono essere verificati prima della pubblicazione.
