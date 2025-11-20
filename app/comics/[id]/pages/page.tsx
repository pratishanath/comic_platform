"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ComicPage = {
  id: string;
  image_url: string;
  page_number: number;
};

export default function ManagePagesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pages, setPages] = useState<ComicPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPages() {
      const comicId = params.id;
      if (!comicId) return;

      const { data, error } = await supabase
        .from("comic_pages")
        .select("*")
        .eq("comic_id", comicId)
        .order("page_number", { ascending: true });

      if (error) {
        console.error("Error loading pages:", error);
      } else if (data) {
        setPages(data as ComicPage[]);
      }
      setLoading(false);
    }

    loadPages();
  }, [params.id]);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const comicId = params.id as string;
    if (!comicId) return;

    try {
      setUploading(true);

      const nextPageNumber =
        pages.length === 0
          ? 1
          : Math.max(...pages.map((p) => p.page_number)) + 1;

      const filePath = `comic-${comicId}/page-${nextPageNumber}-${Date.now()}-${file.name}`;

      // IMPORTANT: bucket name is comic_pages
      const { error: uploadError } = await supabase.storage
        .from("comic_pages")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("comic_pages")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { data, error } = await supabase
        .from("comic_pages")
        .insert({
          comic_id: comicId,
          image_url: publicUrl,
          page_number: nextPageNumber,
        })
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      setPages((prev) => [...prev, data as ComicPage]);
      alert("Page uploaded!");
    } catch (err: any) {
      console.error("Unexpected error during upload:", err);
      alert(`Failed to upload: ${err.message || "Unknown error"}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function extractFilePath(url: string): string | null {
    const marker = "/storage/v1/object/public/comic_pages/";
    const index = url.indexOf(marker);
    if (index === -1) return null;
    return url.substring(index + marker.length);
  }

  async function handleDeletePage(page: ComicPage) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Delete page ${page.page_number}? This cannot be undone.`)
    ) {
      return;
    }

    try {
      setDeletingId(page.id);
      const { error } = await supabase
        .from("comic_pages")
        .delete()
        .eq("id", page.id);

      if (error) {
        console.error("Failed to delete page row:", error);
        alert("Failed to delete page. Please try again.");
        return;
      }

      const filePath = extractFilePath(page.image_url);
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("comic_pages")
          .remove([filePath]);
        if (storageError) {
          console.error("Failed to delete storage object:", storageError);
        }
      }

      setPages((prev) => prev.filter((p) => p.id !== page.id));
    } catch (err: any) {
      console.error("Unexpected delete error:", err);
      alert(`Failed to delete: ${err.message || "Unknown error"}`);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-4 text-sm px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
        >
          ← Back to dashboard
        </button>

        <h1 className="text-3xl font-bold mb-2">
          Manage Pages for {params.id}
        </h1>
        <p className="text-sm text-zinc-400 mb-6">
          Upload new comic pages below. Supported formats: JPG, PNG, WEBP.
        </p>

        <div className="mb-6 border border-zinc-800 rounded p-4">
          <label className="block mb-2 text-sm font-medium">
            Select image to upload
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="text-sm"
          />
          {uploading && (
            <p className="text-zinc-400 text-sm mt-2">Uploading…</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Pages</h2>
          {loading ? (
            <p className="text-zinc-400">Loading pages…</p>
          ) : pages.length === 0 ? (
            <p className="text-zinc-400">
              No pages have been uploaded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {pages
                .slice()
                .sort((a, b) => a.page_number - b.page_number)
                .map((page) => (
                  <div
                    key={page.id}
                    className="border border-zinc-800 rounded p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-zinc-400">
                        Page {page.page_number}
                      </p>
                      <button
                        onClick={() => handleDeletePage(page)}
                        disabled={deletingId === page.id}
                        className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50"
                      >
                        {deletingId === page.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                    <img
                      src={page.image_url}
                      alt={`Page ${page.page_number}`}
                      className="w-full max-h-[600px] object-contain rounded"
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

