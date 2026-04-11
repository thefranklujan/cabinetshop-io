import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Building2, DollarSign, Users, Hammer, TrendingUp, AlertTriangle,
  Database, Mail, MousePointerClick, Eye, Receipt,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function PlatformDashboard() {
  const supabase = createClient();
  const { data: stats, error } = await supabase.rpc("platform_stats");

  if (error) {
    return (
      <div className="card" style={{ padding: "32px" }}>
        <h1 className="text-xl font-bold" style={{ marginBottom: "8px" }}>Platform Stats Error</h1>
        <pre className="text-red-400 text-[12px]">{error.message}</pre>
      </div>
    );
  }

  const s = stats as any;
  const arr = (s?.mrr || 0) * 12;

  return (
    <>
      <div style={{ marginBottom: "32px" }}>
        <h1 className="text-[32px] font-extrabold tracking-tight">SaaS Owner Dashboard</h1>
        <p className="text-neutral-500 text-[14px]" style={{ marginTop: "4px" }}>
          Operational view of CabinetShop.io. Live numbers from production Supabase.
        </p>
      </div>

      {/* Revenue Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ marginBottom: "12px" }}>
        <KPI label="Total Shops" value={s.total_shops} sub={`+${s.shops_this_month} this month`} icon={Building2} accent />
        <KPI label="MRR" value={fmtMoney(s.mrr)} sub={`${fmtMoney(arr)} ARR`} icon={DollarSign} accent />
        <KPI label="Paying Shops" value={s.paying_shops} sub={`${s.total_shops - s.paying_shops} on free tier`} icon={TrendingUp} />
        <KPI label="Total Users" value={s.total_users} sub={`+${s.users_this_week} this week`} icon={Users} />
      </div>

      {/* Platform Usage Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ marginBottom: "12px" }}>
        <KPI label="Total Projects" value={s.total_projects} sub={fmtMoney(s.total_contract_value) + " contract value"} icon={Hammer} />
        <KPI label="Invoiced" value={fmtMoney(s.invoiced_total)} sub={`${s.total_invoices} invoices issued`} icon={Receipt} />
        <KPI label="Clients in System" value={s.total_clients} icon={Users} />
        <KPI label="Team Members" value={s.total_members} sub="across all shops" icon={Users} />
      </div>

      {/* Outreach Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ marginBottom: "32px" }}>
        <KPI label="Prospects in DB" value={s.total_prospects} sub={`${s.prospects_contacted} contacted`} icon={Database} accent />
        <KPI label="Campaigns Sent" value={s.campaigns_sent} sub={`${s.total_campaigns} total created`} icon={Mail} accent />
        <KPI label="Email Opens" value={s.total_opens} icon={Eye} />
        <KPI label="Email Clicks" value={s.total_clicks} icon={MousePointerClick} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Signups */}
        <div className="card lg:col-span-2" style={{ padding: "24px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
            <h2 className="text-[15px] font-bold">Recent Signups</h2>
            <Link href="/platform/shops" className="text-[12px] text-amber-500 font-semibold">
              All shops
            </Link>
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
                      <span className="text-neutral-600"> jobs </span>
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

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 className="text-[15px] font-bold" style={{ marginBottom: "16px" }}>Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/platform/database" className="btn w-full justify-center">
                <Database className="w-4 h-4" /> Add Prospects
              </Link>
              <Link href="/platform/campaigns/new" className="btn btn-primary w-full justify-center">
                <Mail className="w-4 h-4" /> New Campaign
              </Link>
            </div>
          </div>

          {/* Stuck Shops */}
          <div className="card" style={{ padding: "24px", borderColor: "rgba(127,29,29,.4)" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
              <h2 className="text-[15px] font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Needs Help
              </h2>
              <span className="chip" style={{ background: "rgba(239,68,68,.1)", borderColor: "rgba(239,68,68,.3)", color: "#f87171" }}>
                {s.stuck_shops?.length || 0}
              </span>
            </div>
            <p className="text-[11px] text-neutral-600" style={{ marginBottom: "16px" }}>3+ days old, 0 jobs and 0 clients.</p>
            {(!s.stuck_shops || s.stuck_shops.length === 0) ? (
              <div className="text-emerald-400 text-[13px]">All shops are active</div>
            ) : (
              <div className="space-y-3">
                {s.stuck_shops.map((w: any) => (
                  <div key={w.id} style={{ borderBottom: "1px solid #1a1a1a", paddingBottom: "12px" }}>
                    <div className="text-[13px] font-bold text-white">{w.name}</div>
                    <div className="text-[11px] text-neutral-500">{w.owner_email}</div>
                    <div className="text-[11px] text-red-400" style={{ marginTop: "4px" }}>
                      Since {w.created_at?.slice(0, 10)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Prospects */}
          <div className="card" style={{ padding: "24px" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
              <h2 className="text-[15px] font-bold">Recent Prospects</h2>
              <Link href="/platform/database" className="text-[12px] text-amber-500 font-semibold">
                Database
              </Link>
            </div>
            {(!s.recent_prospects || s.recent_prospects.length === 0) ? (
              <div className="text-neutral-600 text-[13px]">No prospects yet. Start building your database.</div>
            ) : (
              <div className="space-y-3">
                {s.recent_prospects.map((p: any) => (
                  <div key={p.id} style={{ borderBottom: "1px solid #1a1a1a", paddingBottom: "12px" }}>
                    <div className="text-[13px] font-bold text-white">{p.name}</div>
                    <div className="text-[11px] text-neutral-500">
                      {p.city}{p.state ? `, ${p.state}` : ""} {p.owner_name ? `(${p.owner_name})` : ""}
                    </div>
                    <span className="chip" style={{ marginTop: "4px" }}>{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function KPI({
  label, value, sub, icon: Icon, accent,
}: {
  label: string; value: any; sub?: string; icon: any; accent?: boolean;
}) {
  return (
    <div className={`card ${accent ? "border-amber-500/40 bg-amber-500/5" : ""}`} style={{ padding: "20px" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
        <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">{label}</span>
        <Icon className={`w-4 h-4 ${accent ? "text-amber-500" : "text-neutral-600"}`} />
      </div>
      <div className="text-2xl font-extrabold tracking-tight">{value}</div>
      {sub && <div className="text-[11px] text-neutral-500" style={{ marginTop: "4px" }}>{sub}</div>}
    </div>
  );
}
