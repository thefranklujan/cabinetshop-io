"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Trash2, Search, Upload, Download, Phone, Mail, MapPin, Building2,
} from "lucide-react";

type Prospect = {
  id: string;
  name: string;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  source: string;
  status: string;
  employee_count: number | null;
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
};

const STATUS_OPTIONS = ["prospect", "contacted", "interested", "demo_scheduled", "signed_up", "not_interested", "dead"];
const STATUS_COLORS: Record<string, string> = {
  prospect: "text-neutral-400",
  contacted: "text-blue-400",
  interested: "text-amber-500",
  demo_scheduled: "text-purple-400",
  signed_up: "text-emerald-400",
  not_interested: "text-neutral-600",
  dead: "text-red-400",
};

export default function DatabasePage() {
  const supabase = createClient();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState({
    name: "", owner_name: "", email: "", phone: "", address: "", city: "", state: "", zip: "",
    website: "", source: "manual", status: "prospect", employee_count: 0, notes: "",
  });

  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("shop_database")
      .select("*")
      .order("created_at", { ascending: false });
    setProspects((data || []) as Prospect[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { reload(); }, [reload]);

  const addProspect = async () => {
    if (!form.name) return;
    await supabase.from("shop_database").insert({
      name: form.name,
      owner_name: form.owner_name || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      zip: form.zip || null,
      website: form.website || null,
      source: form.source,
      status: form.status,
      employee_count: form.employee_count || null,
      notes: form.notes || null,
    });
    setOpen(false);
    setForm({ name: "", owner_name: "", email: "", phone: "", address: "", city: "", state: "", zip: "", website: "", source: "manual", status: "prospect", employee_count: 0, notes: "" });
    reload();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("shop_database").update({ status }).eq("id", id);
    setProspects((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const deleteProspect = async (id: string) => {
    await supabase.from("shop_database").delete().eq("id", id);
    setProspects((p) => p.filter((x) => x.id !== id));
  };

  const exportCSV = () => {
    const headers = ["name", "owner_name", "email", "phone", "city", "state", "status", "source"];
    const rows = prospects.map((p) => headers.map((h) => (p as any)[h] || "").join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shop_database.csv";
    a.click();
  };

  const filtered = prospects
    .filter((p) => statusFilter === "All" || p.status === statusFilter)
    .filter((p) => {
      if (!q) return true;
      const hay = `${p.name} ${p.owner_name || ""} ${p.email || ""} ${p.city || ""} ${p.state || ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });

  const statusCounts = STATUS_OPTIONS.map((s) => ({
    status: s,
    count: prospects.filter((p) => p.status === s).length,
  }));

  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">Shop Database</h1>
          <p className="text-neutral-500 text-[14px]" style={{ marginTop: "4px" }}>
            {prospects.length} cabinet shops in your outreach pipeline
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn"><Download className="w-4 h-4" /> Export CSV</button>
          <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> Add Shop</button>
        </div>
      </div>

      {/* Status Chips */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setStatusFilter("All")}
          className={`text-[12px] font-semibold transition ${statusFilter === "All" ? "bg-amber-500 text-ink" : "bg-[#141414] border border-line text-neutral-400 hover:text-white"}`}
          style={{ padding: "8px 16px", borderRadius: "8px" }}
        >
          All ({prospects.length})
        </button>
        {statusCounts.map((s) => (
          <button
            key={s.status}
            onClick={() => setStatusFilter(s.status)}
            className={`text-[12px] font-semibold transition ${statusFilter === s.status ? "bg-amber-500 text-ink" : "bg-[#141414] border border-line text-neutral-400 hover:text-white"}`}
            style={{ padding: "8px 16px", borderRadius: "8px" }}
          >
            {s.status.replace(/_/g, " ")} ({s.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative" style={{ marginBottom: "20px", maxWidth: "400px" }}>
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shops, owners, cities..." className="input" style={{ paddingLeft: "36px" }} />
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Shop Name</th>
              <th>Owner</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Status</th>
              <th>Source</th>
              <th>Added</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="font-semibold text-white">{p.name}</td>
                <td>{p.owner_name || ""}</td>
                <td className="text-[12px]">{p.email || ""}</td>
                <td className="text-[12px]">{p.phone || ""}</td>
                <td className="text-[12px] text-neutral-400">
                  {[p.city, p.state].filter(Boolean).join(", ")}
                </td>
                <td>
                  <select
                    value={p.status}
                    onChange={(e) => updateStatus(p.id, e.target.value)}
                    className={`bg-transparent border border-neutral-800 rounded text-[12px] font-semibold ${STATUS_COLORS[p.status] || ""}`}
                    style={{ padding: "4px 8px" }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </td>
                <td className="text-[11px] text-neutral-500">{p.source}</td>
                <td className="text-[12px] text-neutral-500">{p.created_at?.slice(0, 10)}</td>
                <td>
                  <button className="text-neutral-700 hover:text-red-400" onClick={() => { if (confirm(`Delete ${p.name}?`)) deleteProspect(p.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-neutral-600" style={{ padding: "40px 16px" }}>
                  {loading ? "Loading..." : "No prospects found. Add your first shop."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" style={{ padding: "16px" }}>
          <div className="card max-w-2xl w-full" style={{ padding: "28px" }}>
            <h2 className="text-xl font-bold" style={{ marginBottom: "20px" }}>Add Cabinet Shop</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><div className="label">Shop Name *</div><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Cabinet Co" /></div>
              <div><div className="label">Owner Name</div><input className="input" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} /></div>
              <div><div className="label">Email</div><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><div className="label">Phone</div><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="col-span-2"><div className="label">Address</div><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><div className="label">City</div><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><div className="label">State</div><input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
              <div><div className="label">Zip</div><input className="input" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} /></div>
              <div><div className="label">Website</div><input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
              <div><div className="label">Employees</div><input type="number" className="input" value={form.employee_count} onChange={(e) => setForm({ ...form, employee_count: +e.target.value })} /></div>
              <div>
                <div className="label">Source</div>
                <select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                  <option value="manual">Manual</option>
                  <option value="google">Google Search</option>
                  <option value="referral">Referral</option>
                  <option value="social">Social Media</option>
                  <option value="directory">Directory</option>
                  <option value="import">Import</option>
                </select>
              </div>
              <div className="col-span-2"><div className="label">Notes</div><textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 justify-end" style={{ marginTop: "24px" }}>
              <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addProspect}>Add Shop</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
