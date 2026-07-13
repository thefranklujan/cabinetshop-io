import type { ActivityRow, Project, Stage } from "./types";

// Phase 5 (docs/LEAN_PLAN_2026_06_10.md §11): stage age is derived from the
// append-only activity stream — no new columns. A job's "entered current stage"
// moment is its most recent move event landing on that stage; jobs that have
// never moved since Phase 1 fall back to their creation date (age reads high for
// old imports, which errs on the side of surfacing them — acceptable for v1).

const MOVE_VERBS = new Set(["stage_moved", "stage_moved_past_warnings", "gate_overridden"]);

const dayMs = 86_400_000;

export function stageEnteredAt(project: Project, activity: ActivityRow[]): string {
  for (const a of activity) {
    // activity arrives newest-first from the store
    if (a.projectId !== project.id) continue;
    if (!MOVE_VERBS.has(a.verb)) continue;
    if ((a.detail as { to?: string }).to === project.stage) return a.createdAt;
  }
  return project.createdAt;
}

export function daysInStage(project: Project, activity: ActivityRow[], now = new Date()): number {
  const entered = stageEnteredAt(project, activity);
  if (!entered) return 0;
  const t = new Date(entered.length <= 10 ? `${entered}T00:00:00` : entered).getTime();
  return Math.max(0, Math.floor((now.getTime() - t) / dayMs));
}

export type StageAging = {
  stage: Stage;
  count: number;
  value: number;
  avgDays: number;
  maxDays: number;
};

/** Per-stage aging for WIP stages (bottleneck spotting). */
export function agingByStage(
  projects: Project[], activity: ActivityRow[], stages: Stage[], now = new Date(),
): StageAging[] {
  return stages.map((stage) => {
    const inStage = projects.filter((p) => p.stage === stage);
    const ages = inStage.map((p) => daysInStage(p, activity, now));
    return {
      stage,
      count: inStage.length,
      value: inStage.reduce((s, p) => s + p.contractTotal, 0),
      avgDays: ages.length ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length) : 0,
      maxDays: ages.length ? Math.max(...ages) : 0,
    };
  });
}
