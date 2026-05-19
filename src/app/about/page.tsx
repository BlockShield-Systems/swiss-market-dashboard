import Image from "next/image";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
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
    technicalPositioning: string;
    brandContext: string;
    techStack: string;
    techStackNote: string;
    dataSources: string;
    coinGeckoTitle: string;
    coinGeckoText: string;
    openMeteoTitle: string;
    openMeteoText: string;
    authorTitle: string;
    authorText: string;
    linksLabel: string;
  };
};

const aboutContent: Record<Locale, AboutContent> = {
  de: {
    projectHighlights: [
      "Next.js-basierte Referenzanwendung mit App Router und TypeScript",
      "Zwei unterschiedliche Datendomänen: Krypto-Märkte und Schweizer Wetterdaten",
      "Fokus auf saubere UI-Architektur, typisierte API-Integration und wartbare Komponenten",
      "Responsives Interface mit Theme-Support, Testing und Vercel Deployment",
    ],
    capabilityAreas: [
      {
        title: "Modern Web Development",
        description:
          "Strukturierte Frontend-Entwicklung mit Fokus auf Lesbarkeit, Wartbarkeit, modularen Komponenten und produktionsnaher Umsetzung.",
      },
      {
        title: "AI Workflow Systems",
        description:
          "Technisches Denken in Workflows, Datenflüssen und schrittweiser Verarbeitung – nicht nur in isolierten Komponenten, sondern auf Systemebene.",
      },
      {
        title: "Data Integration & UI Architecture",
        description:
          "Verarbeitung heterogener externer Datenquellen und Übersetzung in klare, verständliche und performante Benutzeroberflächen.",
      },
      {
        title: "Platform & Infrastructure Thinking",
        description:
          "Praxisorientierter Blick auf Delivery, Integrationen, Betriebsnähe und technische Kohärenz über das Frontend hinaus.",
      },
    ],
    techStack: [
      { category: "Framework", items: ["Next.js 16", "App Router", "Turbopack"] },
      { category: "Sprache", items: ["TypeScript", "Strict Mode"] },
      { category: "Styling", items: ["Tailwind CSS", "shadcn/ui-style Components"] },
      { category: "Charts", items: ["Recharts"] },
      { category: "Tabellen", items: ["TanStack Table v8"] },
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
          "Primäre technische Marke für moderne Webentwicklung, AI-Workflows und digitale Systeme.",
        image: "/branding/ai-techart.webp",
      },
      {
        name: "BlockShield Systems",
        description:
          "Technisch ausgerichteter Teil des öffentlichen Markenökosystems mit Fokus auf Struktur, Systemdenken und belastbare Delivery.",
        image: "/branding/blockshield.webp",
      },
    ],
    sections: {
      projectProfile: "Projektprofil",
      projectProfileText: [
        "Das Swiss Market Dashboard ist eine technische Referenzanwendung, die reale Frontend-Kompetenz nicht über statische Präsentation, sondern über ein funktionales, datengetriebenes Produkt sichtbar macht.",
        "Der Schwerpunkt liegt auf der strukturierten Umsetzung moderner Benutzeroberflächen, der Verarbeitung externer Datenquellen und einer Architektur, die auch im produktionsnahen Kontext nachvollziehbar bleibt.",
        "Inhaltlich verbindet die Anwendung zwei unterschiedliche Datendomänen: tabellarische Kryptomarktdaten sowie visuelle Wetter- und Zeitreihendaten für die Schweiz. Diese Kombination ist bewusst gewählt, um den Umgang mit unterschiedlichen Datenstrukturen, UI-Mustern und Präsentationslogiken zu demonstrieren.",
      ],
      projectAtGlance: "Projekt auf einen Blick",
      technicalPositioning: "Technische Einordnung",
      brandContext: "Brand Context",
      techStack: "Tech Stack",
      techStackNote:
        'Für die tabellarische Darstellung kommt bewusst TanStack Table v8 zum Einsatz. Die Datei nutzt deshalb die Direktive "use no memo", um die bekannte React-Compiler-Inkompatibilität dieser Library-Version sauber zu behandeln, bis ein stabiler Migrationspfad auf eine spätere Version sinnvoll ist.',
      dataSources: "Datenquellen",
      coinGeckoTitle: "CoinGecko API",
      coinGeckoText:
        "Nutzung für aktuelle Kryptomarktdaten, Rankings, Preisentwicklungen, Marktkapitalisierung und historische Chartdaten. Im Dashboard werden diese Daten in Tabellen, Kennzahlen und Detailansichten übersetzt.",
      openMeteoTitle: "Open-Meteo API",
      openMeteoText:
        "Nutzung für Schweizer Wetter- und Prognosedaten mit Fokus auf Temperatur, Niederschlag und Wind. Diese Daten werden als Zeitreihen und visuelle Muster aufbereitet, um neben Tabellen auch chartbasierte Informationsdarstellung abzudecken.",
      authorTitle: "Autor & öffentliche Einordnung",
      authorText:
        "Demian Lienert positioniert sich öffentlich an der Schnittstelle von moderner Webentwicklung, AI-Workflows, visuellen Systemen und plattformorientiertem technischem Denken. Dieses Dashboard dient als nachvollziehbarer Praxisnachweis innerhalb dieses Profils.",
      linksLabel: "Weiterführende Links",
    },
  },

  en: {
    projectHighlights: [
      "Next.js-based reference application using the App Router and TypeScript",
      "Two distinct data domains: crypto markets and Swiss weather data",
      "Focused on clean UI architecture, typed API integration and maintainable components",
      "Responsive interface with theme support, testing and Vercel deployment",
    ],
    capabilityAreas: [
      {
        title: "Modern Web Development",
        description:
          "Structured frontend development focused on readability, maintainability, modular components and production-oriented delivery.",
      },
      {
        title: "AI Workflow Systems",
        description:
          "Technical thinking in workflows, data flows and step-based processing — not only at component level, but at system level.",
      },
      {
        title: "Data Integration & UI Architecture",
        description:
          "Processing heterogeneous external data sources and translating them into clear, understandable and performant user interfaces.",
      },
      {
        title: "Platform & Infrastructure Thinking",
        description:
          "A practical view on delivery, integrations, operational awareness and technical coherence beyond the frontend itself.",
      },
    ],
    techStack: [
      { category: "Framework", items: ["Next.js 16", "App Router", "Turbopack"] },
      { category: "Language", items: ["TypeScript", "Strict Mode"] },
      { category: "Styling", items: ["Tailwind CSS", "shadcn/ui-style components"] },
      { category: "Charts", items: ["Recharts"] },
      { category: "Tables", items: ["TanStack Table v8"] },
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
          "Primary technical brand focused on modern web development, AI workflows and digital systems.",
        image: "/branding/ai-techart.webp",
      },
      {
        name: "BlockShield Systems",
        description:
          "Technically focused part of the public brand ecosystem with emphasis on structure, systems thinking and solid delivery.",
        image: "/branding/blockshield.webp",
      },
    ],
    sections: {
      projectProfile: "Project Profile",
      projectProfileText: [
        "The Swiss Market Dashboard is a technical reference application designed to demonstrate real frontend capability through a functional, data-driven product rather than a static presentation.",
        "Its focus lies in the structured implementation of modern user interfaces, external data integration and an architecture that remains understandable in production-oriented contexts.",
        "The application intentionally combines two different data domains: tabular crypto market data and visual weather/time-series data for Switzerland. This combination highlights the ability to work with different data structures, UI patterns and presentation logics.",
      ],
      projectAtGlance: "Project at a Glance",
      technicalPositioning: "Technical Positioning",
      brandContext: "Brand Context",
      techStack: "Tech Stack",
      techStackNote:
        'TanStack Table v8 is used intentionally for tabular delivery. The related file therefore uses the "use no memo" directive to handle the known React Compiler incompatibility of this library version until a stable migration path to a later version becomes appropriate.',
      dataSources: "Data Sources",
      coinGeckoTitle: "CoinGecko API",
      coinGeckoText:
        "Used for live crypto market data, rankings, price performance, market capitalization and historical chart data. Within the dashboard, the data is translated into tables, metrics and detail views.",
      openMeteoTitle: "Open-Meteo API",
      openMeteoText:
        "Used for Swiss weather and forecast data with focus on temperature, precipitation and wind. The data is prepared as time-series and visual patterns to cover chart-based information delivery in addition to tables.",
      authorTitle: "Author & Public Positioning",
      authorText:
        "Demian Lienert publicly positions himself at the intersection of modern web development, AI workflows, visual systems and platform-oriented technical thinking. This dashboard serves as a practical proof point within that profile.",
      linksLabel: "Further Links",
    },
  },
};

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
      <header className="space-y-2">
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
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
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
          <div className="grid gap-5 sm:grid-cols-2">
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
              <code>/coins/{"{id}"}/market_chart</code>, <code>/global</code>
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
