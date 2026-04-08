"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore } from "@/lib/store";
import { Plus, Trash2, Check } from "lucide-react";
import { useState } from "react";

export default function CutListsPage() {
  const { cutlist, projects, addCutListItem, toggleCutListItem, deleteCutListItem } = useStore();
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [form, setForm] = useState({ part: "", material: "", qty: 1, length: 0, width: 0, thickness: 0.75 });

  const items = cutlist.filter((c) => c.projectId === projectId);
  const done = items.filter((i) => i.done).length;
  const project = projects.find((p) => p.id === projectId);

  return (
    <>
      <PageHeader
        title="Cut Lists"
        sub="Job ready cut lists. Tick parts off as the shop produces them."
      />

      <div className="card p-5 mb-5">
        <div className="label mb-2">Select Project</div>
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input max-w-md">
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.jobNumber} · {p.name}</option>
          ))}
        </select>
        {project && (
          <div className="mt-4 flex gap-6 text-[13px]">
            <div><span className="text-neutral-500">Stage:</span> <span className="text-amber-500 font-semibold">{project.stage}</span></div>
            <div><span className="text-neutral-500">Parts:</span> <span className="font-bold text-white">{items.length}</span></div>
            <div><span className="text-neutral-500">Complete:</span> <span className="text-emerald-400 font-bold">{done} / {items.length}</span></div>
          </div>
        )}
      </div>

      <div className="card p-5 mb-5">
        <div className="label mb-3">Add Part</div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          <input className="input" placeholder="Part" value={form.part} onChange={(e) => setForm({ ...form, part: e.target.value })} />
          <input className="input" placeholder="Material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
          <input type="number" className="input" placeholder="Qty" value={form.qty} onChange={(e) => setForm({ ...form, qty: +e.target.value })} />
          <input type="number" className="input" placeholder="L" value={form.length} onChange={(e) => setForm({ ...form, length: +e.target.value })} />
          <input type="number" className="input" placeholder="W" value={form.width} onChange={(e) => setForm({ ...form, width: +e.target.value })} />
          <input type="number" step="0.125" className="input" placeholder="T" value={form.thickness} onChange={(e) => setForm({ ...form, thickness: +e.target.value })} />
          <button
            className="btn btn-primary justify-center"
            onClick={() => {
              if (!form.part || !projectId) return;
              addCutListItem({ ...form, projectId, done: false });
              setForm({ part: "", material: "", qty: 1, length: 0, width: 0, thickness: 0.75 });
            }}
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr><th></th><th>Part</th><th>Material</th><th>Qty</th><th>Length</th><th>Width</th><th>Thickness</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className={i.done ? "opacity-50" : ""}>
                <td>
                  <button
                    onClick={() => toggleCutListItem(i.id)}
                    className={`w-6 h-6 rounded border-2 grid place-items-center ${i.done ? "bg-amber-500 border-amber-500" : "border-neutral-700"}`}
                  >
                    {i.done && <Check className="w-3.5 h-3.5 text-ink" />}
                  </button>
                </td>
                <td className={`font-semibold ${i.done ? "line-through" : "text-white"}`}>{i.part}</td>
                <td>{i.material}</td>
                <td className="font-bold text-amber-500">×{i.qty}</td>
                <td>{i.length}"</td>
                <td>{i.width}"</td>
                <td>{i.thickness}"</td>
                <td>
                  <button className="text-neutral-700 hover:text-red-400" onClick={() => deleteCutListItem(i.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-neutral-600">No parts on this cut list yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
