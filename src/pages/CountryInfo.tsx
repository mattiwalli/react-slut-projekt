import {getOpenMeteoCurrent} from "@/api/weather";
import {getCountryByName} from "@/api/countries"
import {getWikiSummary} from "@/api/wiki"
import {searchCountryPhotos} from "@/api/photos"
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import type { Country, CurrentWeather, WikiSummary, UnsplashPhoto } from "@/types/country";


export default function CountryDetail() {
  const { code } = useParams<{ code: string }>();
  const nameParam = (code ?? "").trim();

  const countryQuery = useQuery<Country, Error>({
    queryKey: ["country", nameParam],
    enabled: !!nameParam,
    retry: false,
    queryFn: () => getCountryByName(nameParam),
    staleTime: 1000 * 60 * 10,
  });

  const weatherQuery = useQuery<CurrentWeather, Error>({
    queryKey: ["weather", nameParam],
    enabled: !!countryQuery.data,
    retry: false,
    queryFn: () => {
      const c = countryQuery.data!;
      const coords = c.capitalInfo?.latlng ?? c.latlng;
      if (!coords) throw new Error("Saknar koordinater för väder.");
      return getOpenMeteoCurrent(coords[0], coords[1]);
    },
    staleTime: 1000 * 60 * 5,
  });

  const wikiQuery = useQuery<WikiSummary, Error>({
    queryKey: ["wiki", countryQuery.data?.name.common],
    enabled: !!countryQuery.data?.name.common,
    retry: false,
    queryFn: () => getWikiSummary(countryQuery.data!.name.common),
    staleTime: 1000 * 60 * 60,
  });

  const unsplashKey = import.meta.env.VITE_UNSPLASH_KEY as string | undefined;

  const photosQuery = useQuery<UnsplashPhoto[], Error>({
    queryKey: ["unsplash", countryQuery.data?.name.common, unsplashKey],
    enabled: !!countryQuery.data && !!unsplashKey,
    retry: false,
    queryFn: () => searchCountryPhotos(countryQuery.data!, unsplashKey),
    staleTime: 1000 * 60 * 30,
  });

  // global spinner
  if ((countryQuery.isLoading || countryQuery.isFetching) && !countryQuery.isError) {
    return (
      <section className="space-y-3" aria-busy="true">
        <Button asChild variant="link" className="px-0"><Link to="/">Tillbaka</Link></Button>
        <Spinner label={countryQuery.isLoading ? "Laddar land…" : "Uppdaterar…"} />
      </section>
    );
  }

  if (countryQuery.isError) {
    return (
      <section className="space-y-3">
        <Button asChild variant="link" className="px-0"><Link to="/">Tillbaka</Link></Button>
        <p className="text-red-600">{countryQuery.error.message}</p>
      </section>
    );
  }

  const country = countryQuery.data!;

  
  return (
    <section className="space-y-4" aria-labelledby="country-heading">
      <Button asChild variant="link" className="px-0"><Link to="/">Tillbaka</Link></Button>
      <h1 id="country-heading" className="text-3xl font-bold">{country.name.common}</h1>

      <img src={country.flags.svg} alt={`Flagga för ${country.name.common}`} className="h-40 rounded" />

      <Card>
        <CardHeader><CardTitle>Basfakta</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {country.name.official && <p>Officiellt namn: {country.name.official}</p>}
          {country.capital && <p>Huvudstad: {country.capital[0]}</p>}
          <p>Region: {country.region}</p>
          {country.subregion && <p>Subregion: {country.subregion}</p>}
          {country.population && <p>Befolkning: {country.population.toLocaleString("sv-SE")}</p>}
          {country.languages && <p>Språk: {Object.values(country.languages).join(", ")}</p>}
          {country.currencies && (
            <p>
              Valuta:{" "}
              {Object.values(country.currencies)
                .map((c) => (c.symbol ? `${c.name} (${c.symbol})` : c.name))
                .join(", ")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Aktuellt väder</CardTitle></CardHeader>
        <CardContent>
          {weatherQuery.isLoading || weatherQuery.isFetching ? (
            <Spinner label={weatherQuery.isLoading ? "Laddar väder…" : "Uppdaterar väder…"} />
          ) : weatherQuery.isError ? (
            <p className="text-red-600">{weatherQuery.error.message}</p>
          ) : weatherQuery.data ? (
            <div className="space-y-1">
              <p>Temperatur: {weatherQuery.data.temperature_2m}°C</p>
              <p>Vind: {weatherQuery.data.wind_speed_10m} m/s</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Kort intro</CardTitle></CardHeader>
        <CardContent>
          {wikiQuery.isLoading || wikiQuery.isFetching ? (
            <Spinner label={wikiQuery.isLoading ? "Laddar Wikipedia…" : "Uppdaterar…"} />
          ) : wikiQuery.isError ? (
            <p className="text-red-600">{wikiQuery.error.message}</p>
          ) : wikiQuery.data ? (
            <div className="space-y-2">
              <p>{wikiQuery.data.extract}</p>
              {wikiQuery.data.content_urls?.desktop?.page && (
                <p>
                  Källa:{" "}
                  <a className="underline" href={wikiQuery.data.content_urls.desktop.page} target="_blank" rel="noreferrer">
                    Wikipedia
                  </a>
                </p>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bilder</CardTitle></CardHeader>
        <CardContent>
          {!unsplashKey && <p className="text-sm text-red-600">Sätt <code>VITE_UNSPLASH_KEY</code> i <code>.env.local</code> för att ladda bilder.</p>}

          {unsplashKey && (photosQuery.isLoading || photosQuery.isFetching) ? (
            <Spinner label={photosQuery.isLoading ? "Laddar bilder…" : "Uppdaterar bilder…"} />
          ) : unsplashKey && photosQuery.isError ? (
            <p className="text-red-600">{photosQuery.error.message}</p>
          ) : unsplashKey && photosQuery.data && photosQuery.data.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photosQuery.data.map((p) => (
                <a
                  key={p.id}
                  href={p.links.html}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Öppna foto på Unsplash${p.user?.name ? " av " + p.user.name : ""}`}
                >
                  <img
                    src={p.urls.small}
                    alt={p.alt_description || `Foto från ${country.name.common}`}
                    className="w-full h-32 object-cover rounded"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          ) : unsplashKey ? (
            <p className="text-sm text-muted-foreground">Inga bilder hittades för {country.name.common}.</p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
