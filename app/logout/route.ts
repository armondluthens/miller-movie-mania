import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";

export async function POST(request: Request) {
  const supabase = await createSupabaseRouteClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/login", url.origin), { status: 303 });
}
