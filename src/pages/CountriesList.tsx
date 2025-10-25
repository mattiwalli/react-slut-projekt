import { useMemo, useState } from "react";
import {  useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Country } from "@/types/country";
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
import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "@/components/ui/Spinner";

const REGIONS = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania", "Antarctic"] as const;
type Region = typeof REGIONS[number];

export default function CountriesList() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const query = params.get("query") ?? "";
  const region = (params.get("region") as Region) ?? "All";
  const page = parseInt(params.get("page") ?? "1", 10);
  const pageSize = parseInt(params.get("pageSize") ?? "20", 10);

  
  const [isSearching, setIsSearching] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const SPIN_TIME = 1200; 

  const { data, isLoading, isError, error } = useQuery<Country[], Error>({
    queryKey: ["countries"],
    queryFn: async () => {
      const url = new URL("https://restcountries.com/v3.1/all");
      url.searchParams.set(
        "fields",
        ["name", "region", "capital", "flags", "cca2", "cca3", "capitalInfo", "latlng"].join(",")
      );

      let res = await fetch(url.toString(), { method: "GET" });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        if (res.status === 400 && text.toLowerCase().includes("fields")) {
          res = await fetch("https://restcountries.com/v3.1/all", { method: "GET" });
        } else {
          throw new Error(`REST Countries ${res.status}. ${text || "Kunde inte hämta länder."}`);
        }
      }

      const json = (await res.json()) as Country[];
      if (!Array.isArray(json) || json.length === 0) {
        throw new Error("Fick tomt/oväntat svar från REST Countries.");
      }

      json.sort((a, b) => a.name.common.localeCompare(b.name.common));
      return json;
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  /*  jobbar på filtretingen  */
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((c) => {
      const okRegion = region === "All" || c.region === region;
      const okQuery = c.name.common.toLowerCase().includes(query.toLowerCase());
      return okRegion && okQuery;
    });
  }, [data, query, region]);

  /*  joabbar på pagineringen */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

 
  function setParam(name: string, value: string, resetPage = false) {
    const p = new URLSearchParams(params);
    p.set(name, value);
    if (resetPage) p.set("page", "1");
    setParams(p);
  }

  /* spinnern körts först sedan kommer löänderna  */
  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = new FormData(e.currentTarget).get("q") ?? "";
    setIsSearching(true);
    setParam("query", String(text), true); // URL uppdateras, men vi visar inte listan än
    window.setTimeout(() => setIsSearching(false), SPIN_TIME);
  }
