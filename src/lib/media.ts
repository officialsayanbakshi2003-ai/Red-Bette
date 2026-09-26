// Storefront photography. Defaults are Red Betta campaign images in
// public/images (plus one Pexels photo, free for commercial use). Admins can
// replace any slot from Admin → Storefront, which stores the URL in SiteSetting.

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
    hint: "Main homepage image. Portrait 4:5 works best (at least 1600 × 2000 px).",
    photo: {
      src: "/images/lookbook-betta-hoodie-model.webp",
      alt: "Model in a black Red Betta hoodie with a crimson betta print, under red light",
      credit: "Red Betta",
      fallback: "/images/placeholder.svg",
    },
  },
  story: {
    label: "Homepage story",
    hint: "Next to the craft story on the homepage. Portrait 4:5.",
    photo: {
      src: "/images/studio-screen-printing.webp",
      alt: "Screen printing crimson ink onto a black hoodie in the workshop",
      credit: "Red Betta",
      fallback: "/images/placeholder.svg",
    },
  },
  catHoodies: {
    label: "Category tile: Hoodies",
    hint: "Large tile on the homepage and in the menu. Portrait 4:5 or square.",
    photo: {
      src: "/images/crimson-splash-hoodie-back.webp",
      alt: "Black hoodie with a large crimson betta back print",
      credit: "Red Betta",
      fallback: "/images/placeholder.svg",
    },
  },
  catTees: {
    label: "Category tile: Oversized Tees",
    hint: "Portrait 4:5.",
    photo: {
      src: pexels(8532616),
      alt: "A black t-shirt hanging on a wall",
      credit: "Pexels",
      fallback: "/images/placeholder.svg",
    },
  },
  catSweatshirts: {
    label: "Category tile: Sweatshirts",
    hint: "Portrait 4:5.",
    photo: {
      src: "/images/hooded-red-smoke.webp",
      alt: "Hooded figure in black streetwear against red smoke",
      credit: "Red Betta",
      fallback: "/images/placeholder.svg",
    },
  },
  auth: {
    label: "Sign-in & sign-up page",
    hint: "Portrait 4:5.",
    photo: {
      src: "/images/hooded-red-smoke.webp",
      alt: "Hooded figure in black streetwear against red smoke",
      credit: "Red Betta",
      fallback: "/images/placeholder.svg",
    },
  },
  aboutHero: {
    label: "About page: top",
    hint: "Landscape 16:9.",
    photo: {
      src: "/images/betta-fins-macro.webp",
      alt: "Close-up of flowing crimson fins",
      credit: "Red Betta",
      fallback: "/images/placeholder.svg",
    },
  },
  aboutStudio: {
    label: "About page: craft",
    hint: "Portrait 4:5.",
    photo: {
      src: "/images/studio-screen-printing.webp",
      alt: "Screen printing crimson ink onto a black hoodie in the workshop",
      credit: "Red Betta",
      fallback: "/images/placeholder.svg",
    },
  },
} satisfies Record<string, { label: string; hint: string; photo: Photo }>;

export type MediaSlot = keyof typeof MEDIA_SLOTS;
export type StorefrontMedia = Record<MediaSlot, Photo>;

export const DEFAULT_MEDIA = Object.fromEntries(
  Object.entries(MEDIA_SLOTS).map(([k, v]) => [k, v.photo]),
) as StorefrontMedia;
