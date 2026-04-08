"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore, fmtMoney } from "@/lib/store";
import { STAGES } from "@/lib/types";
import { TrendingUp, Hammer, AlertTriangle, DollarSign, Package, Users } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { projects, clients, materials, invoices, schedule } = useStore();

  const wipProjects = projects.filter((p) => p.stage !== "Quote" && p.stage !== "Complete");
  const wipValue = wipProjects.reduce((s, p) => s + p.contractTotal, 0);
  const collected = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  const lowStock = materials.filter((m) => m.inStock <= m.reorderAt);

  const stageCount = STAGES.map((stage) => ({
    stage,
    count: projects.filter((p) => p.stage === stage).length,
  }));

  const upcoming = [...schedule]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const kpi = [
    { label: "Active Jobs", value: wipProjects.length, icon: Hammer, accent: true },
    { label: "WIP Value", value: fmtMoney(wipValue), icon: TrendingUp },
    { label: "Collected", value: fmtMoney(collected), icon: DollarSign },
    { label: "Outstanding", value: fmtMoney(outstanding), icon: AlertTriangle },
    { label: "Clients", value: clients.length, icon: Users },
    { label: "Low Stock", value: lowStock.length, icon: Package },
  ];

  return (
    <>
      <PageHeader
        title="Shop Dashboard"
        sub="Real time view of every job, every dollar, every bottleneck."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-8">
        {kpi.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className={`card p-4 ${k.accent ? "border-amber-500/40 bg-amber-500/5" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
                  {k.label}
                </span>
                <Icon className={`w-4 h-4 ${k.accent ? "text-amber-500" : "text-neutral-600"}`} />
              </div>
              <div className="text-2xl font-extrabold tracking-tight">{k.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stage Distribution */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold">Production Pipeline</h2>
            <Link href="/app/board" className="text-[12px] text-amber-500 font-semibold">
              Open board →
            </Link>
          </div>
          <div className="space-y-2">
            {stageCount.map((s) => {
              const max = Math.max(...stageCount.map((x) => x.count), 1);
              const pct = (s.count / max) * 100;
              return (
                <div key={s.stage} className="flex items-center gap-3">
                  <div className="w-24 text-[12px] text-neutral-400 font-medium">{s.stage}</div>
                  <div className="flex-1 h-6 bg-neutral-900 rounded overflow-hidden">
                    <div
                      className="h-full bg-amber-500/80 flex items-center justify-end pr-2 text-[11px] font-bold text-ink"
                      style={{ width: `${pct}%`, minWidth: s.count ? "24px" : 0 }}
                    >
                      {s.count > 0 ? s.count : ""}
                    </div>
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
                      {new Date(e.date).toLocaleString("en-US", { month: "short" })}
                    </div>
                    <div className="text-xl font-extrabold">{new Date(e.date).getDate()}</div>
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
