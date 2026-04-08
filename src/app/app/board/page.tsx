"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore, fmtMoney } from "@/lib/store";
import { STAGES, type Stage } from "@/lib/types";
import { useState } from "react";
import { GripVertical, ChevronLeft, ChevronRight } from "lucide-react";

const PRIORITY_COLOR: Record<string, string> = {
  Low: "text-neutral-500",
  Normal: "text-blue-400",
  High: "text-orange-400",
  Rush: "text-red-400",
};

export default function BoardPage() {
  const { projects, clients, moveProjectStage } = useStore();
  const [dragId, setDragId] = useState<string | null>(null);

  const moveOne = (id: string, dir: 1 | -1) => {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    const idx = STAGES.indexOf(proj.stage);
    const next = STAGES[idx + dir];
    if (next) moveProjectStage(id, next);
  };

  const handleDrop = (stage: Stage) => {
    if (dragId) moveProjectStage(dragId, stage);
    setDragId(null);
  };

  return (
    <>
      <PageHeader
        title="Production Board"
        sub="Drag any job card forward as work moves through the shop."
      />

      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const cards = projects.filter((p) => p.stage === stage);
          const value = cards.reduce((s, p) => s + p.contractTotal, 0);
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage)}
              className="flex-none w-[260px] bg-[#0e0e0e] border border-line rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                    {stage}
                  </div>
                  <div className="text-[10px] text-neutral-600 mt-0.5">{fmtMoney(value)}</div>
                </div>
                <span className="chip chip-accent">{cards.length}</span>
              </div>
              <div className="space-y-2 min-h-[60px]">
                {cards.map((p) => {
                  const client = clients.find((c) => c.id === p.clientId);
                  return (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={() => setDragId(p.id)}
                      className="bg-[#161616] border border-neutral-800 rounded-lg p-3 cursor-grab hover:border-amber-500/40 group"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <GripVertical className="w-3 h-3 text-neutral-700 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-neutral-600 font-mono">{p.jobNumber}</div>
                          <div className="text-[13px] font-bold text-white truncate">{p.name}</div>
                          <div className="text-[11px] text-neutral-500 truncate">{client?.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`font-semibold ${PRIORITY_COLOR[p.priority]}`}>● {p.priority}</span>
                        <span className="text-amber-500 font-bold">{fmtMoney(p.contractTotal)}</span>
                      </div>
                      <div className="text-[10px] text-neutral-600 mt-1">Due {p.dueDate}</div>
                      <div className="opacity-0 group-hover:opacity-100 transition flex gap-1 mt-2">
                        <button
                          onClick={() => moveOne(p.id, -1)}
                          className="flex-1 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-[10px] flex items-center justify-center gap-1"
                        >
                          <ChevronLeft className="w-3 h-3" /> Back
                        </button>
                        <button
                          onClick={() => moveOne(p.id, 1)}
                          className="flex-1 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] flex items-center justify-center gap-1"
                        >
                          Forward <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {cards.length === 0 && (
                  <div className="text-center py-6 text-[11px] text-neutral-700 border-2 border-dashed border-neutral-900 rounded-lg">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
