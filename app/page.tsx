import { redirect } from "next/navigation";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-component-client";
import { getTodaysPuzzle } from "../lib/db/puzzles";
import { getOrCreatePlay } from "../lib/db/plays";
import { listGuesses } from "../lib/db/guesses";


import Grid from "./Grid";

export default async function Home() {
  const supabase = await createSupabaseServerComponentClient();

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const puzzle = await getTodaysPuzzle();
  const play = await getOrCreatePlay(puzzle.id);
  const guesses = await listGuesses(play.id);

  return (
    <main style={{ padding: 24, textAlign: "center" }}>
      <Grid
        puzzle={puzzle as any}
        play={play}
        guesses={guesses as any}
      />
    </main>
  );
}
