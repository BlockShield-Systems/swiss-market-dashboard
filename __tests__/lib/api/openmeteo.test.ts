export {};

import type { WeatherData } from "@/lib/types/weather";

type FetchInitWithNext = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

const zurich = {
  key: "zurich",
  latitude: 47.3769,
  longitude: 8.5417,
} as const;

function createJsonResponse<T>(data: T, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
  } as unknown as Response;
}

function createValidWeatherData(): WeatherData {
  return {
    daily: {
      time: ["2026-05-21", "2026-05-22"],
      weather_code: [1, 2],
      temperature_2m_max: [22.5, 23.1],
      temperature_2m_min: [12.4, 13.2],
      precipitation_sum: [0, 1.5],
      wind_speed_10m_max: [15, 20],
    },
  };
}

function getLatestFetchCall() {
  const call = mockFetch.mock.calls.at(-1);

  if (!call) {
    throw new Error("Expected fetch to have been called");
  }

  const [url, init] = call;

  return {
    url: new URL(String(url)),
    init: init as FetchInitWithNext,
  };
}

describe("Open-Meteo API client", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    global.fetch = mockFetch;
  });

  test("fetchWeatherForecast requests a seven-day Zurich forecast and returns valid data", async () => {
    const weatherData = createValidWeatherData();

    mockFetch.mockResolvedValueOnce(createJsonResponse(weatherData));

    const { fetchWeatherForecast } = await import("@/lib/api/openmeteo");

    const result = await fetchWeatherForecast(zurich);
    const { url, init } = getLatestFetchCall();

    expect(url.origin).toBe("https://api.open-meteo.com");
    expect(url.pathname).toBe("/v1/forecast");
    expect(url.searchParams.get("latitude")).toBe("47.3769");
    expect(url.searchParams.get("longitude")).toBe("8.5417");
    expect(url.searchParams.get("timezone")).toBe("Europe/Zurich");
    expect(url.searchParams.get("forecast_days")).toBe("7");
    expect(url.searchParams.get("daily")).toBe(
      [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "wind_speed_10m_max",
      ].join(","),
    );
    expect(init.next?.revalidate).toBe(900);
    expect(result).toEqual(weatherData);
  });

  test("fetchWeatherForecast throws on failed responses", async () => {
    mockFetch.mockResolvedValueOnce(createJsonResponse({ error: true }, 503));

    const { fetchWeatherForecast } = await import("@/lib/api/openmeteo");

    await expect(fetchWeatherForecast(zurich)).rejects.toThrow(
      "Open-Meteo request failed with status 503",
    );
  });

  test("fetchWeatherForecast rejects invalid response shapes", async () => {
    mockFetch.mockResolvedValueOnce(
      createJsonResponse({
        daily: {
          time: ["2026-05-21"],
          weather_code: [1],
          temperature_2m_max: [22.5],
          temperature_2m_min: [12.4],
          precipitation_sum: [0],
        },
      }),
    );

    const { fetchWeatherForecast } = await import("@/lib/api/openmeteo");

    await expect(fetchWeatherForecast(zurich)).rejects.toThrow(
      "Invalid Open-Meteo response shape",
    );
  });
});