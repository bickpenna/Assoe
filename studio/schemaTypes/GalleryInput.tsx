import { useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@sanity/ui';
import { insert, setIfMissing, useClient, type ArrayOfObjectsInputProps } from 'sanity';
import { MAX_GALLERY_IMAGES } from '../../shared/imageSize';
import { uploadGalleryFiles } from './galleryUpload';

export function GalleryInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({ apiVersion: '2026-03-01' });
  const fileInput = useRef<HTMLInputElement>(null);
  const uploading = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const count = props.value?.length ?? 0;

  async function uploadFiles(files: File[]) {
    await uploadGalleryFiles(files, {
      count,
      readOnly: props.readOnly,
      uploading,
      setBusy,
      setMessage,
      setError,
      upload: (file) => client.assets.upload('image', file, { filename: file.name }),
      append: (assetId) => props.onChange([
        setIfMissing([]),
        insert([{ _key: crypto.randomUUID(), _type: 'image', asset: { _type: 'reference', _ref: assetId } }], 'after', [-1]),
      ]),
    });
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
