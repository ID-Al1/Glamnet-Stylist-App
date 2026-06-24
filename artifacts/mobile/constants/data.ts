export type TalentType = "model" | "artist";
export type ArtistCategory = "makeup" | "hair" | "nails" | "lash" | "barber" | "photographer" | "stylist";
export type Province = "GP" | "WC" | "KZN" | "GP/WC" | "EC" | "FS" | "NW" | "MP" | "LP" | "NC";

export interface ArtistSettings {
  houseCallsEnabled: boolean;
  callOutFee: boolean;
  callOutRate: number;
  callOutBase: number;
  studioAvailable: boolean;
  instantBook: boolean;
}

export interface VerificationStatus {
  identity: boolean;
  portfolio: boolean;
  firstAppointment: boolean;
  skillAssessment: boolean;
}

export interface Talent {
  id: string;
  name: string;
  handle: string;
  type: TalentType;
  role: string;
  repScore: number;
  jobs: number;
  referrals: number;
  campaigns: number;
  rate: string;
  rateNum: number;
  tier: "New" | "Active" | "Rising" | "Pro" | "Elite";
  available: boolean;
  verified: boolean;
  foundingMember: boolean;
  badges: string[];
  location: string;
  province: Province;
  bio: string;
  modelStats?: {
    height: string;
    measurements: string;
    experience: string;
    aesthetic: string[];
  };
  artistCategory?: ArtistCategory;
  settings: ArtistSettings;
  verification: VerificationStatus;
  collaborations: { name: string; role: string; jobs: number }[];
  portfolio: string[];
}

export const SA_PROVINCES = [
  { id: "all", label: "All Provinces" },
  { id: "GP", label: "GP — Gauteng" },
  { id: "WC", label: "WC — Western Cape" },
  { id: "KZN", label: "KZN — KwaZulu-Natal" },
  { id: "EC", label: "EC — Eastern Cape" },
  { id: "FS", label: "FS — Free State" },
  { id: "NW", label: "NW — North West" },
  { id: "MP", label: "MP — Mpumalanga" },
  { id: "LP", label: "LP — Limpopo" },
  { id: "NC", label: "NC — Northern Cape" },
];

export const TALENT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "makeup", label: "MUA" },
  { id: "hair", label: "Hair" },
  { id: "nails", label: "Nails" },
  { id: "lash", label: "Lash & Brow" },
  { id: "barber", label: "Barber" },
  { id: "photographer", label: "Photography" },
  { id: "stylist", label: "Stylist" },
  { id: "model", label: "Models" },
];

const DEFAULT_SETTINGS: ArtistSettings = {
  houseCallsEnabled: false,
  callOutFee: false,
  callOutRate: 0,
  callOutBase: 0,
  studioAvailable: false,
  instantBook: false,
};

const DEFAULT_VERIFICATION: VerificationStatus = {
  identity: false,
  portfolio: false,
  firstAppointment: false,
  skillAssessment: false,
};

export const ALL_TALENT: Talent[] = [
  {
    id: "m1",
    name: "Naledi Dube",
    handle: "@naledi.model",
    type: "model",
    role: "Commercial & Editorial",
    repScore: 92,
    jobs: 34,
    referrals: 12,
    campaigns: 8,
    rate: "R3,500/day",
    rateNum: 3500,
    tier: "Elite",
    available: true,
    verified: true,
    foundingMember: false,
    badges: ["Editorial Pick", "Campaign Ready"],
    location: "Johannesburg",
    province: "GP",
    bio: "Commercial and editorial model with 4 years experience across print, digital and runway campaigns. Known for versatility and professional on-set presence.",
    modelStats: {
      height: "175cm",
      measurements: "85-60-90",
      experience: "4 years",
      aesthetic: ["Editorial", "Commercial", "Lifestyle"],
    },
    settings: { houseCallsEnabled: false, callOutFee: false, callOutRate: 0, callOutBase: 0, studioAvailable: false, instantBook: true },
    verification: { identity: true, portfolio: true, firstAppointment: true, skillAssessment: true },
    collaborations: [
      { name: "Lerato Dlamini", role: "MUA", jobs: 5 },
      { name: "Palesa Sithole", role: "Lash Tech", jobs: 3 },
    ],
    portfolio: [],
  },
  {
    id: "m2",
    name: "Zinhle Motha",
    handle: "@zinhle_zsa",
    type: "model",
    role: "Runway & Fashion",
    repScore: 88,
    jobs: 28,
    referrals: 9,
    campaigns: 6,
    rate: "R4,200/day",
    rateNum: 4200,
    tier: "Pro",
    available: true,
    verified: true,
    foundingMember: false,
    badges: ["Runway Specialist"],
    location: "Cape Town",
    province: "WC",
    bio: "High-fashion runway model with a strong editorial eye. Experienced in luxury brand campaigns and international shows.",
    modelStats: {
      height: "179cm",
      measurements: "82-58-88",
      experience: "3 years",
      aesthetic: ["High Fashion", "Avant-garde", "Luxury"],
    },
    settings: { ...DEFAULT_SETTINGS, instantBook: false },
    verification: { identity: true, portfolio: true, firstAppointment: true, skillAssessment: false },
    collaborations: [
      { name: "Ayanda Moyo", role: "Hair", jobs: 3 },
      { name: "Nomsa Khumalo", role: "MUA", jobs: 4 },
    ],
    portfolio: [],
  },
  {
    id: "m3",
    name: "Amara Osei",
    handle: "@amara.osei",
    type: "model",
    role: "Commercial & Lifestyle",
    repScore: 78,
    jobs: 19,
    referrals: 6,
    campaigns: 4,
    rate: "R2,800/day",
    rateNum: 2800,
    tier: "Rising",
    available: false,
    verified: true,
    foundingMember: false,
    badges: ["Campaign Ready"],
    location: "Durban",
    province: "KZN",
    bio: "Warm and approachable commercial model, perfect for lifestyle and wellness campaigns. Naturally vibrant energy on set.",
    modelStats: {
      height: "168cm",
      measurements: "88-65-95",
      experience: "2 years",
      aesthetic: ["Commercial", "Lifestyle", "Wellness"],
    },
    settings: { ...DEFAULT_SETTINGS },
    verification: { identity: true, portfolio: true, firstAppointment: false, skillAssessment: false },
    collaborations: [{ name: "Thandi Mokoena", role: "Nails", jobs: 2 }],
    portfolio: [],
  },
  {
    id: "m4",
    name: "Kefilwe Sithole",
    handle: "@kefilwe.s",
    type: "model",
    role: "New Face — Editorial",
    repScore: 62,
    jobs: 7,
    referrals: 2,
    campaigns: 1,
    rate: "R1,800/day",
    rateNum: 1800,
    tier: "New",
    available: true,
    verified: false,
    foundingMember: false,
    badges: ["New Face"],
    location: "Pretoria",
    province: "GP",
    bio: "Striking new face with a natural editorial quality. Fast learner with a fresh perspective, eager to build her portfolio.",
    modelStats: {
      height: "172cm",
      measurements: "80-58-86",
      experience: "1 year",
      aesthetic: ["Editorial", "Emerging"],
    },
    settings: { ...DEFAULT_SETTINGS },
    verification: { identity: true, portfolio: false, firstAppointment: false, skillAssessment: false },
    collaborations: [],
    portfolio: [],
  },
  {
    id: "a1",
    name: "Lerato Dlamini",
    handle: "@lerato_mua",
    type: "artist",
    role: "Bridal & Editorial MUA",
    repScore: 96,
    jobs: 52,
    referrals: 18,
    campaigns: 14,
    rate: "R2,200/day",
    rateNum: 2200,
    tier: "Elite",
    available: true,
    verified: true,
    foundingMember: false,
    badges: ["Editorial Pick", "Top Rated"],
    location: "Johannesburg",
    province: "GP",
    bio: "Award-winning editorial makeup artist with a deep understanding of light, texture and skin. Works across film, fashion and advertising.",
    artistCategory: "makeup",
    settings: { houseCallsEnabled: true, callOutFee: true, callOutRate: 4, callOutBase: 80, studioAvailable: true, instantBook: true },
    verification: { identity: true, portfolio: true, firstAppointment: true, skillAssessment: false },
    collaborations: [
      { name: "Naledi Dube", role: "Model", jobs: 5 },
      { name: "Zinhle Motha", role: "Model", jobs: 2 },
    ],
    portfolio: [],
  },
  {
    id: "a2",
    name: "Thandi Mokoena",
    handle: "@thandi_nails",
    type: "artist",
    role: "Nail Art Specialist",
    repScore: 84,
    jobs: 41,
    referrals: 14,
    campaigns: 7,
    rate: "R1,400/day",
    rateNum: 1400,
    tier: "Pro",
    available: true,
    verified: true,
    foundingMember: false,
    badges: ["Campaign Ready"],
    location: "Johannesburg",
    province: "GP",
    bio: "Creative nail technician specialising in custom nail art, gel, and press-on designs for editorial and events.",
    artistCategory: "nails",
    settings: { houseCallsEnabled: false, callOutFee: false, callOutRate: 0, callOutBase: 0, studioAvailable: true, instantBook: true },
    verification: { identity: true, portfolio: true, firstAppointment: true, skillAssessment: true },
    collaborations: [{ name: "Amara Osei", role: "Model", jobs: 2 }],
    portfolio: [],
  },
  {
    id: "a3",
    name: "Palesa Sithole",
    handle: "@palesa_lash",
    type: "artist",
    role: "Lash & Brow Expert",
    repScore: 79,
    jobs: 36,
    referrals: 11,
    campaigns: 5,
    rate: "R1,200/day",
    rateNum: 1200,
    tier: "Pro",
    available: false,
    verified: true,
    foundingMember: false,
    badges: ["Specialist"],
    location: "Cape Town",
    province: "WC",
    bio: "Precision lash and brow specialist trusted by top models and editorial teams for flawless eye looks.",
    artistCategory: "lash",
    settings: { houseCallsEnabled: true, callOutFee: true, callOutRate: 5, callOutBase: 60, studioAvailable: false, instantBook: false },
    verification: { identity: true, portfolio: true, firstAppointment: true, skillAssessment: true },
    collaborations: [{ name: "Naledi Dube", role: "Model", jobs: 3 }],
    portfolio: [],
  },
  {
    id: "a4",
    name: "Zintle Xaba",
    handle: "@zintle_hair",
    type: "artist",
    role: "Natural Hair Specialist",
    repScore: 88,
    jobs: 44,
    referrals: 16,
    campaigns: 9,
    rate: "R1,800/day",
    rateNum: 1800,
    tier: "Elite",
    available: true,
    verified: true,
    foundingMember: false,
    badges: ["Editorial Pick", "Natural Hair Expert"],
    location: "Johannesburg",
    province: "GP",
    bio: "Celebrated natural hair stylist with a signature approach to protective styles and textured hair for editorial and commercial work.",
    artistCategory: "hair",
    settings: { houseCallsEnabled: true, callOutFee: true, callOutRate: 6, callOutBase: 100, studioAvailable: true, instantBook: true },
    verification: { identity: true, portfolio: true, firstAppointment: false, skillAssessment: false },
    collaborations: [
      { name: "Naledi Dube", role: "Model", jobs: 4 },
      { name: "Kefilwe Sithole", role: "Model", jobs: 2 },
    ],
    portfolio: [],
  },
  {
    id: "a5",
    name: "Nomsa Khumalo",
    handle: "@nomsa_glam",
    type: "artist",
    role: "Glam & Events MUA",
    repScore: 72,
    jobs: 29,
    referrals: 8,
    campaigns: 3,
    rate: "R1,600/day",
    rateNum: 1600,
    tier: "Rising",
    available: true,
    verified: false,
    foundingMember: false,
    badges: ["Rising Star"],
    location: "Durban",
    province: "KZN",
    bio: "Glam-focused makeup artist with a strong portfolio in weddings, events and television. Known for flawless skin prep and lasting looks.",
    artistCategory: "makeup",
    settings: { houseCallsEnabled: true, callOutFee: true, callOutRate: 4, callOutBase: 50, studioAvailable: false, instantBook: false },
    verification: { identity: true, portfolio: true, firstAppointment: false, skillAssessment: false },
    collaborations: [{ name: "Zinhle Motha", role: "Model", jobs: 4 }],
    portfolio: [],
  },
  {
    id: "a6",
    name: "Sipho Dlamini",
    handle: "@sipho.photo",
    type: "artist",
    role: "Campaign Photographer",
    repScore: 91,
    jobs: 47,
    referrals: 20,
    campaigns: 12,
    rate: "R4,500/day",
    rateNum: 4500,
    tier: "Elite",
    available: true,
    verified: true,
    foundingMember: false,
    badges: ["Editorial Pick", "Campaign Ready"],
    location: "Cape Town",
    province: "WC",
    bio: "Commercial and editorial photographer with a distinctive eye for light and narrative. Trusted by leading SA and international brands.",
    artistCategory: "photographer",
    settings: { houseCallsEnabled: false, callOutFee: false, callOutRate: 0, callOutBase: 0, studioAvailable: true, instantBook: false },
    verification: { identity: true, portfolio: true, firstAppointment: true, skillAssessment: false },
    collaborations: [
      { name: "Naledi Dube", role: "Model", jobs: 6 },
      { name: "Lerato Dlamini", role: "MUA", jobs: 4 },
    ],
    portfolio: [],
  },
  {
    id: "a7",
    name: "Ayanda Moyo",
    handle: "@ayanda_hair",
    type: "artist",
    role: "Colour Specialist",
    repScore: 85,
    jobs: 38,
    referrals: 13,
    campaigns: 8,
    rate: "R2,000/day",
    rateNum: 2000,
    tier: "Pro",
    available: false,
    verified: true,
    foundingMember: false,
    badges: ["Colour Expert"],
    location: "Johannesburg",
    province: "GP",
    bio: "Hair colour specialist known for bold, fashion-forward colour work. From balayage to full creative transformations.",
    artistCategory: "hair",
    settings: { houseCallsEnabled: false, callOutFee: false, callOutRate: 0, callOutBase: 0, studioAvailable: true, instantBook: false },
    verification: { identity: true, portfolio: true, firstAppointment: true, skillAssessment: false },
    collaborations: [{ name: "Zinhle Motha", role: "Model", jobs: 3 }],
    portfolio: [],
  },
];

export const TEAM_ROLES = [
  { role: "Makeup Artist", cat: "makeup" },
  { role: "Model", cat: "model" },
  { role: "Photographer", cat: "photographer" },
  { role: "Hair Stylist", cat: "hair" },
  { role: "Nail Technician", cat: "nails" },
  { role: "Lash Tech", cat: "lash" },
  { role: "Barber", cat: "barber" },
  { role: "Stylist", cat: "stylist" },
];

export const TIER_COLORS: Record<string, string> = {
  New: "#8C7B72",
  Active: "#4A7AB8",
  Rising: "#B8893A",
  Pro: "#7A5AB8",
  Elite: "#C4526E",
};
