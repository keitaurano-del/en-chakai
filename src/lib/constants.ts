export const PLANS = [
  {
    id: "conversation",
    name: "The Tea Ceremony",
    durationMin: 60,
    maxGuests: 4,
    privacy: "shared",
    priceUsd: 70,
    priceJpy: 10000,
    includes: [
      "Usucha and koicha (thick matcha) tasting",
      "Two seasonal wagashi",
      "Tea utensil appreciation",
      "Q&A with the host",
    ],
  },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];

export const NEIGHBORHOODS = [
  {
    slug: "sengoku",
    name: "Sengoku",
    nameJa: "千石",
    walkMin: 0,
    blurb:
      "The quiet next door. Old timber houses, narrow alleys, and the residential rhythm of Bunkyō — this is where the tea room sits.",
    photo: "/photos/room1.jpg",
  },
  {
    slug: "hakusan",
    name: "Hakusan",
    nameJa: "白山",
    walkMin: 8,
    blurb:
      "A university hill with a hidden Edo-era shrine. In June, three thousand hydrangeas turn the slope blue and white.",
    photo: "/photos/tokonoma.jpg",
  },
  {
    slug: "sugamo",
    name: "Sugamo",
    nameJa: "巣鴨",
    walkMin: 12,
    blurb:
      "Tokyo's grandmothers come here for healing salt and red underwear. Locals call it Harajuku for the elderly. We mean that as a compliment.",
    photo: "/photos/kettle.jpg",
  },
  {
    slug: "gokokuji",
    name: "Gokokuji",
    nameJa: "護国寺",
    walkMin: 18,
    blurb:
      "A 1681 Shogun's-mother temple, the rare WWII survivor in this part of Tokyo. The graves of three Urasenke tea masters are kept here.",
    photo: "/photos/room2.jpg",
  },
  {
    slug: "zoshigaya",
    name: "Zoshigaya",
    nameJa: "雑司ヶ谷",
    walkMin: 22,
    blurb:
      "Sōseki and Lafcadio Hearn rest in the same cemetery. The pace of the streets has not changed much since they walked them.",
    photo: "/photos/room3.jpg",
  },
] as const;

export type NeighborhoodSlug = (typeof NEIGHBORHOODS)[number]["slug"];

export const TRIPADVISOR_URL = "https://www.tripadvisor.com/";

export const CONTACT = {
  email: "info@en-chakai.com",
  address: "Sengoku, Bunkyo-ku, Tokyo",
  station: "Sengoku Station, Toei Mita Line — 5 min walk",
};

export const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeuo3Ec2k8oROTX2av_uw0re64AMw-z-gLBUZ-pcALj0ITa9w/viewform";
