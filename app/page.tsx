import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          My Comic Platform (WIP)
        </h1>
        <p className="text-lg opacity-80 mb-6">
          Built by me, from scratch, with a little AI help 😎
        </p>

        <Link
          href="/dashboard"
          className="inline-block px-4 py-2 rounded bg-white text-black font-medium hover:bg-zinc-200 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
