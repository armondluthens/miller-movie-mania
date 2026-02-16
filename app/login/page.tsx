"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/browser-client";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendLink() {
    setLoading(true);
    const origin = window.location.origin;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });

    setLoading(false);

    if (error) return alert(error.message);
    setSent(true);
  }

  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Log in</h1>
      {sent ? (
        <p>Check your email for the sign-in link.</p>
      ) : (
        <>
          <input
            style={{ width: "100%", padding: 10, marginTop: 12 }}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <button
            style={{ marginTop: 12, padding: 10, width: "100%" }}
            onClick={sendLink}
            disabled={loading || !email}
          >
            {loading ? "Sending…" : "Send magic link"}
          </button>
        </>
      )}
    </main>
  );
}
