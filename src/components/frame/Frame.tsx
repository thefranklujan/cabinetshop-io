"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, FolderKanban, Trello, Boxes, Scissors,
  ShoppingCart, Clock, Calendar, Receipt, BarChart3, Settings,
  Search, Bell, Menu, X, Plus, LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/board", label: "Production Board", icon: Trello },
  { href: "/app/projects", label: "Projects", icon: FolderKanban },
  { href: "/app/clients", label: "Clients", icon: Users },
  { href: "/app/materials", label: "Materials", icon: Boxes },
  { href: "/app/cutlists", label: "Cut Lists", icon: Scissors },
  { href: "/app/orders", label: "Purchase Orders", icon: ShoppingCart },
  { href: "/app/shopfloor", label: "Shop Floor", icon: Clock },
  { href: "/app/schedule", label: "Schedule", icon: Calendar },
  { href: "/app/invoices", label: "Invoices", icon: Receipt },
  { href: "/app/reports", label: "Reports", icon: BarChart3 },
  { href: "/app/team", label: "Team", icon: Users },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export default function Frame({
  children,
  workspaceName = "Your Shop",
  userEmail = "",
}: {
  children: React.ReactNode;
  workspaceName?: string;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = (userEmail || "?")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-ink text-paper flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[260px] bg-[#0b0b0b] border-r border-line flex flex-col transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-6 py-6 border-b border-line">
          <Link href="/app/dashboard" className="flex items-center gap-2.5 font-extrabold text-[17px]">
            <span className="w-8 h-8 rounded-md bg-ink border border-neutral-800 grid place-items-center">
              <span className="block w-3.5 h-0.5 bg-amber-500 shadow-[0_4px_0_#f59e0b,0_-4px_0_#f59e0b]" />
            </span>
            CabinetShop<span className="text-amber-500">.io</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13.5px] font-medium transition ${
                  active
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent"
                }`}
              >
                <Icon className="w-[17px] h-[17px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-line">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 grid place-items-center text-amber-500 font-bold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">{userEmail || "Owner"}</div>
              <div className="text-[11px] text-neutral-500 truncate">{workspaceName}</div>
            </div>
            <button onClick={signOut} title="Sign out" className="text-neutral-600 hover:text-amber-500">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="h-[68px] border-b border-line bg-[#0b0b0b]/80 backdrop-blur sticky top-0 z-20 flex items-center px-5 lg:px-8 gap-4">
          <button className="lg:hidden text-neutral-400" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              placeholder="Search jobs, clients, materials…"
              className="w-full pl-9 pr-3 py-2.5 bg-[#0f0f0f] border border-line rounded-lg text-[13px] outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/app/projects" className="btn">
              <Plus className="w-4 h-4" /> New Job
            </Link>
            <button className="w-10 h-10 rounded-lg border border-line bg-[#0f0f0f] grid place-items-center text-neutral-400 hover:text-white hover:border-neutral-700 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-8 max-w-[1500px] mx-auto w-full">{children}</div>
        </main>

        {/* Footer */}
        <footer className="border-t border-line px-8 py-4 text-[12px] text-neutral-600 flex justify-between flex-wrap gap-2">
          <div>© 2026 Crafted &amp; Company · CabinetShop.io v1.0</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-neutral-400">Help</a>
            <a href="#" className="hover:text-neutral-400">Changelog</a>
            <a href="#" className="hover:text-neutral-400">Status</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-7 flex-wrap gap-4">
      <div>
        <h1 className="text-[28px] font-extrabold tracking-tight">{title}</h1>
        {sub && <p className="text-neutral-500 text-[14px] mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
