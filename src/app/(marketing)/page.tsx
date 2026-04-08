import Link from "next/link";
import { ArrowRight, Check, Hammer, Users, Boxes, Trello, Scissors, Receipt, Clock, Calendar, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(1200px 500px at 70% -10%, rgba(245,158,11,.18), transparent 60%), radial-gradient(800px 400px at 10% 40%, rgba(245,158,11,.08), transparent 60%)",
          }}
        />
        <div className="relative max-w-[1240px] mx-auto px-7 pt-28 pb-24">
          <span className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-amber-500 border border-amber-900/50 bg-amber-500/10 px-4 py-2 rounded-full font-semibold">
            ● The operating system for custom cabinet shops
          </span>
          <h1 className="text-[clamp(44px,6.4vw,88px)] font-extrabold leading-[0.97] tracking-tight mt-6 max-w-[920px]">
            Every job. Every stage.
            <br />
            <span className="text-amber-500">One live board.</span>
          </h1>
          <p className="text-[clamp(17px,1.5vw,21px)] text-neutral-300 max-w-[640px] mt-6">
            CabinetShop.io replaces the whiteboard, the spreadsheet, and the group text. Your clients, projects, materials, cut lists, and production stages live in one place your whole crew can see.
          </p>
          <div className="flex flex-wrap gap-3 mt-9">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-ink font-bold px-6 py-3.5 rounded-lg transition"
            >
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 border border-neutral-800 hover:border-neutral-600 px-6 py-3.5 rounded-lg font-semibold text-neutral-200 transition"
            >
              See features
            </Link>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-2xl overflow-hidden mt-20">
            {[
              { n: "13", l: "Production stages, out of the box" },
              { n: "12", l: "Core modules built in" },
              { n: "0", l: "Spreadsheets required" },
              { n: "1", l: "Source of truth for your shop" },
            ].map((m) => (
              <div key={m.l} className="bg-ink p-6">
                <div className="text-[34px] font-extrabold text-amber-500 leading-none">{m.n}</div>
                <div className="text-[12px] text-neutral-500 mt-2">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE SLAB */}
      <section className="border-t border-line py-28">
        <div className="max-w-[1240px] mx-auto px-7">
          <div className="flex items-end justify-between flex-wrap gap-8 mb-14">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-amber-500 font-bold mb-3">
                Built for cabinet shops
              </div>
              <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-tight leading-none max-w-[680px]">
                Everything your shop runs on, under one roof.
              </h2>
            </div>
            <p className="text-neutral-500 max-w-md">
              From quote to install. Materials to punch list. Estimator to shop floor.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { i: Users, t: "Clients CRM", d: "Homeowners, designers, GCs, and repeat accounts. Every project and payment tied to the right person." },
              { i: Hammer, t: "Projects / Jobs", d: "Digital job folders with scope, drawings, photos, measurements, and a full timeline." },
              { i: Trello, t: "Live Production Board", d: "Kanban across 13 cabinet shop stages. Drag jobs forward, see bottlenecks instantly." },
              { i: Boxes, t: "Materials & Inventory", d: "Sheet goods, hardwood, hardware, finishes. Track in stock, reserved, and on order per job." },
              { i: Scissors, t: "Cut Lists & BOM", d: "Attach cut lists to every job, push to the shop, tick off pieces as they're made." },
              { i: Receipt, t: "Invoices & POs", d: "Generate purchase orders, invoices, track delivery dates. Get paid faster." },
              { i: Clock, t: "Shop Floor Time", d: "Clock in/out per job and per stage. Owners finally know true hours per cabinet run." },
              { i: Calendar, t: "Schedule & Install", d: "Delivery and install calendar your crew can see from the van." },
              { i: BarChart3, t: "Reports & KPIs", d: "Revenue, WIP value, stage bottlenecks, margin per job. Numbers that run a shop." },
            ].map((f) => {
              const Icon = f.i;
              return (
                <div key={f.t} className="card p-7 hover:border-amber-500/30 transition">
                  <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/25 grid place-items-center text-amber-500 mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-[18px] font-bold mb-2">{f.t}</div>
                  <div className="text-[14px] text-neutral-500 leading-relaxed">{f.d}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTION BOARD PREVIEW */}
      <section className="border-t border-line py-28">
        <div className="max-w-[1240px] mx-auto px-7">
          <div className="flex items-end justify-between flex-wrap gap-8 mb-12">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-amber-500 font-bold mb-3">
                Pipefy grade, cabinet shop tuned
              </div>
              <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-tight leading-none max-w-[680px]">
                The production board your foreman dreamed about.
              </h2>
            </div>
            <p className="text-neutral-500 max-w-sm">
              Every job is a card. Every stage is a column. Drag forward when the work is done.
            </p>
          </div>

          <div className="card p-5 overflow-x-auto">
            <div className="flex gap-3 min-w-[1100px]">
              {[
                { stage: "Quote", count: 4, jobs: [{ n: "Parker Kitchen", c: "Design", v: "$18,400" }, { n: "Reyes Pantry", c: "Est", v: "$6,200" }] },
                { stage: "Design", count: 2, jobs: [{ n: "Whitmore Bath", c: "Rev 2", v: "$22,100" }] },
                { stage: "Approved", count: 3, jobs: [{ n: "Kim Closet", c: "Deposit", v: "$9,500" }, { n: "Gomez Kitchen", c: "50% paid", v: "$31,800" }] },
                { stage: "Cut / CNC", count: 2, jobs: [{ n: "Alvarez Built-in", c: "Sheet 6/12", v: "$14,700" }] },
                { stage: "Assembly", count: 1, jobs: [{ n: "Patel Island", c: "Boxes up", v: "$12,900" }] },
                { stage: "Finish", count: 2, jobs: [{ n: "Harris Laundry", c: "2nd coat", v: "$7,200" }] },
                { stage: "Install", count: 1, jobs: [{ n: "Doyle Pantry", c: "Day 2", v: "$11,400" }] },
              ].map((col) => (
                <div key={col.stage} className="flex-1 min-w-[180px] bg-[#141414] border border-line rounded-xl p-3">
                  <div className="flex justify-between items-center text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-3">
                    <span>{col.stage}</span>
                    <span className="text-amber-500">{col.count}</span>
                  </div>
                  <div className="space-y-2">
                    {col.jobs.map((j) => (
                      <div key={j.n} className="bg-[#1a1a1a] border border-neutral-800 rounded-lg p-3">
                        <div className="text-[13px] font-bold text-white">{j.n}</div>
                        <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
                          <span>● {j.c}</span>
                          <span className="text-amber-500 font-bold">{j.v}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line py-28">
        <div className="max-w-[1240px] mx-auto px-7 text-center">
          <h2 className="text-[clamp(32px,4.4vw,56px)] font-extrabold tracking-tight max-w-[700px] mx-auto">
            Get out of the spreadsheets.
            <br />
            <span className="text-amber-500">Get into the shop.</span>
          </h2>
          <p className="text-neutral-400 mt-5 max-w-lg mx-auto text-[16px]">
            Free forever to start. No credit card. Built by people who actually run a cabinet shop.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-9">
            <Link href="/sign-up" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-ink font-bold px-7 py-4 rounded-lg transition">
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-2 border border-neutral-800 hover:border-neutral-600 px-7 py-4 rounded-lg font-semibold transition">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
