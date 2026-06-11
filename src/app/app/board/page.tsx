"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore, fmtMoney } from "@/lib/store";
import { STAGES, type Stage, type Project } from "@/lib/types";
import { checkMove, RELEASE_STAGE, type MoveCheck, type DerivationCtx } from "@/lib/readiness";
import { ReadinessChip, ReadinessPanel } from "@/components/ReadinessPanel";
import { useState } from "react";
import { GripVertical, ChevronLeft, ChevronRight, ShieldAlert, AlertTriangle } from "lucide-react";

const PRIORITY_COLOR: Record<string, string> = {
  Low: "text-neutral-500",
  Normal: "text-blue-400",
  High: "text-orange-400",
  Rush: "text-red-400",
};

type PendingMove = { project: Project; target: Stage; check: MoveCheck };

export default function BoardPage() {
  const {
    projects, clients, gates, checklistRows, invoices, pos, schedule,
    moveProjectStage, moveProjectStageWithWarnings, overrideMoveProjectStage,
    canWrite, canManage,
  } = useStore();
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingMove | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [panelProject, setPanelProject] = useState<Project | null>(null);

  const ctx: DerivationCtx = { gates, rows: checklistRows, invoices, pos, schedule };
  const releaseIdx = STAGES.indexOf(RELEASE_STAGE);

  const requestMove = (project: Project, target: Stage) => {
    const check = checkMove(project, target, gates);
    if (check.blocked.length === 0 && check.warnings.length === 0) {
      moveProjectStage(project.id, target);
      return;
    }
    setOverrideReason("");
    setPending({ project, target, check });
  };

  const moveOne = (id: string, dir: 1 | -1) => {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    const idx = STAGES.indexOf(proj.stage);
    const next = STAGES[idx + dir];
    if (next) requestMove(proj, next);
  };

  const handleDrop = (stage: Stage) => {
    const proj = dragId ? projects.find((p) => p.id === dragId) : null;
    if (proj && proj.stage !== stage) requestMove(proj, stage);
    setDragId(null);
  };

  const confirmPending = async () => {
    if (!pending) return;
    const gateKeys = [...pending.check.blocked, ...pending.check.warnings].map((g) => g.def.key);
    if (pending.check.blocked.length > 0) {
      await overrideMoveProjectStage(pending.project.id, pending.target, overrideReason.trim(), gateKeys);
    } else {
      await moveProjectStageWithWarnings(pending.project.id, pending.target, gateKeys);
    }
    setPending(null);
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
                      draggable={canWrite}
                      onDragStart={() => canWrite && setDragId(p.id)}
                      className={`bg-[#161616] border border-neutral-800 rounded-lg p-3 hover:border-amber-500/40 group ${canWrite ? "cursor-grab" : ""}`}
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
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-[10px] text-neutral-600">Due {p.dueDate}</div>
                        {STAGES.indexOf(p.stage) < releaseIdx && (
                          <ReadinessChip project={p} ctx={ctx} onClick={() => setPanelProject(p)} />
                        )}
                      </div>
                      {canWrite && (
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
                      )}
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

      {panelProject && <ReadinessPanel project={panelProject} onClose={() => setPanelProject(null)} />}

      {pending && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-7">
            {pending.check.blocked.length > 0 ? (
              <>
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" /> Job is not cleared for {pending.target}
                </h2>
                <p className="text-[13px] text-neutral-400 mb-4">
                  These approvals must be resolved before {pending.project.name} moves forward:
                </p>
                <ul className="space-y-1.5 mb-5">
                  {pending.check.blocked.map(({ def }) => (
                    <li key={def.key} className="text-[13px] text-red-400 flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5" /> {def.label}
                    </li>
                  ))}
                  {pending.check.warnings.map(({ def }) => (
                    <li key={def.key} className="text-[13px] text-amber-500 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5" /> {def.label}
                    </li>
                  ))}
                </ul>
                {canManage ? (
                  <>
                    <div className="label">Override reason (required, logged)</div>
                    <input
                      className="input mb-4"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Why is this job moving anyway?"
                    />
                    <div className="flex gap-2 justify-end">
                      <button className="btn" onClick={() => setPending(null)}>Cancel</button>
                      <button
                        className="btn btn-primary"
                        disabled={overrideReason.trim().length < 3}
                        onClick={confirmPending}
                      >
                        Override &amp; Move
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2 justify-end">
                    <span className="text-[12px] text-neutral-500 self-center mr-auto">
                      An owner or admin can override this.
                    </span>
                    <button className="btn btn-primary" onClick={() => setPending(null)}>OK</button>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Heads up before {pending.target}
                </h2>
                <p className="text-[13px] text-neutral-400 mb-4">
                  {pending.project.name} is missing:
                </p>
                <ul className="space-y-1.5 mb-5">
                  {pending.check.warnings.map(({ def }) => (
                    <li key={def.key} className="text-[13px] text-amber-500 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5" /> {def.label}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 justify-end">
                  <button className="btn" onClick={() => setPending(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={confirmPending}>Move anyway</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
