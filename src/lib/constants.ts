export type NavItemKey =
  | "overview"
  | "crypto"
  | "weather"
  | "about"
  | "settings";

export type NavItemIcon =
  | "LayoutDashboard"
  | "TrendingUp"
  | "CloudSun"
  | "Info"
  | "Settings2";

export type NavItem = {
  key: NavItemKey;
  href: string;
  icon: NavItemIcon;
};

export const SITE_CONFIG = {
  name: "AI-Techart & Dynamics Dashboard",
  shortName: "AI-Techart & Dynamics",
  description:
    "Production-oriented intelligence dashboard for crypto market data, Swiss weather information, persistent insights, Redis caching, rate limiting, and AI-ready platform infrastructure.",
  url: "https://dashboard.ai-techart.com",
  primaryWebsiteUrl: "https://ai-techart.com",
  repositoryUrl: "https://github.com/BlockShield-Systems/swiss-market-dashboard",
  author: "Demian Lienert",
  creator: "Demian Lienert",
  publisher: "AI-Techart & Dynamics",
  locale: "de_CH",
  alternateLocale: "en_CH",
  ogImagePath: "/opengraph-image",
  keywords: [
    "AI-Techart & Dynamics",
    "Swiss Market Dashboard",
    "Crypto Dashboard",
    "Swiss Weather Dashboard",
    "Market Intelligence",
    "Next.js",
    "TypeScript",
    "Neon Postgres",
    "Drizzle ORM",
    "Upstash Redis",
    "Vercel AI Gateway",
    "Feature Flags",
    "Redis Caching",
    "Rate Limiting",
    "Fullstack Dashboard",
  ],
} as const;

export const NAV_ITEMS: NavItem[] = [
  { key: "overview", href: "/", icon: "LayoutDashboard" },
  { key: "crypto", href: "/crypto", icon: "TrendingUp" },
  { key: "weather", href: "/weather", icon: "CloudSun" },
  { key: "about", href: "/about", icon: "Info" },
  { key: "settings", href: "/settings", icon: "Settings2" },
];
