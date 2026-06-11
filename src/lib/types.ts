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
};
