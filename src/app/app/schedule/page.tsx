"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore } from "@/lib/store";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const TYPE_COLOR: Record<string, string> = {
  Measure: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Delivery: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Install: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  "Site Visit": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Punch List": "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function SchedulePage() {
  const { schedule, projects, addScheduleEvent, deleteScheduleEvent } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ projectId: "", type: "Install" as any, date: "", notes: "" });

  // Build a 4-week calendar grid starting from today's week
  const start = new Date();
  start.setDate(start.getDate() - start.getDay());
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const eventsForDay = (d: Date) => {
    const ymd = d.toISOString().slice(0, 10);
    return schedule.filter((s) => s.date === ymd);
  };

  return (
    <>
      <PageHeader
        title="Schedule"
        sub="Measures, deliveries, installs, site visits, and punch lists."
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Event</button>}
      />

      <div className="card p-4 mb-5">
        <div className="grid grid-cols-7 gap-px bg-neutral-900 rounded-lg overflow-hidden">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="bg-[#0d0d0d] py-2 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {d}
            </div>
          ))}
          {days.map((d) => {
            const events = eventsForDay(d);
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div key={d.toISOString()} className={`bg-[#0a0a0a] min-h-[100px] p-2 ${isToday ? "ring-1 ring-amber-500 ring-inset" : ""}`}>
                <div className={`text-[11px] font-bold mb-1 ${isToday ? "text-amber-500" : "text-neutral-500"}`}>
                  {d.getDate()}
                </div>
                <div className="space-y-1">
                  {events.map((e) => {
                    const proj = projects.find((p) => p.id === e.projectId);
                    return (
                      <div
                        key={e.id}
                        className={`px-1.5 py-1 rounded border text-[10px] font-semibold truncate ${TYPE_COLOR[e.type]}`}
                        title={`${e.type} · ${proj?.name || ""} ${e.notes || ""}`}
                      >
                        {e.type} · {proj?.name?.slice(0, 14) || "—"}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table>
          <thead><tr><th>Date</th><th>Type</th><th>Project</th><th>Notes</th><th></th></tr></thead>
          <tbody>
            {[...schedule].sort((a, b) => a.date.localeCompare(b.date)).map((e) => {
              const proj = projects.find((p) => p.id === e.projectId);
              return (
                <tr key={e.id}>
                  <td className="font-bold text-white">{e.date}</td>
                  <td><span className={`chip ${TYPE_COLOR[e.type]}`}>{e.type}</span></td>
                  <td>{proj?.name || "—"}</td>
                  <td className="text-neutral-500">{e.notes || "—"}</td>
                  <td><button className="text-neutral-700 hover:text-red-400" onClick={() => deleteScheduleEvent(e.id)}><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-7">
            <h2 className="text-xl font-bold mb-5">New Schedule Event</h2>
            <div className="space-y-3">
              <div><div className="label">Project</div>
                <select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                  <option value="">— Choose —</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.jobNumber} · {p.name}</option>)}
                </select>
              </div>
              <div><div className="label">Type</div>
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
                  <option>Measure</option><option>Delivery</option><option>Install</option><option>Site Visit</option><option>Punch List</option>
                </select>
              </div>
              <div><div className="label">Date</div><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><div className="label">Notes</div><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { if (form.projectId && form.date) { addScheduleEvent(form); setOpen(false); setForm({ projectId: "", type: "Install", date: "", notes: "" }); } }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
