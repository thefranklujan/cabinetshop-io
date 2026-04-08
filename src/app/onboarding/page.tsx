"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Onboarding() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/sign-in"); return; }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);
    const { error } = await supabase.from("workspaces").insert({ name, slug, owner_id: user.id });
    setLoading(false);
    if (error) return setErr(error.message);
    router.push("/app");
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="card p-8 max-w-md w-full">
        <h1 className="text-2xl font-extrabold mb-1">Name your shop</h1>
        <p className="text-neutral-500 text-[13px] mb-6">This is your workspace inside CabinetShop.io.</p>
        <div className="label">Shop Name</div>
        <input required className="input mb-4" placeholder="Acme Cabinet Co" value={name} onChange={(e) => setName(e.target.value)} />
        {err && <div className="text-red-400 text-[12px] mb-4">{err}</div>}
        <button type="submit" className="btn btn-primary w-full justify-center" disabled={loading}>
          {loading ? "Creating…" : "Create Shop →"}
        </button>
      </form>
    </main>
  );
}
