"use client";
import { useState } from "react";

// Real contact capture: posts to /api/contact (durable contact_messages table,
// triaged at /platform/inbox). Failure is surfaced with a direct email fallback,
// never a fake success.
export default function ContactForm() {
  const [form, setForm] = useState({ name: "", shopName: "", email: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) {
      setErr("Email and message are required.");
      return;
    }
    setState("sending");
    setErr("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErr(body.error || "We could not save your message. Please email hello@cabinetshop.io directly.");
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setErr("Network problem. Please email hello@cabinetshop.io directly.");
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-[20px] font-extrabold mb-2">Got it.</h2>
        <p className="text-[14px] text-neutral-400">
          Your message is saved and the founder reads every one. You&apos;ll hear back at{" "}
          <span className="text-amber-500">{form.email}</span>, usually within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-8 space-y-4">
      <h2 className="text-[20px] font-extrabold mb-2">Send us a note</h2>
      <p className="text-[13px] text-neutral-500 mb-4">Tell us about your shop. We&apos;ll get back fast.</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="label">Your Name</div>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Smith" />
        </div>
        <div>
          <div className="label">Shop Name</div>
          <input className="input" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} placeholder="Acme Cabinet Co" />
        </div>
      </div>
      <div>
        <div className="label">Email *</div>
        <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
      </div>
      <div>
        <div className="label">How can we help? *</div>
        <textarea
          required
          className="input"
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us about your shop, your team size, what tools you're using today…"
        />
      </div>
      {err && <div className="text-red-400 text-[12px]">{err}</div>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-ink font-bold w-full py-3 rounded-lg transition"
      >
        {state === "sending" ? "Sending…" : "Send message →"}
      </button>
      <p className="text-[11px] text-neutral-600 text-center">
        Or just email us directly at{" "}
        <a href="mailto:hello@cabinetshop.io" className="text-amber-500">
          hello@cabinetshop.io
        </a>
      </p>
    </form>
  );
}
