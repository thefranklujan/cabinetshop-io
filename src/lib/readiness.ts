import { STAGES, type Stage, type Gate, type GateMode, type ChecklistRow, type Project, type Invoice, type PurchaseOrder, type ScheduleEvent } from "./types";

// Phase 1 of docs/LEAN_PLAN_2026_06_10.md. Gate/checklist DEFINITIONS live here
// for v1; Phase 4 (standard work templates) moves them to DB-backed,
// Settings-editable templates. Gate INSTANCES always live in the DB.

export type GateDef = {
  key: string;
  label: string;
  blocksStage: Stage;
  defaultMode: GateMode;
  hint: string;
};

export const GATE_DEFS: GateDef[] = [
  { key: "estimate_approval", label: "Estimate approved", blocksStage: "Design", defaultMode: "block", hint: "Client accepted the quote amount" },
  { key: "design_approval", label: "Design approved", blocksStage: "Materials", defaultMode: "block", hint: "Client signed off on drawings/revision" },
  { key: "finish_approval", label: "Finish approved", blocksStage: "Materials", defaultMode: "block", hint: "Finish + sheen confirmed (sample if needed)" },
  { key: "hardware_approval", label: "Hardware approved", blocksStage: "Materials", defaultMode: "warn", hint: "Pulls, hinges, slides confirmed" },
  { key: "appliance_specs", label: "Appliance/specs confirmed", blocksStage: "Cut/CNC", defaultMode: "warn", hint: "Spec sheets on file, or N/A" },
  { key: "field_measure", label: "Field measure confirmed", blocksStage: "Cut/CNC", defaultMode: "block", hint: "Site measured and verified" },
  { key: "cut_list_release", label: "Cut list released", blocksStage: "Cut/CNC", defaultMode: "block", hint: "Engineering reviewed and released to the floor" },
  { key: "install_readiness", label: "Install readiness", blocksStage: "Install", defaultMode: "block", hint: "Site ready, delivery confirmed, crew set" },
  { key: "punch_completion", label: "Punch list complete", blocksStage: "Complete", defaultMode: "block", hint: "All punch items closed, client signed off" },
];

export const RELEASE_STAGE: Stage = "Materials"; // the release-to-production line

export type ChecklistDef = {
  key: string;
  label: string;
  required: boolean;
  /** null = manual item; otherwise derived and the source is shown in the UI */
  auto: "gate:finish_approval" | "gate:hardware_approval" | "gate:field_measure" | "gate:cut_list_release" | "invoice_deposit" | "po_sent" | "po_received" | "schedule_install" | null;
};

export const CHECKLIST_DEFS: ChecklistDef[] = [
  { key: "signed_proposal", label: "Signed proposal on file", required: true, auto: null },
  { key: "deposit", label: "Deposit received", required: true, auto: "invoice_deposit" },
  { key: "field_measure", label: "Field measurements complete", required: true, auto: "gate:field_measure" },
  { key: "drawings", label: "Drawings uploaded/linked", required: true, auto: null },
  { key: "finish_selected", label: "Finish selected", required: true, auto: "gate:finish_approval" },
  { key: "hardware_selected", label: "Hardware selected", required: true, auto: "gate:hardware_approval" },
  { key: "appliance_specs", label: "Appliance/spec notes complete", required: false, auto: null },
  { key: "material_ordered", label: "Material ordered", required: true, auto: "po_sent" },
  { key: "material_received", label: "Material received", required: false, auto: "po_received" },
  { key: "cut_list_ready", label: "Cut list ready", required: false, auto: "gate:cut_list_release" },
  { key: "install_scheduled", label: "Install date scheduled", required: false, auto: "schedule_install" },
];

export type DerivationCtx = {
  gates: Gate[];
  rows: ChecklistRow[];
  invoices: Invoice[];
  pos: PurchaseOrder[];
  schedule: ScheduleEvent[];
};

const gateFor = (ctx: DerivationCtx, projectId: string, key: string) =>
  ctx.gates.find((g) => g.projectId === projectId && g.gateKey === key);

const gateSatisfied = (g?: Gate) => !!g && (g.status === "approved" || g.status === "n_a");

/** What the data says, independent of any manual checkmark. */
function autoState(def: ChecklistDef, projectId: string, ctx: DerivationCtx): boolean {
  switch (def.auto) {
    case "gate:finish_approval":
    case "gate:hardware_approval":
    case "gate:field_measure":
    case "gate:cut_list_release":
      return gateSatisfied(gateFor(ctx, projectId, def.auto.slice(5)));
    case "invoice_deposit":
      return ctx.invoices.some((i) => i.projectId === projectId && i.isDeposit && i.status === "Paid");
    case "po_sent": {
      const pos = ctx.pos.filter((p) => p.projectId === projectId);
      return pos.length > 0 && pos.every((p) => p.status !== "Draft");
    }
    case "po_received": {
      const pos = ctx.pos.filter((p) => p.projectId === projectId);
      return pos.length > 0 && pos.every((p) => p.status === "Received" || p.status === "Closed");
    }
    case "schedule_install":
      return ctx.schedule.some((e) => e.projectId === projectId && e.type === "Install");
    default:
      return false;
  }
}

export type ChecklistState = ChecklistDef & { state: "done" | "pending" | "n_a"; fromAuto: boolean };

/** Effective checklist: auto-derivation OR a manual row can satisfy an item. */
export function checklistFor(projectId: string, ctx: DerivationCtx): ChecklistState[] {
  return CHECKLIST_DEFS.map((def) => {
    const row = ctx.rows.find((r) => r.projectId === projectId && r.itemKey === def.key);
    const auto = autoState(def, projectId, ctx);
    if (auto) return { ...def, state: "done", fromAuto: true };
    if (row && row.status !== "pending") return { ...def, state: row.status, fromAuto: false };
    return { ...def, state: "pending", fromAuto: false };
  });
}

export type Readiness = {
  /** released = job is at/past the release line */
  phase: "pre" | "released";
  ready: boolean;
  missing: string[]; // labels of unmet required items + unmet release-line gates
};

export function readinessFor(project: Project, ctx: DerivationCtx): Readiness {
  const releaseIdx = STAGES.indexOf(RELEASE_STAGE);
  if (STAGES.indexOf(project.stage) >= releaseIdx) return { phase: "released", ready: true, missing: [] };

  const missing: string[] = [];
  for (const item of checklistFor(project.id, ctx)) {
    if (item.required && item.state === "pending") missing.push(item.label);
  }
  for (const def of GATE_DEFS) {
    if (STAGES.indexOf(def.blocksStage) > releaseIdx) continue; // only release-line and earlier gates count
    const g = gateFor(ctx, project.id, def.key);
    if (!gateSatisfied(g)) missing.push(def.label);
  }
  return { phase: "pre", ready: missing.length === 0, missing: Array.from(new Set(missing)) };
}

export type MoveCheck = {
  blocked: { def: GateDef; gate?: Gate }[];
  warnings: { def: GateDef; gate?: Gate }[];
};

/**
 * Gate check for a forward stage move. Gates whose blocked stage is entered or
 * passed by this move, and which are not approved/n_a, either block or warn.
 * Jobs with no gate rows (created before Phase 1) fall back to warn for every
 * gate, so existing pilot data is never hard-blocked.
 */
export function checkMove(project: Project, target: Stage, gates: Gate[]): MoveCheck {
  const from = STAGES.indexOf(project.stage);
  const to = STAGES.indexOf(target);
  const result: MoveCheck = { blocked: [], warnings: [] };
  if (to <= from) return result; // backward/no-op moves are always allowed

  const projectGates = gates.filter((g) => g.projectId === project.id);
  const legacy = projectGates.length === 0;

  for (const def of GATE_DEFS) {
    const gi = STAGES.indexOf(def.blocksStage);
    if (gi <= from || gi > to) continue;
    const gate = projectGates.find((g) => g.gateKey === def.key);
    if (gateSatisfied(gate)) continue;
    const mode: GateMode = legacy ? "warn" : gate ? gate.mode : def.defaultMode;
    if (mode === "block") result.blocked.push({ def, gate });
    else result.warnings.push({ def, gate });
  }
  return result;
}
