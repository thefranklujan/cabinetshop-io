import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "/ forever",
    blurb: "For solo makers getting off spreadsheets.",
    features: ["Up to 5 active jobs", "Clients, Projects, Board", "Materials list", "1 crew member", "Email support"],
    cta: "Start free",
    pop: false,
  },
  {
    name: "Shop",
    price: "$149",
    period: "/ month",
    blurb: "Everything the average cabinet shop needs.",
    features: [
      "Unlimited jobs",
      "All 12 modules",
      "Unlimited crew members",
      "Purchase orders",
      "Shop floor time tracking",
      "Reports & KPIs",
      "Priority email support",
    ],
    cta: "Start 14-day trial",
    pop: true,
  },
  {
    name: "Scale",
    price: "$349",
    period: "/ month",
    blurb: "Multi location shops, higher volume.",
    features: [
      "Everything in Shop",
      "Multiple shop locations",
      "Advanced reports + margin by job",
      "API access",
      "Dedicated success manager",
      "SLA",
    ],
    cta: "Talk to sales",
    pop: false,
  },
];

const FAQ = [
  { q: "Is Starter really free forever?", a: "Yes. No credit card. Up to 5 active jobs and 1 crew member. Upgrade when you outgrow it." },
  { q: "Do I pay per crew member?", a: "Never. Shop and Scale are flat-rate. Add as many crew members as you want." },
  { q: "What's a 'shop'?", a: "One workspace = one shop. If you run two physical locations under one company, the Scale plan supports multiple locations under one bill." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel from Settings. Your data stays exportable for 30 days after cancellation." },
  { q: "Is my data isolated from other shops?", a: "Yes. Postgres Row Level Security on every table means your data is cryptographically invisible to every other shop on the platform." },
  { q: "Can I import from QuickBooks / Excel?", a: "CSV import for clients, projects, and materials is supported. QuickBooks integration is on the roadmap." },
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
            Flat rate.
            <br />
            <span className="text-amber-500">No per-seat tax.</span>
          </h1>
          <p className="text-[18px] text-neutral-400 mt-6 max-w-[600px] mx-auto">
            You pay for the shop, not every guy in the shop. Start free, upgrade when you feel it.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1240px] mx-auto px-7 grid md:grid-cols-3 gap-5">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`card p-8 ${p.pop ? "border-amber-500/60 bg-gradient-to-b from-amber-500/[.06] to-transparent relative" : ""}`}
            >
              {p.pop && (
                <span className="absolute -top-3 left-8 bg-amber-500 text-ink text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}
              <div className="text-[18px] font-bold">{p.name}</div>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-[44px] font-extrabold tracking-tight">{p.price}</span>
                <span className="text-neutral-500 text-[14px]">{p.period}</span>
              </div>
              <p className="text-[13px] text-neutral-500 mt-2">{p.blurb}</p>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-[13.5px] text-neutral-300">
                    <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href={p.name === "Scale" ? "/contact" : "/sign-up"}
                className={`block text-center mt-7 py-3 rounded-lg font-bold transition ${
                  p.pop
                    ? "bg-amber-500 hover:bg-amber-400 text-ink"
                    : "bg-[#141414] border border-line hover:border-neutral-600 text-paper"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
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
