import type { NavItemKey } from "@/lib/constants";
import type { SwissCityKey } from "@/lib/types/weather";

export const SUPPORTED_LOCALES = ["de", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "de";

type HeaderEntry = {
  title: string;
  description: string;
};

export type Dictionary = {
  site: {
    name: string;
    description: string;
  };
  common: {
    language: string;
    german: string;
    english: string;
    theme: string;
    themeToggle: string;
    system: string;
    light: string;
    dark: string;
    current: string;
    savedHint: string;
  };
  nav: Record<NavItemKey, string>;
  header: Record<NavItemKey, HeaderEntry>;
  sidebar: {
    subtitle: string;
    ecosystemLabel: string;
    openMenu: string;
    footer: string;
  };
  home: {
    title: string;
    description: string;
    stats: {
      marketCap: string;
      activeCoins: string;
      zurichToday: string;
      swissCities: string;
    };
    statDescriptions: {
      totalMarket: string;
      listedOnCoinGecko: string;
      minPrefix: string;
      monitoring: string;
    };
  };
  crypto: {
    title: string;
    description: string;
    errorPrefix: string;
    loadError: string;
    searchPlaceholder: string;
    noResults: string;
    marketShareTitle: string;
    marketShareError: string;
    table: {
      rank: string;
      coin: string;
      price: string;
      change24h: string;
      change7d: string;
      marketCap: string;
      volume: string;
    };
    filters: {
      all: string;
      gainers24h: string;
      losers24h: string;
      gainers7d: string;
      losers7d: string;
    };
    detail: {
      backToMarket: string;
      notFoundTitle: string;
      loadError: string;
      detailDescription: string;
      priceChartTitle: string;
      price: string;
      date: string;
      rank: string;
      marketCap: string;
      volume: string;
      ath: string;
      atl: string;
      aboutCoin: string;
      noDescription: string;
      marketData: string;
      circulatingSupply: string;
      totalSupply: string;
      maxSupply: string;
      categories: string;
      website: string;
      explorer: string;
      openDetails: string;
      chartRange7d: string;
      chartRange30d: string;
      chartRange90d: string;
      chartLoading: string;
      chartLoadError: string;
      showMore: string;
      showLess: string;
      chartSource: string;
      chartPriceInChf: string;
      chartTimeframe: string;
      chartZoomHint: string;
      chartBrushHint: string;
      chartMode: string;
      chartModeArea: string;
      chartModeLine: string;
      chartModeCandlestick: string;
      chartCandlestickDescription: string;
      chartCandlestickHint: string;
      chartOhlcLoading: string;
      chartOhlcLoadError: string;
      chartOhlcNoData: string;
    };
    legend: {
      title: string;
      rank: string;
      marketCap: string;
      volume: string;
      change24h: string;
      change7d: string;
      colors: string;
    };
  };
  weather: {
    title: string;
    description: string;
    cityLabel: string;
    forecastTitle: string;
    loading: string;
    loadError: string;
    temperatureLabel: string;
    precipitationChartLabel: string;
    precipitationBarLabel: string;
    maxSeriesLabel: string;
    minSeriesLabel: string;
    currentConditionsTitle: string;
    maxMinLabel: string;
    precipitationLabel: string;
    windMaxLabel: string;
    averageRain7dLabel: string;
    cities: Record<SwissCityKey, string>;
    weatherCodes: Record<number, string>;
    legend: {
      title: string;
      temperature: string;
      precipitation: string;
      wind: string;
      weatherCode: string;
      source: string;
    };
  };
  about: {
    title: string;
    description: string;
    websiteLabel: string;
    repositoryLabel: string;
    repositoryPendingLabel: string;
  };
  settings: {
    title: string;
    description: string;
    intro: string;
    languageTitle: string;
    languageText: string;
    themeTitle: string;
    themeText: string;
    summaryTitle: string;
    recruiterNoteTitle: string;
    recruiterNote: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  de: {
    site: {
      name: "AI-Techart & Dynamics Dashboard",
      description:
        "Recruiter-taugliche technische Case Study für moderne Frontend-Architektur, Datenintegration und produktionsnahe UI-Umsetzung.",
    },
    common: {
      language: "Sprache",
      german: "Deutsch",
      english: "English",
      theme: "Theme",
      themeToggle: "Theme umschalten",
      system: "System",
      light: "Hell",
      dark: "Dunkel",
      current: "Aktuell",
      savedHint:
        "Die Auswahl wird im Browser gespeichert und serverseitig für das gesamte Dashboard berücksichtigt.",
    },
    nav: {
      overview: "Übersicht",
      crypto: "Krypto-Markt",
      weather: "Wetter Schweiz",
      about: "Über das Dashboard",
      settings: "Einstellungen",
    },
    header: {
      overview: {
        title: "Übersicht",
        description:
          "Konsolidierte Übersicht über globale Krypto-Märkte und Schweizer Wetterdaten.",
      },
      crypto: {
        title: "Krypto-Markt",
        description:
          "Sortierbare Marktansicht mit CoinGecko-Daten und fokussierter Tabellendarstellung.",
      },
      weather: {
        title: "Wetter Schweiz",
        description:
          "Wetterprognosen und aktuelle Bedingungen für ausgewählte Schweizer Städte.",
      },
      about: {
        title: "Über das Dashboard",
        description:
          "Technische Einordnung, Branding-Kontext und recruiter-taugliche Projektbeschreibung.",
      },
      settings: {
        title: "Einstellungen",
        description:
          "Sprache und Theme für das gesamte Dashboard konsistent konfigurieren.",
      },
    },
    sidebar: {
      subtitle: "Technical Dashboard",
      ecosystemLabel: "Brand Context",
      openMenu: "Menü öffnen",
      footer: "© 2026 Demian Lienert · ai-techart.com",
    },
    home: {
      title: "Dashboard Übersicht",
      description:
        "Echtzeit-Übersicht über globale Krypto-Märkte und Schweizer Wetterdaten.",
      stats: {
        marketCap: "Krypto Market Cap",
        activeCoins: "Aktive Coins",
        zurichToday: "Zürich heute",
        swissCities: "Schweizer Städte",
      },
      statDescriptions: {
        totalMarket: "Gesamter Kryptomarkt",
        listedOnCoinGecko: "Gelistet auf CoinGecko",
        minPrefix: "Min:",
        monitoring: "Wetter-Monitoring",
      },
    },
    crypto: {
      title: "Krypto-Markt",
      description:
        "Top 50 Kryptowährungen nach Market Cap in CHF. Sortierbar, filterbar und ergänzt um 24h- sowie 7d-Änderungen.",
      errorPrefix: "Fehler beim Laden der Krypto-Daten:",
      loadError: "Krypto-Daten konnten nicht geladen werden.",
      searchPlaceholder: "Nach Coin oder Symbol suchen",
      noResults: "Keine Coins für die aktuelle Suche oder den aktiven Filter gefunden.",
      marketShareTitle: "Krypto-Marktanteile",
      marketShareError: "Marktanteile konnten nicht geladen werden.",
      table: {
        rank: "#",
        coin: "Coin",
        price: "Preis",
        change24h: "24h",
        change7d: "7d",
        marketCap: "Market Cap",
        volume: "Volumen",
      },
      filters: {
        all: "Alle Coins",
        gainers24h: "Gewinner 24h",
        losers24h: "Verlierer 24h",
        gainers7d: "Gewinner 7d",
        losers7d: "Verlierer 7d",
      },
      detail: {
        backToMarket: "Zurück zum Krypto-Markt",
        notFoundTitle: "Coin nicht gefunden",
        loadError: "Coin-Details konnten nicht geladen werden.",
        detailDescription:
          "Detailansicht mit Marktkennzahlen, Preisverlauf und CoinGecko-Metadaten.",
        priceChartTitle: "Preisverlauf",
        price: "Preis",
        date: "Datum",
        rank: "Rang",
        marketCap: "Market Cap",
        volume: "Volumen",
        ath: "Allzeithoch",
        atl: "Allzeittief",
        aboutCoin: "Über diesen Coin",
        noDescription: "Für diesen Coin ist keine Beschreibung verfügbar.",
        marketData: "Marktdaten",
        circulatingSupply: "Umlaufversorgung",
        totalSupply: "Gesamtversorgung",
        maxSupply: "Maximale Versorgung",
        categories: "Kategorien",
        website: "Website",
        explorer: "Blockchain Explorer",
        openDetails: "Details zu {coin} öffnen",
        chartRange7d: "7 Tage",
        chartRange30d: "30 Tage",
        chartRange90d: "90 Tage",
        chartLoading: "Chartdaten werden geladen …",
        chartLoadError: "Chartdaten konnten nicht geladen werden.",
        showMore: "Mehr anzeigen",
        showLess: "Weniger anzeigen",
        chartSource: "Datenquelle",
        chartPriceInChf: "Preisverlauf in Schweizer Franken (CHF).",
        chartTimeframe: "Zeitraum",
        chartZoomHint: "Zoom / Scroll",
        chartBrushHint: "Den unteren Schieberegler ziehen, um den sichtbaren Zeitraum einzugrenzen.",
        chartMode: "Chart-Typ",
        chartModeArea: "Fläche",
        chartModeLine: "Linie",
        chartModeCandlestick: "Candlestick",
        chartCandlestickDescription:
          "Echter OHLC-Candlestick-Chart mit Open-, High-, Low- und Close-Werten in CHF.",
        chartCandlestickHint:
          "Candlestick-Chart mit Maus ziehen, Mausrad zoomen oder Touch-Gesten bedienen. Charts bereitgestellt durch",
        chartOhlcLoading: "OHLC-Daten werden geladen …",
        chartOhlcLoadError: "OHLC-Daten konnten nicht geladen werden.",
        chartOhlcNoData: "Keine OHLC-Daten für diesen Zeitraum verfügbar.",
      },
      legend: {
        title: "Legende",
        rank:
          "Rang zeigt die CoinGecko-Position nach Marktkapitalisierung. Rang 1 entspricht dem grössten Marktwert.",
        marketCap:
          "Market Cap beschreibt den geschätzten Gesamtwert aller im Umlauf befindlichen Coins.",
        volume:
          "Volumen zeigt das gehandelte Volumen der letzten 24 Stunden in CHF.",
        change24h:
          "24h zeigt die Preisveränderung innerhalb der letzten 24 Stunden.",
        change7d:
          "7d zeigt die Preisveränderung innerhalb der letzten sieben Tage.",
        colors:
          "Positive Werte werden grün dargestellt, negative Werte rot.",
      },
    },
    weather: {
      title: "Wetter Schweiz",
      description:
        "7-Tage-Vorhersage für ausgewählte Schweizer Städte mit Temperatur, Niederschlag und Winddaten.",
      cityLabel: "Stadt auswählen",
      forecastTitle: "7-Tage-Vorhersage",
      loading: "Wetterdaten werden geladen …",
      loadError: "Wetterdaten konnten nicht geladen werden.",
      temperatureLabel: "Temperatur",
      precipitationChartLabel: "Niederschlag",
      precipitationBarLabel: "Niederschlag",
      maxSeriesLabel: "Maximum",
      minSeriesLabel: "Minimum",
      currentConditionsTitle: "Aktuelles Wetter",
      maxMinLabel: "Max. / Min.",
      precipitationLabel: "Niederschlag",
      windMaxLabel: "Max. Wind",
      averageRain7dLabel: "Ø Regen 7 Tage",
      cities: {
        zurich: "Zürich",
        bern: "Bern",
        geneva: "Genf",
        basel: "Basel",
        lausanne: "Lausanne",
        lucerne: "Luzern",
        lugano: "Lugano",
        stGallen: "St. Gallen",
        winterthur: "Winterthur",
        interlaken: "Interlaken",
        zermatt: "Zermatt",
        davos: "Davos",
      },
      weatherCodes: {
        0: "☀️ Klar",
        1: "🌤️ Leicht bewölkt",
        2: "⛅ Teilweise bewölkt",
        3: "☁️ Bedeckt",
        45: "🌫️ Nebel",
        48: "🌫️ Reifnebel",
        51: "🌧️ Leichter Nieselregen",
        53: "🌧️ Mässiger Nieselregen",
        55: "🌧️ Dichter Nieselregen",
        61: "🌧️ Leichter Regen",
        63: "🌧️ Mässiger Regen",
        65: "🌧️ Starker Regen",
        71: "🌨️ Leichter Schnee",
        73: "🌨️ Mässiger Schnee",
        75: "🌨️ Starker Schnee",
        80: "🌦️ Leichte Regenschauer",
        81: "🌦️ Mässige Regenschauer",
        82: "🌦️ Heftige Regenschauer",
        95: "⛈️ Gewitter",
        96: "⛈️ Gewitter mit Hagel",
        99: "⛈️ Schweres Gewitter mit Hagel",
      },
      legend: {
        title: "Legende",
        temperature:
          "Temperatur zeigt tägliche Minimal- und Maximalwerte in Grad Celsius.",
        precipitation:
          "Niederschlag zeigt die erwartete Regen- oder Schneemenge in Millimetern pro Tag.",
        wind:
          "Wind zeigt die maximale Windgeschwindigkeit pro Tag in km/h.",
        weatherCode:
          "Wettercodes werden als verständliche Symbole und Kurzbeschreibungen dargestellt.",
        source:
          "Datenquelle ist die Open-Meteo Weather API für ausgewählte Schweizer Städte.",
      },
    },
    about: {
      title: "Über dieses Dashboard",
      description:
        "Recruiter-taugliche Case Study innerhalb des AI-Techart & Dynamics Ökosystems – mit Fokus auf Frontend-Architektur, Datenintegration und produktionsnahe Umsetzung.",
      websiteLabel: "Hauptseite",
      repositoryLabel: "Dashboard Repository",
      repositoryPendingLabel: "Repository folgt",
    },
    settings: {
      title: "Einstellungen",
      description: "Sprache und Theme für dieses Dashboard konfigurieren.",
      intro:
        "Diese Seite steuert die zentralen Benutzerpräferenzen für das Dashboard. Die Sprache wird per Cookie gespeichert und bei serverseitig gerenderten Seiten sofort berücksichtigt.",
      languageTitle: "Sprache",
      languageText:
        "Wechselt Navigation, Seitenüberschriften und erklärende Inhalte zwischen Deutsch und Englisch.",
      themeTitle: "Theme",
      themeText:
        "Steuert die visuelle Darstellung über das gesamte Dashboard hinweg.",
      summaryTitle: "Zusammenfassung",
      recruiterNoteTitle: "Portfolio-Hinweis",
      recruiterNote:
        "Diese Implementierung ist bewusst robust gehalten: Cookie-basierte Sprache für SSR-Konsistenz, lokales Branding und klar getrennte Präferenzlogik statt verteilter Hardcoded-Strings.",
    },
  },

  en: {
    site: {
      name: "AI-Techart & Dynamics Dashboard",
      description:
        "Recruiter-ready technical case study for modern frontend architecture, data integration and production-oriented UI delivery.",
    },
    common: {
      language: "Language",
      german: "German",
      english: "English",
      theme: "Theme",
      themeToggle: "Toggle theme",
      system: "System",
      light: "Light",
      dark: "Dark",
      current: "Current",
      savedHint:
        "Your selection is stored in the browser and applied server-side across the dashboard.",
    },
    nav: {
      overview: "Overview",
      crypto: "Crypto Market",
      weather: "Swiss Weather",
      about: "About the Dashboard",
      settings: "Settings",
    },
    header: {
      overview: {
        title: "Overview",
        description:
          "Consolidated overview of global crypto markets and Swiss weather data.",
      },
      crypto: {
        title: "Crypto Market",
        description:
          "Sortable market view backed by CoinGecko data and a focused table layout.",
      },
      weather: {
        title: "Swiss Weather",
        description:
          "Forecasts and current conditions for selected Swiss cities.",
      },
      about: {
        title: "About the Dashboard",
        description:
          "Technical positioning, brand context and recruiter-ready project framing.",
      },
      settings: {
        title: "Settings",
        description:
          "Configure language and theme consistently across the dashboard.",
      },
    },
    sidebar: {
      subtitle: "Technical Dashboard",
      ecosystemLabel: "Brand Context",
      openMenu: "Open menu",
      footer: "© 2026 Demian Lienert · ai-techart.com",
    },
    home: {
      title: "Dashboard Overview",
      description:
        "Real-time overview of global crypto markets and Swiss weather data.",
      stats: {
        marketCap: "Crypto Market Cap",
        activeCoins: "Active Coins",
        zurichToday: "Zurich Today",
        swissCities: "Swiss Cities",
      },
      statDescriptions: {
        totalMarket: "Total crypto market",
        listedOnCoinGecko: "Listed on CoinGecko",
        minPrefix: "Min:",
        monitoring: "Weather monitoring",
      },
    },
    crypto: {
      title: "Crypto Market",
      description:
        "Top 50 cryptocurrencies by market cap in CHF. Sortable, filterable and enriched with 24h and 7d price changes.",
      errorPrefix: "Error while loading crypto data:",
      loadError: "Crypto data could not be loaded.",
      searchPlaceholder: "Search by coin or symbol",
      noResults: "No coins found for the current search or active filter.",
      marketShareTitle: "Crypto Market Shares",
      marketShareError: "Market shares could not be loaded.",
      table: {
        rank: "#",
        coin: "Coin",
        price: "Price",
        change24h: "24h",
        change7d: "7d",
        marketCap: "Market Cap",
        volume: "Volume",
      },
      filters: {
        all: "All coins",
        gainers24h: "Gainers 24h",
        losers24h: "Losers 24h",
        gainers7d: "Gainers 7d",
        losers7d: "Losers 7d",
      },
      detail: {
        backToMarket: "Back to crypto market",
        notFoundTitle: "Coin not found",
        loadError: "Coin details could not be loaded.",
        detailDescription:
          "Detail view with market metrics, price chart and CoinGecko metadata.",
        priceChartTitle: "Price Chart",
        price: "Price",
        date: "Date",
        rank: "Rank",
        marketCap: "Market Cap",
        volume: "Volume",
        ath: "All-time high",
        atl: "All-time low",
        aboutCoin: "About this coin",
        noDescription: "No description is available for this coin.",
        marketData: "Market Data",
        circulatingSupply: "Circulating Supply",
        totalSupply: "Total Supply",
        maxSupply: "Max Supply",
        categories: "Categories",
        website: "Website",
        explorer: "Blockchain Explorer",
        openDetails: "Open details for {coin}",
        chartRange7d: "7 days",
        chartRange30d: "30 days",
        chartRange90d: "90 days",
        chartLoading: "Loading chart data …",
        chartLoadError: "Chart data could not be loaded.",
        showMore: "Show more",
        showLess: "Show less",
        chartSource: "Data source",
        chartPriceInChf: "Price history in Swiss francs (CHF).",
        chartTimeframe: "Timeframe",
        chartZoomHint: "Zoom / scroll",
        chartBrushHint: "Drag the lower range slider to narrow the visible timeframe.",
        chartMode: "Chart type",
        chartModeArea: "Area",
        chartModeLine: "Line",
        chartModeCandlestick: "Candlestick",
        chartCandlestickDescription:
          "Real OHLC candlestick chart with open, high, low and close values in CHF.",
        chartCandlestickHint:
          "Drag the candlestick chart, zoom with the mouse wheel or use touch gestures. Charts provided by",
        chartOhlcLoading: "Loading OHLC data …",
        chartOhlcLoadError: "OHLC data could not be loaded.",
        chartOhlcNoData: "No OHLC data available for this timeframe.",
      },
      legend: {
        title: "Legend",
        rank:
          "Rank shows the CoinGecko position by market capitalization. Rank 1 represents the largest market value.",
        marketCap:
          "Market cap describes the estimated total value of all circulating coins.",
        volume:
          "Volume shows the traded volume over the last 24 hours in CHF.",
        change24h:
          "24h shows the price change over the last 24 hours.",
        change7d:
          "7d shows the price change over the last seven days.",
        colors:
          "Positive values are shown in green, negative values in red.",
      },
    },
    weather: {
      title: "Swiss Weather",
      description:
        "7-day forecast for selected Swiss cities with temperature, precipitation and wind data.",
      cityLabel: "Select city",
      forecastTitle: "7-Day Forecast",
      loading: "Loading weather data …",
      loadError: "Weather data could not be loaded.",
      temperatureLabel: "Temperature",
      precipitationChartLabel: "Precipitation",
      precipitationBarLabel: "Precipitation",
      maxSeriesLabel: "Maximum",
      minSeriesLabel: "Minimum",
      currentConditionsTitle: "Current Weather",
      maxMinLabel: "Max / Min",
      precipitationLabel: "Precipitation",
      windMaxLabel: "Max wind",
      averageRain7dLabel: "Ø rain 7 days",
      cities: {
        zurich: "Zurich",
        bern: "Bern",
        geneva: "Geneva",
        basel: "Basel",
        lausanne: "Lausanne",
        lucerne: "Lucerne",
        lugano: "Lugano",
        stGallen: "St. Gallen",
        winterthur: "Winterthur",
        interlaken: "Interlaken",
        zermatt: "Zermatt",
        davos: "Davos",
      },
      weatherCodes: {
        0: "☀️ Clear",
        1: "🌤️ Mostly clear",
        2: "⛅ Partly cloudy",
        3: "☁️ Overcast",
        45: "🌫️ Fog",
        48: "🌫️ Rime fog",
        51: "🌧️ Light drizzle",
        53: "🌧️ Moderate drizzle",
        55: "🌧️ Dense drizzle",
        61: "🌧️ Light rain",
        63: "🌧️ Moderate rain",
        65: "🌧️ Heavy rain",
        71: "🌨️ Light snow",
        73: "🌨️ Moderate snow",
        75: "🌨️ Heavy snow",
        80: "🌦️ Light showers",
        81: "🌦️ Moderate showers",
        82: "🌦️ Violent showers",
        95: "⛈️ Thunderstorm",
        96: "⛈️ Thunderstorm with hail",
        99: "⛈️ Severe thunderstorm with hail",
      },
      legend: {
        title: "Legend",
        temperature:
          "Temperature shows daily minimum and maximum values in degrees Celsius.",
        precipitation:
          "Precipitation shows the expected rain or snow amount in millimeters per day.",
        wind:
          "Wind shows the maximum wind speed per day in km/h.",
        weatherCode:
          "Weather codes are translated into readable icons and short descriptions.",
        source:
          "Data source is the Open-Meteo Weather API for selected Swiss cities.",
      },
    },
    about: {
      title: "About this Dashboard",
      description:
        "Recruiter-ready case study within the AI-Techart & Dynamics ecosystem, focused on frontend architecture, data integration and production-oriented implementation.",
      websiteLabel: "Main website",
      repositoryLabel: "Dashboard repository",
      repositoryPendingLabel: "Repository coming soon",
    },
    settings: {
      title: "Settings",
      description: "Configure language and theme for this dashboard.",
      intro:
        "This page controls the central user preferences for the dashboard. Language is stored in a cookie so server-rendered pages can immediately reflect the selected locale.",
      languageTitle: "Language",
      languageText:
        "Switches navigation, page headlines and explanatory content between German and English.",
      themeTitle: "Theme",
      themeText:
        "Controls the visual appearance across the entire dashboard.",
      summaryTitle: "Summary",
      recruiterNoteTitle: "Portfolio Note",
      recruiterNote:
        "This implementation is intentionally robust: cookie-based language for SSR consistency, local branding assets and cleanly separated preference logic instead of scattered hardcoded strings.",
    },
  },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
