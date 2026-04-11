import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PlatformSidebar from "./PlatformSidebar";

export const dynamic = "force-dynamic";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) redirect("/app");

  return (
    <div className="min-h-screen bg-ink text-paper flex">
      <PlatformSidebar userEmail={user.email || ""} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-[60px] border-b border-line bg-[#0b0b0b]/80 backdrop-blur sticky top-0 z-20 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2.5 py-1 rounded">
              Platform Admin
            </span>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-neutral-500">
            <span>{user.email}</span>
            <Link href="/app" className="text-amber-500 hover:underline font-semibold">
              Exit to my shop
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-8 max-w-[1500px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
