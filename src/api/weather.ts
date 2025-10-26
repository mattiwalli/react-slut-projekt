
import type { CurrentWeather } from "@/types/country";

export async function getOpenMeteoCurrent(lat: number, lon: number): Promise<CurrentWeather> {
  const u = new URL("https://api.open-meteo.com/v1/forecast");
  u.searchParams.set("latitude", String(lat));
  u.searchParams.set("longitude", String(lon));
  u.searchParams.set("current", "temperature_2m,wind_speed_10m,weather_code");
  u.searchParams.set("timezone", "auto");

  const res = await fetch(u.toString());
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Open-Meteo ${res.status}. ${txt || "Kunde inte hämta väder."}`);
  }
  const data = await res.json();
  return data.current as CurrentWeather;
}
