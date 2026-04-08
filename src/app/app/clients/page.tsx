"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore, fmtMoney } from "@/lib/store";
import { Plus, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export default function ClientsPage() {
  const { clients, projects, addClient, deleteClient } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "Homeowner" as any, email: "", phone: "", address: "", notes: "",
  });

  return (
    <>
      <PageHeader
        title="Clients"
        sub={`${clients.length} contacts in CRM`}
        action={<button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> New Client</button>}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c) => {
          const cProjects = projects.filter((p) => p.clientId === c.id);
          const lifetime = cProjects.reduce((s, p) => s + p.contractTotal, 0);
          return (
            <div key={c.id} className="card p-5 hover:border-amber-500/30 transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[16px] font-bold text-white">{c.name}</div>
                  <span className="chip mt-1">{c.type}</span>
                </div>
                <button
                  onClick={() => { if (confirm(`Delete ${c.name}?`)) deleteClient(c.id); }}
                  className="text-neutral-700 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5 text-[12px] text-neutral-400 mb-4">
                <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-neutral-600" /> {c.email}</div>
                <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-neutral-600" /> {c.phone}</div>
                <div className="flex items-center gap-2"><MapPin className="w-3 h-3 text-neutral-600" /> {c.address}</div>
              </div>
              <div className="flex justify-between pt-3 border-t border-neutral-900">
                <div>
                  <div className="text-[10px] uppercase text-neutral-600 font-bold">Projects</div>
                  <div className="text-lg font-extrabold text-white">{cProjects.length}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-neutral-600 font-bold">Lifetime</div>
                  <div className="text-lg font-extrabold text-amber-500">{fmtMoney(lifetime)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-7">
            <h2 className="text-xl font-bold mb-5">New Client</h2>
            <div className="space-y-3">
              <div><div className="label">Name</div><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><div className="label">Type</div>
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
                  <option>Homeowner</option><option>Designer</option><option>GC</option><option>Builder</option>
                </select>
              </div>
              <div><div className="label">Email</div><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><div className="label">Phone</div><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><div className="label">Address</div><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { if (form.name) { addClient(form); setOpen(false); setForm({ name: "", type: "Homeowner", email: "", phone: "", address: "", notes: "" }); } }}>Create Client</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
