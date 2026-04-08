import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) redirect("/app");

  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="h-[60px] border-b border-line bg-[#0b0b0b] flex items-center justify-between px-6">
        <Link href="/platform" className="flex items-center gap-2.5 font-extrabold text-[16px]">
          <span className="w-7 h-7 rounded-md bg-ink border border-neutral-800 grid place-items-center">
            <span className="block w-3 h-0.5 bg-amber-500 shadow-[0_3px_0_#f59e0b,0_-3px_0_#f59e0b]" />
          </span>
          CabinetShop<span className="text-amber-500">.io</span>
          <span className="ml-2 text-[10px] uppercase tracking-widest font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded">
            Platform Admin
          </span>
        </Link>
        <div className="flex items-center gap-4 text-[12px] text-neutral-500">
          <span>{user.email}</span>
          <Link href="/app" className="text-amber-500 hover:underline font-semibold">
            ← Exit to my shop
          </Link>
        </div>
      </header>
      <main className="p-6 lg:p-10 max-w-[1400px] mx-auto">{children}</main>
    </div>
  );
}
