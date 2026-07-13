"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Check, AlertTriangle } from "lucide-react";
import TemplateManager from "@/components/TemplateManager";

const CURRENCIES = ["USD", "CAD", "EUR", "GBP", "MXN", "AUD"];

type SettingsForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  hourlyRate: string;
  taxRate: string;
  currency: string;
};

const EMPTY: SettingsForm = {
  name: "", email: "", phone: "", address: "", hourlyRate: "", taxRate: "", currency: "USD",
};

export default function SettingsPage() {
  const { workspaceId, canManage } = useStore();
  const supabase = createClient();
  const router = useRouter();

  const [form, setForm] = useState<SettingsForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("workspaces")
        .select("name, email, phone, address, hourly_rate, tax_rate, currency")
        .eq("id", workspaceId)
        .single();
      if (!active) return;
      if (data) {
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          hourlyRate: data.hourly_rate != null ? String(data.hourly_rate) : "",
          taxRate: data.tax_rate != null ? String(data.tax_rate) : "",
          currency: data.currency ?? "USD",
        });
      } else if (error) {
        setMsg({ type: "err", text: "Could not load settings." });
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [workspaceId, supabase]);

  const set = (patch: Partial<SettingsForm>) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    if (!canManage || !workspaceId || saving) return;
    if (!form.name.trim()) { setMsg({ type: "err", text: "Shop name is required." }); return; }
    setSaving(true);
    setMsg(null);
    // Whitelisted payload only — never plan / slug / owner_id (also frozen at the DB layer).
    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      hourly_rate: form.hourlyRate === "" ? null : Number(form.hourlyRate),
      tax_rate: form.taxRate === "" ? null : Number(form.taxRate),
      currency: form.currency || "USD",
    };
    const { error } = await supabase.from("workspaces").update(payload).eq("id", workspaceId);
    setSaving(false);
    if (error) {
      setMsg({ type: "err", text: error.message || "Save failed." });
    } else {
      setMsg({ type: "ok", text: "Settings saved." });
      router.refresh(); // refresh the shell so the workspace name updates
    }
  };

  const ro = !canManage;

  return (
    <>
      <PageHeader title="Settings" sub="Shop information and shop-wide defaults." />

      {ro && (
        <div className="card p-4 mb-6 text-[13px] text-neutral-400 border-amber-500/20">
          Settings are managed by the shop owner and admins. You have read-only access.
        </div>
      )}

      {msg && (
        <div
          className={`card p-3 mb-6 text-[13px] flex items-center gap-2 ${
            msg.type === "ok" ? "text-emerald-400 border-emerald-500/30" : "text-red-400 border-red-500/30"
          }`}
        >
          {msg.type === "ok" ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-[15px] font-bold mb-5">Shop Information</h2>
          {loading ? (
            <div className="flex items-center gap-2 text-neutral-500 text-[13px] py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading settings…
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="label">Shop Name</div>
                <input className="input disabled:opacity-60" disabled={ro || saving} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Acme Cabinet Co" />
              </div>
              <div>
                <div className="label">Business Email</div>
                <input type="email" className="input disabled:opacity-60" disabled={ro || saving} value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="hello@acmecabinets.com" />
              </div>
              <div>
                <div className="label">Phone</div>
                <input className="input disabled:opacity-60" disabled={ro || saving} value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="(512) 555-0100" />
              </div>
              <div>
                <div className="label">Address</div>
                <input className="input disabled:opacity-60" disabled={ro || saving} value={form.address} onChange={(e) => set({ address: e.target.value })} placeholder="123 Workshop Ln, Austin TX" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="label">Hourly Rate</div>
                  <input type="number" min="0" step="1" className="input disabled:opacity-60" disabled={ro || saving} value={form.hourlyRate} onChange={(e) => set({ hourlyRate: e.target.value })} placeholder="85" />
                </div>
                <div>
                  <div className="label">Tax Rate %</div>
                  <input type="number" min="0" step="0.001" className="input disabled:opacity-60" disabled={ro || saving} value={form.taxRate} onChange={(e) => set({ taxRate: e.target.value })} placeholder="8.25" />
                </div>
                <div>
                  <div className="label">Currency</div>
                  <select className="input disabled:opacity-60" disabled={ro || saving} value={form.currency} onChange={(e) => set({ currency: e.target.value })}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {!ro && (
                <div className="flex justify-end pt-2">
                  <button className="btn btn-primary" onClick={save} disabled={saving}>
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-[15px] font-bold mb-5">Production Stages</h2>
          <p className="text-[13px] text-neutral-500 mb-4">CabinetShop.io ships with 13 stages tuned for custom cabinet shops.</p>
          <div className="flex flex-wrap gap-2">
            {["Quote","Design","Approved","Materials","Cut/CNC","Assembly","Sanding","Finish","QC","Delivery","Install","Punch List","Complete"].map((s) => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>
          <p className="text-[11px] text-neutral-600 mt-5 border-t border-neutral-900 pt-4">
            Editable production stages are coming in a later release.
          </p>
        </div>
      </div>

      <TemplateManager />
    </>
  );
}
