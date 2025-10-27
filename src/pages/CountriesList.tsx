import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Country } from "@/types/country";
import { getAllCountries } from "@/api/countries";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Spinner from "@/components/ui/Spinner";

const REGIONS = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania", "Antarctic"] as const;
type Region = typeof REGIONS[number];

const SPIN_TIME = 1200;

export default function CountriesList() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const query = params.get("query") ?? "";
  const region = (params.get("region") as Region) ?? "All";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const pageSize = parseInt(params.get("pageSize") ?? "20", 10);
  const [isSearching, setIsSearching] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const { data, isLoading, isError, error, isFetching } = useQuery<Country[], Error>({
    queryKey: ["countries"],
    queryFn: getAllCountries,
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((c) => {
      const okRegion = region === "All" || c.region === region;
      const okQuery = c.name.common.toLowerCase().includes(query.toLowerCase());
      return okRegion && okQuery;
    });
  }, [data, query, region]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = Math.min((page - 1) * pageSize, Math.max(0, (totalPages - 1) * pageSize));
  const items = filtered.slice(start, start + pageSize);

 
  useEffect(() => {
    const current = Math.max(1, parseInt(params.get("page") ?? "1", 10));
    if (current > totalPages) {
      const p = new URLSearchParams(params);
      p.set("page", String(totalPages));
      setParams(p);
    }
  }, [totalPages, params, setParams]);

  function setParam(name: string, value: string, resetPage = false) {
    const p = new URLSearchParams(params);
    p.set(name, value);
    if (resetPage) p.set("page", "1");
    setParams(p);
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = new FormData(e.currentTarget).get("q") ?? "";
    setIsSearching(true);
    setParam("query", String(text), true);
    window.setTimeout(() => setIsSearching(false), SPIN_TIME);
  }

  function handleOpenCountry(name: string) {
    setIsNavigating(true);
    window.setTimeout(() => {
      navigate(`/country/${encodeURIComponent(name)}`);
    }, SPIN_TIME);
  }

  
  const showSpinner = isSearching || isNavigating || isLoading || isFetching;

  if (showSpinner && !isError) {
    return (
      <section aria-busy="true" className="space-y-3">
        <h1 className="text-2xl font-bold">Länder</h1>
        <Spinner
          label={
            isSearching ? "Söker…" :
            isNavigating ? "Öppnar detaljvy…" :
            isLoading ? "Laddar länder…" :
            "Uppdaterar…"
          }
        />
      </section>
    );
  }

  if (isError) {
    return (
      <section role="alert" className="space-y-2">
        <h1 className="text-2xl font-bold">Länder</h1>
        <p className="text-red-600">{error?.message || "Ett fel inträffade vid hämtning av länder."}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Försök igen
        </Button>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-bold mb-3">Länder</h1>

      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 mb-3">
        <Input id="q" name="q" defaultValue={query} placeholder="Sök land..." aria-label="Sök land" />
        <Button type="submit">Sök</Button>
      </form>

      <div role="group" aria-label="Filtrera region" className="flex flex-wrap gap-2 mb-3">
        {REGIONS.map((r) => (
          <Button
            key={r}
            variant={region === r ? "default" : "outline"}
            onClick={() => setParam("region", r, true)}
            aria-pressed={region === r}
          >
            {r}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p>Inga länder matchar dina kriterier.</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {items.map((c) => (
              <li key={c.cca3}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{c.name.common}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={c.flags.svg}
                      alt={`Flagga för ${c.name.common}`}
                      className="h-28 w-full object-cover rounded mb-2"
                    />
                    <p className="text-sm">Region: {c.region}</p>
                    {c.capital && <p className="text-sm">Huvudstad: {c.capital[0]}</p>}
                  </CardContent>
                  <CardFooter>
                    <button
                      type="button"
                      className="text-primary underline"
                      onClick={() => handleOpenCountry(c.name.common)}
                      aria-label={`Visa mer om ${c.name.common}`}
                    >
                      Visa mer
                    </button>
                  </CardFooter>
                </Card>
              </li>
            ))}
          </ul>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && setParam("page", String(page - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  aria-label="Föregående sida"
                />
              </PaginationItem>

              {(() => {
                const pages: (number | "...")[] = [];
                const left = Math.max(2, page - 1);
                const right = Math.min(totalPages - 1, page + 1);

                pages.push(1);
                if (left > 2) pages.push("...");
                for (let n = left; n <= right; n++) if (n > 1 && n < totalPages) pages.push(n);
                if (right < totalPages - 1) pages.push("...");
                if (totalPages > 1) pages.push(totalPages);

                return pages.map((n, i) =>
                  n === "..." ? (
                    <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                  ) : (
                    <PaginationItem key={n}>
                      <PaginationLink
                        isActive={n === page}
                        onClick={() => setParam("page", String(n))}
                        aria-label={`Gå till sida ${n}`}
                      >
                        {n}
                      </PaginationLink>
                    </PaginationItem>
                  )
                );
              })()}

              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && setParam("page", String(page + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  aria-label="Nästa sida"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </section>
  );
}
