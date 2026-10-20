export interface SanityImage {
  url: string | null;
  width: number | null;
  height: number | null;
  crop: { left: number; top: number; right: number; bottom: number } | null;
}

/** Apply only a crop chosen in Studio; Astro still handles responsive sizing and encoding. */
export function initiativeImageUrl(image: SanityImage | null): string | undefined {
  if (!image?.url) return undefined;
  const { crop, width, height } = image;
  if (!crop || typeof width !== 'number' || !Number.isInteger(width) || width <= 0 || typeof height !== 'number' || !Number.isInteger(height) || height <= 0) return image.url;

  const edges = [crop.left, crop.top, crop.right, crop.bottom];
  if (edges.some((value) => !Number.isFinite(value) || value < 0 || value >= 1)) return image.url;

  const left = Math.round(crop.left * width);
  const top = Math.round(crop.top * height);
  const cropWidth = width - left - Math.round(crop.right * width);
  const cropHeight = height - top - Math.round(crop.bottom * height);
  if (cropWidth <= 0 || cropHeight <= 0) return image.url;
  if (left === 0 && top === 0 && cropWidth === width && cropHeight === height) return image.url;

  const url = new URL(image.url);
  url.searchParams.set('rect', `${left},${top},${cropWidth},${cropHeight}`);
  return url.toString();
}
