import fs from 'node:fs';
import path from 'node:path';

const outputDirectory = path.resolve('dist');
const siteBase = process.env.SITE_BASE || '/';
const redirectBase = siteBase === '/' ? '' : `/${siteBase.replace(/^\/+|\/+$/g, '')}`;
const allowedRedirects = new Map([
  [path.join('dist', '5x1000', 'index.html'), `${redirectBase}/sostienici/#cinque-per-mille`],
  [path.join('dist', 'contatti', 'index.html'), `${redirectBase}/chi-siamo/#contatti`],
  [path.join('dist', 'progetti', 'index.html'), `${redirectBase}/iniziative/`],
]);

function expectedRedirect(relativePath) {
  const staticRedirect = allowedRedirects.get(relativePath);
  if (staticRedirect) return staticRedirect;

  const legacyPath = relativePath.split(path.sep).join('/').match(/^dist\/progetti\/(.+)\/index\.html$/);
  return legacyPath ? `${redirectBase}/iniziative/${legacyPath[1]}/` : undefined;
}

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(filePath);
    return entry.name.endsWith('.html') ? [filePath] : [];
  });
}

if (!fs.existsSync(outputDirectory)) {
  throw new Error('Output statico assente: esegui prima npm run build.');
}

const pages = htmlFiles(outputDirectory);
if (pages.length === 0) throw new Error('Nessuna pagina HTML trovata nell’output statico.');

for (const filePath of pages) {
  const html = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  const h1Count = (html.match(/<h1\b/g) ?? []).length;
  const redirectTarget = html.match(/<meta http-equiv="refresh" content="0;url=([^"]+)"/i)?.[1];

  if (redirectTarget) {
    const destination = expectedRedirect(relativePath);
    if (destination !== redirectTarget) {
      throw new Error(`${relativePath}: redirect non previsto.`);
    }
    if (relativePath.includes(`${path.sep}progetti${path.sep}`)) {
      const targetPath = destination.slice(redirectBase.length + 1).replace(/\/$/, '');
      const targetFile = path.join('dist', ...targetPath.split('/'), 'index.html');
      if (!fs.existsSync(targetFile)) throw new Error(`${relativePath}: destinazione mancante.`);
    }
    if (!/<meta name="robots" content="noindex"/i.test(html)) {
      throw new Error(`${relativePath}: redirect indicizzabile.`);
    }
    continue;
  }

  if (relativePath.includes(`${path.sep}progetti${path.sep}`)) {
    throw new Error(`${relativePath}: il vecchio URL deve reindirizzare.`);
  }

  if (!/<title>[^<]+<\/title>/i.test(html)) throw new Error(`${relativePath}: title mancante.`);
  if (!/<meta name="description" content="[^"]+"/i.test(html)) {
    throw new Error(`${relativePath}: meta description mancante.`);
  }
  if (process.env.PUBLIC_SITE_PREVIEW === 'true' && !/<meta name="robots" content="noindex,nofollow"/i.test(html)) {
    throw new Error(`${relativePath}: il sito di anteprima deve restare non indicizzabile.`);
  }
  if (h1Count !== 1) throw new Error(`${relativePath}: attesi 1 H1, trovati ${h1Count}.`);
  if (redirectBase) {
    const rootAssetsAndLinks = [...html.matchAll(/\b(?:href|src|srcset)="(\/[^"]*)"/g)].map((match) => match[1]);
    if (rootAssetsAndLinks.some((url) => !url.startsWith(`${redirectBase}/`))) {
      throw new Error(`${relativePath}: link o risorsa interna senza base GitHub Pages.`);
    }
  }
  const legacyHref = `${redirectBase}/progetti`;
  if (html.includes(`href="${legacyHref}/`) || html.includes(`href="${legacyHref}"`)) {
    throw new Error(`${relativePath}: link al vecchio percorso.`);
  }
  if (/href="(?:javascript:|data:)/i.test(html)) throw new Error(`${relativePath}: URL non sicuro.`);
  if (/target="_blank"(?![^>]*rel="[^"]*(?:noopener|noreferrer))/i.test(html)) {
    throw new Error(`${relativePath}: link _blank senza protezione rel.`);
  }
}

for (const filePath of pages) {
  const relativePath = path.relative(process.cwd(), filePath);
  if (!relativePath.includes(`${path.sep}iniziative${path.sep}`)) continue;
  const oldPath = relativePath.replace(`${path.sep}iniziative${path.sep}`, `${path.sep}progetti${path.sep}`);
  if (!fs.existsSync(oldPath)) throw new Error(`${relativePath}: vecchio URL senza redirect.`);
}

console.log(`Output statico valido: ${pages.length} pagine HTML.`);
