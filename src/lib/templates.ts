import type { GateMode, GateStatus, TaskTeam } from "./types";

// Phase 4 (docs/LEAN_PLAN_2026_06_10.md §10). These are the STARTER templates a
// workspace installs once from Settings; after that the DB copies are the truth
// and fully editable there. Nothing at runtime reads this file except the
// "Install starter templates" action.

export type TaskPayload = { title: string; team?: TaskTeam; offsetDays?: number; priority?: "Low" | "Normal" | "High" | "Rush" };
export type ChecklistPayload = { label: string; required?: boolean };
export type GatePayload = { key: string; mode?: GateMode; status?: GateStatus };

export type TemplateItemSeed =
  | { kind: "task"; payload: TaskPayload }
  | { kind: "checklist"; payload: ChecklistPayload }
  | { kind: "gate"; payload: GatePayload };

export type TemplateSeed = {
  name: string;
  jobType: string;
  items: TemplateItemSeed[];
};

export const STARTER_TEMPLATES: TemplateSeed[] = [
  {
    name: "Kitchen job",
    jobType: "kitchen",
    items: [
      { kind: "gate", payload: { key: "appliance_specs", mode: "block" } },
      { kind: "task", payload: { title: "Send proposal for signature", team: "office", offsetDays: 1 } },
      { kind: "task", payload: { title: "Collect deposit invoice", team: "office", offsetDays: 3 } },
      { kind: "task", payload: { title: "Schedule field measure", team: "field", offsetDays: 5 } },
      { kind: "task", payload: { title: "Collect appliance spec sheets", team: "office", offsetDays: 7 } },
      { kind: "task", payload: { title: "Finish sample made and sent", team: "shop", offsetDays: 10 } },
      { kind: "task", payload: { title: "Hardware selections confirmed", team: "design", offsetDays: 10 } },
      { kind: "task", payload: { title: "Drawings to client for sign-off", team: "design", offsetDays: 12 } },
      { kind: "task", payload: { title: "Order materials", team: "office", offsetDays: 14 } },
      { kind: "task", payload: { title: "Release cut list to the floor", team: "shop", offsetDays: 18 } },
    ],
  },
  {
    name: "Bath/vanity job",
    jobType: "bath",
    items: [
      { kind: "gate", payload: { key: "appliance_specs", status: "n_a" } },
      { kind: "task", payload: { title: "Send proposal for signature", team: "office", offsetDays: 1 } },
      { kind: "task", payload: { title: "Schedule field measure", team: "field", offsetDays: 4 } },
      { kind: "task", payload: { title: "Confirm top material and sink cutout", team: "design", offsetDays: 6 } },
      { kind: "task", payload: { title: "Finish confirmed with client", team: "design", offsetDays: 7 } },
      { kind: "task", payload: { title: "Order materials", team: "office", offsetDays: 9 } },
    ],
  },
  {
    name: "Built-in/closet job",
    jobType: "built_in",
    items: [
      { kind: "gate", payload: { key: "appliance_specs", status: "n_a" } },
      { kind: "task", payload: { title: "Field measure — verify walls, outlets, vents", team: "field", offsetDays: 2, priority: "High" } },
      { kind: "task", payload: { title: "Confirm interior layout with client", team: "design", offsetDays: 5 } },
      { kind: "task", payload: { title: "Order materials", team: "office", offsetDays: 8 } },
    ],
  },
  {
    name: "Commercial/millwork job",
    jobType: "commercial",
    items: [
      { kind: "gate", payload: { key: "hardware_approval", mode: "block" } },
      { kind: "checklist", payload: { label: "Submittal package approved by GC", required: true } },
      { kind: "checklist", payload: { label: "Site conditions verified with super", required: true } },
      { kind: "task", payload: { title: "Prepare submittal package", team: "design", offsetDays: 3 } },
      { kind: "task", payload: { title: "Send submittals to GC/builder", team: "office", offsetDays: 5 } },
      { kind: "task", payload: { title: "Chase submittal approval", team: "office", offsetDays: 12 } },
      { kind: "task", payload: { title: "Confirm delivery window with super", team: "office", offsetDays: 20 } },
    ],
  },
  {
    name: "Install prep",
    jobType: "task_pack",
    items: [
      { kind: "task", payload: { title: "Site check — floors done, HVAC on, power live", team: "field", offsetDays: 0, priority: "High" } },
      { kind: "task", payload: { title: "Floor and wall protection loaded", team: "shop", offsetDays: 1 } },
      { kind: "task", payload: { title: "Hardware kits pulled and labeled per room", team: "shop", offsetDays: 1 } },
      { kind: "task", payload: { title: "Touch-up kit packed (finish, filler, pens)", team: "shop", offsetDays: 1 } },
      { kind: "task", payload: { title: "Confirm crew and truck for install day", team: "office", offsetDays: 0 } },
    ],
  },
  {
    name: "Punch list",
    jobType: "task_pack",
    items: [
      { kind: "task", payload: { title: "Walkthrough with client — list every punch item", team: "field", offsetDays: 0, priority: "High" } },
      { kind: "task", payload: { title: "Order/replace any damaged parts", team: "office", offsetDays: 2 } },
      { kind: "task", payload: { title: "Complete punch items on site", team: "field", offsetDays: 7 } },
      { kind: "task", payload: { title: "Client sign-off on completion", team: "office", offsetDays: 8, priority: "High" } },
    ],
  },
  {
    name: "Finish approval",
    jobType: "task_pack",
    items: [
      { kind: "task", payload: { title: "Make finish sample", team: "shop", offsetDays: 2 } },
      { kind: "task", payload: { title: "Send/show sample to client", team: "office", offsetDays: 4 } },
      { kind: "task", payload: { title: "Log client confirmation on the job timeline", team: "office", offsetDays: 7, priority: "High" } },
    ],
  },
];
