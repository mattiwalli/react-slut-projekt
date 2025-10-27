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

 