"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Comic = {
  id: string;
  title: string;
  description: string | null;
  user_id?: string | null;
  created_at: string;
};

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export default function ExplorePage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadComics() {
      setLoading(true);
      const { data, error } = await supabase
        .from("comics")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load comics:", error);
        setError("Unable to load comics right now.");
      } else {
        setComics(data || []);
      }
      setLoading(false);
    }

    loadComics();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <p className="text-emerald-400 uppercase tracking-wide text-xs font-semibold">
            Discover new stories
          </p>
          <h1 className="text-4xl font-bold">Explore Comics</h1>
          <p className="text-zinc-400">
            Browse the latest creations from the community.
          </p>
        </header>

        {loading ? (
          <p className="text-center text-zinc-400">Loading comics…</p>
        ) : error ? (
          <p className="text-center text-red-400">{error}</p>
        ) : comics.length === 0 ? (
          <p className="text-center text-zinc-400">
            No comics available yet. Check back soon!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {comics.map((comic) => (
              <article
                key={comic.id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg hover:border-emerald-500 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 uppercase tracking-wide">
                    <span>
                      {comic.user_id ? comic.user_id : "Unknown author"}
                    </span>
                    <span>
                      {new Date(comic.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold">{comic.title}</h2>
                  {comic.user_id && (
                    <p className="text-xs text-zinc-500">By {comic.user_id}</p>
                  )}
                  <p className="text-zinc-300">
                    {comic.description
                      ? truncate(comic.description, 150)
                      : "No description provided."}
                  </p>
                </div>
                <Link
                  href={`/comics/${comic.id}`}
                  className="mt-6 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition"
                >
                  Read
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

