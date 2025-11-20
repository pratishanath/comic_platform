"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

export default function CreateComicPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const ideaParam = searchParams.get("idea");

  useEffect(() => {
    if (!ideaParam || description.trim().length > 0) return;
    try {
      setDescription(decodeURIComponent(ideaParam));
    } catch {
      setDescription(ideaParam);
    }
  }, [ideaParam, description]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("comics").insert({
      title,
      description,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Error saving comic.");
      return;
    }

    alert("Comic saved!");
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex justify-center p-8">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-4">Create a New Comic</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Comic Title
            </label>
            <input
              type="text"
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Comic"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Description
            </label>
            <textarea
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of your comic..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-white text-black font-medium hover:bg-zinc-200 transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Create Comic"}
          </button>
        </form>
      </div>
    </main>
  );
}
