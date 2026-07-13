export type Stage =
  | "Quote"
  | "Design"
  | "Approved"
  | "Materials"
  | "Cut/CNC"
  | "Assembly"
  | "Sanding"
  | "Finish"
  | "QC"
  | "Delivery"
  | "Install"
  | "Punch List"
  | "Complete";

export const STAGES: Stage[] = [
  "Quote","Design","Approved","Materials","Cut/CNC","Assembly","Sanding","Finish","QC","Delivery","Install","Punch List","Complete",
];

export type Client = {
  id: string;
  name: string;
  type: "Homeowner" | "Designer" | "GC" | "Builder";
  email: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string;
};

export type Project = {
  id: string;
  jobNumber: string;
  name: string;
  clientId: string;
  stage: Stage;
  contractTotal: number;
  paid: number;
  startDate: string;
  dueDate: string;
  description?: string;
  woodSpecies?: string;
  finish?: string;
  hardware?: string;
  squareFeet?: number;
  cabinetCount?: number;
  priority: "Low" | "Normal" | "High" | "Rush";
  createdAt: string;
  /** set the first time the job crosses the release-to-production line */
  releasedAt?: string;
};

export type Material = {
  id: string;
  sku: string;
  name: string;
  category: "Sheet Goods" | "Hardwood" | "Hardware" | "Finish" | "Edge Banding" | "Misc";
  unit: string;
  costPerUnit: number;
  inStock: number;
  reorderAt: number;
  supplier: string;
};

export type CutListItem = {
  id: string;
  projectId: string;
  part: string;
  material: string;
  qty: number;
  length: number;
  width: number;
  thickness: number;
  done: boolean;
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  supplier: string;
  projectId?: string;
  status: "Draft" | "Sent" | "Confirmed" | "Received" | "Closed";
  total: number;
  items: { name: string; qty: number; cost: number }[];
  createdAt: string;
  expectedDate: string;
};

export type TimeEntry = {
  id: string;
  workerName: string;
  projectId: string;
  stage: Stage;
  startedAt: string;
  endedAt?: string;
  hours?: number;
};

export type ScheduleEvent = {
  id: string;
  projectId: string;
  type: "Measure" | "Delivery" | "Install" | "Site Visit" | "Punch List";
  date: string;
  notes?: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  projectId: string;
  amount: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  dueDate: string;
  issuedAt: string;
  isDeposit: boolean;
};

// ---- Phase 1: approval gates + readiness (docs/LEAN_PLAN_2026_06_10.md) ----

export type GateStatus = "not_started" | "in_progress" | "waiting_external" | "approved" | "declined" | "n_a";
export type GateMode = "block" | "warn";

export type Gate = {
  id: string;
  projectId: string;
  gateKey: string;
  status: GateStatus;
  mode: GateMode;
  blocksStage: Stage | null;
  dueDate: string;
  resolvedAt?: string;
};

export type ChecklistRow = {
  id: string;
  projectId: string;
  itemKey: string;
  status: "pending" | "done" | "n_a";
  /** label + required matter for template-added custom items (Phase 4) */
  label?: string;
  required?: boolean;
};

// ---- Phase 2: tasks + constraints (docs/LEAN_PLAN_2026_06_10.md §8) ----

export type TaskStatus = "open" | "in_progress" | "done" | "canceled";
export type TaskTeam = "office" | "shop" | "field" | "design";
export type WaitingOn = "client" | "design" | "material" | "vendor" | "install_date" | "internal";

export const WAITING_ON_LABELS: Record<WaitingOn, string> = {
  client: "Waiting on Client",
  design: "Waiting on Design",
  material: "Waiting on Material",
  vendor: "Waiting on Vendor",
  install_date: "Waiting on Install Date",
  internal: "Waiting Internal",
};

export type Task = {
  id: string;
  projectId?: string;
  title: string;
  ownerUserId?: string;
  team?: TaskTeam;
  dueDate: string;
  status: TaskStatus;
  priority: "Low" | "Normal" | "High" | "Rush";
  isBlocker: boolean;
  waitingOn?: WaitingOn;
  stage?: string;
  doneAt?: string;
  createdAt: string;
};

/** Workspace member with email, from the workspace_member_emails() RPC. */
export type Member = {
  userId: string;
  email: string;
  role: string;
  joinedAt: string;
};

// ---- Phase 3: per-job message timeline (docs/LEAN_PLAN_2026_06_10.md §9) ----

export type MessageKind = "internal_note" | "client_note" | "approval_request" | "client_response" | "system";

export type Message = {
  id: string;
  projectId: string;
  kind: MessageKind;
  body: string;
  gateId?: string;
  taskId?: string;
  authorUserId: string;
  createdAt: string;
};

/** Append-only audit rows (stage moves, gate changes, overrides) from Phase 1. */
export type ActivityRow = {
  id: string;
  projectId: string;
  actorUserId?: string;
  verb: string;
  detail: Record<string, unknown>;
  createdAt: string;
};

// ---- Phase 4: standard work templates (docs/LEAN_PLAN_2026_06_10.md §10) ----

export type JobTemplate = {
  id: string;
  name: string;
  jobType: string;
  isDefault: boolean;
  createdAt: string;
};

export type TemplateItem = {
  id: string;
  templateId: string;
  kind: "task" | "checklist" | "gate";
  payload: Record<string, unknown>;
  sort: number;
};
