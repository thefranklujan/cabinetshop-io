import Link from "next/link";
import { Users, Hammer, Trello, Boxes, Scissors, ShoppingCart, Clock, Calendar, Receipt, BarChart3, Shield, Zap } from "lucide-react";

const FEATURES = [
  { i: Users, t: "Clients CRM", d: "Homeowners, designers, GCs, builders. Lifetime value, project history, contact info, every dollar tied to the right account." },
  { i: Hammer, t: "Projects & Job Folders", d: "Job number, scope, contract total, paid to date, due date, wood species, finish, hardware, square footage, cabinet count, priority. The whole story of a job in one place." },
  { i: Trello, t: "Live Production Board (Kanban)", d: "13 stages tuned for cabinet shops: Quote → Design → Approved → Materials → Cut/CNC → Assembly → Sanding → Finish → QC → Delivery → Install → Punch List → Complete. Drag jobs forward, see bottlenecks instantly." },
  { i: Boxes, t: "Materials & Inventory", d: "Sheet goods, hardwood, hardware, finishes, edge banding. Track in stock, reorder thresholds, supplier, cost per unit, total inventory value. Low stock alerts on the dashboard." },
  { i: Scissors, t: "Cut Lists & BOM", d: "Per-project cut lists with part name, material, quantity, length, width, thickness. Tick parts off as the shop produces them." },
  { i: ShoppingCart, t: "Purchase Orders", d: "Generate POs to suppliers, track status (Draft → Sent → Confirmed → Received → Closed), expected delivery dates, link to specific jobs." },
  { i: Clock, t: "Shop Floor Time Tracking", d: "Workers clock in/out per job per stage. Live timer, hours per worker per day, true labor cost per cabinet run." },
  { i: Calendar, t: "Schedule & Calendar", d: "Measures, deliveries, installs, site visits, punch lists. 4-week calendar grid your crew can see from the van." },
  { i: Receipt, t: "Invoices", d: "Draft → Sent → Paid → Overdue. AR aging, totals by status, due dates, every invoice tied to a project." },
  { i: BarChart3, t: "Reports & KPIs", d: "Total contract volume, cash collected, inventory value, hours logged, revenue by client, pipeline value by stage. Numbers that actually run a shop." },
  { i: Users, t: "Team Members & Roles", d: "Invite your crew by email. Owner, admin, member, viewer. Each shop is fully isolated from other shops." },
  { i: Shield, t: "Multi-Tenant Security", d: "Postgres Row Level Security on every table. Your shop's data is invisible to every other shop on the platform. Cryptographically enforced." },
];

export default function Features() {
  return (
    <>
      <section className="border-b border-line py-24">
        <div className="max-w-[1240px] mx-auto px-7">
          <span className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-amber-500 border border-amber-900/50 bg-amber-500/10 px-4 py-2 rounded-full font-semibold">
            ● Features
          </span>
          <h1 className="text-[clamp(40px,5.6vw,76px)] font-extrabold leading-[0.97] tracking-tight mt-6 max-w-[920px]">
            12 modules.
            <br />
            <span className="text-amber-500">One operating system.</span>
          </h1>
          <p className="text-[18px] text-neutral-400 max-w-[640px] mt-6">
            Designed with real cabinet shops in mind. Every screen serves a job that's actually happening on your shop floor right now.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[1240px] mx-auto px-7 grid md:grid-cols-2 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.i;
            return (
              <div key={f.t} className="card p-7 hover:border-amber-500/30 transition">
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/25 grid place-items-center text-amber-500 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[18px] font-bold mb-2">{f.t}</div>
                    <div className="text-[14px] text-neutral-500 leading-relaxed">{f.d}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-line py-24 text-center">
        <div className="max-w-[700px] mx-auto px-7">
          <Zap className="w-8 h-8 text-amber-500 mx-auto mb-5" />
          <h2 className="text-[clamp(28px,3.6vw,44px)] font-extrabold tracking-tight">
            Try it on your own shop in 60 seconds.
          </h2>
          <p className="text-neutral-400 mt-4">Free forever to start. No credit card.</p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-ink font-bold px-7 py-4 rounded-lg mt-8 transition"
          >
            Create your shop →
          </Link>
        </div>
      </section>
    </>
  );
}
