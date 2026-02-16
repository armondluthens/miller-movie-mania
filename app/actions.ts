"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-component-client";

export async function submitGuessAction(cellKey: string, tmdbMovieId: number, actorId: number, posterPath: string) {
  const isCorrect = await validateActorInMovie(
      tmdbMovieId,
      actorId
    );

    let points = 0
    if (isCorrect) {
      points = 100
    }
    
  
  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase.rpc("submit_guess", {
    p_game_date: new Date().toISOString().slice(0, 10),
    p_cell_key: cellKey,
    p_tmdb_movie_id: tmdbMovieId,
    p_max_guesses: 9,
    is_correct: isCorrect,
    points_awarded: points,
    poster_path: posterPath
  });

  if (error) {
    console.error("[SERVER ACTION] RPC ERROR", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true, data };
}

export async function validateActorInMovie(
  tmdbMovieId: number,
  actorId: number
): Promise<boolean> {
    const apiKey = process.env.TMDB_API_KEY;
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbMovieId}/credits?api_key=${apiKey}`,
    {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("TMDB credits fetch failed:", await res.text());
    throw new Error("Failed to fetch movie credits");
  }

  const credits = await res.json();

  return credits.cast?.some(
    (person: any) => person.id === actorId
  ) ?? false;
}
