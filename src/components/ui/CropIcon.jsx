'use client';

import { CROP_DATA, getCropEmojiById, getShopSeed } from '@/lib/utils';

/**
 * Ikon bibit / tanaman — selalu menampilkan emoji hasil panen yang sesuai.
 */
export function CropIcon({ itemId, cropId, className = 'plot-emoji', title }) {
  const seed = itemId ? getShopSeed(itemId) : null;
  const resolvedCropId = cropId || seed?.cropId || itemId;
  const emoji = seed?.emoji || getCropEmojiById(resolvedCropId);
  const label = title || seed?.name || CROP_DATA[resolvedCropId]?.name;

  return (
    <span className={className} title={label} aria-label={label}>
      {emoji}
    </span>
  );
}
