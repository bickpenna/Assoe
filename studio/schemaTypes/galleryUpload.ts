import { gallerySelectionError } from '../../shared/imageSize.ts';

interface GalleryUploadOptions {
  count: number;
  readOnly?: boolean;
  uploading: { current: boolean };
  upload: (file: File) => Promise<{ _id: string }>;
  append: (assetId: string) => void;
  setBusy: (busy: boolean) => void;
  setMessage: (message: string) => void;
  setError: (error: string) => void;
}

export async function uploadGalleryFiles(files: File[], options: GalleryUploadOptions): Promise<void> {
  const { count, readOnly, uploading, upload, append, setBusy, setMessage, setError } = options;
  if (uploading.current || readOnly) return;

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
      const asset = await upload(file);
      append(asset._id);
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
