"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Comic = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_public: boolean;
};

export default function Dashboard() {
  const router = useRouter();
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/auth?redirect=/dashboard");
        return;
      }

      if (isMounted) {
        setCheckingAuth(false);
      }
    }

    verifySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/auth?redirect=/dashboard");
      } else {
        setCheckingAuth(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;

    async function loadComics() {
      setLoading(true);
      const { data, error } = await supabase
        .from("comics")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else if (data) {
        setComics(data as Comic[]);
      }

      setLoading(false);
    }

    loadComics();
  }, [checkingAuth]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Checking your dashboard access…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Creator Dashboard</h1>

      <Link
        href="/create-comic"
        className="inline-block px-4 py-2 rounded bg-white text-black font-medium hover:bg-zinc-200 transition mb-6"
      >
        + Create New Comic
      </Link>

      <div className="mt-4">
        {loading ? (
          <p className="text-zinc-400">Loading comics...</p>
        ) : comics.length === 0 ? (
          <p className="text-zinc-400">
            You don&apos;t have any comics yet. Create one!
          </p>
        ) : (
          <ul className="space-y-3">
            {comics.map((comic) => (
              <li
                key={comic.id}
                className="border border-zinc-800 rounded p-4 hover:border-zinc-500 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold">{comic.title}</h2>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      comic.is_public
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/40"
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    }`}
                  >
                    {comic.is_public ? "Public" : "Private"}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mt-1">{comic.description}</p>
                <p className="text-xs text-zinc-500 mt-2">
                  {new Date(comic.created_at).toLocaleString()}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/comics/${comic.id}`}
                    className="text-sm px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
                  >
                    View comic
                  </Link>

                  <Link
                    href={`/comics/${comic.id}/pages`}
                    className="text-sm px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
                  >
                    Manage pages
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
