import { useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@sanity/ui';
import { insert, setIfMissing, useClient, type ArrayOfObjectsInputProps } from 'sanity';
import { gallerySelectionError, MAX_GALLERY_IMAGES } from '../../shared/imageSize';

export function GalleryInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({ apiVersion: '2026-03-01' });
  const fileInput = useRef<HTMLInputElement>(null);
  const uploading = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const count = props.value?.length ?? 0;

  async function uploadFiles(files: File[]) {
    if (uploading.current || props.readOnly) return;

    setMessage('');
    const validationError = gallerySelectionError(count, files);
    setError(validationError ?? '');
    if (validationError) return;

    uploading.current = true;
    setBusy(true);
    let completed = 0;

    try {
      for (const file of files) {
        setMessage(`Caricamento ${completed + 1} di ${files.length}…`);
        const asset = await client.assets.upload('image', file, { filename: file.name });
        props.onChange([
          setIfMissing([]),
          insert([{ _key: crypto.randomUUID(), _type: 'image', asset: { _type: 'reference', _ref: asset._id } }], 'after', [-1]),
        ]);
        completed += 1;
      }
      setMessage(`${completed} ${completed === 1 ? 'foto caricata' : 'foto caricate'}.`);
    } catch {
      setError(`Caricamento interrotto. ${completed} ${completed === 1 ? 'foto è stata aggiunta' : 'foto sono state aggiunte'}; controlla la galleria prima di riprovare.`);
      setMessage('');
    } finally {
      uploading.current = false;
      setBusy(false);
    }
  }

  function onSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    if (files.length > 0) void uploadFiles(files);
  }

  return (
    <div>
      <div style={{ marginBottom: '0.75rem' }}>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onSelect}
          aria-label="Seleziona più foto per la galleria"
          style={{ display: 'none' }}
          disabled={busy || props.readOnly || count >= MAX_GALLERY_IMAGES}
        />
        <Button
          type="button"
          text="Seleziona più foto"
          mode="ghost"
          onClick={() => fileInput.current?.click()}
          disabled={busy || props.readOnly || count >= MAX_GALLERY_IMAGES}
          loading={busy}
        />
        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
      </div>
      {props.renderDefault(props)}
    </div>
  );
}
