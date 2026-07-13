"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore, fmtMoney } from "@/lib/store";
import { STAGES } from "@/lib/types";
import { readinessFor, type DerivationCtx } from "@/lib/readiness";
import { blockedProjectIds, constraintCards, OVERDUE_APPROVALS_LANE } from "@/lib/constraints";
import { agingByStage } from "@/lib/aging";
import {
  TrendingUp, Hammer, AlertTriangle, DollarSign, Package, ShieldAlert,
  CheckCircle2, CalendarClock, ListChecks,
} from "lucide-react";
import Link from "next/link";

// Phase 5 (docs/LEAN_PLAN_2026_06_10.md §11): the dashboard is the shop's andon
// board. Row 1 = flow health, row 2 = this week, row 3 = flow analytics. Every
// count clicks through to the page it was computed from.

export default function Dashboard() {
  const { projects, clients, materials, invoices, schedule, tasks, gates, checklistRows, pos, activity } = useStore();
  const ctx: DerivationCtx = { gates, rows: checklistRows, invoices, pos, schedule };

  // Row 1 — flow health
  const pre = projects.filter((p) => readinessFor(p, ctx).phase === "pre");
  const readyJobs = pre.filter((p) => readinessFor(p, ctx).ready);
  const notReadyJobs = pre.filter((p) => !readinessFor(p, ctx).ready);
  const worstOffender = [...notReadyJobs].sort(
    (a, b) => readinessFor(b, ctx).missing.length - readinessFor(a, ctx).missing.length,
  )[0];
  const blockedJobs = blockedProjectIds(tasks).size;
  const overdueApprovals = constraintCards(tasks, gates, projects).filter((c) => c.lane === OVERDUE_APPROVALS_LANE).length;

  // Row 2 — this week
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayStr = iso(now);
  const weekOut = new Date(now);
  weekOut.setDate(weekOut.getDate() + 7);
  const weekStr = iso(weekOut);
  const installsThisWeek = schedule.filter((e) => e.type === "Install" && e.date >= todayStr && e.date <= weekStr);
  const lowStock = materials.filter((m) => m.inStock <= m.reorderAt);
  const waitingOnMaterial = tasks.filter((t) => (t.status === "open" || t.status === "in_progress") && t.waitingOn === "material").length;
  const punchJobs = projects.filter((p) => p.stage === "Punch List").length;

  // Money strip
  const wipProjects = projects.filter((p) => p.stage !== "Quote" && p.stage !== "Complete");
  const wipValue = wipProjects.reduce((s, p) => s + p.contractTotal, 0);
  const collected = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);

  // Row 3 — flow analytics with aging (WIP stages only for the bottleneck read)
  const aging = agingByStage(projects, activity, STAGES);
  const wipAging = aging.filter((a) => a.stage !== "Quote" && a.stage !== "Complete" && a.count > 0);
  const bottleneck = [...wipAging].sort((a, b) => b.avgDays - a.avgDays)[0];

  const upcoming = [...schedule].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  // schedule dates are plain YYYY-MM-DD; new Date(s) would read them as UTC midnight
  // and render a day early in any US timezone.
  const localDay = (s: string) => new Date(`${s.slice(0, 10)}T00:00:00`);

  const flow = [
    {
      label: "Ready for Production", value: readyJobs.length,
      sub: readyJobs.length ? fmtMoney(readyJobs.reduce((s, p) => s + p.contractTotal, 0)) : "all clear",
      icon: CheckCircle2, tone: "good" as const, href: "/app/projects",
    },
    {
      label: "Not Ready", value: notReadyJobs.length,
      sub: worstOffender ? `worst: ${worstOffender.name} (${readinessFor(worstOffender, ctx).missing.length} open)` : "nothing pending",
      icon: AlertTriangle, tone: notReadyJobs.length ? ("warn" as const) : ("dim" as const), href: "/app/projects",
    },
    {
      label: "Blocked Jobs", value: blockedJobs,
      sub: blockedJobs ? "see constraints" : "no blockers",
      icon: ShieldAlert, tone: blockedJobs ? ("bad" as const) : ("dim" as const), href: "/app/constraints",
    },
    {
      label: "Overdue Approvals", value: overdueApprovals,
      sub: overdueApprovals ? "chase these first" : "none past due",
      icon: CalendarClock, tone: overdueApprovals ? ("bad" as const) : ("dim" as const), href: "/app/constraints",
    },
  ];

  const week = [
    { label: "Installs This Week", value: installsThisWeek.length, icon: Hammer, href: "/app/schedule" },
    { label: "Material Shortages", value: lowStock.length + waitingOnMaterial, icon: Package, href: "/app/materials" },
    { label: "Jobs in Punch List", value: punchJobs, icon: ListChecks, href: "/app/board" },
  ];

  const money = [
    { label: "Active Jobs", value: String(wipProjects.length), icon: Hammer },
    { label: "WIP Value", value: fmtMoney(wipValue), icon: TrendingUp },
    { label: "Collected", value: fmtMoney(collected), icon: DollarSign },
    { label: "Outstanding", value: fmtMoney(outstanding), icon: AlertTriangle },
  ];

  const toneClasses = {
    good: { card: "border-emerald-500/40 bg-emerald-500/5", icon: "text-emerald-400", num: "text-emerald-400" },
    warn: { card: "border-amber-500/40 bg-amber-500/5", icon: "text-amber-500", num: "text-amber-500" },
    bad: { card: "border-red-500/40 bg-red-500/5", icon: "text-red-400", num: "text-red-400" },
    dim: { card: "", icon: "text-neutral-600", num: "" },
  };

  return (
    <>
      <PageHeader
        title="Shop Dashboard"
        sub="The 10 second read: what is ready, what is stuck, what is aging, what is due."
      />

      {/* Row 1 — flow health */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {flow.map((k) => {
          const Icon = k.icon;
          const t = toneClasses[k.tone];
          return (
            <Link key={k.label} href={k.href} className={`card p-4 block hover:border-amber-500/40 transition ${t.card}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">{k.label}</span>
                <Icon className={`w-4 h-4 ${t.icon}`} />
              </div>
              <div className={`text-2xl font-extrabold tracking-tight ${t.num}`}>{k.value}</div>
              <div className="text-[11px] text-neutral-500 mt-1 truncate">{k.sub}</div>
            </Link>
          );
        })}
      </div>

      {/* Row 2 — this week + money */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 mb-8">
        {week.map((k) => {
          const Icon = k.icon;
          return (
            <Link key={k.label} href={k.href} className="card p-4 block hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">{k.label}</span>
                <Icon className="w-4 h-4 text-neutral-600" />
              </div>
              <div className="text-2xl font-extrabold tracking-tight">{k.value}</div>
            </Link>
          );
        })}
        {money.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">{k.label}</span>
                <Icon className="w-4 h-4 text-neutral-600" />
              </div>
              <div className="text-2xl font-extrabold tracking-tight">{k.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline with aging */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-bold">Production Pipeline</h2>
            <Link href="/app/board" className="text-[12px] text-amber-500 font-semibold">
              Open board →
            </Link>
          </div>
          {bottleneck && bottleneck.avgDays >= 7 && (
            <div className="text-[12px] text-orange-400 mb-4 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Bottleneck watch: {bottleneck.stage} holds {bottleneck.count} job{bottleneck.count === 1 ? "" : "s"} / {fmtMoney(bottleneck.value)}, avg {bottleneck.avgDays} days in stage.
            </div>
          )}
          <div className="space-y-2 mt-3">
            {aging.map((s) => {
              const max = Math.max(...aging.map((x) => x.count), 1);
              const pct = (s.count / max) * 100;
              const isBottleneck = bottleneck && s.stage === bottleneck.stage && s.avgDays >= 7;
              return (
                <div key={s.stage} className="flex items-center gap-3">
                  <div className="w-24 text-[12px] text-neutral-400 font-medium">{s.stage}</div>
                  <div className="flex-1 h-6 bg-neutral-900 rounded overflow-hidden">
                    <div
                      className={`h-full flex items-center justify-end pr-2 text-[11px] font-bold text-ink ${isBottleneck ? "bg-orange-400/90" : "bg-amber-500/80"}`}
                      style={{ width: `${pct}%`, minWidth: s.count ? "24px" : 0 }}
                    >
                      {s.count > 0 ? s.count : ""}
                    </div>
                  </div>
                  <div
                    className={`w-16 text-right text-[11px] ${isBottleneck ? "text-orange-400 font-bold" : s.avgDays >= 7 ? "text-orange-400" : "text-neutral-600"}`}
                    title="Average days jobs have been sitting in this stage"
                  >
                    {s.count > 0 && s.stage !== "Complete" ? `~${s.avgDays}d` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold">Upcoming on Site</h2>
            <Link href="/app/schedule" className="text-[12px] text-amber-500 font-semibold">
              Schedule →
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.map((e) => {
              const proj = projects.find((p) => p.id === e.projectId);
              return (
                <div key={e.id} className="flex gap-3 items-start pb-3 border-b border-neutral-900 last:border-0 last:pb-0">
                  <div className="w-12 text-center">
                    <div className="text-[10px] uppercase text-amber-500 font-bold">
                      {localDay(e.date).toLocaleString("en-US", { month: "short" })}
                    </div>
                    <div className="text-xl font-extrabold">{localDay(e.date).getDate()}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate">{proj?.name || "—"}</div>
                    <div className="text-[11px] text-neutral-500">
                      {e.type} {e.notes ? `· ${e.notes}` : ""}
                    </div>
                  </div>
                </div>
              );
            })}
            {upcoming.length === 0 && (
              <div className="text-[12px] text-neutral-600">Nothing scheduled.</div>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold">
              Low Stock Materials{" "}
              {lowStock.length > 0 && (
                <span className="ml-2 chip chip-accent">{lowStock.length} need reorder</span>
              )}
            </h2>
            <Link href="/app/materials" className="text-[12px] text-amber-500 font-semibold">
              Materials →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="text-[13px] text-neutral-500">All stock above reorder threshold ✓</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Material</th>
                  <th>In Stock</th>
                  <th>Reorder At</th>
                  <th>Supplier</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((m) => (
                  <tr key={m.id}>
                    <td className="font-mono text-[12px] text-amber-500">{m.sku}</td>
                    <td>{m.name}</td>
                    <td>
                      {m.inStock} {m.unit}
                    </td>
                    <td>
                      {m.reorderAt} {m.unit}
                    </td>
                    <td className="text-neutral-500">{m.supplier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
