"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Sign up successful! You can log in now.");
        setMode("login");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (!data.session) throw new Error("No session returned");
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-zinc-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {mode === "login" ? "Log in" : "Sign up"}
        </h1>

        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-3 py-1 rounded ${
              mode === "login"
                ? "bg-white text-black"
                : "bg-zinc-800 text-zinc-200"
            }`}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`px-3 py-1 rounded ${
              mode === "signup"
                ? "bg-white text-black"
                : "bg-zinc-800 text-zinc-200"
            }`}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded bg-white text-black font-medium hover:bg-zinc-200 transition disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Log in"
              : "Sign up"}
          </button>
        </form>
      </div>
    </main>
  );
}
