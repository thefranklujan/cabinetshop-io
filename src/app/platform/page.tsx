import { createClient } from "@/lib/supabase/server";
import { Building2, DollarSign, Users, Hammer, TrendingUp, AlertTriangle, Package, Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function PlatformDashboard() {
  const supabase = createClient();
  const { data: stats, error } = await supabase.rpc("platform_stats");

  if (error) {
    return (
      <div className="card p-8">
        <h1 className="text-xl font-bold mb-2">Platform Stats Error</h1>
        <pre className="text-red-400 text-[12px]">{error.message}</pre>
      </div>
    );
  }

  const s = stats as any;
  const arr = (s?.mrr || 0) * 12;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[32px] font-extrabold tracking-tight">SaaS Owner Dashboard</h1>
        <p className="text-neutral-500 text-[14px] mt-1">
          Operational view of CabinetShop.io. Live numbers from production Supabase.
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <KPI label="Total Shops" value={s.total_shops} sub={`+${s.shops_this_month} this month`} icon={Building2} accent />
        <KPI label="MRR" value={fmtMoney(s.mrr)} sub={`${fmtMoney(arr)} ARR`} icon={DollarSign} accent />
        <KPI label="Paying Shops" value={s.paying_shops} sub={`${s.total_shops - s.paying_shops} on free tier`} icon={TrendingUp} />
        <KPI label="Total Users" value={s.total_users} sub={`+${s.users_this_week} this week`} icon={Users} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <KPI label="New Shops (7d)" value={s.shops_this_week} sub="signups this week" icon={Building2} />
        <KPI label="Team Members" value={s.total_members} sub="across all shops" icon={Users} />
        <KPI label="Total Projects" value={s.total_projects} sub={`${fmtMoney(s.total_contract_value)} contract value`} icon={Hammer} />
        <KPI label="Invoiced" value={fmtMoney(s.invoiced_total)} sub={`${s.total_invoices} invoices issued`} icon={Receipt} />
      </div>

      <div className="grid lg:grid-cols-3 gap-3 mb-8">
        <KPI label="Clients in System" value={s.total_clients} icon={Users} small />
        <KPI label="Materials Tracked" value={s.total_materials} icon={Package} small />
        <KPI label="Purchase Orders" value={s.total_pos} icon={Package} small />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Signups */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold">Recent Signups</h2>
            <span className="chip chip-accent">{s.recent_shops?.length || 0}</span>
          </div>
          {(!s.recent_shops || s.recent_shops.length === 0) ? (
            <div className="text-neutral-600 text-[13px]">No shops yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Owner</th>
                  <th>Plan</th>
                  <th>Members</th>
                  <th>Activity</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {s.recent_shops.map((w: any) => (
                  <tr key={w.id}>
                    <td className="font-semibold text-white">{w.name}</td>
                    <td className="text-[12px] text-neutral-400">{w.owner_email}</td>
                    <td>
                      <span className={`chip ${w.plan === "starter" ? "" : "chip-accent"}`}>{w.plan}</span>
                    </td>
                    <td className="font-bold text-white">{w.members}</td>
                    <td className="text-[12px]">
                      <span className="text-amber-500 font-bold">{w.projects}</span>
                      <span className="text-neutral-600"> jobs · </span>
                      <span className="text-amber-500 font-bold">{w.clients}</span>
                      <span className="text-neutral-600"> clients</span>
                    </td>
                    <td className="text-[12px] text-neutral-500">{w.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stuck Shops */}
        <div className="card p-6 border-red-900/40">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Needs Onboarding Help
            </h2>
            <span className="chip" style={{ background: "rgba(239,68,68,.1)", borderColor: "rgba(239,68,68,.3)", color: "#f87171" }}>
              {s.stuck_shops?.length || 0}
            </span>
          </div>
          <p className="text-[11px] text-neutral-600 mb-4">3+ days old, 0 jobs and 0 clients added.</p>
          {(!s.stuck_shops || s.stuck_shops.length === 0) ? (
            <div className="text-emerald-400 text-[13px]">All shops are active ✓</div>
          ) : (
            <div className="space-y-3">
              {s.stuck_shops.map((w: any) => (
                <div key={w.id} className="border-b border-neutral-900 pb-3 last:border-0 last:pb-0">
                  <div className="text-[13px] font-bold text-white">{w.name}</div>
                  <div className="text-[11px] text-neutral-500">{w.owner_email}</div>
                  <div className="text-[11px] text-red-400 mt-1">
                    Stuck since {w.created_at?.slice(0, 10)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function KPI({
  label, value, sub, icon: Icon, accent, small,
}: {
  label: string; value: any; sub?: string; icon: any; accent?: boolean; small?: boolean;
}) {
  return (
    <div className={`card ${small ? "p-4" : "p-5"} ${accent ? "border-amber-500/40 bg-amber-500/5" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">{label}</span>
        <Icon className={`w-4 h-4 ${accent ? "text-amber-500" : "text-neutral-600"}`} />
      </div>
      <div className={`${small ? "text-xl" : "text-2xl"} font-extrabold tracking-tight`}>{value}</div>
      {sub && <div className="text-[11px] text-neutral-500 mt-1">{sub}</div>}
    </div>
  );
}
