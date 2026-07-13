import type { Gate, Project, Task, WaitingOn } from "./types";
import { WAITING_ON_LABELS } from "./types";
import { GATE_DEFS } from "./readiness";

// Phase 2 of docs/LEAN_PLAN_2026_06_10.md §8: the constraints board is a pure
// query over tasks + gates — no table of its own. Shared by the Constraints
// page and the dashboard's Blocked Jobs card so counts can never disagree.

export type ConstraintCard = {
  key: string;
  lane: string;
  projectId?: string;
  title: string;
  ownerUserId?: string;
  /** days since the constraint arose (waiting) or days past due (overdue) */
  ageDays: number;
  overdue: boolean;
};

export const WAITING_LANES: WaitingOn[] = ["client", "design", "material", "vendor", "install_date", "internal"];
export const OVERDUE_APPROVALS_LANE = "Overdue Approvals";
export const OVERDUE_TASKS_LANE = "Overdue Tasks";

const dayMs = 86_400_000;
const daysSince = (iso: string, now: Date) =>
  Math.max(0, Math.floor((now.getTime() - new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso).getTime()) / dayMs));

const taskOpen = (t: Task) => t.status === "open" || t.status === "in_progress";

/** Open tasks flagged as blockers or waiting on someone — the "blocked" signal. */
export const blockingTasks = (tasks: Task[]) => tasks.filter((t) => taskOpen(t) && (t.isBlocker || !!t.waitingOn));

/** Distinct projects with an active blocker/waiting task (dashboard count). */
export function blockedProjectIds(tasks: Task[]): Set<string> {
  const ids = new Set<string>();
  for (const t of blockingTasks(tasks)) if (t.projectId) ids.add(t.projectId);
  return ids;
}

export function constraintCards(tasks: Task[], gates: Gate[], projects: Project[], now = new Date()): ConstraintCard[] {
  const cards: ConstraintCard[] = [];
  const active = new Set(projects.filter((p) => p.stage !== "Complete").map((p) => p.id));

  for (const t of tasks) {
    if (!taskOpen(t)) continue;
    const overdueDays = t.dueDate ? daysSince(t.dueDate, now) : 0;
    const overdue = !!t.dueDate && overdueDays > 0;
    if (t.waitingOn) {
      cards.push({
        key: `task-wait-${t.id}`, lane: WAITING_ON_LABELS[t.waitingOn], projectId: t.projectId,
        title: t.title, ownerUserId: t.ownerUserId, ageDays: daysSince(t.createdAt || "", now), overdue,
      });
    } else if (overdue) {
      cards.push({
        key: `task-due-${t.id}`, lane: OVERDUE_TASKS_LANE, projectId: t.projectId,
        title: t.title, ownerUserId: t.ownerUserId, ageDays: overdueDays, overdue: true,
      });
    }
  }

  for (const g of gates) {
    if (g.status === "approved" || g.status === "n_a") continue;
    if (!active.has(g.projectId)) continue;
    const label = GATE_DEFS.find((d) => d.key === g.gateKey)?.label ?? g.gateKey;
    const pastDue = !!g.dueDate && daysSince(g.dueDate, now) > 0;
    if (pastDue) {
      cards.push({
        key: `gate-${g.id}`, lane: OVERDUE_APPROVALS_LANE, projectId: g.projectId,
        title: label, ageDays: daysSince(g.dueDate, now), overdue: true,
      });
    } else if (g.status === "waiting_external") {
      // An approval sitting with the client/vendor is a live constraint even
      // without a due date; age counts from the due date once one is set.
      cards.push({
        key: `gate-${g.id}`, lane: WAITING_ON_LABELS.client, projectId: g.projectId,
        title: `Approval: ${label}`, ageDays: 0, overdue: false,
      });
    }
  }

  return cards.sort((a, b) => b.ageDays - a.ageDays);
}
