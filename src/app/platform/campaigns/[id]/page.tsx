import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Eye, MousePointerClick, Mail, Users } from "lucide-react";
import CampaignActions from "./CampaignActions";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: campaign, error } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !campaign) redirect("/platform/campaigns");

  const { data: events } = await supabase
    .from("campaign_events")
    .select("*")
    .eq("campaign_id", params.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const c = campaign as any;
  const evts = (events || []) as any[];
  const openRate = c.sent_count > 0 ? ((c.open_count / c.sent_count) * 100).toFixed(1) : "0";
  const clickRate = c.sent_count > 0 ? ((c.click_count / c.sent_count) * 100).toFixed(1) : "0";

  return (
    <>
      <div className="flex items-center gap-4" style={{ marginBottom: "28px" }}>
        <Link href="/platform/campaigns" className="text-neutral-500 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-[28px] font-extrabold tracking-tight">{c.subject}</h1>
          <p className="text-neutral-500 text-[14px]" style={{ marginTop: "4px" }}>
            {c.audience.replace(/_/g, " ")} &middot; {c.status}
            {c.sent_at && ` &middot; Sent ${c.sent_at.slice(0, 10)}`}
          </p>
        </div>
        {c.status === "draft" && <CampaignActions campaignId={c.id} />}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3" style={{ marginBottom: "28px" }}>
        <div className="card" style={{ padding: "16px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Sent</span>
            <Mail className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-extrabold">{c.sent_count}</div>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Opens</span>
            <Eye className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-500">{c.open_count}</div>
          <div className="text-[11px] text-neutral-500">{openRate}% rate</div>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Clicks</span>
            <MousePointerClick className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-500">{c.click_count}</div>
          <div className="text-[11px] text-neutral-500">{clickRate}% rate</div>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Audience</span>
            <Users className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-[14px] font-bold">{c.audience.replace(/_/g, " ")}</div>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Status</span>
            <Send className="w-4 h-4 text-neutral-600" />
          </div>
          <span className={`chip font-semibold ${c.status === "sent" ? "chip-accent" : c.status === "draft" ? "" : "text-red-400"}`}>
            {c.status}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Email Preview */}
        <div className="card" style={{ padding: "24px" }}>
          <h2 className="text-[15px] font-bold" style={{ marginBottom: "16px" }}>Email Preview</h2>
          <div
            className="rounded-lg overflow-hidden"
            style={{ background: "#fff", maxHeight: "500px", overflowY: "auto" }}
            dangerouslySetInnerHTML={{ __html: c.html }}
          />
        </div>

        {/* Event Log */}
        <div className="card" style={{ padding: "24px" }}>
          <h2 className="text-[15px] font-bold" style={{ marginBottom: "16px" }}>
            Event Log ({evts.length})
          </h2>
          {evts.length === 0 ? (
            <div className="text-neutral-600 text-[13px]">No events recorded yet.</div>
          ) : (
            <div className="space-y-2" style={{ maxHeight: "460px", overflowY: "auto" }}>
              {evts.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between text-[12px]" style={{ padding: "8px 0", borderBottom: "1px solid #161616" }}>
                  <div>
                    <span className={`font-semibold ${e.event === "open" ? "text-amber-500" : e.event === "click" ? "text-emerald-400" : e.event === "bounce" ? "text-red-400" : "text-neutral-400"}`}>
                      {e.event}
                    </span>
                    <span className="text-neutral-500" style={{ marginLeft: "8px" }}>{e.email}</span>
                  </div>
                  <span className="text-neutral-600">{e.created_at?.slice(0, 16).replace("T", " ")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
