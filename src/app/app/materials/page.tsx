"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore, fmtMoney } from "@/lib/store";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function MaterialsPage() {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useStore();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("All");
  const [form, setForm] = useState({
    sku: "", name: "", category: "Sheet Goods" as any, unit: "ea", costPerUnit: 0, inStock: 0, reorderAt: 0, supplier: "",
  });

  const categories = ["All", ...Array.from(new Set(materials.map((m) => m.category)))];
  const filtered = filter === "All" ? materials : materials.filter((m) => m.category === filter);
  const totalValue = materials.reduce((s, m) => s + m.costPerUnit * m.inStock, 0);

  return (
    <>
      <PageHeader
        title="Materials & Inventory"
        sub={`${materials.length} SKUs · ${fmtMoney(totalValue)} on hand`}
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Material</button>}
      />

      <div className="flex gap-2 mb-5 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition ${
              filter === c ? "bg-amber-500 text-ink" : "bg-[#141414] border border-line text-neutral-400 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Cost</th>
              <th>In Stock</th>
              <th>Reorder At</th>
              <th>Value</th>
              <th>Supplier</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const low = m.inStock <= m.reorderAt;
              return (
                <tr key={m.id}>
                  <td className="font-mono text-[12px] text-amber-500">{m.sku}</td>
                  <td className="font-semibold text-white">{m.name}</td>
                  <td>{m.category}</td>
                  <td>{m.unit}</td>
                  <td>{fmtMoney(m.costPerUnit)}</td>
                  <td>
                    <input
                      type="number"
                      value={m.inStock}
                      onChange={(e) => updateMaterial(m.id, { inStock: +e.target.value })}
                      className="bg-transparent border border-neutral-800 rounded px-2 py-1 w-20 text-[13px]"
                    />
                    {low && <AlertTriangle className="inline w-3.5 h-3.5 text-red-400 ml-2" />}
                  </td>
                  <td>{m.reorderAt}</td>
                  <td className="font-bold text-white">{fmtMoney(m.costPerUnit * m.inStock)}</td>
                  <td className="text-neutral-500">{m.supplier}</td>
                  <td>
                    <button className="text-neutral-700 hover:text-red-400" onClick={() => { if (confirm("Delete?")) deleteMaterial(m.id); }}>
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
            <h2 className="text-xl font-bold mb-5">New Material</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><div className="label">SKU</div><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
              <div><div className="label">Name</div><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><div className="label">Category</div>
                <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })}>
                  <option>Sheet Goods</option><option>Hardwood</option><option>Hardware</option><option>Finish</option><option>Edge Banding</option><option>Misc</option>
                </select>
              </div>
              <div><div className="label">Unit</div><input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
              <div><div className="label">Cost / Unit</div><input type="number" className="input" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: +e.target.value })} /></div>
              <div><div className="label">In Stock</div><input type="number" className="input" value={form.inStock} onChange={(e) => setForm({ ...form, inStock: +e.target.value })} /></div>
              <div><div className="label">Reorder At</div><input type="number" className="input" value={form.reorderAt} onChange={(e) => setForm({ ...form, reorderAt: +e.target.value })} /></div>
              <div><div className="label">Supplier</div><input className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { if (form.name) { addMaterial(form); setOpen(false); setForm({ sku: "", name: "", category: "Sheet Goods", unit: "ea", costPerUnit: 0, inStock: 0, reorderAt: 0, supplier: "" }); } }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
