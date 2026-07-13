"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "./supabase/client";
import type {
  Client, Project, Material, CutListItem, PurchaseOrder, TimeEntry, ScheduleEvent, Invoice, Stage,
  Gate, GateStatus, ChecklistRow, Task, Member, Message, MessageKind, ActivityRow,
  JobTemplate, TemplateItem, GateMode,
} from "./types";
import { GATE_DEFS, RELEASE_STAGE } from "./readiness";
import { STAGES } from "./types";
import { STARTER_TEMPLATES } from "./templates";

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
  gates: Gate[];
  checklistRows: ChecklistRow[];
  tasks: Task[];
  members: Member[];
  messages: Message[];
  activity: ActivityRow[];
  templates: JobTemplate[];
  templateItems: TemplateItem[];
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
  addProject: (p: Omit<Project, "id" | "createdAt">, templateId?: string) => Promise<void>;
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
  /** Move with an override of blocking gates: logs reason to activity (admin/owner only). */
  overrideMoveProjectStage: (id: string, stage: Stage, reason: string, gateKeys: string[]) => Promise<void>;
  /** Move past warn-mode gates: logs which warnings were acknowledged. */
  moveProjectStageWithWarnings: (id: string, stage: Stage, gateKeys: string[]) => Promise<void>;
  setGateStatus: (projectId: string, gateKey: string, status: GateStatus) => Promise<void>;
  setGateDueDate: (projectId: string, gateKey: string, dueDate: string) => Promise<void>;
  setChecklistItem: (projectId: string, itemKey: string, label: string, status: "pending" | "done" | "n_a") => Promise<void>;
  addTask: (t: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addMessage: (projectId: string, kind: MessageKind, body: string, gateId?: string) => Promise<void>;
  addTemplate: (name: string, jobType: string) => Promise<void>;
  renameTemplate: (id: string, name: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  addTemplateItem: (templateId: string, kind: TemplateItem["kind"], payload: Record<string, unknown>, sort: number) => Promise<void>;
  deleteTemplateItem: (id: string) => Promise<void>;
  installStarterTemplates: () => Promise<void>;
  resetData: () => Promise<void>;
};

const StoreContext = createContext<Ctx | null>(null);

const empty: Store = {
  clients: [], projects: [], materials: [], cutlist: [], pos: [], time: [], schedule: [], invoices: [],
  gates: [], checklistRows: [], tasks: [], members: [], messages: [], activity: [],
  templates: [], templateItems: [],
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
  releasedAt: r.released_to_production_at || undefined,
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
  issuedAt: r.issued_at || "", isDeposit: !!r.is_deposit,
});
const toInvoice = (i: Partial<Invoice>) => ({
  invoice_number: i.invoiceNumber, project_id: i.projectId, amount: i.amount,
  status: i.status, due_date: i.dueDate || null, issued_at: i.issuedAt || null,
  is_deposit: i.isDeposit ?? false,
});

const fromGate = (r: any): Gate => ({
  id: r.id, projectId: r.project_id, gateKey: r.gate_key, status: r.status,
  mode: r.mode, blocksStage: r.blocks_stage || null, dueDate: r.due_date || "",
  resolvedAt: r.resolved_at || undefined,
});

const fromChecklistRow = (r: any): ChecklistRow => ({
  id: r.id, projectId: r.project_id, itemKey: r.item_key, status: r.status,
  label: r.label || undefined, required: r.required_for_release ?? true,
});

const fromTask = (r: any): Task => ({
  id: r.id, projectId: r.project_id || undefined, title: r.title,
  ownerUserId: r.owner_user_id || undefined, team: r.team || undefined,
  dueDate: r.due_date || "", status: r.status, priority: r.priority,
  isBlocker: !!r.is_blocker, waitingOn: r.waiting_on || undefined,
  stage: r.stage || undefined, doneAt: r.done_at || undefined,
  createdAt: r.created_at || "",
});
const toTask = (t: Partial<Task>) => ({
  project_id: t.projectId || null, title: t.title, owner_user_id: t.ownerUserId || null,
  team: t.team || null, due_date: t.dueDate || null, status: t.status,
  priority: t.priority, is_blocker: t.isBlocker ?? false, waiting_on: t.waitingOn || null,
  stage: t.stage || null,
});

const fromMember = (r: any): Member => ({
  userId: r.user_id, email: r.email || "", role: r.role, joinedAt: r.joined_at || "",
});

const fromMessage = (r: any): Message => ({
  id: r.id, projectId: r.project_id, kind: r.kind, body: r.body,
  gateId: r.gate_id || undefined, taskId: r.task_id || undefined,
  authorUserId: r.author_user_id, createdAt: r.created_at || "",
});

const fromActivity = (r: any): ActivityRow => ({
  id: r.id, projectId: r.project_id, actorUserId: r.actor_user_id || undefined,
  verb: r.verb, detail: r.detail || {}, createdAt: r.created_at || "",
});

const fromTemplate = (r: any): JobTemplate => ({
  id: r.id, name: r.name, jobType: r.job_type || "general", isDefault: !!r.is_default,
  createdAt: r.created_at || "",
});

const fromTemplateItem = (r: any): TemplateItem => ({
  id: r.id, templateId: r.template_id, kind: r.kind, payload: r.payload || {}, sort: r.sort ?? 0,
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
  const denyManage = () => {
    if (typeof window !== "undefined") alert("Only owners and admins can manage templates.");
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
    const [c, p, m, cl, po, te, sc, iv, ga, ck, tk, me, ms, ac, tp, ti] = await Promise.all([
      supabase.from("clients").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.from("projects").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.from("materials").select("*").eq("workspace_id", workspaceId).order("name"),
      supabase.from("cut_list_items").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.from("purchase_orders").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.from("time_entries").select("*").eq("workspace_id", workspaceId).order("started_at", { ascending: false }),
      supabase.from("schedule_events").select("*").eq("workspace_id", workspaceId).order("date"),
      supabase.from("invoices").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.from("gates").select("*").eq("workspace_id", workspaceId),
      supabase.from("checklist_items").select("*").eq("workspace_id", workspaceId),
      supabase.from("tasks").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.rpc("workspace_member_emails", { ws: workspaceId }),
      supabase.from("messages").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.from("activity").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(500),
      supabase.from("job_templates").select("*").eq("workspace_id", workspaceId).order("created_at"),
      supabase.from("template_items").select("*").eq("workspace_id", workspaceId).order("sort"),
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
      gates: (ga.data || []).map(fromGate),
      checklistRows: (ck.data || []).map(fromChecklistRow),
      tasks: (tk.data || []).map(fromTask),
      members: (me.data || []).map(fromMember),
      messages: (ms.data || []).map(fromMessage),
      activity: (ac.data || []).map(fromActivity),
      templates: (tp.data || []).map(fromTemplate),
      templateItems: (ti.data || []).map(fromTemplateItem),
    });
    setLoading(false);
  }, [supabase, workspaceId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Generic helpers that always include workspace_id
  const ws = { workspace_id: workspaceId };

  const logActivity = async (projectId: string, verb: string, detail: Record<string, unknown>) => {
    const { data } = await supabase.auth.getUser();
    // Best-effort audit write; surfaced if it fails so overrides are never silent.
    const { error } = await supabase.from("activity").insert({
      ...ws, project_id: projectId, actor_user_id: data.user?.id ?? null, verb, detail,
    });
    failed("Recording the activity entry", error);
  };

  // Shared by plain/warned/overridden moves. Stamps released_to_production_at the
  // first time a job crosses the release line.
  const doMove = async (id: string, stage: Stage) => {
    const proj = store.projects.find((p) => p.id === id);
    const patch: Record<string, unknown> = { stage };
    if (
      proj && !proj.releasedAt &&
      STAGES.indexOf(stage) >= STAGES.indexOf(RELEASE_STAGE) &&
      STAGES.indexOf(proj.stage) < STAGES.indexOf(RELEASE_STAGE)
    ) {
      patch.released_to_production_at = new Date().toISOString();
    }
    const { error } = await supabase.from("projects").update(patch).eq("id", id);
    if (failed("Moving the job", error)) return false;
    setStore((s) => ({ ...s, projects: s.projects.map((x) => (x.id === id ? { ...x, stage } : x)) }));
    return true;
  };

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
    addProject: async (p, templateId) => {
      if (!canWrite) return denyWrite();
      const { data, error } = await supabase.from("projects")
        .insert({ ...toProject(p), template_id: templateId || null, ...ws }).select("id").single();
      if (failed("Adding the project", error)) return;
      // New jobs get the full gate set with the lean default modes. Jobs created
      // before Phase 1 have no gate rows and fall back to warn-only (see checkMove).
      // A template (Phase 4) COPIES its overrides/tasks/items onto the job — later
      // template edits never touch this job.
      if (data?.id) {
        const items = templateId ? store.templateItems.filter((i) => i.templateId === templateId) : [];
        const gateOverride = new Map<string, { mode?: GateMode; status?: GateStatus }>();
        for (const i of items) {
          if (i.kind === "gate" && typeof i.payload.key === "string") {
            gateOverride.set(i.payload.key, i.payload as { mode?: GateMode; status?: GateStatus });
          }
        }
        const { error: gErr } = await supabase.from("gates").insert(
          GATE_DEFS.map((d) => {
            const o = gateOverride.get(d.key);
            return {
              ...ws, project_id: data.id, gate_key: d.key,
              mode: o?.mode ?? d.defaultMode, blocks_stage: d.blocksStage,
              status: o?.status ?? "not_started",
              ...(o?.status === "n_a" ? { resolved_at: new Date().toISOString() } : {}),
            };
          }),
        );
        failed("Creating the job's approval gates", gErr);

        const taskRows = items
          .filter((i) => i.kind === "task" && typeof i.payload.title === "string")
          .map((i) => {
            const pl = i.payload as { title: string; team?: string; offsetDays?: number; priority?: string };
            const due = new Date();
            due.setDate(due.getDate() + (pl.offsetDays ?? 0));
            return {
              ...ws, project_id: data.id, title: pl.title, team: pl.team ?? null,
              due_date: due.toISOString().slice(0, 10), priority: pl.priority ?? "Normal",
            };
          });
        if (taskRows.length > 0) {
          const { error: tErr } = await supabase.from("tasks").insert(taskRows);
          failed("Creating the template's tasks", tErr);
        }

        const slug = (s: string) => `tpl_${s.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40)}`;
        const checkRows = items
          .filter((i) => i.kind === "checklist" && typeof i.payload.label === "string")
          .map((i) => {
            const pl = i.payload as { label: string; required?: boolean };
            return {
              ...ws, project_id: data.id, item_key: slug(pl.label), label: pl.label,
              required_for_release: pl.required ?? true,
            };
          });
        if (checkRows.length > 0) {
          const { error: cErr } = await supabase.from("checklist_items").insert(checkRows);
          failed("Creating the template's checklist items", cErr);
        }
      }
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
      const proj = store.projects.find((p) => p.id === id);
      if (await doMove(id, stage)) {
        // Plain moves are logged too — stage aging (Phase 5) is derived from
        // these events. Warned/overridden moves log their own richer entries.
        await logActivity(id, "stage_moved", { from: proj?.stage, to: stage });
      }
    },
    moveProjectStageWithWarnings: async (id, stage, gateKeys) => {
      if (!canWrite) return denyWrite();
      const proj = store.projects.find((p) => p.id === id);
      if (await doMove(id, stage)) {
        await logActivity(id, "stage_moved_past_warnings", { from: proj?.stage, to: stage, gates: gateKeys });
      }
    },
    overrideMoveProjectStage: async (id, stage, reason, gateKeys) => {
      if (!canManage) {
        if (typeof window !== "undefined") alert("Only owners and admins can override a blocking gate.");
        return;
      }
      const proj = store.projects.find((p) => p.id === id);
      if (await doMove(id, stage)) {
        await logActivity(id, "gate_overridden", { from: proj?.stage, to: stage, gates: gateKeys, reason });
      }
    },
    setGateStatus: async (projectId, gateKey, status) => {
      if (!canWrite) return denyWrite();
      const def = GATE_DEFS.find((d) => d.key === gateKey);
      const { data } = await supabase.auth.getUser();
      const resolved = status === "approved" || status === "n_a" || status === "declined";
      const { error } = await supabase.from("gates").upsert(
        {
          ...ws, project_id: projectId, gate_key: gateKey, status,
          // upsert keeps mode/blocks_stage for existing rows; legacy jobs get warn
          // so pre-Phase-1 work is never hard-blocked by touching one gate.
          mode: store.gates.find((g) => g.projectId === projectId && g.gateKey === gateKey)?.mode
            ?? (store.gates.some((g) => g.projectId === projectId) ? def?.defaultMode ?? "warn" : "warn"),
          blocks_stage: def?.blocksStage ?? null,
          resolved_at: resolved ? new Date().toISOString() : null,
          resolved_by: resolved ? data.user?.id ?? null : null,
        },
        { onConflict: "project_id,gate_key" },
      );
      if (failed("Updating the approval gate", error)) return;
      await logActivity(projectId, "gate_status_changed", { gate: gateKey, status });
      // Sending a gate out for approval is a client-facing event — record what was
      // asked and when on the job timeline (Phase 3: the defensible record).
      if (status === "waiting_external" && data.user?.id) {
        const { data: gateRow } = await supabase
          .from("gates").select("id").eq("project_id", projectId).eq("gate_key", gateKey).single();
        const { error: msgErr } = await supabase.from("messages").insert({
          ...ws, project_id: projectId, kind: "approval_request",
          body: `Approval requested: ${def?.label ?? gateKey}`,
          gate_id: gateRow?.id ?? null, author_user_id: data.user.id,
        });
        failed("Recording the approval request", msgErr);
      }
      reload();
    },
    setGateDueDate: async (projectId, gateKey, dueDate) => {
      if (!canWrite) return denyWrite();
      const def = GATE_DEFS.find((d) => d.key === gateKey);
      const existing = store.gates.find((g) => g.projectId === projectId && g.gateKey === gateKey);
      const { error } = await supabase.from("gates").upsert(
        {
          ...ws, project_id: projectId, gate_key: gateKey,
          status: existing?.status ?? "not_started",
          mode: existing?.mode
            ?? (store.gates.some((g) => g.projectId === projectId) ? def?.defaultMode ?? "warn" : "warn"),
          blocks_stage: def?.blocksStage ?? null,
          due_date: dueDate || null,
        },
        { onConflict: "project_id,gate_key" },
      );
      if (failed("Setting the approval due date", error)) return;
      reload();
    },
    setChecklistItem: async (projectId, itemKey, label, status) => {
      if (!canWrite) return denyWrite();
      const { data } = await supabase.auth.getUser();
      const { error } = await supabase.from("checklist_items").upsert(
        {
          ...ws, project_id: projectId, item_key: itemKey, label, status,
          done_at: status === "done" ? new Date().toISOString() : null,
          done_by: status === "done" ? data.user?.id ?? null : null,
        },
        { onConflict: "project_id,item_key" },
      );
      if (failed("Updating the checklist item", error)) return;
      reload();
    },
    addTask: async (t) => {
      if (!canWrite) return denyWrite();
      const { error } = await supabase.from("tasks").insert({ ...toTask(t), ...ws });
      if (failed("Adding the task", error)) return;
      reload();
    },
    updateTask: async (id, patch) => {
      if (!canWrite) return denyWrite();
      const row: Record<string, unknown> = {};
      // Patch only the provided fields — toTask() would null out everything omitted.
      const full = toTask(patch);
      const map: Record<string, keyof typeof full> = {
        projectId: "project_id", title: "title", ownerUserId: "owner_user_id", team: "team",
        dueDate: "due_date", status: "status", priority: "priority", isBlocker: "is_blocker",
        waitingOn: "waiting_on", stage: "stage",
      };
      for (const [camel, snake] of Object.entries(map)) {
        if (camel in patch) row[snake] = full[snake];
      }
      if (patch.status) row.done_at = patch.status === "done" ? new Date().toISOString() : null;
      const { error } = await supabase.from("tasks").update(row).eq("id", id);
      if (failed("Saving the task", error)) return;
      reload();
    },
    deleteTask: async (id) => {
      if (!canManage) return denyDelete();
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (failed("Deleting the task", error)) return;
      reload();
    },
    addTemplate: async (name, jobType) => {
      if (!canManage) return denyManage();
      const { error } = await supabase.from("job_templates").insert({ ...ws, name, job_type: jobType });
      if (failed("Creating the template", error)) return;
      reload();
    },
    renameTemplate: async (id, name) => {
      if (!canManage) return denyManage();
      const { error } = await supabase.from("job_templates").update({ name }).eq("id", id);
      if (failed("Renaming the template", error)) return;
      reload();
    },
    deleteTemplate: async (id) => {
      if (!canManage) return denyManage();
      const { error } = await supabase.from("job_templates").delete().eq("id", id);
      if (failed("Deleting the template", error)) return;
      reload();
    },
    addTemplateItem: async (templateId, kind, payload, sort) => {
      if (!canManage) return denyManage();
      const { error } = await supabase.from("template_items").insert({ ...ws, template_id: templateId, kind, payload, sort });
      if (failed("Adding the template item", error)) return;
      reload();
    },
    deleteTemplateItem: async (id) => {
      if (!canManage) return denyManage();
      const { error } = await supabase.from("template_items").delete().eq("id", id);
      if (failed("Removing the template item", error)) return;
      reload();
    },
    installStarterTemplates: async () => {
      if (!canManage) return denyManage();
      for (const seed of STARTER_TEMPLATES) {
        if (store.templates.some((t) => t.name === seed.name)) continue; // never duplicate
        const { data, error } = await supabase.from("job_templates")
          .insert({ ...ws, name: seed.name, job_type: seed.jobType, is_default: true })
          .select("id").single();
        if (failed(`Installing "${seed.name}"`, error) || !data?.id) return;
        const { error: iErr } = await supabase.from("template_items").insert(
          seed.items.map((item, idx) => ({
            ...ws, template_id: data.id, kind: item.kind, payload: item.payload, sort: idx,
          })),
        );
        if (failed(`Installing items for "${seed.name}"`, iErr)) return;
      }
      reload();
    },
    addMessage: async (projectId, kind, body, gateId) => {
      if (!canWrite) return denyWrite();
      const { data } = await supabase.auth.getUser();
      if (!data.user?.id) return;
      const { error } = await supabase.from("messages").insert({
        ...ws, project_id: projectId, kind, body, gate_id: gateId ?? null,
        author_user_id: data.user.id,
      });
      if (failed("Adding the timeline entry", error)) return;
      reload();
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
