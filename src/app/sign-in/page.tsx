"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignIn() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.push("/app");
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-ink">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-[18px] mb-10 justify-center">
          <span className="w-8 h-8 rounded-md bg-ink border border-neutral-800 grid place-items-center">
            <span className="block w-3.5 h-0.5 bg-amber-500 shadow-[0_4px_0_#f59e0b,0_-4px_0_#f59e0b]" />
          </span>
          CabinetShop<span className="text-amber-500">.io</span>
        </Link>
        <div className="card p-8">
          <h1 className="text-2xl font-extrabold mb-1">Sign in</h1>
          <p className="text-neutral-500 text-[13px] mb-6">Welcome back to your shop.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <div className="label">Email</div>
              <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="label">Password</div>
              <input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {err && <div className="text-red-400 text-[12px]">{err}</div>}
            <button type="submit" className="btn btn-primary w-full justify-center" disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
          <div className="mt-6 text-center text-[12px] text-neutral-500">
            New shop?{" "}
            <Link href="/sign-up" className="text-amber-500 font-semibold">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
