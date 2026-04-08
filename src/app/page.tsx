import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-900/40 bg-amber-500/10 text-amber-500 text-xs uppercase tracking-widest font-semibold mb-8">
          ● CabinetShop.io is live
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
          The operating system for <span className="text-amber-500">custom cabinet shops.</span>
        </h1>
        <p className="text-neutral-400 text-lg mb-10">
          Clients, projects, materials, cut lists, and a live production board your whole crew can see.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/app/dashboard" className="btn btn-primary">Open the App →</Link>
          <a href="#" className="btn">Watch demo</a>
        </div>
      </div>
    </main>
  );
}
