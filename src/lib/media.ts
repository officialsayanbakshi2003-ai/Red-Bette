// Storefront photography. Each slot has a default photo from Pexels (free for
// commercial use, https://www.pexels.com/license/). Admins can replace any
// slot from Admin → Storefront, which stores the new URL in SiteSetting.

export interface Photo {
  src: string;
  alt: string;
  credit: string;
  fallback: string; // shown if the image cannot load
}

const pexels = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`;

export const MEDIA_SLOTS = {
  hero: {
    label: "Homepage hero",
    hint: "Wide image behind the main headline. Landscape 16:9, at least 2400 px wide.",
    photo: {
      src: pexels(1335971),
      alt: "A red betta fish with flowing fins against a black background",
      credit: "Chevanon Photography",
      fallback: "/brand/mark.svg",
    },
  },
  story: {
    label: "Homepage story",
    hint: "Next to the “Made to flow alone” story. Portrait 4:5.",
    photo: {
      src: pexels(14554642),
      alt: "A person in a hoodie walking alone down a city street at night",
      credit: "Esra Erdem",
      fallback: "/products/flow-alone-back.svg",
    },
  },
  catHoodies: {
    label: "Category tile: Hoodies",
    hint: "Large tile on the homepage and in the menu. Portrait 4:5 or square.",
    photo: {
      src: pexels(12596472),
      alt: "Back view of a person in a black hoodie on a city street at night",
      credit: "Adhen Wijaya Kusuma",
      fallback: "/products/red-widow-back.svg",
    },
  },
  catTees: {
    label: "Category tile: Oversized Tees",
    hint: "Portrait 4:5.",
    photo: {
      src: pexels(8532616),
      alt: "A black t-shirt hanging on a wall",
      credit: "Pexels",
      fallback: "/products/red-moon-tee-back.svg",
    },
  },
  catSweatshirts: {
    label: "Category tile: Sweatshirts",
    hint: "Portrait 4:5.",
    photo: {
      src: pexels(8523206),
      alt: "Back view of a person wearing a black hoodie in an industrial corridor",
      credit: "Davi T3",
      fallback: "/products/crimson-tide-crew-front.svg",
    },
  },
  auth: {
    label: "Sign-in & sign-up page",
    hint: "Portrait 4:5.",
    photo: {
      src: pexels(15583299),
      alt: "A hooded figure standing on a busy street at night",
      credit: "Tubagus Alief Leo",
      fallback: "/brand/mark-dark.svg",
    },
  },
  aboutHero: {
    label: "About page: top",
    hint: "Landscape 16:9.",
    photo: {
      src: pexels(15431847),
      alt: "Close-up of a vivid red betta fish",
      credit: "Daniel Franco",
      fallback: "/brand/mark.svg",
    },
  },
  aboutStudio: {
    label: "About page: craft",
    hint: "Portrait 4:5.",
    photo: {
      src: pexels(7679438),
      alt: "Clothes hanging on a black steel rack",
      credit: "Pexels",
      fallback: "/products/signature-tee-back.svg",
    },
  },
} satisfies Record<string, { label: string; hint: string; photo: Photo }>;

export type MediaSlot = keyof typeof MEDIA_SLOTS;
export type StorefrontMedia = Record<MediaSlot, Photo>;

export const DEFAULT_MEDIA = Object.fromEntries(
  Object.entries(MEDIA_SLOTS).map(([k, v]) => [k, v.photo]),
) as StorefrontMedia;
