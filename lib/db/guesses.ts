import { createSupabaseServerComponentClient } from "@/lib/supabase/server-component-client";


export type GuessRow = {
  cell_key: string;
  tmdb_movie_id: number;
  poster_path: string;
};

export async function getGuessesForPlay(playId: string): Promise<GuessRow[]> {
  const supabase = await createSupabaseServerComponentClient();

  const { data, error } = await supabase
    .from("guesses")
    .select("cell_key, tmdb_movie_id, poster_path")
    .eq("play_id", playId);

  if (error) throw new Error(`Failed to load guesses: ${error.message}`);
  return (data ?? []) as GuessRow[];
}

export async function listGuesses(playId: string) {
  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("guesses")
    .select("cell_key, tmdb_movie_id, poster_path")
    .eq("play_id", playId);

  if (error) throw new Error(`Failed to load guesses: ${error.message}`);
  console.log(data)
  return data ?? [];
}
