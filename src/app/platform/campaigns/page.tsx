"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus, Mail, Eye, MousePointerClick, Send, Trash2 } from "lucide-react";

type Campaign = {
  id: string;
  subject: string;
  preview_text: string | null;
  audience: string;
  status: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  sent_at: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "text-neutral-400",
  sending: "text-amber-500",
  sent: "text-emerald-400",
  failed: "text-red-400",
};

export default function CampaignsPage() {
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("email_campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    setCampaigns((data || []) as Campaign[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { reload(); }, [reload]);

  const deleteCampaign = async (id: string) => {
    await supabase.from("email_campaigns").delete().eq("id", id);
    setCampaigns((c) => c.filter((x) => x.id !== id));
  };

  const totalSent = campaigns.reduce((s, c) => s + c.sent_count, 0);
  const totalOpens = campaigns.reduce((s, c) => s + c.open_count, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.click_count, 0);
  const avgOpenRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : "0";
  const avgClickRate = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : "0";

  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">Email Campaigns</h1>
          <p className="text-neutral-500 text-[14px]" style={{ marginTop: "4px" }}>
            {campaigns.length} campaigns created
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/platform/campaigns/reports" className="btn">
            View Reports
          </Link>
          <Link href="/platform/campaigns/new" className="btn btn-primary">
            <Plus className="w-4 h-4" /> New Campaign
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3" style={{ marginBottom: "28px" }}>
        <div className="card" style={{ padding: "16px" }}>
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Campaigns</div>
          <div className="text-2xl font-extrabold" style={{ marginTop: "4px" }}>{campaigns.length}</div>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Emails Sent</div>
          <div className="text-2xl font-extrabold" style={{ marginTop: "4px" }}>{totalSent}</div>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Opens</div>
          <div className="text-2xl font-extrabold text-amber-500" style={{ marginTop: "4px" }}>{totalOpens}</div>
          <div className="text-[11px] text-neutral-500">{avgOpenRate}% rate</div>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Clicks</div>
          <div className="text-2xl font-extrabold text-amber-500" style={{ marginTop: "4px" }}>{totalClicks}</div>
          <div className="text-[11px] text-neutral-500">{avgClickRate}% rate</div>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Sent This Month</div>
          <div className="text-2xl font-extrabold" style={{ marginTop: "4px" }}>
            {campaigns.filter((c) => c.status === "sent" && c.sent_at && c.sent_at > new Date(Date.now() - 30 * 86400000).toISOString()).length}
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Audience</th>
              <th>Status</th>
              <th>Sent</th>
              <th>Opens</th>
              <th>Clicks</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={`/platform/campaigns/${c.id}`} className="font-semibold text-white hover:text-amber-500">
                    {c.subject}
                  </Link>
                </td>
                <td className="text-[12px]">{c.audience.replace(/_/g, " ")}</td>
                <td>
                  <span className={`chip font-semibold ${STATUS_COLORS[c.status] || ""}`}>{c.status}</span>
                </td>
                <td className="font-bold text-white">{c.sent_count}</td>
                <td>
                  <span className="text-amber-500 font-bold">{c.open_count}</span>
                  {c.sent_count > 0 && (
                    <span className="text-neutral-600 text-[11px] ml-1">
                      ({((c.open_count / c.sent_count) * 100).toFixed(0)}%)
                    </span>
                  )}
                </td>
                <td>
                  <span className="text-amber-500 font-bold">{c.click_count}</span>
                </td>
                <td className="text-[12px] text-neutral-500">
                  {c.sent_at ? c.sent_at.slice(0, 10) : c.created_at?.slice(0, 10)}
                </td>
                <td>
                  {c.status === "draft" && (
                    <button className="text-neutral-700 hover:text-red-400" onClick={() => { if (confirm("Delete this campaign?")) deleteCampaign(c.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-neutral-600" style={{ padding: "40px 16px" }}>
                  {loading ? "Loading..." : "No campaigns yet. Create your first one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
