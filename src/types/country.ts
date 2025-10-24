// Grund-typer för REST Countries + väder + wiki + bilder

export type Country = {
  cca2: string;
  cca3: string;
  name: { common: string; official?: string };
  flags: { svg: string; png?: string };
  region: string;
  capital?: string[];
  capitalInfo?: { latlng?: [number, number] };
  latlng?: [number, number];
  subregion?: string;
  population?: number;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol?: string }>;
};

export type CurrentWeather = {
  temperature_2m?: number;
  wind_speed_10m?: number;
  weather_code?: number;
};

export type WikiSummary = {
  title: string;
  extract: string;
  content_urls?: { desktop?: { page?: string } };
  thumbnail?: { source?: string };
};

export type UnsplashPhoto = {
  id: string;
  alt_description: string | null;
  urls: { small: string; regular: string };
  links: { html: string };
  user?: { name?: string };
};

