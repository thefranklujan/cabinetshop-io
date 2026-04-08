"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore, fmtMoney } from "@/lib/store";
import { STAGES } from "@/lib/types";

export default function ReportsPage() {
  const { projects, clients, invoices, materials, time } = useStore();

  const revenueByClient = clients
    .map((c) => ({
      name: c.name,
      total: projects.filter((p) => p.clientId === c.id).reduce((s, p) => s + p.contractTotal, 0),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const stageValue = STAGES.map((s) => ({
    stage: s,
    value: projects.filter((p) => p.stage === s).reduce((sum, p) => sum + p.contractTotal, 0),
  }));

  const inventoryValue = materials.reduce((s, m) => s + m.costPerUnit * m.inStock, 0);
  const totalContract = projects.reduce((s, p) => s + p.contractTotal, 0);
  const totalCollected = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const totalHours = time.reduce((s, t) => s + (t.hours || 0), 0);
  const maxRev = Math.max(...revenueByClient.map((r) => r.total), 1);
  const maxStage = Math.max(...stageValue.map((s) => s.value), 1);

  return (
    <>
      <PageHeader title="Reports & KPIs" sub="Numbers that actually run a cabinet shop." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        <div className="card p-5"><div className="label">Total Contract Volume</div><div className="text-2xl font-extrabold text-amber-500">{fmtMoney(totalContract)}</div></div>
        <div className="card p-5"><div className="label">Cash Collected</div><div className="text-2xl font-extrabold text-emerald-400">{fmtMoney(totalCollected)}</div></div>
        <div className="card p-5"><div className="label">Inventory On Hand</div><div className="text-2xl font-extrabold text-white">{fmtMoney(inventoryValue)}</div></div>
        <div className="card p-5"><div className="label">Shop Hours Logged</div><div className="text-2xl font-extrabold text-white">{totalHours.toFixed(1)}h</div></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-[15px] font-bold mb-5">Revenue by Client</h2>
          <div className="space-y-3">
            {revenueByClient.map((r) => (
              <div key={r.name}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-neutral-300 font-medium">{r.name}</span>
                  <span className="text-amber-500 font-bold">{fmtMoney(r.total)}</span>
                </div>
                <div className="h-2 bg-neutral-900 rounded overflow-hidden">
                  <div className="h-full bg-amber-500/80" style={{ width: `${(r.total / maxRev) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-[15px] font-bold mb-5">Pipeline Value by Stage</h2>
          <div className="space-y-3">
            {stageValue.map((s) => (
              <div key={s.stage}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-neutral-300 font-medium">{s.stage}</span>
                  <span className="text-amber-500 font-bold">{fmtMoney(s.value)}</span>
                </div>
                <div className="h-2 bg-neutral-900 rounded overflow-hidden">
                  <div className="h-full bg-amber-500/80" style={{ width: `${(s.value / maxStage) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
