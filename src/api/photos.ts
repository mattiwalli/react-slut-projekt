
import type { Country, UnsplashPhoto } from "@/types/country";

export async function searchCountryPhotos(country: Country, clientKey?: string): Promise<UnsplashPhoto[]> {
  if (!clientKey) return [];

  const queries = [
    country.name.common,
    country.name.official || "",
    country.capital?.[0] || "",
    `${country.name.common} landscape`,
    `${country.name.common} city`,
    country.region || "",
  ].filter(Boolean);

  for (const q of queries) {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", q);
    url.searchParams.set("per_page", "12");
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("content_filter", "high");
    url.searchParams.set("client_id", clientKey);

    const res = await fetch(url.toString());
    if (!res.ok) continue;
    const data = await res.json();
    const results = Array.isArray(data?.results) ? (data.results as UnsplashPhoto[]) : [];
    if (results.length > 0) return results.slice(0, 4);
  }
  return [];
}
