import { createSupabaseServerComponentClient } from "@/lib/supabase/server-component-client";

export type Play = {
  id: string;
  puzzle_id: string;
  user_id: string;
  guesses_used: number;
  max_guesses: number;
  status: string;
  points: number;
};

export async function getOrCreatePlay(puzzleId: string): Promise<Play> {
  const supabase = await createSupabaseServerComponentClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(`Auth error: ${userErr.message}`);
  if (!userRes.user) throw new Error("Not authenticated");

  const userId = userRes.user.id;

  // 1) Try fetch
  const { data: existing, error: selErr } = await supabase
    .from("plays")
    .select("id,puzzle_id,user_id,guesses_used,max_guesses,status,points")
    .eq("puzzle_id", puzzleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (selErr) throw new Error(`Failed to load play: ${selErr.message}`);
  if (existing) return existing as Play;

  // 2) Create
  const { data: created, error: insErr } = await supabase
    .from("plays")
    .insert({
      puzzle_id: puzzleId,
      user_id: userId,
      guesses_used: 0,
      max_guesses: 9,
      status: "IN_PROGRESS",
    })
    .select("id,puzzle_id,user_id,guesses_used,max_guesses,status")
    .single();

  if (insErr) throw new Error(`Failed to create play: ${insErr.message}`);

  return created as Play;
}

export async function getPointsForPlay(playId: string) {
  const supabase = await createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("plays")
    .select("points")
    .eq("id", playId);

  if (error) throw new Error(`Failed to load guesses: ${error.message}`);
  console.log(data)
  return data ?? [];
}