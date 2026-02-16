"use client";

import React, { Fragment, useEffect, useMemo, useState, useTransition } from "react";
import { submitGuessAction } from "@/app/actions";

type Puzzle = {
  row_clues: any[];
  col_clues: any[];
};

type Play = {
  id: string;
  guesses_used: number;
  max_guesses: number;
  points: number;
};

type Guess = {
  cell_key: string;
  tmdb_movie_id: number;
  poster_path: string | null;
};

type SearchResult = {
  tmdbId: number;
  title: string;
  year: string | null;
  posterPath: string;
};

const TILE_W = 100; // single knob: tile width (and row label width)
const SHELL_MAX_WIDTH = 560; // centers BOTH search + grid to this width

export default function Grid({
  puzzle,
  play,
  guesses,
}: {
  puzzle: Puzzle;
  play: Play;
  guesses: Guess[];
}) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [selectedActor, setSelectedActor] = useState<number | null>(null);

  const [selectedCellLabel, setSelectedCellLabel] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const outOfGuesses = play.guesses_used >= play.max_guesses;

  const guessMap = useMemo(() => {
    const m = new Map<string, Guess>();
    guesses.forEach((g) => m.set(g.cell_key, g));
    return m;
  }, [guesses]);

  // Debounced search
  useEffect(() => {
    let alive = true;

    const t = setTimeout(async () => {
      const q = query.trim();

      if (!q) {
        if (alive) setResults([]);
        return;
      }

      setLoading(true);
      try {
        const resp = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`);
        const data = await resp.json();
        if (!alive) return;
        setResults(data.results ?? []);
      } catch (e) {
        console.error("[UI] TMDB search failed", e);
        if (!alive) return;
        setResults([]);
      } finally {
        if (alive) setLoading(false);
      }
    }, 250);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query]);

  function cellLabelKey(r: number, c: number) {
    return `r${r + 1}c${c + 1}`;
  }

  function cellLabel(rowName: string, colName: string) {
    return `${rowName}: ${colName}`;
  }

  function pickMovie(tmdbId: number, posterPath: string) {
    if (!selectedCell) return;
    if (outOfGuesses) return;
    if (!selectedActor) return;

    setSubmitError(null);

    startTransition(async () => {
      try {

        const res = await submitGuessAction(selectedCell, tmdbId, selectedActor, posterPath);

        if (!res?.ok) {
          const msg = (res as any)?.error ?? "Submit failed";
          setSubmitError(msg);
          return;
        }

        // Success: clear search + selection
        setSelectedCell(null);
        setSelectedCellLabel(null);
        setResults([]);
        setQuery("");
      } catch (e: any) {
        setSubmitError(e?.message ?? "Submit threw");
      }
    });
  }

  const shellStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: SHELL_MAX_WIDTH,
    margin: "0 auto",
    display: "grid",
    gap: 16,
    justifyItems: "center", // centers children (search + grid) within shell
  };

const pointsStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  fontSize: 40,
  textAlign: "center",
};

const pointsTextStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  margin: 0,
};

  const searchStyle: React.CSSProperties = {
    width: "100%",
    display: "grid",
    gap: 8,
  };

  const gridOuterStyle: React.CSSProperties = {
    width: "100%",
    overflowX: "auto", // prevents squish on small screens; allows horizontal scroll if needed
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `${TILE_W}px repeat(3, ${TILE_W}px)`,
    gap: 8,
    justifyContent: "center", // centers the whole grid within gridOuterStyle
  };

  return (
    <div style={shellStyle}>
      {/* points */}
      <div style={pointsStyle}>
        <div style={{ fontWeight: 600, textAlign: "center" }}>
          Daily Points: {play.points}
          <p style={pointsTextStyle}>Guesses Remaining: {play.max_guesses - play.guesses_used}</p>
        </div>
        
      </div>

      {/* Search + select */}
      <div style={searchStyle}>
        <div style={{ fontWeight: 600, textAlign: "center" }}>
          {selectedCellLabel ? `Selected: ${selectedCellLabel}` : "Select A Tile"}
        </div>

        <input
          disabled={!selectedCell || outOfGuesses || pending}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            outOfGuesses
              ? "No guesses remaining"
              : selectedCell
              ? "Search for a movie…"
              : "Select A Tile To Start"
          }
          style={{
            padding: 10,
            border: "1px solid #4F2683",
            borderRadius: 8,
            width: "100%",
            maxWidth: 420,       // control how wide it gets
            justifySelf: "center" // because parent is display: grid
          }}
        />

        {submitError ? <div style={{ color: "crimson" }}>{submitError}</div> : null}
        {loading && <div style={{ fontSize: 12, opacity: 0.7 }}>Searching…</div>}

        <div style={{ display: "grid", gap: 6 }}>
          {results.map((m) => (
            <button
              type="button"
              key={m.tmdbId}
              disabled={!selectedCell || outOfGuesses || pending}
              onClick={() => pickMovie(m.tmdbId, m.posterPath)}
              style={{
                padding: 10,
                border: "1px solid #eee",
                borderRadius: 8,
                background: "white",
                color: "black",
                cursor: !selectedCell || outOfGuesses || pending ? "not-allowed" : "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {m.title} {m.year ? `(${m.year})` : ""}
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>TMDB #{m.tmdbId}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={gridOuterStyle}>
        <div style={gridStyle}>
          <div />
          {puzzle.col_clues.map((c, idx) => (
            <div
              key={idx}
              style={{
                padding: 8,
                fontWeight: 600,
                display: "grid",
                placeItems: "center",
                minHeight: 72,
                textAlign: "center",
              }}
            >
              {c?.name ?? String(c)}
            </div>
          ))}

          {puzzle.row_clues.map((r, rowIdx) => (
            <Fragment key={`rowgroup-${rowIdx}`}>
              <div
                style={{
                  padding: 8,
                  fontWeight: 600,
                  display: "grid",
                  alignItems: "center",
                  width: TILE_W,
                  textAlign: "center",
                }}
              >
                {r?.name ?? String(r)}
              </div>

              {[0, 1, 2].map((colIdx) => {
                const cellKey = cellLabelKey(rowIdx, colIdx);
                const cell = cellLabel(r?.name ?? String(r), puzzle.col_clues[colIdx]?.name ?? String(puzzle.col_clues[colIdx]));
                const existing = guessMap.get(cellKey);
                const selected = selectedCell === cellKey;
                const actorId = r?.actor_id ?? null; 

                return (
                  <button
                    type="button"
                    key={cellKey}
                    onClick={() => {
                      if (pending || outOfGuesses || existing) return;

                      setSelectedCell((prev) => {
                        const next = prev === cellKey ? null : cellKey;
                        setSelectedCellLabel(next ? cell : null);
                        return next;
                      });
                      setSelectedActor(actorId);

                      setSubmitError(null);
                    }}
                    disabled={pending || !!existing || outOfGuesses}
                    style={{
                      position: "relative",
                      width: TILE_W,
                      aspectRatio: "2 / 3",
                      padding: 0,
                      overflow: "hidden",
                      borderRadius: 8,
                      border: selected ? "2px solid #4F2683" : "1px solid #4F2683",
                      background: selected ? "#FFC62F" : "white",
                      cursor: pending || existing || outOfGuesses ? "not-allowed" : "pointer",
                    }}
                    title={
                      existing
                        ? "Already guessed"
                        : outOfGuesses
                        ? "No guesses remaining"
                        : pending
                        ? "Submitting…"
                        : "Select this cell"
                    }
                  >
                    {existing?.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w342${
                          existing.poster_path.startsWith("/")
                            ? existing.poster_path
                            : `/${existing.poster_path}`
                        }`}
                        alt=""
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "grid",
                          placeItems: "center",
                          padding: 8,
                          fontWeight: 600,
                          textAlign: "center",
                          color: "#4F2683",
                        }}
                      >
                        Pick a movie
                      </div>
                    )}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
