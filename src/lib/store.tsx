"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "./supabase/client";
import type {
  Client, Project, Material, CutListItem, PurchaseOrder, TimeEntry, ScheduleEvent, Invoice, Stage,
} from "./types";

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

type Store = {
  clients: Client[];
  projects: Project[];
  materials: Material[];
  cutlist: CutListItem[];
  pos: PurchaseOrder[];
  time: TimeEntry[];
  schedule: ScheduleEvent[];
  invoices: Invoice[];
};

type Ctx = Store & {
  loading: boolean;
  workspaceId: string | null;
  role: WorkspaceRole;
  /** owner/admin/member — may create and edit operational records */
  canWrite: boolean;
  /** owner/admin — may delete records and manage team/settings */
  canManage: boolean;
  setStore: React.Dispatch<React.SetStateAction<Store>>;
  addClient: (c: Omit<Client, "id" | "createdAt">) => Promise<void>;
  updateClient: (id: string, patch: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addProject: (p: Omit<Project, "id" | "createdAt">) => Promise<void>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  moveProjectStage: (id: string, stage: Stage) => Promise<void>;
  addMaterial: (m: Omit<Material, "id">) => Promise<void>;
  updateMaterial: (id: string, patch: Partial<Material>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  addCutListItem: (c: Omit<CutListItem, "id">) => Promise<void>;
  toggleCutListItem: (id: string) => Promise<void>;
  deleteCutListItem: (id: string) => Promise<void>;
  addPO: (p: Omit<PurchaseOrder, "id" | "createdAt">) => Promise<void>;
  updatePO: (id: string, patch: Partial<PurchaseOrder>) => Promise<void>;
  deletePO: (id: string) => Promise<void>;
  addScheduleEvent: (s: Omit<ScheduleEvent, "id">) => Promise<void>;
  deleteScheduleEvent: (id: string) => Promise<void>;
  addInvoice: (i: Omit<Invoice, "id">) => Promise<void>;
  updateInvoice: (id: string, patch: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  resetData: () => Promise<void>;
};

const StoreContext = createContext<Ctx | null>(null);

const empty: Store = {
  clients: [], projects: [], materials: [], cutlist: [], pos: [], time: [], schedule: [], invoices: [],
};

// Supabase row -> camelCase mappers
const fromClient = (r: any): Client => ({
  id: r.id, name: r.name, type: r.type, email: r.email || "", phone: r.phone || "",
  address: r.address || "", notes: r.notes, createdAt: r.created_at?.slice(0, 10) || "",
});
const toClient = (c: Partial<Client>) => ({
  name: c.name, type: c.type, email: c.email, phone: c.phone, address: c.address, notes: c.notes,
});

const fromProject = (r: any): Project => ({
  id: r.id, jobNumber: r.job_number || "", name: r.name, clientId: r.client_id || "",
  stage: r.stage as Stage, contractTotal: Number(r.contract_total || 0), paid: Number(r.paid || 0),
  startDate: r.start_date || "", dueDate: r.due_date || "", description: r.description,
  woodSpecies: r.wood_species, finish: r.finish, hardware: r.hardware,
  squareFeet: r.square_feet, cabinetCount: r.cabinet_count,
  priority: (r.priority || "Normal") as any, createdAt: r.created_at?.slice(0, 10) || "",
});
const toProject = (p: Partial<Project>) => ({
  job_number: p.jobNumber, name: p.name, client_id: p.clientId || null, stage: p.stage,
  contract_total: p.contractTotal, paid: p.paid, start_date: p.startDate || null,
  due_date: p.dueDate || null, description: p.description, wood_species: p.woodSpecies,
  finish: p.finish, hardware: p.hardware, square_feet: p.squareFeet,
  cabinet_count: p.cabinetCount, priority: p.priority,
});

const fromMaterial = (r: any): Material => ({
  id: r.id, sku: r.sku || "", name: r.name, category: r.category, unit: r.unit || "ea",
  costPerUnit: Number(r.cost_per_unit || 0), inStock: Number(r.in_stock || 0),
  reorderAt: Number(r.reorder_at || 0), supplier: r.supplier || "",
});
const toMaterial = (m: Partial<Material>) => ({
  sku: m.sku, name: m.name, category: m.category, unit: m.unit,
  cost_per_unit: m.costPerUnit, in_stock: m.inStock, reorder_at: m.reorderAt, supplier: m.supplier,
});

const fromCut = (r: any): CutListItem => ({
  id: r.id, projectId: r.project_id, part: r.part, material: r.material || "",
  qty: r.qty, length: Number(r.length || 0), width: Number(r.width || 0),
  thickness: Number(r.thickness || 0), done: r.done,
});
const toCut = (c: Partial<CutListItem>) => ({
  project_id: c.projectId, part: c.part, material: c.material, qty: c.qty,
  length: c.length, width: c.width, thickness: c.thickness, done: c.done,
});

const fromPO = (r: any): PurchaseOrder => ({
  id: r.id, poNumber: r.po_number || "", supplier: r.supplier, projectId: r.project_id || undefined,
  status: r.status, total: Number(r.total || 0), items: r.items || [],
  expectedDate: r.expected_date || "", createdAt: r.created_at?.slice(0, 10) || "",
});
const toPO = (p: Partial<PurchaseOrder>) => ({
  po_number: p.poNumber, supplier: p.supplier, project_id: p.projectId || null,
  status: p.status, total: p.total, items: p.items, expected_date: p.expectedDate || null,
});

const fromTime = (r: any): TimeEntry => ({
  id: r.id, workerName: r.worker_name, projectId: r.project_id || "",
  stage: r.stage as Stage, startedAt: r.started_at, endedAt: r.ended_at || undefined,
  hours: r.hours ? Number(r.hours) : undefined,
});

const fromSchedule = (r: any): ScheduleEvent => ({
  id: r.id, projectId: r.project_id || "", type: r.type, date: r.date, notes: r.notes || undefined,
});
const toSchedule = (s: Partial<ScheduleEvent>) => ({
  project_id: s.projectId, type: s.type, date: s.date, notes: s.notes,
});

const fromInvoice = (r: any): Invoice => ({
  id: r.id, invoiceNumber: r.invoice_number || "", projectId: r.project_id || "",
  amount: Number(r.amount || 0), status: r.status, dueDate: r.due_date || "",
  issuedAt: r.issued_at || "",
});
const toInvoice = (i: Partial<Invoice>) => ({
  invoice_number: i.invoiceNumber, project_id: i.projectId, amount: i.amount,
  status: i.status, due_date: i.dueDate || null, issued_at: i.issuedAt || null,
});

export function StoreProvider({
  children,
  workspaceId,
  role = "viewer",
}: {
  children: React.ReactNode;
  workspaceId: string;
  role?: WorkspaceRole;
}) {
  const supabase = createClient();
  const [store, setStore] = useState<Store>(empty);
  const [loading, setLoading] = useState(true);

  // Client-side role gates. These mirror the RLS policies (security_pass_1) so the UI
  // fails fast with a clear message instead of bouncing off a silent RLS denial.
  // RLS remains the authoritative enforcement layer.
  const canWrite = role === "owner" || role === "admin" || role === "member";
  const canManage = role === "owner" || role === "admin";
  const denyWrite = () => {
    if (typeof window !== "undefined") alert("Your access to this shop is view-only.");
  };
  const denyDelete = () => {
    if (typeof window !== "undefined") alert("Only owners and admins can delete records.");
  };
  // Surface failed mutations instead of swallowing them. Without this, an RLS denial
  // or network error looks like a successful save (the UI just reloads unchanged).
  const failed = (action: string, error: { message: string } | null) => {
    if (!error) return false;
    if (typeof window !== "undefined") alert(`${action} failed: ${error.message}`);
    return true;
  };

  const reload = useCallback(async () => {
    setLoading(true);
    // Scope every read to the active workspace. RLS already limits rows to the caller's
    // workspaces, but a user in multiple shops would otherwise see merged data — and the
    // workspace switcher depends on this filter to show the selected shop only.
    const [c, p, m, cl, po, te, sc, iv] = await Promise.all([
      supabase.from("clients").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.from("projects").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.from("materials").select("*").eq("workspace_id", workspaceId).order("name"),
      supabase.from("cut_list_items").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.from("purchase_orders").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.from("time_entries").select("*").eq("workspace_id", workspaceId).order("started_at", { ascending: false }),
      supabase.from("schedule_events").select("*").eq("workspace_id", workspaceId).order("date"),
      supabase.from("invoices").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    ]);
    setStore({
      clients: (c.data || []).map(fromClient),
      projects: (p.data || []).map(fromProject),
      materials: (m.data || []).map(fromMaterial),
      cutlist: (cl.data || []).map(fromCut),
      pos: (po.data || []).map(fromPO),
      time: (te.data || []).map(fromTime),
      schedule: (sc.data || []).map(fromSchedule),
      invoices: (iv.data || []).map(fromInvoice),
    });
    setLoading(false);
  }, [supabase, workspaceId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Generic helpers that always include workspace_id
  const ws = { workspace_id: workspaceId };

  const value: Ctx = {
    ...store,
    loading,
    workspaceId,
    role,
    canWrite,
    canManage,
    setStore,
    addClient: async (c) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("clients").insert({ ...toClient(c), ...ws });
      if (failed("Adding the client", error)) return;
      reload();
    },
    updateClient: async (id, patch) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("clients").update(toClient(patch)).eq("id", id);
      if (failed("Saving the client", error)) return;
      reload();
    },
    deleteClient: async (id) => {
      if (!canManage) return denyDelete();
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (failed("Deleting the client", error)) return;
      reload();
    },
    addProject: async (p) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("projects").insert({ ...toProject(p), ...ws });
      if (failed("Adding the project", error)) return;
      reload();
    },
    updateProject: async (id, patch) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("projects").update(toProject(patch)).eq("id", id);
      if (failed("Saving the project", error)) return;
      reload();
    },
    deleteProject: async (id) => {
      if (!canManage) return denyDelete();
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (failed("Deleting the project", error)) return;
      reload();
    },
    moveProjectStage: async (id, stage) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("projects").update({ stage }).eq("id", id);
      if (failed("Moving the job", error)) return;
      setStore((s) => ({ ...s, projects: s.projects.map((x) => (x.id === id ? { ...x, stage } : x)) }));
    },
    addMaterial: async (m) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("materials").insert({ ...toMaterial(m), ...ws });
      if (failed("Adding the material", error)) return;
      reload();
    },
    updateMaterial: async (id, patch) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("materials").update(toMaterial(patch)).eq("id", id);
      if (failed("Saving the material", error)) return;
      setStore((s) => ({ ...s, materials: s.materials.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
    },
    deleteMaterial: async (id) => {
      if (!canManage) return denyDelete();
      const { error } = await supabase.from("materials").delete().eq("id", id);
      if (failed("Deleting the material", error)) return;
      reload();
    },
    addCutListItem: async (c) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("cut_list_items").insert({ ...toCut(c), ...ws });
      if (failed("Adding the part", error)) return;
      reload();
    },
    toggleCutListItem: async (id) => {
      if (!canWrite) return denyWrite();
      const item = store.cutlist.find((x) => x.id === id);
      if (!item) return;
      const { error } = await supabase.from("cut_list_items").update({ done: !item.done }).eq("id", id);
      if (failed("Updating the part", error)) return;
      setStore((s) => ({ ...s, cutlist: s.cutlist.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) }));
    },
    deleteCutListItem: async (id) => {
      if (!canManage) return denyDelete();
      const { error } = await supabase.from("cut_list_items").delete().eq("id", id);
      if (failed("Deleting the part", error)) return;
      reload();
    },
    addPO: async (p) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("purchase_orders").insert({ ...toPO(p), ...ws });
      if (failed("Adding the purchase order", error)) return;
      reload();
    },
    updatePO: async (id, patch) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("purchase_orders").update(toPO(patch)).eq("id", id);
      if (failed("Saving the purchase order", error)) return;
      reload();
    },
    deletePO: async (id) => {
      if (!canManage) return denyDelete();
      const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
      if (failed("Deleting the purchase order", error)) return;
      reload();
    },
    addScheduleEvent: async (e) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("schedule_events").insert({ ...toSchedule(e), ...ws });
      if (failed("Adding the event", error)) return;
      reload();
    },
    deleteScheduleEvent: async (id) => {
      if (!canManage) return denyDelete();
      const { error } = await supabase.from("schedule_events").delete().eq("id", id);
      if (failed("Deleting the event", error)) return;
      reload();
    },
    addInvoice: async (i) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("invoices").insert({ ...toInvoice(i), ...ws });
      if (failed("Adding the invoice", error)) return;
      reload();
    },
    updateInvoice: async (id, patch) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("invoices").update(toInvoice(patch)).eq("id", id);
      if (failed("Saving the invoice", error)) return;
      reload();
    },
    deleteInvoice: async (id) => {
      if (!canManage) return denyDelete();
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (failed("Deleting the invoice", error)) return;
      reload();
    },
    resetData: async () => {
      // No-op in Supabase mode (would be destructive across workspace)
      alert("Reset is disabled in cloud mode. Delete records individually.");
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
