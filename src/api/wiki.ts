
import type { WikiSummary } from "@/types/country";

export async function getWikiSummary(title: string): Promise<WikiSummary> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url) 
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    if (res.status === 404) throw new Error("Ingen Info hittades.");
    throw new Error(`Wikipedia ${res.status}. ${txt || "Kunde inte hämta sammanfattning."}`);
  }
  return (await res.json()) as WikiSummary;
}
