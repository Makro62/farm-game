"use client";

import { CROP_DATA } from "@/lib/data/crops";
import { getCropEmojiById, getShopSeed } from "@/lib/data/item-helpers";

type CropIconProps = {
  itemId?: string;
  cropId?: string;
  className?: string;
  title?: string;
};

export function CropIcon({
  itemId,
  cropId,
  className = "plot-emoji",
  title,
}: CropIconProps) {
  const seed = itemId ? getShopSeed(itemId) : null;
  const resolvedCropId = cropId || seed?.cropId || itemId;
  const emoji = seed?.emoji || getCropEmojiById(resolvedCropId);
  const label = title || seed?.name || CROP_DATA[resolvedCropId as string]?.name;

  return (
    <span className={className} title={label} aria-label={label}>
      {emoji}
    </span>
  );
}
