import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import { uploadGalleryFiles } from '../studio/schemaTypes/galleryUpload.ts';

const photo = (name = 'foto.jpg') => new File(['foto'], name, { type: 'image/jpeg' });
function setup(overrides = {}) {
  return {
    count: 0,
    uploading: { current: false },
    upload: mock.fn(async (file) => ({ _id: `asset-${file.name}` })),
    append: mock.fn(),
    setBusy: mock.fn(),
    setMessage: mock.fn(),
    setError: mock.fn(),
    ...overrides,
  };
}
const values = (fn) => fn.mock.calls.map((call) => call.arguments[0]);

test('carica le foto in ordine e aggiunge un riferimento per ogni upload riuscito', async () => {
  const options = setup();
  const files = [photo('prima.jpg'), photo('seconda.jpg')];
  await uploadGalleryFiles(files, options);
  assert.deepEqual(values(options.upload), files);
  assert.deepEqual(values(options.append), ['asset-prima.jpg', 'asset-seconda.jpg']);
  assert.deepEqual(values(options.setBusy), [true, false]);
  assert.deepEqual(values(options.setMessage), ['', 'Caricamento 1 di 2…', 'Caricamento 2 di 2…', '2 foto caricate.']);
  assert.deepEqual(values(options.setError), ['']);
  assert.equal(options.uploading.current, false);
});

test('una singola foto ha un messaggio coerente', async () => {
  const options = setup();
  await uploadGalleryFiles([photo()], options);
  assert.equal(values(options.setMessage).at(-1), '1 foto caricata.');
});

test('rifiuta selezioni vuote, oltre il limite, troppo grandi o con formato non ammesso prima di caricare', async () => {
  for (const [files, count] of [
    [[], 0], [[photo()], 6],
    [[new File(['x'], 'test.svg', { type: 'image/svg+xml' })], 0],
    [[new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.jpg', { type: 'image/jpeg' })], 0],
  ]) {
    const options = setup({ count });
    await uploadGalleryFiles(files, options);
    assert.equal(options.upload.mock.callCount(), 0);
    assert.equal(options.append.mock.callCount(), 0);
    assert.equal(options.setBusy.mock.callCount(), 0);
    assert.ok(values(options.setError)[0]);
  }
});

test('blocca gli upload in sola lettura e quelli già in corso', async () => {
  for (const overrides of [{ readOnly: true }, { uploading: { current: true } }]) {
    const options = setup(overrides);
    await uploadGalleryFiles([photo()], options);
    assert.equal(options.upload.mock.callCount(), 0);
    assert.equal(options.setBusy.mock.callCount(), 0);
    assert.equal(options.setMessage.mock.callCount(), 0);
  }
});

test('blocca una seconda selezione mentre la prima attende il server', async () => {
  let resolveUpload;
  const options = setup({ upload: mock.fn(() => new Promise((resolve) => { resolveUpload = resolve; })) });
  const first = uploadGalleryFiles([photo()], options);
  assert.equal(options.uploading.current, true);
  await uploadGalleryFiles([photo('altra.jpg')], options);
  assert.equal(options.upload.mock.callCount(), 1);
  resolveUpload({ _id: 'asset-1' });
  await first;
  assert.equal(options.uploading.current, false);
});

test('un errore parziale conserva le foto già aggiunte e permette un nuovo tentativo', async () => {
  const options = setup();
  options.upload.mock.mockImplementationOnce(async () => { throw new Error('Rete assente'); }, 1);
  await uploadGalleryFiles([photo('prima.jpg'), photo('seconda.jpg'), photo('terza.jpg')], options);
  assert.deepEqual(values(options.append), ['asset-prima.jpg']);
  assert.equal(options.upload.mock.callCount(), 2);
  assert.match(values(options.setError).at(-1), /1 foto è stata aggiunta/);
  assert.equal(values(options.setMessage).at(-1), '');
  assert.equal(options.uploading.current, false);
  assert.equal(values(options.setBusy).at(-1), false);
  await uploadGalleryFiles([photo('seconda.jpg')], options);
  assert.deepEqual(values(options.append), ['asset-prima.jpg', 'asset-seconda.jpg']);
  assert.equal(values(options.setError).at(-1), '');
});

test('se il primo upload fallisce non aggiunge riferimenti e ripristina lo stato', async () => {
  const options = setup({ upload: mock.fn(async () => { throw new Error('Errore'); }) });
  await uploadGalleryFiles([photo()], options);
  assert.equal(options.append.mock.callCount(), 0);
  assert.match(values(options.setError).at(-1), /0 foto sono state aggiunte/);
  assert.equal(options.uploading.current, false);
  assert.deepEqual(values(options.setBusy), [true, false]);
});
