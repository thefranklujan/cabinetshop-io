import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="sticky top-0 z-40 bg-[rgba(10,10,10,.82)] backdrop-blur border-b border-line">
        <div className="max-w-[1240px] mx-auto px-7 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-[18px]">
            <span className="w-7 h-7 rounded-md bg-ink border border-neutral-800 grid place-items-center">
              <span className="block w-3.5 h-0.5 bg-amber-500 shadow-[0_4px_0_#f59e0b,0_-4px_0_#f59e0b]" />
            </span>
            CabinetShop<span className="text-amber-500">.io</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-[14px] text-neutral-300">
            {NAV.slice(1).map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-white transition">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/sign-in" className="hidden sm:inline-flex text-[13px] font-semibold text-neutral-300 hover:text-white px-3 py-2">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-ink font-bold text-[13px] px-4 py-2.5 rounded-lg transition"
            >
              Start free →
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-line mt-32 py-14 text-[13px] text-neutral-500">
        <div className="max-w-[1240px] mx-auto px-7 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-extrabold text-[16px] text-paper">
              <span className="w-7 h-7 rounded-md bg-ink border border-neutral-800 grid place-items-center">
                <span className="block w-3.5 h-0.5 bg-amber-500 shadow-[0_4px_0_#f59e0b,0_-4px_0_#f59e0b]" />
              </span>
              CabinetShop<span className="text-amber-500">.io</span>
            </Link>
            <p className="mt-4 max-w-sm text-neutral-500">
              The operating system for custom cabinet shops. A Crafted Systems product.
            </p>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-neutral-600 font-bold mb-3">Product</div>
            <ul className="space-y-2">
              <li><Link href="/features" className="hover:text-white">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/sign-up" className="hover:text-white">Start free</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-neutral-600 font-bold mb-3">Company</div>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1240px] mx-auto px-7 mt-10 pt-6 border-t border-line text-[12px] text-neutral-600 flex flex-wrap justify-between gap-2">
          <div>© 2026 Crafted &amp; Company. All rights reserved.</div>
          <div>Built in Austin, TX</div>
        </div>
      </footer>
    </div>
  );
}
