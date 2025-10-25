
import type { Country } from "@/types/country";

const BASE = "https://restcountries.com/v3.1";

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${url} -> ${res.status} ${txt}`);
  }
  return res.json();
}


export async function getAllCountries(): Promise<Country[]> {
  const fields = [
    "name",
    "region",
    "capital",
    "flags",
    "cca2",
    "cca3",
    "capitalInfo",
    "latlng",
  ].join(",");
  const withFields = `${BASE}/all?fields=${fields}`;

  try {
    const data = await getJSON<unknown>(withFields);
    const arr = Array.isArray(data) ? (data as Country[]) : [];
    if (arr.length === 0) throw new Error("Empty array");
    arr.sort((a, b) => a.name.common.localeCompare(b.name.common));
    return arr;
  } catch {
    const arr = await getJSON<Country[]>(`${BASE}/all`);
    arr.sort((a, b) => a.name.common.localeCompare(b.name.common));
    return arr;
  }
}

/** Info sidan, vad som ska hämtaas */
export async function getCountryByName(name: string): Promise<Country> {
  const base = `${BASE}/name/${encodeURIComponent(name)}`;
  const fields = [
    "name",
    "region",
    "subregion",
    "capital",
    "flags",
    "cca2",
    "cca3",
    "capitalInfo",
    "latlng",
    "population",
    "languages",
    "currencies",
  ].join(",");
  const withFields = `${base}?fields=${fields}`;

  
  let data: unknown;
  try {
    data = await getJSON<unknown>(withFields);
  } catch {
    data = await getJSON<unknown>(base);
  }
  const arr = Array.isArray(data) ? (data as Country[]) : [];
  if (!arr[0]) throw new Error("Hittade inte landet.");
  const exact = arr.find(
    (c) => c.name.common.toLowerCase() === name.toLowerCase()
  );
  return exact || arr[0];
}
