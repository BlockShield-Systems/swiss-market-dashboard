import type { SwissCity, WeatherData } from "@/lib/types/weather";

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchWeatherForecast(
  city: SwissCity,
): Promise<WeatherData> {
  const searchParams = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "wind_speed_10m_max",
    ].join(","),
    timezone: "Europe/Zurich",
    forecast_days: "7",
  });

  const response = await fetch(
    `${OPEN_METEO_FORECAST_URL}?${searchParams.toString()}`,
    {
      next: {
        revalidate: 900,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }

  const data = (await response.json()) as WeatherData;

  validateWeatherData(data);

  return data;
}

function validateWeatherData(data: WeatherData) {
  const daily = data.daily;

  if (
    !daily ||
    !Array.isArray(daily.time) ||
    !Array.isArray(daily.weather_code) ||
    !Array.isArray(daily.temperature_2m_max) ||
    !Array.isArray(daily.temperature_2m_min) ||
    !Array.isArray(daily.precipitation_sum) ||
    !Array.isArray(daily.wind_speed_10m_max)
  ) {
    throw new Error("Invalid Open-Meteo response shape");
  }
}
