"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  seedClients, seedProjects, seedMaterials, seedCutList, seedPOs, seedTime, seedSchedule, seedInvoices,
} from "./seed";
import type { Client, Project, Material, CutListItem, PurchaseOrder, TimeEntry, ScheduleEvent, Invoice, Stage } from "./types";

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
  setStore: React.Dispatch<React.SetStateAction<Store>>;
  addClient: (c: Omit<Client, "id" | "createdAt">) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addProject: (p: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  moveProjectStage: (id: string, stage: Stage) => void;
  addMaterial: (m: Omit<Material, "id">) => void;
  updateMaterial: (id: string, patch: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  addCutListItem: (c: Omit<CutListItem, "id">) => void;
  toggleCutListItem: (id: string) => void;
  deleteCutListItem: (id: string) => void;
  addPO: (p: Omit<PurchaseOrder, "id" | "createdAt">) => void;
  updatePO: (id: string, patch: Partial<PurchaseOrder>) => void;
  deletePO: (id: string) => void;
  addScheduleEvent: (s: Omit<ScheduleEvent, "id">) => void;
  deleteScheduleEvent: (id: string) => void;
  addInvoice: (i: Omit<Invoice, "id">) => void;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  resetData: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

const initial: Store = {
  clients: seedClients,
  projects: seedProjects,
  materials: seedMaterials,
  cutlist: seedCutList,
  pos: seedPOs,
  time: seedTime,
  schedule: seedSchedule,
  invoices: seedInvoices,
};

const KEY = "cabinetshop-io-store-v1";
const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setStore(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(store));
  }, [store, hydrated]);

  const value: Ctx = {
    ...store,
    setStore,
    addClient: (c) => setStore((s) => ({ ...s, clients: [{ ...c, id: uid(), createdAt: today() }, ...s.clients] })),
    updateClient: (id, patch) => setStore((s) => ({ ...s, clients: s.clients.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    deleteClient: (id) => setStore((s) => ({ ...s, clients: s.clients.filter((x) => x.id !== id) })),
    addProject: (p) => setStore((s) => ({ ...s, projects: [{ ...p, id: uid(), createdAt: today() }, ...s.projects] })),
    updateProject: (id, patch) => setStore((s) => ({ ...s, projects: s.projects.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    deleteProject: (id) => setStore((s) => ({ ...s, projects: s.projects.filter((x) => x.id !== id) })),
    moveProjectStage: (id, stage) => setStore((s) => ({ ...s, projects: s.projects.map((x) => (x.id === id ? { ...x, stage } : x)) })),
    addMaterial: (m) => setStore((s) => ({ ...s, materials: [{ ...m, id: uid() }, ...s.materials] })),
    updateMaterial: (id, patch) => setStore((s) => ({ ...s, materials: s.materials.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    deleteMaterial: (id) => setStore((s) => ({ ...s, materials: s.materials.filter((x) => x.id !== id) })),
    addCutListItem: (c) => setStore((s) => ({ ...s, cutlist: [{ ...c, id: uid() }, ...s.cutlist] })),
    toggleCutListItem: (id) => setStore((s) => ({ ...s, cutlist: s.cutlist.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) })),
    deleteCutListItem: (id) => setStore((s) => ({ ...s, cutlist: s.cutlist.filter((x) => x.id !== id) })),
    addPO: (p) => setStore((s) => ({ ...s, pos: [{ ...p, id: uid(), createdAt: today() }, ...s.pos] })),
    updatePO: (id, patch) => setStore((s) => ({ ...s, pos: s.pos.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    deletePO: (id) => setStore((s) => ({ ...s, pos: s.pos.filter((x) => x.id !== id) })),
    addScheduleEvent: (e) => setStore((s) => ({ ...s, schedule: [{ ...e, id: uid() }, ...s.schedule] })),
    deleteScheduleEvent: (id) => setStore((s) => ({ ...s, schedule: s.schedule.filter((x) => x.id !== id) })),
    addInvoice: (i) => setStore((s) => ({ ...s, invoices: [{ ...i, id: uid() }, ...s.invoices] })),
    updateInvoice: (id, patch) => setStore((s) => ({ ...s, invoices: s.invoices.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    deleteInvoice: (id) => setStore((s) => ({ ...s, invoices: s.invoices.filter((x) => x.id !== id) })),
    resetData: () => setStore(initial),
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
