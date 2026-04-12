"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export default function EarlyAccessPage() {
  const [form, setForm] = useState({
    shopName: "", ownerName: "", email: "", phone: "", city: "", state: "", employeeCount: "", website: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shopName || !form.email) return setErr("Shop name and email are required.");
    setLoading(true);
    setErr("");
    const res = await fetch("/api/early-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json();
      return setErr(body.error || "Something went wrong. Try again.");
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ink" style={{ padding: "24px" }}>
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 grid place-items-center mx-auto" style={{ marginBottom: "24px" }}>
            <Check className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-[28px] font-extrabold" style={{ marginBottom: "8px" }}>You're on the list.</h1>
          <p className="text-neutral-400 text-[15px]" style={{ marginBottom: "24px" }}>
            We're reviewing early access requests in the order they come in. You'll get an email from us within 48 hours with your login credentials and a personal walkthrough.
          </p>
          <p className="text-neutral-500 text-[13px]" style={{ marginBottom: "32px" }}>
            In the meantime, here's what you're getting: a 13-stage production board, materials tracking, cut lists, shop floor time tracking, invoicing, and reports that actually tell you which jobs make money.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-amber-500 font-semibold text-[14px]">
            Back to CabinetShop.io <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink" style={{ padding: "24px" }}>
      <div className="w-full max-w-lg">
        <div className="text-center" style={{ marginBottom: "32px" }}>
          <Link href="/" className="inline-flex items-center gap-2.5 font-extrabold text-[18px]" style={{ marginBottom: "24px" }}>
            <span className="w-8 h-8 rounded-md bg-ink border border-neutral-800 grid place-items-center">
              <span className="block w-3.5 h-0.5 bg-amber-500 shadow-[0_4px_0_#f59e0b,0_-4px_0_#f59e0b]" />
            </span>
            CabinetShop<span className="text-amber-500">.io</span>
          </Link>
          <h1 className="text-[32px] font-extrabold tracking-tight" style={{ marginTop: "24px", marginBottom: "8px" }}>
            Request Early Access
          </h1>
          <p className="text-neutral-400 text-[15px]">
            We're onboarding shops one at a time to make sure every setup is dialed. Tell us about your shop and we'll get you in.
          </p>
        </div>

        <form onSubmit={submit} className="card" style={{ padding: "32px" }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <div className="label">Shop Name *</div>
              <input required className="input" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} placeholder="Acme Cabinet Co" />
            </div>
            <div>
              <div className="label">Your Name</div>
              <input className="input" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="John Smith" />
            </div>
            <div>
              <div className="label">Email *</div>
              <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@acmecabinets.com" />
            </div>
            <div>
              <div className="label">Phone</div>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(512) 555-0100" />
            </div>
            <div>
              <div className="label">How many in the shop?</div>
              <select className="input" value={form.employeeCount} onChange={(e) => setForm({ ...form, employeeCount: e.target.value })}>
                <option value="">Select</option>
                <option value="1">Just me</option>
                <option value="2-5">2 to 5</option>
                <option value="6-10">6 to 10</option>
                <option value="11-20">11 to 20</option>
                <option value="20+">20+</option>
              </select>
            </div>
            <div>
              <div className="label">City</div>
              <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Austin" />
            </div>
            <div>
              <div className="label">State</div>
              <input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="TX" />
            </div>
            <div className="col-span-2">
              <div className="label">Website (optional)</div>
              <input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="www.acmecabinets.com" />
            </div>
          </div>
          {err && <div className="text-red-400 text-[12px]" style={{ marginTop: "12px" }}>{err}</div>}
          <button type="submit" className="btn btn-primary w-full justify-center" style={{ marginTop: "24px" }} disabled={loading}>
            {loading ? "Submitting..." : "Request Early Access"}
          </button>
          <p className="text-neutral-600 text-[11px] text-center" style={{ marginTop: "16px" }}>
            Free to start. No credit card. We'll set up your shop personally.
          </p>
        </form>
      </div>
    </main>
  );
}
