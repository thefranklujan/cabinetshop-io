"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore } from "@/lib/store";
import { Clock, Play, Square } from "lucide-react";
import { useState } from "react";

export default function ShopFloorPage() {
  const { time, projects, setStore } = useStore();

  const active = time.filter((t) => !t.endedAt);
  const totalHours = time.reduce((s, t) => s + (t.hours || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayHours = time
    .filter((t) => (t.startedAt || "").startsWith(today))
    .reduce((s, t) => s + (t.hours || 0), 0);

  const stop = (id: string) => {
    setStore((s) => ({
      ...s,
      time: s.time.map((t) => {
        if (t.id !== id) return t;
        const endedAt = new Date().toISOString();
        const hours = +(((+new Date(endedAt) - +new Date(t.startedAt)) / 3600000)).toFixed(2);
        return { ...t, endedAt, hours };
      }),
    }));
  };

  return (
    <>
      <PageHeader
        title="Shop Floor"
        sub={`${active.length} clocked in · ${todayHours.toFixed(1)}h logged today · ${totalHours.toFixed(1)}h all time`}
      />

      <div className="card p-5 mb-5">
        <h2 className="text-[14px] font-bold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" /> Currently Clocked In
        </h2>
        {active.length === 0 ? (
          <div className="text-neutral-600 text-[13px]">No one clocked in right now.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {active.map((t) => {
              const proj = projects.find((p) => p.id === t.projectId);
              return (
                <div key={t.id} className="bg-amber-500/5 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <div className="font-bold text-white">{t.workerName}</div>
                  </div>
                  <div className="text-[12px] text-neutral-400">{proj?.name || "—"}</div>
                  <div className="text-[11px] text-neutral-600 mb-3">{t.stage} · since {new Date(t.startedAt).toLocaleTimeString()}</div>
                  <button className="btn w-full justify-center" onClick={() => stop(t.id)}>
                    <Square className="w-3 h-3" /> Clock Out
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr><th>Worker</th><th>Project</th><th>Stage</th><th>Started</th><th>Ended</th><th>Hours</th></tr>
          </thead>
          <tbody>
            {time.map((t) => {
              const proj = projects.find((p) => p.id === t.projectId);
              return (
                <tr key={t.id}>
                  <td className="font-semibold text-white">{t.workerName}</td>
                  <td>{proj?.name || "—"}</td>
                  <td><span className="chip chip-accent">{t.stage}</span></td>
                  <td className="text-[12px]">{new Date(t.startedAt).toLocaleString()}</td>
                  <td className="text-[12px]">{t.endedAt ? new Date(t.endedAt).toLocaleString() : <span className="text-amber-500 font-bold">In progress</span>}</td>
                  <td className="font-bold text-white">{t.hours ? `${t.hours}h` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
