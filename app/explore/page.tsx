"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Comic = {
  id: string;
  title: string;
  description: string | null;
  user_id?: string | null;
  author_id?: string | null;
  created_at: string;
  genre?: string | null;
};

type OriginalSeries = {
  id: string;
  title: string;
  logline: string;
  cadence: string;
  spotlight: string;
};

const platformOriginals: OriginalSeries[] = [
  {
    id: "nebula-drift",
    title: "Nebula Drift",
    logline: "A courier pilot smuggles memories across a fractured galaxy.",
    cadence: "New every Friday",
    spotlight: "Sci-Fi Epic",
  },
  {
    id: "bloom-run",
    title: "Bloom Run",
    logline: "Two teens hack the weather to save their neon-drenched city.",
    cadence: "New every Tuesday",
    spotlight: "Original Series",
  },
  {
    id: "hollow-metro",
    title: "Hollow Metro",
    logline: "Detectives patrol an endless subway haunted by lost timelines.",
    cadence: "Mini-season",
    spotlight: "Mystery Thriller",
  },
];

const categoryFilters = [
  "All",
  "Action",
  "Romance",
  "Fantasy",
  "Comedy",
  "Drama",
  "Slice of Life",
];

const creatorGuides = [
  {
    title: "Get started now",
    body: "Pitch your premise, upload your first chapter, and mark it public when you're ready.",
    cta: { label: "Create a comic", href: "/create-comic" },
  },
  {
    title: "Learn the playbook",
    body: "Follow our pacing tips, panel guidance, and publishing calendar to stay consistent.",
    cta: { label: "View Creator Hub", href: "#creator-guide" },
  },
  {
    title: "Grow your audience",
    body: "Use dashboard insights to monitor reads, iterate on chapters, and collaborate with colorists.",
    cta: { label: "Open dashboard", href: "/dashboard" },
  },
];

function truncate(text: string, maxLength: number) {
  if (!text) return "No description provided.";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export default function ExplorePage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

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

  const filteredComics = useMemo(() => {
    const term = search.trim().toLowerCase();
    return comics.filter((comic) => {
      const matchesSearch =
        term.length === 0 ||
        comic.title.toLowerCase().includes(term) ||
        (comic.description || "").toLowerCase().includes(term);

      const matchesCategory =
        activeCategory === "All" ||
        (comic.genre &&
          comic.genre.toLowerCase().includes(activeCategory.toLowerCase())) ||
        ((comic.description || "")
          .toLowerCase()
          .includes(activeCategory.toLowerCase()));

      return matchesSearch && matchesCategory;
    });
  }, [comics, search, activeCategory]);

  const creatorSpotlights = useMemo(() => {
    const map = new Map<
      string,
      { creator: string; total: number; latestTitle: string }
    >();

    comics.forEach((comic) => {
      const creatorId = comic.user_id || comic.author_id || "anonymous";
      if (!map.has(creatorId)) {
        map.set(creatorId, {
          creator: creatorId,
          total: 0,
          latestTitle: comic.title,
        });
      }

      const entry = map.get(creatorId)!;
      entry.total += 1;
      entry.latestTitle = comic.title;
    });

    return Array.from(map.values()).slice(0, 3);
  }, [comics]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-zinc-900/40 p-8 shadow-2xl">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Read • Create • Repeat
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Explore indie comics and publish your next series with PanelPlay.
            </h1>
            <p className="text-lg text-zinc-300">
              Dive into community-made stories, browse categories, or jump into
              the creator hub to launch your own series.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <label className="sr-only" htmlFor="comic-search">
                Search comics by title
              </label>
              <div className="group relative">
                <input
                  id="comic-search"
                  type="search"
                  placeholder="Search stories by title or keyword"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-base text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                />
                {search && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 text-sm text-zinc-400 hover:text-white"
                    onClick={() => setSearch("")}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="#creator-hub"
                className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-center font-semibold hover:border-white transition"
              >
                Creator Hub
              </Link>
              <Link
                href="/create-comic"
                className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 text-center font-semibold text-zinc-950 hover:bg-emerald-400 transition"
              >
                Publish now
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[280px,minmax(0,1fr)]">
          <aside
            id="originals"
            className="space-y-5 rounded-3xl border border-zinc-900 bg-zinc-950/70 p-6"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
                PanelPlay Originals
              </p>
              <h2 className="text-2xl font-semibold mt-2">
                Editor&apos;s shelf
              </h2>
              <p className="text-sm text-zinc-400">
                Premium series curated and produced in-house. Updated weekly.
              </p>
            </div>
            <div className="space-y-4">
              {platformOriginals.map((original) => (
                <article
                  key={original.id}
                  className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/40 p-4 shadow-inner"
                >
                  <p className="text-xs text-emerald-300">{original.spotlight}</p>
                  <h3 className="text-lg font-semibold">{original.title}</h3>
                  <p className="text-sm text-zinc-400">{original.logline}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {original.cadence}
                  </p>
                </article>
              ))}
            </div>
          </aside>

          <div className="space-y-10">
            <section id="categories" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    Categories
                  </p>
                  <h2 className="text-2xl font-semibold">Browse genres</h2>
                </div>
                <span className="text-sm text-zinc-500">
                  {filteredComics.length} result
                  {filteredComics.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categoryFilters.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${
                      activeCategory === category
                        ? "border-emerald-400 bg-emerald-400/10 text-white"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>

            <section id="creator-comics" className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    Community
                  </p>
                  <h2 className="text-2xl font-semibold">Creator comics</h2>
                </div>
                <Link
                  href="/dashboard"
                  className="text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Manage your series →
                </Link>
              </div>
              {loading ? (
                <p className="text-zinc-500">Loading comics…</p>
              ) : error ? (
                <p className="text-red-400">{error}</p>
              ) : filteredComics.length === 0 ? (
                <p className="text-zinc-400">
                  No comics match that search just yet. Try another keyword or
                  view all.
                </p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {filteredComics.slice(0, 6).map((comic) => {
                    const creator =
                      comic.user_id || comic.author_id || "Unknown creator";
                    return (
                      <article
                        key={comic.id}
                        className="rounded-2xl border border-zinc-900 bg-zinc-900/60 p-4 hover:border-emerald-400 transition"
                      >
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span>
                            {new Date(comic.created_at).toLocaleDateString()}
                          </span>
                          <span>
                            {comic.genre
                              ? comic.genre
                              : activeCategory === "All"
                              ? "Original"
                              : activeCategory}
                          </span>
                        </div>
                        <h3 className="mt-2 text-xl font-semibold">
                          {comic.title}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          By {creator}
                        </p>
                        <p className="mt-3 text-sm text-zinc-300">
                          {truncate(comic.description || "", 140)}
                        </p>
                        <div className="mt-4 flex gap-2">
                          <Link
                            href={`/comics/${comic.id}`}
                            className="flex-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-center text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition"
                          >
                            Read
                          </Link>
                          <Link
                            href={`/comics/${comic.id}/pages`}
                            className="flex-1 rounded-lg border border-zinc-800 px-3 py-1.5 text-center text-sm text-zinc-300 hover:border-white transition"
                          >
                            Pages
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section
              id="creator-guide"
              className="grid gap-5 rounded-3xl border border-zinc-900 bg-zinc-900/40 p-6 md:grid-cols-2"
            >
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  For creators
                </p>
                <h2 className="text-3xl font-semibold">
                  Launch faster with the Creator Hub
                </h2>
                <p className="text-sm text-zinc-400">
                  Guidance for scripting, paneling, and releasing your seasons.
                  Stay in the loop with prompts, asset kits, and community
                  reviews.
                </p>
              </div>
              <div className="grid gap-4">
                {creatorGuides.map((guide) => (
                  <article
                    key={guide.title}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
                  >
                    <h3 className="text-lg font-semibold">{guide.title}</h3>
                    <p className="text-sm text-zinc-400">{guide.body}</p>
                    <Link
                      href={guide.cta.href}
                      className="mt-3 inline-flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      {guide.cta.label} →
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section
          id="creator-hub"
          className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-zinc-950 to-zinc-950 p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                Creator spotlight
              </p>
              <h2 className="text-3xl font-semibold">
                Build your readership with analytics & AI helpers.
              </h2>
              <p className="text-sm text-zinc-300">
                Track chapters, request AI story beats, and collaborate with
                editors—all inside your dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:w-1/3">
              <Link
                href="/dashboard"
                className="rounded-2xl bg-white px-4 py-3 text-center font-semibold text-zinc-900 hover:bg-zinc-200"
              >
                Visit dashboard
              </Link>
              <Link
                href="/ai/story-helper"
                className="rounded-2xl border border-white/40 px-4 py-3 text-center text-white hover:bg-white/10"
              >
                Use AI story helper
              </Link>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {creatorSpotlights.map((spotlight) => (
              <article
                key={spotlight.creator}
                className="rounded-2xl border border-emerald-500/20 bg-zinc-900/60 p-4"
              >
                <p className="text-xs text-emerald-300">{spotlight.total} comic(s)</p>
                <h3 className="text-lg font-semibold truncate">
                  {spotlight.creator}
                </h3>
                <p className="text-sm text-zinc-400">
                  Latest: {spotlight.latestTitle}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

