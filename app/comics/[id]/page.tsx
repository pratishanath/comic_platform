"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Comic = {
  id: string;
  title: string;
  description: string;
  created_at: string;
};

type ComicPage = {
  id: string;
  image_url: string;
  page_number: number;
};

export default function ComicReaderPage() {
  const params = useParams<{ id: string }>();
  const [comic, setComic] = useState<Comic | null>(null);
  const [pages, setPages] = useState<ComicPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComicAndPages() {
      const id = params.id;
      if (!id) return;

      const { data: comicData } = await supabase
        .from("comics")
        .select("*")
        .eq("id", id)
        .single();

      setComic(comicData || null);

      const { data: pageData } = await supabase
        .from("comic_pages")
        .select("*")
        .eq("comic_id", id)
        .order("page_number", { ascending: true });

      setPages(
        (pageData || []).sort((a, b) => a.page_number - b.page_number)
      );
      setLoading(false);
    }

    loadComicAndPages();
  }, [params.id]);

  if (loading) {
    return <main className="min-h-screen text-white p-8">Loading…</main>;
  }

  if (!comic) {
    return (
      <main className="min-h-screen text-white p-8">
        Comic not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-center">{comic.title}</h1>
        <p className="text-zinc-400 mb-10 text-center">{comic.description}</p>

        <h2 className="text-2xl mb-6 text-center">Pages</h2>
        {pages.length === 0 ? (
          <p className="text-center text-zinc-400">No pages yet</p>
        ) : (
          <div className="space-y-12">
            {pages.map((page) => (
              <div
                key={page.id}
                className="flex flex-col items-center space-y-3"
              >
                <p className="text-sm text-zinc-400">
                  Page {page.page_number} of {pages.length}
                </p>
                <img
                  src={page.image_url}
                  className="rounded-lg max-h-[80vh] w-auto max-w-full shadow-lg"
                  alt={`Page ${page.page_number}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

