import { denverISODate } from "../time";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-component-client";

export type Puzzle = {
  id: string;
  puzzle_date: string;
  title: string | null;
  row_clues: any; // jsonb
  col_clues: any; // jsonb
};

export async function getTodaysPuzzle(): Promise<Puzzle> {
  const supabase = await createSupabaseServerComponentClient();
  const today = denverISODate();

  const { data, error } = await supabase
    .from("puzzles")
    .select("id,puzzle_date,title,row_clues,col_clues")
    .eq("puzzle_date", today)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(`Failed to load puzzle: ${error.message}`);
  if (!data) throw new Error(`No published puzzle found for ${today}`);

  return data as Puzzle;
}
