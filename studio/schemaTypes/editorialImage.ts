import type { Image, ValidationContext } from 'sanity';
import { editorialImageSizeResult } from '../../shared/imageSize.ts';

export async function validateEditorialImageSize(
  value: Image | undefined,
  { getClient }: ValidationContext,
): Promise<true | string> {
  const assetId = value?.asset?._ref;
  if (!assetId) return true;

  const size = await getClient({ apiVersion: '2026-03-01' }).fetch<unknown>(
    '*[_id == $assetId][0].size',
    { assetId },
  );
  return editorialImageSizeResult(size);
}
