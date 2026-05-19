import { NextResponse } from "next/server";
import { fetchWeatherForecast } from "@/lib/api/openmeteo";
import {
  DEFAULT_SWISS_CITY_KEY,
  getSwissCityByKey,
} from "@/lib/types/weather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityKey = searchParams.get("key") ?? DEFAULT_SWISS_CITY_KEY;

  const city = getSwissCityByKey(cityKey);

  if (!city) {
    return NextResponse.json(
      {
        error: "Invalid city key",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const data = await fetchWeatherForecast(city);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=900, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Failed to fetch weather forecast",
      },
      {
        status: 502,
      },
    );
  }
}
