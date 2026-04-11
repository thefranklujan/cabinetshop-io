"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Database, Mail, Activity, Settings, LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/platform", label: "Dashboard", icon: LayoutDashboard },
  { href: "/platform/shops", label: "Shops", icon: Building2 },
  { href: "/platform/database", label: "Shop Database", icon: Database },
  { href: "/platform/campaigns", label: "Campaigns", icon: Mail },
  { href: "/platform/activity", label: "Activity", icon: Activity },
];

export default function PlatformSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = (userEmail || "?").split("@")[0].slice(0, 2).toUpperCase();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <aside className="hidden lg:flex w-[240px] bg-[#0b0b0b] border-r border-line flex-col">
      <div style={{ padding: "24px 24px 20px" }}>
        <Link href="/platform" className="flex items-center gap-2.5 font-extrabold text-[16px]">
          <span className="w-7 h-7 rounded-md bg-ink border border-neutral-800 grid place-items-center">
            <span className="block w-3 h-0.5 bg-amber-500 shadow-[0_3px_0_#f59e0b,0_-3px_0_#f59e0b]" />
          </span>
          CabinetShop<span className="text-amber-500">.io</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto" style={{ padding: "0 12px" }}>
        <div className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/platform" && pathname.startsWith(item.href + "/"));
            const exactActive = item.href === "/platform" && pathname === "/platform";
            const isActive = active || exactActive;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg text-[13.5px] font-medium transition ${
                  isActive
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent"
                }`}
                style={{ padding: "10px 14px" }}
              >
                <Icon className="w-[17px] h-[17px]" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div style={{ padding: "16px", borderTop: "1px solid #1e1e1e" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 grid place-items-center text-amber-500 font-bold text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold truncate">{userEmail}</div>
            <div className="text-[11px] text-neutral-500">Platform Admin</div>
          </div>
          <button onClick={signOut} title="Sign out" className="text-neutral-600 hover:text-amber-500">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
