"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore, fmtMoney } from "@/lib/store";
import { STAGES, type Stage } from "@/lib/types";
import { Plus, Trash2, Search } from "lucide-react";
import { useState } from "react";

export default function ProjectsPage() {
  const { projects, clients, addProject, updateProject, deleteProject } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "All">("All");
  const [form, setForm] = useState({
    jobNumber: "",
    name: "",
    clientId: clients[0]?.id || "",
    stage: "Quote" as Stage,
    contractTotal: 0,
    paid: 0,
    startDate: "",
    dueDate: "",
    woodSpecies: "",
    finish: "",
    hardware: "",
    squareFeet: 0,
    cabinetCount: 0,
    priority: "Normal" as "Low" | "Normal" | "High" | "Rush",
  });

  const filtered = projects
    .filter((p) => stageFilter === "All" || p.stage === stageFilter)
    .filter((p) => {
      const c = clients.find((x) => x.id === p.clientId);
      const hay = `${p.name} ${p.jobNumber} ${c?.name || ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });

  const submit = () => {
    if (!form.name || !form.clientId) return;
    addProject(form);
    setOpen(false);
    setForm({ ...form, name: "", jobNumber: "", contractTotal: 0, paid: 0 });
  };

  return (
    <>
      <PageHeader
        title="Projects"
        sub={`${projects.length} total · ${projects.filter((p) => p.stage !== "Complete").length} active`}
        action={
          <button onClick={() => setOpen(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> New Project
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search project, job number, client…"
            className="input pl-9"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as any)}
          className="input max-w-[200px]"
        >
          <option value="All">All Stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Job #</th>
              <th>Project</th>
              <th>Client</th>
              <th>Stage</th>
              <th>Priority</th>
              <th>Contract</th>
              <th>Paid</th>
              <th>Due</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const c = clients.find((x) => x.id === p.clientId);
              return (
                <tr key={p.id}>
                  <td className="font-mono text-[12px] text-amber-500">{p.jobNumber}</td>
                  <td className="font-semibold text-white">{p.name}</td>
                  <td>{c?.name || "—"}</td>
                  <td>
                    <select
                      value={p.stage}
                      onChange={(e) => updateProject(p.id, { stage: e.target.value as Stage })}
                      className="bg-transparent border border-neutral-800 rounded px-2 py-1 text-[12px] text-amber-500 font-semibold"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className="chip">{p.priority}</span>
                  </td>
                  <td className="font-bold text-white">{fmtMoney(p.contractTotal)}</td>
                  <td className="text-emerald-400">{fmtMoney(p.paid)}</td>
                  <td className="text-neutral-500">{p.dueDate}</td>
                  <td>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${p.name}?`)) deleteProject(p.id);
                      }}
                      className="text-neutral-600 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-10 text-neutral-600">
                  No projects match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full p-7">
            <h2 className="text-xl font-bold mb-5">New Project</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="label">Job Number</div>
                <input className="input" value={form.jobNumber} onChange={(e) => setForm({ ...form, jobNumber: e.target.value })} placeholder="JOB-1033" />
              </div>
              <div>
                <div className="label">Project Name</div>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Smith Kitchen" />
              </div>
              <div>
                <div className="label">Client</div>
                <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="label">Stage</div>
                <select className="input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}>
                  {STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="label">Contract Total</div>
                <input type="number" className="input" value={form.contractTotal} onChange={(e) => setForm({ ...form, contractTotal: +e.target.value })} />
              </div>
              <div>
                <div className="label">Paid To Date</div>
                <input type="number" className="input" value={form.paid} onChange={(e) => setForm({ ...form, paid: +e.target.value })} />
              </div>
              <div>
                <div className="label">Start Date</div>
                <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <div className="label">Due Date</div>
                <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div>
                <div className="label">Wood Species</div>
                <input className="input" value={form.woodSpecies} onChange={(e) => setForm({ ...form, woodSpecies: e.target.value })} placeholder="White Oak" />
              </div>
              <div>
                <div className="label">Finish</div>
                <input className="input" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} placeholder="Conversion Varnish" />
              </div>
              <div>
                <div className="label">Hardware</div>
                <input className="input" value={form.hardware} onChange={(e) => setForm({ ...form, hardware: e.target.value })} />
              </div>
              <div>
                <div className="label">Priority</div>
                <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                  <option>Rush</option>
                </select>
              </div>
              <div>
                <div className="label">Square Feet</div>
                <input type="number" className="input" value={form.squareFeet} onChange={(e) => setForm({ ...form, squareFeet: +e.target.value })} />
              </div>
              <div>
                <div className="label">Cabinet Count</div>
                <input type="number" className="input" value={form.cabinetCount} onChange={(e) => setForm({ ...form, cabinetCount: +e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>Create Project</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
