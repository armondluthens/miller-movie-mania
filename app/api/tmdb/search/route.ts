import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();

  if (!q) return NextResponse.json({ results: [] });

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing TMDB_API_KEY" }, { status: 500 });
  }

  const tmdbUrl = new URL("https://api.themoviedb.org/3/search/movie");
  tmdbUrl.searchParams.set("api_key", apiKey);
  tmdbUrl.searchParams.set("query", q);
  tmdbUrl.searchParams.set("include_adult", "false");
  tmdbUrl.searchParams.set("language", "en-US");
  tmdbUrl.searchParams.set("page", "1");

  const resp = await fetch(tmdbUrl.toString(), { cache: "no-store" });
  if (!resp.ok) {
    return NextResponse.json({ error: "TMDB request failed" }, { status: 502 });
  }

  const data = await resp.json();

  const results = (data.results ?? [])
  .filter((m: any) => (m.popularity ?? 0) > 6.0 && Number(String(m.release_date).slice(0, 4)) > 1990)
  .slice(0, 8)
  .map((m: any) => ({
    tmdbId: m.id,
    title: m.title,
    year: m.release_date ? String(m.release_date).slice(0, 4) : null,
    popularity: m.popularity,
    posterPath: m.poster_path,
    voteCount: m.vote_count
  }));

  return NextResponse.json({ results });
}
