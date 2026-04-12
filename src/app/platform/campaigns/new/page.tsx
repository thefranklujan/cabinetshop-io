"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Send, Eye } from "lucide-react";
import Link from "next/link";

const AUDIENCES = [
  { value: "all_prospects", label: "All Prospects (entire database)" },
  { value: "prospects_only", label: "New Prospects Only (not yet contacted)" },
  { value: "contacted", label: "Contacted (follow up)" },
  { value: "interested", label: "Interested (warm leads)" },
  { value: "all_users", label: "All Platform Users (signed up shops)" },
];

const TEMPLATES = [
  {
    name: "Introduction",
    subject: "The operating system your cabinet shop is missing",
    html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fafaf7; padding: 40px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <span style="font-size: 20px; font-weight: 800;">CabinetShop<span style="color: #f59e0b;">.io</span></span>
  </div>
  <h1 style="font-size: 28px; font-weight: 800; line-height: 1.2; margin-bottom: 16px;">Stop running your shop from a whiteboard and a group text.</h1>
  <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">CabinetShop.io is the operating system built specifically for custom cabinet shops. Track every job from quote to install, manage materials and cut lists, clock shop hours, and finally know which jobs are making you money.</p>
  <ul style="color: #d4d4d4; font-size: 14px; line-height: 2; margin-bottom: 28px; padding-left: 20px;">
    <li>13-stage production pipeline tuned for cabinet shops</li>
    <li>Materials & inventory with low stock alerts</li>
    <li>Cut lists your shop floor can check off</li>
    <li>Shop floor time tracking per job per stage</li>
    <li>Invoicing, POs, and real financial KPIs</li>
  </ul>
  <div style="text-align: center; margin: 32px 0;">
    <a href="https://cabinetshop.io/sign-up" style="background: #f59e0b; color: #0a0a0a; font-weight: 700; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block;">Start free today</a>
  </div>
  <p style="color: #737373; font-size: 13px; text-align: center;">Free forever to start. No credit card required.</p>
  <hr style="border: none; border-top: 1px solid #262626; margin: 32px 0;" />
  <p style="color: #525252; font-size: 11px; text-align: center;">By CabinetShop.io 2026 Austin, TX<br/><a href="{unsubscribe_url}" style="color: #525252;">Unsubscribe</a></p>
</div>`,
  },
  {
    name: "Follow Up",
    subject: "Quick question about your shop",
    html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fafaf7; padding: 40px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <span style="font-size: 20px; font-weight: 800;">CabinetShop<span style="color: #f59e0b;">.io</span></span>
  </div>
  <p style="color: #d4d4d4; font-size: 15px; line-height: 1.7;">Hey,</p>
  <p style="color: #d4d4d4; font-size: 15px; line-height: 1.7;">I reached out recently about CabinetShop.io. Just wanted to check in.</p>
  <p style="color: #d4d4d4; font-size: 15px; line-height: 1.7;">We built this because we run a cabinet shop ourselves and were tired of spreadsheets, whiteboards, and group texts. If you are dealing with any of these:</p>
  <ul style="color: #a3a3a3; font-size: 14px; line-height: 2; margin-bottom: 20px; padding-left: 20px;">
    <li>Quoting takes forever and you are underpricing jobs</li>
    <li>No idea which jobs are actually profitable</li>
    <li>Materials run out the morning of a delivery</li>
    <li>Your foreman calls you 6 times a day for status</li>
  </ul>
  <p style="color: #d4d4d4; font-size: 15px; line-height: 1.7;">CabinetShop.io solves all of these. Free to start, takes 60 seconds to set up.</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="https://cabinetshop.io/sign-up" style="background: #f59e0b; color: #0a0a0a; font-weight: 700; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block;">Try it free</a>
  </div>
  <p style="color: #737373; font-size: 13px;">Frank Lujan<br/>Founder, CabinetShop.io</p>
  <hr style="border: none; border-top: 1px solid #262626; margin: 32px 0;" />
  <p style="color: #525252; font-size: 11px; text-align: center;">By CabinetShop.io 2026 Austin, TX<br/><a href="{unsubscribe_url}" style="color: #525252;">Unsubscribe</a></p>
</div>`,
  },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const supabase = createClient();
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [audience, setAudience] = useState("all_prospects");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  const [err, setErr] = useState("");

  const fetchCount = useCallback(async () => {
    let query = supabase.from("shop_database").select("id", { count: "exact", head: true });
    if (audience === "prospects_only") query = query.eq("status", "prospect");
    else if (audience === "contacted") query = query.eq("status", "contacted");
    else if (audience === "interested") query = query.eq("status", "interested");
    // all_prospects = entire database, all_users = platform users
    const { count } = await query;
    setRecipientCount(count || 0);
  }, [supabase, audience]);

  useEffect(() => { fetchCount(); }, [fetchCount]);

  const loadTemplate = (idx: number) => {
    setSubject(TEMPLATES[idx].subject);
    setHtml(TEMPLATES[idx].html);
  };

  const saveDraft = async () => {
    if (!subject || !html) return setErr("Subject and body are required.");
    setSaving(true);
    setErr("");
    const { data, error } = await supabase.from("email_campaigns").insert({
      subject, html, preview_text: previewText || null, audience, status: "draft",
    }).select("id").single();
    setSaving(false);
    if (error) return setErr(error.message);
    router.push(`/platform/campaigns/${data.id}`);
  };

  const saveAndSend = async () => {
    if (!subject || !html) return setErr("Subject and body are required.");
    if (!confirm(`Send this campaign to ~${recipientCount} recipients?`)) return;
    setSending(true);
    setErr("");
    const { data, error } = await supabase.from("email_campaigns").insert({
      subject, html, preview_text: previewText || null, audience, status: "draft",
    }).select("id").single();
    if (error) { setSending(false); return setErr(error.message); }

    const res = await fetch("/api/platform/campaigns/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: data.id }),
    });
    setSending(false);
    if (!res.ok) {
      const body = await res.json();
      return setErr(body.error || "Failed to send");
    }
    router.push(`/platform/campaigns/${data.id}`);
  };

  return (
    <>
      <div className="flex items-center gap-4" style={{ marginBottom: "28px" }}>
        <Link href="/platform/campaigns" className="text-neutral-500 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">New Campaign</h1>
          <p className="text-neutral-500 text-[14px]" style={{ marginTop: "4px" }}>
            Compose and send to your shop database
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card" style={{ padding: "24px" }}>
            <div className="label">Subject Line</div>
            <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="The operating system your cabinet shop is missing" />
            <div className="label" style={{ marginTop: "16px" }}>Preview Text (optional)</div>
            <input className="input" value={previewText} onChange={(e) => setPreviewText(e.target.value)} placeholder="Shows after subject in inbox" />
            <div className="label" style={{ marginTop: "16px" }}>Email Body (HTML)</div>
            <textarea
              className="input font-mono text-[12px]"
              rows={20}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="Paste or write your HTML email body..."
              style={{ lineHeight: "1.5" }}
            />
            {err && <div className="text-red-400 text-[12px]" style={{ marginTop: "12px" }}>{err}</div>}
          </div>

          {/* Preview */}
          {preview && html && (
            <div className="card" style={{ padding: "24px" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
                <h2 className="text-[15px] font-bold">Preview</h2>
                <button onClick={() => setPreview(false)} className="text-[12px] text-neutral-500">Close</button>
              </div>
              <div
                className="rounded-lg overflow-hidden"
                style={{ background: "#fff", padding: "0" }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Templates */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 className="text-[15px] font-bold" style={{ marginBottom: "16px" }}>Templates</h2>
            <div className="space-y-2">
              {TEMPLATES.map((t, i) => (
                <button key={t.name} onClick={() => loadTemplate(i)} className="btn w-full justify-center text-[12px]">
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 className="text-[15px] font-bold" style={{ marginBottom: "16px" }}>Audience</h2>
            <select className="input" value={audience} onChange={(e) => setAudience(e.target.value)}>
              {AUDIENCES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
            <div className="text-[13px] text-amber-500 font-bold" style={{ marginTop: "12px" }}>
              ~{recipientCount} recipients
            </div>
          </div>

          {/* Actions */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 className="text-[15px] font-bold" style={{ marginBottom: "16px" }}>Actions</h2>
            <div className="space-y-2">
              <button onClick={() => setPreview(!preview)} className="btn w-full justify-center">
                <Eye className="w-4 h-4" /> {preview ? "Hide Preview" : "Preview"}
              </button>
              <button onClick={saveDraft} disabled={saving} className="btn w-full justify-center">
                {saving ? "Saving..." : "Save as Draft"}
              </button>
              <button onClick={saveAndSend} disabled={sending} className="btn btn-primary w-full justify-center">
                <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
