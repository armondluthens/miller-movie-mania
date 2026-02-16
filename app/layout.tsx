import type { Metadata } from "next";
import { Montserrat, Geist, Geist_Mono } from "next/font/google";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-component-client";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // choose what you actually use
  variable: "--font-montserrat",
});


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Miller Movie Mania",
  description: "Moviegrid 2.0",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerComponentClient();
  const { data } = await supabase.auth.getUser();

  return (
    <html lang="en">
    <body
      className={`${montserrat.variable} antialiased`}
      >
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            borderBottom: "1px solid #e5e5e5",
            background: "#4F2683",
            color: "#FFC62F"
          }}
        >
          <div style={{ fontWeight: 600}}>
            Miller Movie Mania
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 12, opacity: 0.0 }}>
            {data.user ? data.user.email : "NOT LOGGED IN"}
          </span>

          {data.user && (
            <form action="/logout" method="post">
              <button type="submit">Sign out</button>
            </form>
          )}
        </div>
        </nav>

        <div style={{ padding: 24 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
