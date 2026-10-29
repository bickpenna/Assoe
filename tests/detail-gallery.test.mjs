import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDom } from './helpers/dom.mjs';
import { initDetailGalleries } from '../src/scripts/detailGallery.ts';

function setup(t) {
  const window = createDom(t, `<section class="detail-gallery">
    <button data-gallery-open="foto:1"><span>Apri foto</span></button>
    <button data-gallery-open="inesistente">Non disponibile</button>
    <dialog class="gallery-lightbox" id="foto:1" tabindex="-1"><img alt="Foto" /></dialog>
  </section><section class="detail-gallery"><button data-gallery-open="foto:1">Altra galleria</button></section>`);
  const dialog = window.document.querySelector('dialog');
  // jsdom non implementa i metodi nativi dei dialog: verifichiamo le chiamate dello script.
  dialog.showModal = t.mock.fn();
  dialog.close = t.mock.fn();
  const focus = t.mock.method(dialog, 'focus');
  initDetailGalleries();
  return { window, dialog, focus };
}

test('il click su un elemento del pulsante apre la foto e sposta il focus', (t) => {
  const { window, dialog, focus } = setup(t);
  window.document.querySelector('button span').click();
  assert.equal(dialog.showModal.mock.callCount(), 1);
  assert.deepEqual(focus.mock.calls[0].arguments, [{ preventScroll: true }]);
  assert.equal(window.document.activeElement, dialog);
});

test('il click sullo sfondo chiude la foto, quello sull’immagine la mantiene aperta', (t) => {
  const { window, dialog } = setup(t);
  window.document.querySelector('img').click();
  assert.equal(dialog.close.mock.callCount(), 0);
  dialog.click();
  assert.equal(dialog.close.mock.callCount(), 1);
});

test('ignora destinazioni mancanti e non apre dialog appartenenti ad altre gallerie', (t) => {
  const { window, dialog } = setup(t);
  window.document.querySelector('[data-gallery-open="inesistente"]').click();
  window.document.querySelectorAll('section')[1].querySelector('button').click();
  window.document.querySelector('section').click();
  assert.equal(dialog.showModal.mock.callCount(), 0);
});

test('ignora eventi provenienti da nodi di testo', (t) => {
  const { window, dialog } = setup(t);
  const text = window.document.querySelector('button span').firstChild;
  text.dispatchEvent(new window.Event('click', { bubbles: true }));
  assert.equal(dialog.showModal.mock.callCount(), 0);
});
