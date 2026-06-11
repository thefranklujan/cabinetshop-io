"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore, fmtMoney } from "@/lib/store";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const STATUS: Record<string, string> = {
  Draft: "text-neutral-400",
  Sent: "text-blue-400",
  Paid: "text-emerald-400",
  Overdue: "text-red-400",
};

export default function InvoicesPage() {
  const { invoices, projects, addInvoice, updateInvoice, deleteInvoice, canWrite, canManage } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    invoiceNumber: "", projectId: "", amount: 0, status: "Draft" as any, dueDate: "", issuedAt: "", isDeposit: false,
  });

  const totals = {
    paid: invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0),
    sent: invoices.filter((i) => i.status === "Sent").reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0),
    draft: invoices.filter((i) => i.status === "Draft").reduce((s, i) => s + i.amount, 0),
  };

  return (
    <>
      <PageHeader
        title="Invoices"
        sub={`${invoices.length} invoices on file`}
        action={canWrite ? <button className="btn btn-primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Invoice</button> : null}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="card p-4"><div className="label">Paid</div><div className="text-2xl font-extrabold text-emerald-400">{fmtMoney(totals.paid)}</div></div>
        <div className="card p-4"><div className="label">Sent</div><div className="text-2xl font-extrabold text-blue-400">{fmtMoney(totals.sent)}</div></div>
        <div className="card p-4"><div className="label">Overdue</div><div className="text-2xl font-extrabold text-red-400">{fmtMoney(totals.overdue)}</div></div>
        <div className="card p-4"><div className="label">Draft</div><div className="text-2xl font-extrabold text-neutral-400">{fmtMoney(totals.draft)}</div></div>
      </div>

      <div className="card overflow-x-auto">
        <table>
          <thead><tr><th>Invoice #</th><th>Project</th><th>Amount</th><th>Status</th><th>Issued</th><th>Due</th><th></th></tr></thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-neutral-500 text-[13px]">
                  No invoices yet. Bill deposits and progress payments per job
                  {canWrite ? " with New Invoice above." : "."}
                </td>
              </tr>
            )}
            {invoices.map((i) => {
              const proj = projects.find((p) => p.id === i.projectId);
              return (
                <tr key={i.id}>
                  <td className="font-mono text-[12px] text-amber-500">
                    {i.invoiceNumber}
                    {i.isDeposit && <span className="chip ml-2">Deposit</span>}
                  </td>
                  <td className="font-semibold text-white">{proj?.name || "—"}</td>
                  <td className="font-bold text-white">{fmtMoney(i.amount)}</td>
                  <td>
                    <select
                      value={i.status}
                      disabled={!canWrite}
                      onChange={(e) => updateInvoice(i.id, { status: e.target.value as any })}
                      className={`bg-transparent border border-neutral-800 rounded px-2 py-1 text-[12px] font-semibold disabled:opacity-60 ${STATUS[i.status]}`}
                    >
                      <option>Draft</option><option>Sent</option><option>Paid</option><option>Overdue</option>
                    </select>
                  </td>
                  <td className="text-neutral-500">{i.issuedAt}</td>
                  <td className="text-neutral-500">{i.dueDate}</td>
                  <td>{canManage && <button className="text-neutral-700 hover:text-red-400" onClick={() => deleteInvoice(i.id)}><Trash2 className="w-4 h-4" /></button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="card max-w-lg w-full p-7" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-5">New Invoice</h2>
            <div className="space-y-3">
              <div><div className="label">Invoice Number</div><input className="input" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} /></div>
              <div><div className="label">Project</div>
                <select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                  <option value="">— Choose —</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.jobNumber ? `${p.jobNumber} · ` : ""}{p.name}</option>)}
                </select>
              </div>
              <div><div className="label">Amount</div><input type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="label">Issued</div><input type="date" className="input" value={form.issuedAt} onChange={(e) => setForm({ ...form, issuedAt: e.target.value })} /></div>
                <div><div className="label">Due</div><input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
              </div>
              <label className="flex items-center gap-2 text-[13px] text-neutral-300 cursor-pointer">
                <input type="checkbox" checked={form.isDeposit} onChange={(e) => setForm({ ...form, isDeposit: e.target.checked })} className="accent-amber-500" />
                This is the deposit invoice
                <span className="text-neutral-600 text-[11px]">checks "Deposit received" on job readiness when paid</span>
              </label>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { if (form.projectId && form.amount) { addInvoice(form); setOpen(false); setForm({ invoiceNumber: "", projectId: "", amount: 0, status: "Draft", dueDate: "", issuedAt: "", isDeposit: false }); } }}>Create Invoice</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
