export interface WeatherData {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
  };
  daily_units?: {
    time?: string;
    weather_code?: string;
    temperature_2m_max?: string;
    temperature_2m_min?: string;
    precipitation_sum?: string;
    wind_speed_10m_max?: string;
  };
}

export const SWISS_CITIES = [
  {
    key: "zurich",
    latitude: 47.3769,
    longitude: 8.5417,
  },
  {
    key: "bern",
    latitude: 46.9481,
    longitude: 7.4474,
  },
  {
    key: "geneva",
    latitude: 46.2044,
    longitude: 6.1432,
  },
  {
    key: "basel",
    latitude: 47.5596,
    longitude: 7.5886,
  },
  {
    key: "lausanne",
    latitude: 46.5197,
    longitude: 6.6323,
  },
  {
    key: "lucerne",
    latitude: 47.0502,
    longitude: 8.3093,
  },
  {
    key: "lugano",
    latitude: 46.0037,
    longitude: 8.9511,
  },
  {
    key: "stGallen",
    latitude: 47.4245,
    longitude: 9.3767,
  },
  {
    key: "winterthur",
    latitude: 47.4988,
    longitude: 8.7237,
  },
  {
    key: "interlaken",
    latitude: 46.6863,
    longitude: 7.8632,
  },
  {
    key: "zermatt",
    latitude: 46.0207,
    longitude: 7.7491,
  },
  {
    key: "davos",
    latitude: 46.8027,
    longitude: 9.8359,
  },
] as const;

export type SwissCity = (typeof SWISS_CITIES)[number];

export type SwissCityKey = SwissCity["key"];

export const DEFAULT_SWISS_CITY_KEY: SwissCityKey = "zurich";

export const DEFAULT_SWISS_CITY = SWISS_CITIES.find(
  (city) => city.key === DEFAULT_SWISS_CITY_KEY,
) as SwissCity;

export function getSwissCityByKey(key: string | null | undefined) {
  if (!key) return undefined;

  return SWISS_CITIES.find((city) => city.key === key);
}
