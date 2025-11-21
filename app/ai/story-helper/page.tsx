"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type StoryResult = {
  content: string;
};

export default function StoryHelperPage() {
  const [genre, setGenre] = useState("");
  const [characters, setCharacters] = useState("");
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<StoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/story-helper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ genre, characters, idea }),
      });

      if (!response.ok) {
        const { error: message } = await response.json();
        throw new Error(message || "Failed to generate story outline.");
      }

      const data = (await response.json()) as StoryResult;
      setResult(data);
    } catch (err: any) {
      console.error("Story helper request failed:", err);
      setError(err.message || "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-10">
        <header>
          <p className="text-emerald-400 uppercase tracking-wide text-xs font-semibold mb-2">
            AI assistant
          </p>
          <h1 className="text-4xl font-bold mb-4">Comic Story Helper</h1>
          <p className="text-zinc-400">
            Describe your idea and let the AI craft a synopsis and 10-panel
            outline to kickstart your next comic.
          </p>
        </header>

        <section className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2">Genre</label>
              <input
                type="text"
                required
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Main Characters
              </label>
              <textarea
                required
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 focus:border-emerald-500 focus:outline-none h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Short Idea
              </label>
              <textarea
                required
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 focus:border-emerald-500 focus:outline-none h-28"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors py-3 font-semibold disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Story"}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>
        </section>

        {result && (
          <section className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 space-y-4 shadow-lg">
            <h2 className="text-2xl font-semibold">Result</h2>
            <div className="whitespace-pre-line text-zinc-200 leading-relaxed">
              {result.content}
            </div>
            <p className="text-xs text-zinc-500">
              This outline is a starting point—feel free to tweak the scenes when
              you create your comic.
            </p>
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/create-comic?idea=${encodeURIComponent(result.content)}`
                )
              }
              className="w-full rounded-lg bg-white text-black font-semibold py-2.5 hover:bg-zinc-200 transition"
            >
              Start comic from this
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

