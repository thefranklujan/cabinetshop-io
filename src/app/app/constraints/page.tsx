"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore } from "@/lib/store";
import { WAITING_ON_LABELS } from "@/lib/types";
import {
  constraintCards, WAITING_LANES, OVERDUE_APPROVALS_LANE, OVERDUE_TASKS_LANE,
} from "@/lib/constraints";
import { AlertTriangle, CalendarClock, ShieldAlert } from "lucide-react";
import Link from "next/link";

// The lean control tower (docs/LEAN_PLAN_2026_06_10.md §8): every lane is a
// reason work is stuck; the oldest card in the room is today's first phone call.
export default function ConstraintsPage() {
  const { tasks, gates, projects, members } = useStore();
  const cards = constraintCards(tasks, gates, projects);

  const emailOf = (userId?: string) => members.find((m) => m.userId === userId)?.email || "";
  const projectOf = (id?: string) => projects.find((p) => p.id === id);

  const lanes: { title: string; computed?: boolean }[] = [
    ...WAITING_LANES.map((w) => ({ title: WAITING_ON_LABELS[w] })),
    { title: OVERDUE_APPROVALS_LANE, computed: true },
    { title: OVERDUE_TASKS_LANE, computed: true },
  ];
  const nonEmpty = lanes.filter((l) => cards.some((c) => c.lane === l.title));
  const oldest = cards[0];

  return (
    <>
      <PageHeader
        title="Constraints"
        sub={
          cards.length === 0
            ? "Nothing is waiting on anyone. Clear board."
            : `${cards.length} open constraint${cards.length === 1 ? "" : "s"} · oldest: ${oldest.ageDays} day${oldest.ageDays === 1 ? "" : "s"}`
        }
      />

      {cards.length === 0 ? (
        <div className="card p-10 text-center">
          <AlertTriangle className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
          <div className="text-[15px] font-semibold text-neutral-300">No open constraints</div>
          <p className="text-[13px] text-neutral-600 mt-2 max-w-md mx-auto">
            When a task is marked as waiting on a client, vendor, material, design, or install
            date, or an approval goes past due, it shows up here sorted by age.
          </p>
          <Link href="/app/tasks" className="btn mt-5 inline-flex">Go to Tasks</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {nonEmpty.map((lane) => {
            const laneCards = cards.filter((c) => c.lane === lane.title);
            return (
              <div key={lane.title} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[13px] uppercase tracking-wider font-bold text-neutral-400 flex items-center gap-2">
                    {lane.computed ? (
                      <CalendarClock className="w-4 h-4 text-red-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-orange-400" />
                    )}
                    {lane.title}
                  </h2>
                  <span className="chip">{laneCards.length}</span>
                </div>
                <div className="space-y-2.5">
                  {laneCards.map((c) => {
                    const p = projectOf(c.projectId);
                    return (
                      <div key={c.key} className="rounded-lg border border-neutral-900 bg-[#0f0f0f] p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-white truncate">{c.title}</div>
                            <div className="text-[11px] text-neutral-500 mt-1 truncate">
                              {p ? (
                                <Link href={`/app/tasks?project=${p.id}`} className="hover:text-amber-500">
                                  {p.jobNumber ? `${p.jobNumber} · ` : ""}{p.name}
                                </Link>
                              ) : (
                                "Shop"
                              )}
                              {emailOf(c.ownerUserId) ? ` · ${emailOf(c.ownerUserId)}` : ""}
                            </div>
                          </div>
                          <span
                            className={`chip whitespace-nowrap shrink-0 ${
                              c.overdue
                                ? "text-red-400 border-red-500/30"
                                : c.ageDays >= 7
                                  ? "text-orange-400 border-orange-500/30"
                                  : "text-neutral-400"
                            }`}
                            title={c.overdue ? "Days past due" : "Days waiting"}
                          >
                            {c.ageDays}d
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
