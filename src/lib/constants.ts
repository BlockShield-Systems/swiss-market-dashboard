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
    "Technical dashboard case study focused on modern frontend architecture, data integration and recruiter-ready product delivery.",
  url: "https://dashboard.ai-techart.com",
  primaryWebsiteUrl: "https://ai-techart.com",
  author: "Demian Lienert",
} as const;

export const NAV_ITEMS: NavItem[] = [
  { key: "overview", href: "/", icon: "LayoutDashboard" },
  { key: "crypto", href: "/crypto", icon: "TrendingUp" },
  { key: "weather", href: "/weather", icon: "CloudSun" },
  { key: "about", href: "/about", icon: "Info" },
  { key: "settings", href: "/settings", icon: "Settings2" },
];
