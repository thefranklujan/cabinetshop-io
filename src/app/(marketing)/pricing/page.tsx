import Link from "next/link";
import { Check } from "lucide-react";

// Honest pilot pricing. There is no billing system yet: nothing here may claim
// trials, per-seat charges, SLAs, or plan limits the product does not enforce.

const PILOT_FEATURES = [
  "All 15 modules, nothing held back",
  "Unlimited jobs",
  "Unlimited crew members",
  "Production board, gates, and readiness",
  "Tasks, constraints, and job timeline",
  "Direct line to the founder for support",
];

const PLANNED = [
  {
    name: "Shop",
    price: "$149",
    period: "/ month, flat",
    blurb: "One shop, unlimited crew. No per-seat charges.",
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    blurb: "Multiple locations under one company.",
  },
];

const FAQ = [
  {
    q: "What does the pilot cost?",
    a: "Nothing. While CabinetShop.io is in pilot, everything is free and every module is included. No credit card is asked for anywhere in the product.",
  },
  {
    q: "What happens when billing launches?",
    a: "Pilot shops get notice well before anything changes, plus founding-shop pricing. You will never be charged silently; there is no payment method on file to charge.",
  },
  {
    q: "Will I pay per crew member?",
    a: "No. Planned pricing is flat per shop. Add as many crew members as you want.",
  },
  {
    q: "Is my data isolated from other shops?",
    a: "Yes. Postgres Row Level Security is enforced by the database on every query. Your shop's data is invisible to every other shop on the platform.",
  },
  {
    q: "Can I get my data out?",
    a: "Your data is yours. Email hello@cabinetshop.io and we will export your shop's data for you while self-serve export is being built.",
  },
  {
    q: "Can I import from QuickBooks or Excel?",
    a: "Not yet. Imports and a QuickBooks integration are on the roadmap. During the pilot we help you load your jobs personally.",
  },
];

export default function Pricing() {
  return (
    <>
      <section className="border-b border-line py-24 text-center">
        <div className="max-w-[920px] mx-auto px-7">
          <span className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-amber-500 border border-amber-900/50 bg-amber-500/10 px-4 py-2 rounded-full font-semibold">
            ● Pricing
          </span>
          <h1 className="text-[clamp(42px,5.6vw,80px)] font-extrabold leading-[0.97] tracking-tight mt-6">
            Free in pilot.
            <br />
            <span className="text-amber-500">Flat rate after.</span>
          </h1>
          <p className="text-[18px] text-neutral-400 mt-6 max-w-[600px] mx-auto">
            CabinetShop.io is in pilot. Everything is free while we prove it in real shops. When billing launches, you pay for the shop, not every person in it.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1240px] mx-auto px-7 grid md:grid-cols-3 gap-5">
          <div className="card p-8 border-amber-500/60 bg-gradient-to-b from-amber-500/[.06] to-transparent relative md:col-span-1">
            <span className="absolute -top-3 left-8 bg-amber-500 text-ink text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
              Available now
            </span>
            <div className="text-[18px] font-bold">Pilot</div>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-[44px] font-extrabold tracking-tight">$0</span>
              <span className="text-neutral-500 text-[14px]">during the pilot</span>
            </div>
            <p className="text-[13px] text-neutral-500 mt-2">
              Full product, real support, no credit card.
            </p>
            <ul className="mt-6 space-y-2.5">
              {PILOT_FEATURES.map((f) => (
                <li key={f} className="flex gap-2 text-[13.5px] text-neutral-300">
                  <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="block text-center mt-7 py-3 rounded-lg font-bold transition bg-amber-500 hover:bg-amber-400 text-ink"
            >
              Start your shop free
            </Link>
          </div>

          <div className="md:col-span-2 card p-8">
            <div className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
              Planned pricing, once billing launches
            </div>
            <p className="text-[13px] text-neutral-500 mt-2 max-w-lg">
              Published now so there are no surprises later. These plans are not for sale yet, and pilot shops hear from us before anything changes.
            </p>
            <div className="grid sm:grid-cols-2 gap-5 mt-6">
              {PLANNED.map((p) => (
                <div key={p.name} className="rounded-xl border border-line p-6">
                  <div className="text-[16px] font-bold">{p.name}</div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-[32px] font-extrabold tracking-tight">{p.price}</span>
                    <span className="text-neutral-500 text-[13px]">{p.period}</span>
                  </div>
                  <p className="text-[13px] text-neutral-500 mt-2">{p.blurb}</p>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-neutral-600 mt-6">
              No per-seat charges. No credit card during the pilot. Cancel by emailing us and your data stays exportable.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-24">
        <div className="max-w-[820px] mx-auto px-7">
          <h2 className="text-[clamp(28px,3.4vw,42px)] font-extrabold tracking-tight mb-10 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <div key={f.q} className="card p-6">
                <div className="font-bold text-[15px] mb-2">{f.q}</div>
                <div className="text-[14px] text-neutral-500 leading-relaxed">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
