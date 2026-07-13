"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskStatus, TaskTeam, WaitingOn } from "@/lib/types";
import { WAITING_ON_LABELS } from "@/lib/types";
import { CheckCircle2, Circle, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const TEAMS: TaskTeam[] = ["office", "shop", "field", "design"];
const STATUS_LABELS: Record<TaskStatus, string> = {
  open: "Open", in_progress: "In progress", done: "Done", canceled: "Canceled",
};

export default function TasksPage() {
  const { tasks, projects, members, addTask, updateTask, deleteTask, canWrite, canManage } = useStore();
  const supabase = createClient();
  const [me, setMe] = useState<string>("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id || ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [view, setView] = useState<"mine" | "today" | "all">("all");
  const [showDone, setShowDone] = useState(false);
  const [projectFilter, setProjectFilter] = useState("All");
  // Deep-linkable: ?project=<id> filters to one job (used from readiness/constraints).
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("project");
    if (initial) setProjectFilter(initial);
  }, []);

  const [open, setOpen] = useState(false);
  const emptyForm = {
    title: "", projectId: "", ownerUserId: "", team: "" as "" | TaskTeam, dueDate: "",
    priority: "Normal" as Task["priority"], isBlocker: false, waitingOn: "" as "" | WaitingOn,
  };
  const [form, setForm] = useState(emptyForm);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const active = (t: Task) => t.status === "open" || t.status === "in_progress";
  const filtered = tasks
    .filter((t) => (showDone ? true : active(t)))
    .filter((t) => (view === "mine" ? t.ownerUserId === me : true))
    .filter((t) => (view === "today" ? active(t) && !!t.dueDate && t.dueDate <= todayStr : true))
    .filter((t) => (projectFilter === "All" ? true : (t.projectId || "") === projectFilter))
    .sort((a, b) => {
      if (active(a) !== active(b)) return active(a) ? -1 : 1;
      const ad = a.dueDate || "9999", bd = b.dueDate || "9999";
      return ad.localeCompare(bd);
    });

  const openCount = tasks.filter(active).length;
  const overdueCount = tasks.filter((t) => active(t) && !!t.dueDate && t.dueDate < todayStr).length;

  const emailOf = (userId?: string) => members.find((m) => m.userId === userId)?.email || "";
  const projectOf = (id?: string) => projects.find((p) => p.id === id);

  const submit = () => {
    if (!form.title.trim()) return;
    addTask({
      title: form.title.trim(),
      projectId: form.projectId || undefined,
      ownerUserId: form.ownerUserId || undefined,
      team: form.team || undefined,
      dueDate: form.dueDate,
      status: "open",
      priority: form.priority,
      isBlocker: form.isBlocker,
      waitingOn: form.waitingOn || undefined,
    });
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        sub={`${openCount} open${overdueCount ? ` · ${overdueCount} overdue` : ""}`}
        action={
          canWrite ? (
            <button onClick={() => setOpen(true)} className="btn btn-primary">
              <Plus className="w-4 h-4" /> New Task
            </button>
          ) : null
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="flex rounded-lg border border-line overflow-hidden">
          {([["all", "All"], ["mine", "My Tasks"], ["today", "Today"]] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-[13px] font-semibold transition ${
                view === v ? "bg-amber-500/10 text-amber-500" : "text-neutral-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="input max-w-[240px]">
          <option value="All">All jobs</option>
          <option value="">Shop tasks (no job)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-[13px] text-neutral-400 cursor-pointer">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
          Show done
        </label>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Task</th>
              <th>Job</th>
              <th>Owner</th>
              <th>Team</th>
              <th>Due</th>
              <th>Priority</th>
              <th>Constraint</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const p = projectOf(t.projectId);
              const overdue = active(t) && !!t.dueDate && t.dueDate < todayStr;
              return (
                <tr key={t.id} className={t.status === "done" || t.status === "canceled" ? "opacity-50" : ""}>
                  <td>
                    <button
                      disabled={!canWrite}
                      onClick={() => updateTask(t.id, { status: t.status === "done" ? "open" : "done" })}
                      className={t.status === "done" ? "text-emerald-400" : "text-neutral-500 hover:text-emerald-300"}
                      title={t.status === "done" ? "Reopen" : "Mark done"}
                    >
                      {t.status === "done" ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="font-semibold text-white">
                    <span className="flex items-center gap-2">
                      {t.isBlocker && <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                      {t.title}
                    </span>
                  </td>
                  <td>{p ? p.name : <span className="text-neutral-600">Shop</span>}</td>
                  <td className="text-neutral-400">{emailOf(t.ownerUserId) || "—"}</td>
                  <td className="capitalize text-neutral-500">{t.team || "—"}</td>
                  <td className={overdue ? "text-red-400 font-semibold" : "text-neutral-500"}>{t.dueDate || "—"}</td>
                  <td><span className="chip">{t.priority}</span></td>
                  <td>
                    {t.waitingOn ? (
                      <span className="chip text-orange-400 border-orange-500/30 whitespace-nowrap">
                        {WAITING_ON_LABELS[t.waitingOn]}
                      </span>
                    ) : (
                      <span className="text-neutral-700">—</span>
                    )}
                  </td>
                  <td>
                    {canWrite ? (
                      <select
                        value={t.status}
                        onChange={(e) => updateTask(t.id, { status: e.target.value as TaskStatus })}
                        className="bg-transparent border border-neutral-800 rounded px-2 py-1 text-[12px] text-amber-500 font-semibold"
                      >
                        {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-[12px] text-neutral-400">{STATUS_LABELS[t.status]}</span>
                    )}
                  </td>
                  <td>
                    {canManage && (
                      <button
                        onClick={() => { if (confirm(`Delete task "${t.title}"?`)) deleteTask(t.id); }}
                        className="text-neutral-600 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-10 text-neutral-600">
                  {tasks.length === 0
                    ? "No tasks yet. Tasks are the shop's daily to-do list — what must happen, by whom, to keep jobs flowing."
                    : "No tasks match this view."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New task modal */}
      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="card max-w-2xl w-full p-7" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-5">New Task</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="label">Task</div>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Call Maria to confirm slab white oak" autoFocus />
              </div>
              <div>
                <div className="label">Job</div>
                <select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                  <option value="">Shop task (no job)</option>
                  {projects.filter((p) => p.stage !== "Complete").map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="label">Owner</div>
                <select className="input" value={form.ownerUserId} onChange={(e) => setForm({ ...form, ownerUserId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="label">Team</div>
                <select className="input" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value as any })}>
                  <option value="">—</option>
                  {TEAMS.map((t) => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="label">Due Date</div>
                <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
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
                <div className="label">Waiting On</div>
                <select className="input" value={form.waitingOn} onChange={(e) => setForm({ ...form, waitingOn: e.target.value as any })}>
                  <option value="">Not waiting</option>
                  {(Object.keys(WAITING_ON_LABELS) as WaitingOn[]).map((w) => (
                    <option key={w} value={w}>{WAITING_ON_LABELS[w]}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-[13px] text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={form.isBlocker} onChange={(e) => setForm({ ...form, isBlocker: e.target.checked })} />
                  This task blocks its job (shows the job as Blocked until done)
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>Create Task</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
