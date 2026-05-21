import Image from "next/image";
import type { Metadata } from "next";
import {
  Bot,
  Database,
  ExternalLink,
  Flag,
  Gauge,
  GitBranch,
  LockKeyhole,
  Server,
  ShieldCheck,
} from "lucide-react";
import { ArchitectureBadges } from "@/components/dashboard/architecture-badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

const REPOSITORY_URL =
  "https://github.com/BlockShield-Systems/swiss-market-dashboard";

type AboutContent = {
  projectHighlights: string[];
  capabilityAreas: Array<{
    title: string;
    description: string;
  }>;
  productionLayers: Array<{
    title: string;
    description: string;
    icon: "database" | "flag" | "bot" | "redis" | "security" | "deployment";
  }>;
  techStack: Array<{
    category: string;
    items: string[];
  }>;
  brandEcosystem: Array<{
    name: string;
    description: string;
    image: string;
  }>;
  sections: {
    projectProfile: string;
    projectProfileText: string[];
    projectAtGlance: string;
    productionArchitecture: string;
    technicalPositioning: string;
    brandContext: string;
    techStack: string;
    techStackNote: string;
    dataSources: string;
    coinGeckoTitle: string;
    coinGeckoText: string;
    openMeteoTitle: string;
    openMeteoText: string;
    securityAndCostControl: string;
    securityAndCostControlItems: Array<{
      title: string;
      description: string;
    }>;
    authorTitle: string;
    authorText: string;
    linksLabel: string;
    badgeProduction: string;
    badgePostgres: string;
    badgeAi: string;
  };
};

const aboutContent: Record<Locale, AboutContent> = {
  de: {
    projectHighlights: [
      "Next.js-basierte Intelligence-Plattform mit App Router und TypeScript",
      "Mehrere Datendomänen: Krypto-Märkte, Schweizer Wetterdaten und persistente Market Insights",
      "Interaktive Krypto-Detailseiten mit Area-, Line- und echtem OHLC-Candlestick-Chart",
      "Schweizer Wetterdashboard mit 7-Tage-Forecast, Tageskarten, Temperatur-, Niederschlags- und Windvisualisierung",
      "Produktionsnahe Architektur mit Neon Postgres, Drizzle ORM, Upstash Redis, Feature Flags, Testing und Vercel Deployment",
    ],
    capabilityAreas: [
      {
        title: "Modern Web Development",
        description:
          "Strukturierte Webentwicklung mit Fokus auf Lesbarkeit, Wartbarkeit, modularen Komponenten, klarer Nutzerführung und produktionsnaher Umsetzung.",
      },
      {
        title: "Data Integration & Intelligence",
        description:
          "Integration heterogener Datenquellen und Übersetzung von Markt-, Wetter- und Insight-Daten in verständliche, performante Benutzeroberflächen.",
      },
      {
        title: "Platform Architecture",
        description:
          "Serverseitige API-Routen, persistente Datenhaltung, Redis-Caching, Rate Limiting, Feature Flags und kontrollierte Deployment-Prozesse als zusammenhängende Plattformarchitektur.",
      },
      {
        title: "AI-ready Systems",
        description:
          "Vorbereitete AI-Infrastruktur mit Gateway-Anbindung, Kostenkontrolle, Feature-Flag-Schutz, Rate Limiting und Response-Caching – bewusst deaktiviert, bis Betrieb und Kostenrahmen freigegeben sind.",
      },
    ],
    productionLayers: [
      {
        title: "Postgres-Datenschicht",
        description:
          "Neon Postgres speichert persistente Market Intelligence Records. Drizzle ORM und migrationsbasierter Workflow machen die Datenschicht nachvollziehbar und erweiterbar.",
        icon: "database",
      },
      {
        title: "Feature-Flag-Steuerung",
        description:
          "Serverseitige Flags steuern das Insights-Modul, die AI Summary Route und den Standard-Chartmodus ohne Codeänderung oder riskanten Rollout.",
        icon: "flag",
      },
      {
        title: "Vorbereitete AI-Gateway-Anbindung",
        description:
          "Die AI Market Summary Route ist implementiert, validiert Requests mit Zod, baut strukturierte Prompts und persistiert zukünftige Ergebnisse in Postgres.",
        icon: "bot",
      },
      {
        title: "Redis-Cache & Rate Limits",
        description:
          "Upstash Redis schützt externe APIs und AI-Flows durch Public API Caching, Rate Limits und Response Caching für teure Operationen.",
        icon: "redis",
      },
      {
        title: "Security-Hygiene",
        description:
          "Secrets bleiben serverseitig, .env.local wird nicht committed, Dependency Advisories wurden bereinigt und Audit-Checks sind dokumentiert.",
        icon: "security",
      },
      {
        title: "Production Deployment",
        description:
          "Vercel liefert Production Deployments, Domains, Runtime Logs, Analytics, Speed Insights und kontrollierte Environment Variables.",
        icon: "deployment",
      },
    ],
    techStack: [
      {
        category: "Framework",
        items: ["Next.js 16", "App Router", "Turbopack"],
      },
      { category: "Sprache", items: ["TypeScript", "Strict Mode"] },
      {
        category: "Styling",
        items: ["Tailwind CSS", "shadcn/ui-style Components"],
      },
      { category: "Charts", items: ["Recharts", "lightweight-charts"] },
      { category: "Tabellen", items: ["TanStack Table v8"] },
      {
        category: "Datenbank",
        items: ["Neon Postgres", "Drizzle ORM", "Drizzle Kit"],
      },
      {
        category: "Cache & Rate Limiting",
        items: ["Upstash Redis", "@upstash/redis", "@upstash/ratelimit"],
      },
      {
        category: "AI-Infrastruktur",
        items: ["Vercel AI Gateway", "AI SDK", "Feature Flag Kill Switch"],
      },
      {
        category: "Testing",
        items: ["Jest", "React Testing Library", "Playwright-ready"],
      },
      { category: "Deployment", items: ["Vercel", "GitHub"] },
      {
        category: "APIs",
        items: ["CoinGecko", "Open-Meteo"],
      },
    ],
    brandEcosystem: [
      {
        name: "AI-Techart & Dynamics",
        description:
          "Technische Marke für moderne Webentwicklung, AI-Workflows, datengetriebene Interfaces und digitale Plattformen.",
        image: "/branding/ai-techart.webp",
      },
      {
        name: "BlockShield Systems",
        description:
          "Technisch ausgerichteter Teil des öffentlichen Markenökosystems mit Fokus auf Struktur, Systemdenken, robuste Umsetzung und nachvollziehbare Delivery.",
        image: "/branding/blockshield.webp",
      },
    ],
    sections: {
      projectProfile: "Projektprofil",
      projectProfileText: [
        "Das Swiss Market Dashboard ist ein produktionsnahes Intelligence Dashboard innerhalb des AI-Techart & Dynamics Ökosystems. Es kombiniert Kryptowährungsdaten, Schweizer Wetterinformationen, persistente Market Insights, Feature Flags, Redis-Caching und eine vorbereitete AI-Analyse-Infrastruktur zu einer modernen, erweiterbaren Plattform.",
        "Der Schwerpunkt liegt auf klarer Datenintegration, stabilen serverseitigen APIs, nachvollziehbarer Plattformarchitektur und einer Benutzeroberfläche, die komplexe externe Daten verständlich aufbereitet.",
        "Die Anwendung verbindet bewusst unterschiedliche Datendomänen: tabellarische Kryptomarktdaten, visuelle Wetter- und Zeitreihendaten sowie persistente Marktinformationen aus einer SQL-Datenbank. Dadurch entsteht eine belastbare Grundlage für weitere Module wie Watchlists, Admin-Funktionen, AI-generierte Analysen oder geschützte Premium-Bereiche.",
      ],
      projectAtGlance: "Projekt auf einen Blick",
      productionArchitecture: "Produktionsnahe Architektur",
      technicalPositioning: "Technische Einordnung",
      brandContext: "Markenkontext",
      techStack: "Tech Stack",
      techStackNote:
        'Für die tabellarische Darstellung kommt bewusst TanStack Table v8 zum Einsatz. Die Datei nutzt deshalb die Direktive "use no memo", um die bekannte React-Compiler-Inkompatibilität dieser Library-Version sauber zu behandeln, bis ein stabiler Migrationspfad auf eine spätere Version sinnvoll ist.',
      dataSources: "Datenquellen",
      coinGeckoTitle: "CoinGecko API",
      coinGeckoText:
        "Nutzung für aktuelle Kryptomarktdaten, Rankings, Preisentwicklungen, Marktkapitalisierung, historische Zeitreihen und echte OHLC-Daten. Die öffentlichen Datenrouten werden zusätzlich über Redis gecacht und rate-limited, um externe API-Last und unnötige Requests zu reduzieren.",
      openMeteoTitle: "Open-Meteo API",
      openMeteoText:
        "Nutzung für Schweizer Wetter- und Prognosedaten mit Fokus auf Temperatur, Niederschlag, Wind und Wetterzustände. Die Wetterroute nutzt Redis-Caching, da Wetterdaten nicht bei jedem Seitenaufruf neu geladen werden müssen.",
      securityAndCostControl: "Sicherheit & Kostenkontrolle",
      securityAndCostControlItems: [
        {
          title: "Secret Management",
          description:
            "Secrets werden ausschließlich serverseitig über Environment Variables verwendet. Lokale .env-Dateien sind vom Git-Tracking ausgeschlossen.",
        },
        {
          title: "AI-Kostenkontrolle",
          description:
            "AI-Funktionalität ist bewusst hinter einem Feature Flag deaktiviert, bis Billing, Nutzungsgrenzen und Freigabe explizit entschieden sind.",
        },
        {
          title: "Redis-Schutzschicht",
          description:
            "Redis schützt API- und AI-Flows durch Rate Limiting und Caching. Dependency Advisories wurden über pnpm Overrides, Workspace-Konfiguration und Audit-Checks bereinigt.",
        },
      ],
      authorTitle: "Autor & Projektkontext",
      authorText:
        "Demian Lienert entwickelt das Swiss Market Dashboard als Teil des AI-Techart & Dynamics Ökosystems. Das Projekt verbindet moderne Webentwicklung, Datenintegration, AI-ready Infrastruktur und plattformorientiertes technisches Denken in einer öffentlich zugänglichen Anwendung.",
      linksLabel: "Weiterführende Links",
      badgeProduction: "Produktionsnah",
      badgePostgres: "Postgres-basiert",
      badgeAi: "Kostenkontrollierte AI",
    },
  },

  en: {
    projectHighlights: [
      "Next.js-based intelligence platform using the App Router and TypeScript",
      "Multiple data domains: crypto markets, Swiss weather data and persistent market insights",
      "Interactive crypto detail pages with area, line and real OHLC candlestick charts",
      "Swiss weather dashboard with 7-day forecasts, daily cards, temperature, precipitation and wind visualizations",
      "Production-oriented architecture with Neon Postgres, Drizzle ORM, Upstash Redis, feature flags, testing and Vercel deployment",
    ],
    capabilityAreas: [
      {
        title: "Modern Web Development",
        description:
          "Structured web development focused on readability, maintainability, modular components, clear user experience and production-oriented delivery.",
      },
      {
        title: "Data Integration & Intelligence",
        description:
          "Integration of heterogeneous data sources and translation of market, weather and insight data into clear, performant user interfaces.",
      },
      {
        title: "Platform Architecture",
        description:
          "Server-side API routes, persistent storage, Redis caching, rate limiting, feature flags and controlled deployment workflows as one coherent platform architecture.",
      },
      {
        title: "AI-ready Systems",
        description:
          "Prepared AI infrastructure with gateway integration, cost control, feature-flag protection, rate limiting and response caching — intentionally disabled until operations and cost limits are approved.",
      },
    ],
    productionLayers: [
      {
        title: "Postgres Data Layer",
        description:
          "Neon Postgres stores persistent market intelligence records. Drizzle ORM and migration-based workflows make the data layer explainable and extensible.",
        icon: "database",
      },
      {
        title: "Feature Flag Control",
        description:
          "Server-side flags control the insights module, the AI summary route and the default chart mode without code changes or risky rollout.",
        icon: "flag",
      },
      {
        title: "AI Gateway Prepared",
        description:
          "The AI market summary route is implemented, validates requests with Zod, builds structured prompts and persists future results in Postgres.",
        icon: "bot",
      },
      {
        title: "Redis Cache & Rate Limits",
        description:
          "Upstash Redis protects external APIs and AI flows through public API caching, rate limits and response caching for expensive operations.",
        icon: "redis",
      },
      {
        title: "Security Hygiene",
        description:
          "Secrets remain server-side, .env.local is not committed, dependency advisories were resolved and audit checks are documented.",
        icon: "security",
      },
      {
        title: "Production Deployment",
        description:
          "Vercel provides production deployments, domains, runtime logs, analytics, speed insights and controlled environment variables.",
        icon: "deployment",
      },
    ],
    techStack: [
      {
        category: "Framework",
        items: ["Next.js 16", "App Router", "Turbopack"],
      },
      { category: "Language", items: ["TypeScript", "Strict Mode"] },
      {
        category: "Styling",
        items: ["Tailwind CSS", "shadcn/ui-style components"],
      },
      { category: "Charts", items: ["Recharts", "lightweight-charts"] },
      { category: "Tables", items: ["TanStack Table v8"] },
      {
        category: "Database",
        items: ["Neon Postgres", "Drizzle ORM", "Drizzle Kit"],
      },
      {
        category: "Cache & Rate Limiting",
        items: ["Upstash Redis", "@upstash/redis", "@upstash/ratelimit"],
      },
      {
        category: "AI Infrastructure",
        items: ["Vercel AI Gateway", "AI SDK", "Feature Flag Kill Switch"],
      },
      {
        category: "Testing",
        items: ["Jest", "React Testing Library", "Playwright-ready"],
      },
      { category: "Deployment", items: ["Vercel", "GitHub"] },
      {
        category: "APIs",
        items: ["CoinGecko", "Open-Meteo"],
      },
    ],
    brandEcosystem: [
      {
        name: "AI-Techart & Dynamics",
        description:
          "Technical brand focused on modern web development, AI workflows, data-driven interfaces and digital platforms.",
        image: "/branding/ai-techart.webp",
      },
      {
        name: "BlockShield Systems",
        description:
          "Technically focused part of the public brand ecosystem with emphasis on structure, systems thinking, robust implementation and transparent delivery.",
        image: "/branding/blockshield.webp",
      },
    ],
    sections: {
      projectProfile: "Project Profile",
      projectProfileText: [
        "Swiss Market Dashboard is a production-oriented intelligence dashboard within the AI-Techart & Dynamics ecosystem. It combines crypto market data, Swiss weather information, persistent market insights, feature flags, Redis caching and prepared AI analysis infrastructure into a modern, extensible platform.",
        "The focus is on clear data integration, stable server-side APIs, understandable platform architecture and a user interface that turns complex external data into accessible information.",
        "The application intentionally combines different data domains: tabular crypto market data, visual weather and time-series data, and persistent market intelligence stored in a SQL database. This creates a solid foundation for future modules such as watchlists, admin controls, AI-generated analysis or protected premium areas.",
      ],
      projectAtGlance: "Project at a Glance",
      productionArchitecture: "Production-Oriented Architecture",
      technicalPositioning: "Technical Positioning",
      brandContext: "Brand Context",
      techStack: "Tech Stack",
      techStackNote:
        'TanStack Table v8 is used intentionally for tabular delivery. The related file therefore uses the "use no memo" directive to handle the known React Compiler incompatibility of this library version until a stable migration path to a later version becomes appropriate.',
      dataSources: "Data Sources",
      coinGeckoTitle: "CoinGecko API",
      coinGeckoText:
        "Used for live crypto market data, rankings, price performance, market capitalization, historical time series and real OHLC data. Public data routes are additionally cached and rate-limited through Redis to reduce external API load and unnecessary requests.",
      openMeteoTitle: "Open-Meteo API",
      openMeteoText:
        "Used for Swiss weather and forecast data with focus on temperature, precipitation, wind and weather conditions. The weather route uses Redis caching because weather data does not need to be refetched on every page request.",
      securityAndCostControl: "Security & Cost Control",
      securityAndCostControlItems: [
        {
          title: "Secret Management",
          description:
            "Secrets are used server-side only through environment variables. Local .env files are excluded from Git tracking.",
        },
        {
          title: "AI Cost Control",
          description:
            "AI functionality is intentionally disabled behind a feature flag until billing, usage limits and activation are explicitly approved.",
        },
        {
          title: "Redis Protection Layer",
          description:
            "Redis protects API and AI flows through rate limiting and caching. Dependency advisories were resolved using pnpm overrides, workspace configuration and audit checks.",
        },
      ],
      authorTitle: "Author & Project Context",
      authorText:
        "Demian Lienert develops the Swiss Market Dashboard as part of the AI-Techart & Dynamics ecosystem. The project combines modern web development, data integration, AI-ready infrastructure and platform-oriented technical thinking in a publicly accessible application.",
      linksLabel: "Further Links",
      badgeProduction: "Production-oriented",
      badgePostgres: "Postgres-backed",
      badgeAi: "Cost-controlled AI",
    },
  },
};

function getLayerIcon(icon: AboutContent["productionLayers"][number]["icon"]) {
  switch (icon) {
    case "database":
      return <Database className="size-4 text-primary" />;
    case "flag":
      return <Flag className="size-4 text-primary" />;
    case "bot":
      return <Bot className="size-4 text-primary" />;
    case "redis":
      return <Gauge className="size-4 text-primary" />;
    case "security":
      return <ShieldCheck className="size-4 text-primary" />;
    case "deployment":
      return <Server className="size-4 text-primary" />;
    default:
      return <GitBranch className="size-4 text-primary" />;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return {
    title: t.about.title,
    description: t.about.description,
  };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const content = aboutContent[locale];

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1">
            <Server className="size-3" />
            {content.sections.badgeProduction}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Database className="size-3" />
            {content.sections.badgePostgres}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <ShieldCheck className="size-3" />
            {content.sections.badgeAi}
          </Badge>
        </div>

        <ArchitectureBadges locale={locale} compact />

        <h1 className="text-3xl font-bold tracking-tight">{t.about.title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
          {t.about.description}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{content.sections.projectProfile}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {content.sections.projectProfileText.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {content.sections.projectAtGlance}
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {content.projectHighlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-linear-to-br from-primary/5 via-background to-background">
        <CardHeader>
          <CardTitle>{content.sections.productionArchitecture}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {content.productionLayers.map((layer) => (
            <div
              key={layer.title}
              className="rounded-xl border bg-background/70 p-4"
            >
              <div className="flex items-center gap-2">
                {getLayerIcon(layer.icon)}
                <h2 className="text-sm font-semibold text-foreground">
                  {layer.title}
                </h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {layer.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{content.sections.technicalPositioning}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {content.capabilityAreas.map((area) => (
            <div key={area.title} className="rounded-xl border bg-muted/20 p-4">
              <h2 className="text-sm font-semibold text-foreground">
                {area.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {area.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{content.sections.brandContext}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {content.brandEcosystem.map((brand) => (
            <div key={brand.name} className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl border bg-background/80 p-2">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  width={64}
                  height={64}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                {brand.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {brand.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{content.sections.techStack}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {content.techStack.map((stack) => (
              <div key={stack.category} className="space-y-2">
                <h2 className="text-sm font-semibold text-foreground">
                  {stack.category}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {stack.items.map((item) => (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="font-normal"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground">
            {content.sections.techStackNote}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{content.sections.dataSources}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-muted/20 p-4">
            <h2 className="text-sm font-semibold text-foreground">
              {content.sections.coinGeckoTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {content.sections.coinGeckoText}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <code>/coins/markets</code>, <code>/coins/{"{id}"}</code>,{" "}
              <code>/coins/{"{id}"}/market_chart</code>,{" "}
              <code>/coins/{"{id}"}/ohlc</code>, <code>/global</code>
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <h2 className="text-sm font-semibold text-foreground">
              {content.sections.openMeteoTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {content.sections.openMeteoText}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{content.sections.securityAndCostControl}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {content.sections.securityAndCostControlItems.map((item) => (
            <div key={item.title} className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <LockKeyhole className="size-4 text-primary" />
                {item.title}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{content.sections.authorTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>{content.sections.authorText}</p>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              {content.sections.linksLabel}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://ai-techart.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
              >
                {t.about.websiteLabel}
                <ExternalLink className="size-3" />
              </a>

              <a
                href={REPOSITORY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
              >
                {t.about.repositoryLabel}
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
