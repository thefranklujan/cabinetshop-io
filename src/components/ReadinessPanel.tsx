"use client";
import { useStore } from "@/lib/store";
import type { Project, GateStatus } from "@/lib/types";
import { GATE_DEFS, checklistFor, readinessFor, type DerivationCtx } from "@/lib/readiness";
import { CheckCircle2, Circle, MinusCircle, ShieldAlert, ShieldCheck, X } from "lucide-react";

const GATE_STATUS_OPTIONS: { value: GateStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "waiting_external", label: "Waiting on client/vendor" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
  { value: "n_a", label: "N/A" },
];

const GATE_STATUS_COLOR: Record<GateStatus, string> = {
  not_started: "text-neutral-500",
  in_progress: "text-blue-400",
  waiting_external: "text-orange-400",
  approved: "text-emerald-400",
  declined: "text-red-400",
  n_a: "text-neutral-600",
};

export function ReadinessChip({ project, ctx, onClick }: { project: Project; ctx: DerivationCtx; onClick?: () => void }) {
  const r = readinessFor(project, ctx);
  if (r.phase === "released") {
    return (
      <button onClick={onClick} className="chip text-emerald-400 border-emerald-500/30 whitespace-nowrap">
        In production
      </button>
    );
  }
  return r.ready ? (
    <button onClick={onClick} className="chip text-emerald-400 border-emerald-500/30 whitespace-nowrap">
      ✓ Ready
    </button>
  ) : (
    <button onClick={onClick} className="chip text-amber-500 border-amber-500/30 whitespace-nowrap">
      {r.missing.length} to go
    </button>
  );
}

export function ReadinessPanel({ project, onClose }: { project: Project; onClose: () => void }) {
  const { gates, checklistRows, invoices, pos, schedule, canWrite, setGateStatus, setChecklistItem } = useStore();
  const ctx: DerivationCtx = { gates, rows: checklistRows, invoices, pos, schedule };
  const items = checklistFor(project.id, ctx);
  const readiness = readinessFor(project, ctx);
  const projectGates = gates.filter((g) => g.projectId === project.id);
  const legacy = projectGates.length === 0;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card max-w-2xl w-full p-7 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-xl font-bold">{project.name}</h2>
          <button onClick={onClose} className="text-neutral-600 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="text-[13px] mb-6">
          {readiness.phase === "released" ? (
            <span className="text-emerald-400">In production since {project.releasedAt?.slice(0, 10) || "—"}</span>
          ) : readiness.ready ? (
            <span className="text-emerald-400">Ready for production. Everything required is in place.</span>
          ) : (
            <span className="text-amber-500">Not ready for production · {readiness.missing.length} item{readiness.missing.length === 1 ? "" : "s"} open</span>
          )}
        </div>

        <h3 className="text-[12px] uppercase tracking-wider font-bold text-neutral-400 mb-3">Readiness checklist</h3>
        <div className="space-y-1 mb-7">
          {items.map((item) => {
            const Icon = item.state === "done" ? CheckCircle2 : item.state === "n_a" ? MinusCircle : Circle;
            const color = item.state === "done" ? "text-emerald-400" : item.state === "n_a" ? "text-neutral-600" : "text-neutral-500";
            const clickable = canWrite && !item.fromAuto;
            return (
              <div key={item.key} className="flex items-center gap-3 py-1.5 border-b border-neutral-900 last:border-0">
                <button
                  disabled={!clickable}
                  onClick={() => setChecklistItem(project.id, item.key, item.label, item.state === "pending" ? "done" : "pending")}
                  className={`${color} ${clickable ? "hover:text-emerald-300" : "cursor-default"}`}
                  title={item.fromAuto ? "Set automatically from job data" : clickable ? "Toggle" : ""}
                >
                  <Icon className="w-4 h-4" />
                </button>
                <span className={`flex-1 text-[13px] ${item.state === "done" ? "text-neutral-400" : "text-white"}`}>
                  {item.label}
                  {!item.required && <span className="text-neutral-600 text-[11px] ml-2">optional</span>}
                </span>
                {item.fromAuto && <span className="text-[10px] text-neutral-600 uppercase">auto</span>}
                {clickable && item.state !== "n_a" && (
                  <button
                    onClick={() => setChecklistItem(project.id, item.key, item.label, "n_a")}
                    className="text-[10px] text-neutral-700 hover:text-neutral-400 uppercase"
                  >
                    n/a
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <h3 className="text-[12px] uppercase tracking-wider font-bold text-neutral-400 mb-1">Approval gates</h3>
        {legacy && (
          <p className="text-[11px] text-neutral-600 mb-3">
            This job predates gates, so unmet gates warn instead of blocking. Updating any gate keeps that behavior.
          </p>
        )}
        <div className="space-y-1">
          {GATE_DEFS.map((def) => {
            const gate = projectGates.find((g) => g.gateKey === def.key);
            const status: GateStatus = gate?.status ?? "not_started";
            const mode = legacy ? "warn" : gate?.mode ?? def.defaultMode;
            return (
              <div key={def.key} className="flex items-center gap-3 py-1.5 border-b border-neutral-900 last:border-0">
                {mode === "block" ? (
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-neutral-600 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-white">{def.label}</div>
                  <div className="text-[11px] text-neutral-600 truncate">
                    {def.hint} · gates <span className="text-neutral-500">{def.blocksStage}</span> · {mode === "block" ? "blocks" : "warns"}
                  </div>
                </div>
                {canWrite ? (
                  <select
                    value={status}
                    onChange={(e) => setGateStatus(project.id, def.key, e.target.value as GateStatus)}
                    className={`bg-[#0f0f0f] border border-line rounded-lg px-2.5 py-1.5 text-[12px] outline-none focus:border-amber-500 ${GATE_STATUS_COLOR[status]}`}
                  >
                    {GATE_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`text-[12px] font-semibold ${GATE_STATUS_COLOR[status]}`}>
                    {GATE_STATUS_OPTIONS.find((o) => o.value === status)?.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
