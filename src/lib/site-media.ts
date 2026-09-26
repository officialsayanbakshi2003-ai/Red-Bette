import "server-only";
import { cache } from "react";
import { db } from "./db";
import { DEFAULT_MEDIA, MEDIA_SLOTS, type MediaSlot, type StorefrontMedia } from "./media";

export const mediaSettingKey = (slot: MediaSlot) => `media.${slot}`;

/** Storefront photos with any admin overrides applied. */
export const getStorefrontMedia = cache(async (): Promise<StorefrontMedia> => {
  const rows = await db.siteSetting.findMany({ where: { key: { startsWith: "media." } } });
  const overrides = new Map(rows.map((r) => [r.key, r.value]));
  const result = { ...DEFAULT_MEDIA };
  for (const slot of Object.keys(MEDIA_SLOTS) as MediaSlot[]) {
    const src = overrides.get(mediaSettingKey(slot));
    if (src) result[slot] = { ...DEFAULT_MEDIA[slot], src, credit: "Red Betta" };
  }
  return result;
});
