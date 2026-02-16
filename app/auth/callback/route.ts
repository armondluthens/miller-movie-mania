import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseRouteClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/", req.url));
}
