// Storefront photography. Defaults are Red Betta campaign images in
// public/images. Admins can replace any slot from Admin → Storefront, which
// stores the URL in SiteSetting.

export interface Photo {
  src: string;
  alt: string;
  credit: string;
  fallback: string; // shown if the image cannot load
}

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
      src: "/images/betta-tee-hanger.webp",
      alt: "Black oversized tee with a crimson betta back print on a hanger under red light",
      credit: "Red Betta",
      fallback: "/images/placeholder.svg",
    },
  },
  catSweatshirts: {
    label: "Category tile: Sweatshirts",
    hint: "Portrait 4:5.",
    photo: {
      src: "/images/crimson-tide-crewneck-garage.webp",
      alt: "Model sitting on steps in a red-lit parking garage, wearing a black crewneck with a crimson betta print",
      credit: "Red Betta",
      fallback: "/images/placeholder.svg",
    },
  },
  banner: {
    label: "Homepage banner",
    hint: "Full-width banner near the bottom of the homepage. Landscape 16:9 with space on the left for text.",
    photo: {
      src: "/images/betta-wide-black.webp",
      alt: "Crimson betta with flowing fins on a black background",
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
    label: "About page: side photo",
    hint: "Portrait 4:5.",
    photo: {
      src: "/images/rain-street-walk.webp",
      alt: "Hooded figure walking alone down a rain-soaked street lit red",
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
