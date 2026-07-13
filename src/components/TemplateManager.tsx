"use client";
import { useStore } from "@/lib/store";
import { GATE_DEFS } from "@/lib/readiness";
import { STARTER_TEMPLATES } from "@/lib/templates";
import type { TemplateItem, TaskTeam } from "@/lib/types";
import { ClipboardList, Download, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

// Phase 4 (docs/LEAN_PLAN_2026_06_10.md §10): the Settings home for standard work.
// Templates are DB rows, admin-editable; applying one copies rows onto a job, so
// nothing here ever rewrites a live job.

const TEAMS: TaskTeam[] = ["office", "shop", "field", "design"];

function itemSummary(item: TemplateItem): string {
  const p = item.payload as any;
  if (item.kind === "task") {
    const bits = [p.team, p.offsetDays != null ? `day ${p.offsetDays}` : null, p.priority && p.priority !== "Normal" ? p.priority : null].filter(Boolean);
    return `${p.title}${bits.length ? ` (${bits.join(", ")})` : ""}`;
  }
  if (item.kind === "checklist") return `${p.label}${p.required === false ? " (optional)" : " (required for release)"}`;
  const gate = GATE_DEFS.find((d) => d.key === p.key)?.label ?? p.key;
  if (p.status === "n_a") return `${gate}: N/A for this job type`;
  return `${gate}: ${p.mode === "block" ? "blocks" : "warns"}`;
}

export default function TemplateManager() {
  const {
    templates, templateItems, canManage,
    addTemplate, renameTemplate, deleteTemplate, addTemplateItem, deleteTemplateItem, installStarterTemplates,
  } = useStore();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [installing, setInstalling] = useState(false);

  // Per-template add-item form
  const emptyItem = { kind: "task" as TemplateItem["kind"], title: "", team: "" as "" | TaskTeam, offsetDays: "", label: "", required: true, gateKey: GATE_DEFS[0].key, gateMode: "block" as "block" | "warn" | "n_a" };
  const [itemForm, setItemForm] = useState(emptyItem);

  const missingStarters = STARTER_TEMPLATES.filter((s) => !templates.some((t) => t.name === s.name));

  const submitItem = async (templateId: string) => {
    const sort = templateItems.filter((i) => i.templateId === templateId).length;
    if (itemForm.kind === "task") {
      if (!itemForm.title.trim()) return;
      await addTemplateItem(templateId, "task", {
        title: itemForm.title.trim(),
        ...(itemForm.team ? { team: itemForm.team } : {}),
        ...(itemForm.offsetDays !== "" ? { offsetDays: Number(itemForm.offsetDays) } : {}),
      }, sort);
    } else if (itemForm.kind === "checklist") {
      if (!itemForm.label.trim()) return;
      await addTemplateItem(templateId, "checklist", { label: itemForm.label.trim(), required: itemForm.required }, sort);
    } else {
      await addTemplateItem(templateId, "gate",
        itemForm.gateMode === "n_a" ? { key: itemForm.gateKey, status: "n_a" } : { key: itemForm.gateKey, mode: itemForm.gateMode },
        sort);
    }
    setItemForm(emptyItem);
  };

  return (
    <div className="card p-6 mt-6">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <h2 className="text-[15px] font-bold flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-amber-500" /> Job Templates
        </h2>
        {canManage && (
          <div className="flex gap-2">
            {missingStarters.length > 0 && (
              <button
                className="btn"
                disabled={installing}
                onClick={async () => { setInstalling(true); await installStarterTemplates(); setInstalling(false); }}
              >
                <Download className="w-4 h-4" />
                {installing ? "Installing…" : `Install ${missingStarters.length} starter template${missingStarters.length === 1 ? "" : "s"}`}
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4" /> New Template
            </button>
          </div>
        )}
      </div>
      <p className="text-[13px] text-neutral-500 mb-5">
        Standard work per job type: the tasks, checklist items, and gate settings a new job starts with.
        Applying a template copies everything onto the job, so editing here never changes existing jobs.
      </p>

      {creating && (
        <div className="rounded-lg border border-neutral-900 bg-[#0f0f0f] p-4 mb-4 flex gap-2 flex-wrap items-center">
          <input
            className="input flex-1 min-w-[220px]"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Template name, e.g. Kitchen job"
            autoFocus
          />
          <button
            className="btn btn-primary"
            onClick={async () => {
              if (!newName.trim()) return;
              await addTemplate(newName.trim(), "general");
              setNewName("");
              setCreating(false);
            }}
          >
            Create
          </button>
          <button className="btn" onClick={() => { setCreating(false); setNewName(""); }}>Cancel</button>
        </div>
      )}

      {templates.length === 0 && !creating ? (
        <div className="text-[13px] text-neutral-600 py-6 text-center">
          No templates yet. Install the starter set to give every job type its standard gates, checklist, and task pack.
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => {
            const items = templateItems.filter((i) => i.templateId === t.id);
            const open = expanded === t.id;
            return (
              <div key={t.id} className="rounded-lg border border-neutral-900 bg-[#0f0f0f]">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  onClick={() => { setExpanded(open ? null : t.id); setItemForm(emptyItem); }}
                >
                  <span className="text-[14px] font-semibold text-white">{t.name}</span>
                  <span className="text-[12px] text-neutral-500">
                    {items.length} item{items.length === 1 ? "" : "s"} {open ? "▾" : "▸"}
                  </span>
                </button>
                {open && (
                  <div className="px-4 pb-4 border-t border-neutral-900">
                    <div className="space-y-1 mt-3 mb-4">
                      {items.map((i) => (
                        <div key={i.id} className="flex items-center gap-3 py-1.5 border-b border-neutral-900 last:border-0">
                          <span className={`chip shrink-0 ${i.kind === "gate" ? "text-amber-500 border-amber-500/30" : i.kind === "checklist" ? "text-sky-400 border-sky-500/30" : "text-neutral-400"}`}>
                            {i.kind}
                          </span>
                          <span className="flex-1 text-[13px] text-neutral-300 min-w-0 truncate">{itemSummary(i)}</span>
                          {canManage && (
                            <button onClick={() => deleteTemplateItem(i.id)} className="text-neutral-700 hover:text-red-400">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {items.length === 0 && <div className="text-[12px] text-neutral-600 py-2">Empty template.</div>}
                    </div>

                    {canManage && (
                      <>
                        <div className="flex gap-2 flex-wrap items-end rounded-lg border border-neutral-900 p-3">
                          <div>
                            <div className="label">Add</div>
                            <select className="input" value={itemForm.kind} onChange={(e) => setItemForm({ ...emptyItem, kind: e.target.value as any })}>
                              <option value="task">Task</option>
                              <option value="checklist">Checklist item</option>
                              <option value="gate">Gate setting</option>
                            </select>
                          </div>
                          {itemForm.kind === "task" && (
                            <>
                              <div className="flex-1 min-w-[200px]">
                                <div className="label">Task</div>
                                <input className="input" value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} placeholder="Order materials" />
                              </div>
                              <div>
                                <div className="label">Team</div>
                                <select className="input" value={itemForm.team} onChange={(e) => setItemForm({ ...itemForm, team: e.target.value as any })}>
                                  <option value="">—</option>
                                  {TEAMS.map((tm) => <option key={tm} value={tm}>{tm}</option>)}
                                </select>
                              </div>
                              <div className="w-[110px]">
                                <div className="label">Day offset</div>
                                <input type="number" className="input" value={itemForm.offsetDays} onChange={(e) => setItemForm({ ...itemForm, offsetDays: e.target.value })} placeholder="7" />
                              </div>
                            </>
                          )}
                          {itemForm.kind === "checklist" && (
                            <>
                              <div className="flex-1 min-w-[200px]">
                                <div className="label">Checklist item</div>
                                <input className="input" value={itemForm.label} onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })} placeholder="Submittals approved by GC" />
                              </div>
                              <label className="flex items-center gap-2 text-[13px] text-neutral-300 pb-2.5 cursor-pointer">
                                <input type="checkbox" checked={itemForm.required} onChange={(e) => setItemForm({ ...itemForm, required: e.target.checked })} />
                                Required for release
                              </label>
                            </>
                          )}
                          {itemForm.kind === "gate" && (
                            <>
                              <div className="flex-1 min-w-[200px]">
                                <div className="label">Gate</div>
                                <select className="input" value={itemForm.gateKey} onChange={(e) => setItemForm({ ...itemForm, gateKey: e.target.value })}>
                                  {GATE_DEFS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
                                </select>
                              </div>
                              <div>
                                <div className="label">Behavior</div>
                                <select className="input" value={itemForm.gateMode} onChange={(e) => setItemForm({ ...itemForm, gateMode: e.target.value as any })}>
                                  <option value="block">Blocks the stage</option>
                                  <option value="warn">Warns only</option>
                                  <option value="n_a">N/A for this job type</option>
                                </select>
                              </div>
                            </>
                          )}
                          <button className="btn btn-primary" onClick={() => submitItem(t.id)}>
                            <Plus className="w-4 h-4" /> Add
                          </button>
                        </div>

                        <div className="flex gap-2 justify-end mt-3">
                          <button
                            className="btn"
                            onClick={() => {
                              const name = prompt("Rename template:", t.name);
                              if (name && name.trim()) renameTemplate(t.id, name.trim());
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" /> Rename
                          </button>
                          <button
                            className="btn text-red-400"
                            onClick={() => {
                              if (confirm(`Delete template "${t.name}"? Existing jobs keep their copies.`)) deleteTemplate(t.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-neutral-600 mt-5 border-t border-neutral-900 pt-4 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" />
        Gate settings in a template override the standard defaults for jobs created from it. The nine standard gates always exist on every job.
      </p>
    </div>
  );
}
