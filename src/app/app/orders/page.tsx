"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore, fmtMoney } from "@/lib/store";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  Draft: "text-neutral-400",
  Sent: "text-blue-400",
  Confirmed: "text-amber-500",
  Received: "text-emerald-400",
  Closed: "text-neutral-600",
};

export default function OrdersPage() {
  const { pos, projects, addPO, updatePO, deletePO } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    poNumber: "", supplier: "", projectId: "", status: "Draft" as any,
    total: 0, items: [], expectedDate: "",
  });

  return (
    <>
      <PageHeader
        title="Purchase Orders"
        sub={`${pos.length} POs · ${fmtMoney(pos.reduce((s, p) => s + p.total, 0))} total committed`}
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New PO</button>}
      />

      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr><th>PO #</th><th>Supplier</th><th>Job</th><th>Status</th><th>Total</th><th>Expected</th><th>Created</th><th></th></tr>
          </thead>
          <tbody>
            {pos.map((p) => {
              const proj = projects.find((x) => x.id === p.projectId);
              return (
                <tr key={p.id}>
                  <td className="font-mono text-[12px] text-amber-500">{p.poNumber}</td>
                  <td className="font-semibold text-white">{p.supplier}</td>
                  <td>{proj?.name || "—"}</td>
                  <td>
                    <select
                      value={p.status}
                      onChange={(e) => updatePO(p.id, { status: e.target.value as any })}
                      className={`bg-transparent border border-neutral-800 rounded px-2 py-1 text-[12px] font-semibold ${STATUS_COLORS[p.status]}`}
                    >
                      <option>Draft</option><option>Sent</option><option>Confirmed</option><option>Received</option><option>Closed</option>
                    </select>
                  </td>
                  <td className="font-bold text-white">{fmtMoney(p.total)}</td>
                  <td>{p.expectedDate}</td>
                  <td className="text-neutral-500">{p.createdAt}</td>
                  <td>
                    <button className="text-neutral-700 hover:text-red-400" onClick={() => { if (confirm("Delete?")) deletePO(p.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-7">
            <h2 className="text-xl font-bold mb-5">New Purchase Order</h2>
            <div className="space-y-3">
              <div><div className="label">PO Number</div><input className="input" value={form.poNumber} onChange={(e) => setForm({ ...form, poNumber: e.target.value })} /></div>
              <div><div className="label">Supplier</div><input className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
              <div><div className="label">Project (optional)</div>
                <select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                  <option value="">— Stock —</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.jobNumber} · {p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="label">Total</div><input type="number" className="input" value={form.total} onChange={(e) => setForm({ ...form, total: +e.target.value })} /></div>
                <div><div className="label">Expected Date</div><input type="date" className="input" value={form.expectedDate} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} /></div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { if (form.supplier) { addPO(form); setOpen(false); setForm({ poNumber: "", supplier: "", projectId: "", status: "Draft", total: 0, items: [], expectedDate: "" }); } }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
