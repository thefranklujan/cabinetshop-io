import type { Client, Project, Material, CutListItem, PurchaseOrder, TimeEntry, ScheduleEvent, Invoice } from "./types";

export const seedClients: Client[] = [
  { id: "c1", name: "Sarah Parker", type: "Homeowner", email: "sarah@parker.com", phone: "512-555-0101", address: "1820 Hillcrest, Austin TX", createdAt: "2026-01-12" },
  { id: "c2", name: "Whitmore Design Studio", type: "Designer", email: "hello@whitmore.co", phone: "512-555-0144", address: "401 Congress, Austin TX", createdAt: "2026-01-20" },
  { id: "c3", name: "Reyes Builders", type: "GC", email: "carlos@reyesbuild.com", phone: "512-555-0188", address: "8800 Burnet, Austin TX", createdAt: "2026-02-02" },
  { id: "c4", name: "Maria Gomez", type: "Homeowner", email: "maria.g@email.com", phone: "512-555-0210", address: "612 W 9th, Austin TX", createdAt: "2026-02-14" },
  { id: "c5", name: "Patel Family", type: "Homeowner", email: "patel.r@email.com", phone: "512-555-0133", address: "2300 Lakeshore, Austin TX", createdAt: "2026-03-01" },
  { id: "c6", name: "Doyle Custom Homes", type: "Builder", email: "info@doylehomes.com", phone: "512-555-0166", address: "5500 Bee Cave, Austin TX", createdAt: "2026-03-08" },
  { id: "c7", name: "Kim Residence", type: "Homeowner", email: "kim.j@email.com", phone: "512-555-0177", address: "910 Oak Knoll, Austin TX", createdAt: "2026-03-15" },
];

export const seedProjects: Project[] = [
  { id: "p1", jobNumber: "JOB-1024", name: "Parker Kitchen", clientId: "c1", stage: "Design", contractTotal: 32400, paid: 0, startDate: "2026-04-15", dueDate: "2026-06-10", woodSpecies: "White Oak", finish: "Natural Matte", hardware: "Top Knobs Bar Pulls Brass", squareFeet: 220, cabinetCount: 18, priority: "Normal", createdAt: "2026-03-22" },
  { id: "p2", jobNumber: "JOB-1025", name: "Whitmore Master Bath", clientId: "c2", stage: "Design", contractTotal: 22100, paid: 5000, startDate: "2026-04-20", dueDate: "2026-06-01", woodSpecies: "Walnut", finish: "Conversion Varnish", hardware: "Emtek Brass", squareFeet: 90, cabinetCount: 6, priority: "High", createdAt: "2026-03-25" },
  { id: "p3", jobNumber: "JOB-1026", name: "Kim Walk-in Closet", clientId: "c7", stage: "Approved", contractTotal: 9500, paid: 4750, startDate: "2026-04-12", dueDate: "2026-05-05", woodSpecies: "Maple", finish: "White Lacquer", hardware: "Blum Soft Close", squareFeet: 60, cabinetCount: 8, priority: "Normal", createdAt: "2026-03-29" },
  { id: "p4", jobNumber: "JOB-1027", name: "Gomez Kitchen Remodel", clientId: "c4", stage: "Approved", contractTotal: 31800, paid: 15900, startDate: "2026-04-18", dueDate: "2026-06-15", woodSpecies: "Cherry", finish: "Natural Stain", hardware: "Mockett", squareFeet: 280, cabinetCount: 22, priority: "Normal", createdAt: "2026-04-01" },
  { id: "p5", jobNumber: "JOB-1028", name: "Alvarez Library Built-in", clientId: "c3", stage: "Cut/CNC", contractTotal: 14700, paid: 7350, startDate: "2026-03-25", dueDate: "2026-04-30", woodSpecies: "Rift White Oak", finish: "Custom Stain", hardware: "Hidden Hinges", squareFeet: 110, cabinetCount: 12, priority: "High", createdAt: "2026-03-18" },
  { id: "p6", jobNumber: "JOB-1029", name: "Patel Kitchen Island", clientId: "c5", stage: "Assembly", contractTotal: 12900, paid: 6450, startDate: "2026-03-20", dueDate: "2026-04-22", woodSpecies: "White Oak", finish: "Cerused", hardware: "Top Knobs Brushed Nickel", squareFeet: 80, cabinetCount: 5, priority: "Normal", createdAt: "2026-03-10" },
  { id: "p7", jobNumber: "JOB-1030", name: "Harris Laundry Room", clientId: "c1", stage: "Finish", contractTotal: 7200, paid: 3600, startDate: "2026-03-15", dueDate: "2026-04-18", woodSpecies: "MDF / Painted", finish: "Sherwin Emerald Urethane", hardware: "Emtek Polished Nickel", squareFeet: 50, cabinetCount: 4, priority: "Normal", createdAt: "2026-03-05" },
  { id: "p8", jobNumber: "JOB-1031", name: "Doyle Spec House Pantry", clientId: "c6", stage: "Install", contractTotal: 11400, paid: 11400, startDate: "2026-03-10", dueDate: "2026-04-12", woodSpecies: "Maple", finish: "White", hardware: "Top Knobs", squareFeet: 70, cabinetCount: 7, priority: "Rush", createdAt: "2026-03-01" },
  { id: "p9", jobNumber: "JOB-1023", name: "Vargas Mudroom", clientId: "c3", stage: "Complete", contractTotal: 8800, paid: 8800, startDate: "2026-02-15", dueDate: "2026-03-20", woodSpecies: "Maple Painted", finish: "BM Hale Navy", hardware: "Emtek", squareFeet: 55, cabinetCount: 5, priority: "Normal", createdAt: "2026-02-10" },
  { id: "p10", jobNumber: "JOB-1032", name: "Reyes Spec Pantry", clientId: "c3", stage: "Quote", contractTotal: 6200, paid: 0, startDate: "2026-05-01", dueDate: "2026-06-01", woodSpecies: "TBD", finish: "TBD", hardware: "TBD", squareFeet: 45, cabinetCount: 5, priority: "Low", createdAt: "2026-04-05" },
];

export const seedMaterials: Material[] = [
  { id: "m1", sku: "PLY-3/4-WO", name: '3/4" White Oak Plywood', category: "Sheet Goods", unit: "sheet", costPerUnit: 142, inStock: 28, reorderAt: 12, supplier: "States Industries" },
  { id: "m2", sku: "PLY-3/4-MAPLE", name: '3/4" Maple Plywood', category: "Sheet Goods", unit: "sheet", costPerUnit: 98, inStock: 42, reorderAt: 15, supplier: "Columbia Forest" },
  { id: "m3", sku: "MDF-3/4", name: '3/4" MDF Sheet', category: "Sheet Goods", unit: "sheet", costPerUnit: 48, inStock: 60, reorderAt: 20, supplier: "Local Hardwoods" },
  { id: "m4", sku: "WO-4/4", name: "White Oak 4/4 S2S", category: "Hardwood", unit: "bd ft", costPerUnit: 9.5, inStock: 480, reorderAt: 200, supplier: "Hardwood Co" },
  { id: "m5", sku: "WAL-4/4", name: "Walnut 4/4 S2S", category: "Hardwood", unit: "bd ft", costPerUnit: 14.2, inStock: 220, reorderAt: 150, supplier: "Hardwood Co" },
  { id: "m6", sku: "BLUM-110", name: "Blum 110 Soft Close Hinge", category: "Hardware", unit: "ea", costPerUnit: 4.2, inStock: 340, reorderAt: 100, supplier: "Cabinet Hardware Inc" },
  { id: "m7", sku: "BLUM-DRAWER", name: "Blum Tandembox Drawer 18in", category: "Hardware", unit: "set", costPerUnit: 38, inStock: 24, reorderAt: 12, supplier: "Cabinet Hardware Inc" },
  { id: "m8", sku: "TOP-PULL-5", name: 'Top Knobs Bar Pull 5" Brass', category: "Hardware", unit: "ea", costPerUnit: 12, inStock: 88, reorderAt: 40, supplier: "Top Knobs" },
  { id: "m9", sku: "CV-CLEAR", name: "Conversion Varnish Clear Gallon", category: "Finish", unit: "gal", costPerUnit: 68, inStock: 14, reorderAt: 6, supplier: "ML Campbell" },
  { id: "m10", sku: "EB-WO-2MM", name: "White Oak Edge Banding 2mm", category: "Edge Banding", unit: "roll", costPerUnit: 84, inStock: 8, reorderAt: 4, supplier: "Doellken" },
];

export const seedCutList: CutListItem[] = [
  { id: "cl1", projectId: "p5", part: "Side Panel", material: "3/4 WO Ply", qty: 24, length: 30, width: 23, thickness: 0.75, done: true },
  { id: "cl2", projectId: "p5", part: "Top/Bottom", material: "3/4 WO Ply", qty: 24, length: 33, width: 23, thickness: 0.75, done: true },
  { id: "cl3", projectId: "p5", part: "Back Panel", material: "1/2 WO Ply", qty: 12, length: 30, width: 33, thickness: 0.5, done: false },
  { id: "cl4", projectId: "p5", part: "Shelf", material: "3/4 WO Ply", qty: 36, length: 32, width: 22, thickness: 0.75, done: false },
  { id: "cl5", projectId: "p6", part: "Drawer Front", material: "WO Solid", qty: 5, length: 32, width: 6, thickness: 0.75, done: true },
];

export const seedPOs: PurchaseOrder[] = [
  { id: "po1", poNumber: "PO-2042", supplier: "States Industries", status: "Confirmed", total: 1704, projectId: "p5", items: [{ name: '3/4" White Oak Ply', qty: 12, cost: 142 }], createdAt: "2026-04-01", expectedDate: "2026-04-12" },
  { id: "po2", poNumber: "PO-2043", supplier: "Cabinet Hardware Inc", status: "Sent", total: 912, projectId: "p4", items: [{ name: "Blum Tandembox 18in", qty: 24, cost: 38 }], createdAt: "2026-04-04", expectedDate: "2026-04-15" },
  { id: "po3", poNumber: "PO-2044", supplier: "Hardwood Co", status: "Draft", total: 2280, projectId: "p2", items: [{ name: "Walnut 4/4 S2S", qty: 160, cost: 14.2 }], createdAt: "2026-04-06", expectedDate: "2026-04-20" },
];

export const seedTime: TimeEntry[] = [
  { id: "t1", workerName: "Miguel R", projectId: "p5", stage: "Cut/CNC", startedAt: "2026-04-07T08:00", endedAt: "2026-04-07T16:30", hours: 8.5 },
  { id: "t2", workerName: "Jorge V", projectId: "p6", stage: "Assembly", startedAt: "2026-04-07T08:15", endedAt: "2026-04-07T17:00", hours: 8.75 },
  { id: "t3", workerName: "Tomas K", projectId: "p7", stage: "Finish", startedAt: "2026-04-08T07:45" },
];

export const seedSchedule: ScheduleEvent[] = [
  { id: "s1", projectId: "p1", type: "Measure", date: "2026-04-10", notes: "Final field measure" },
  { id: "s2", projectId: "p8", type: "Install", date: "2026-04-11", notes: "Day 1 install" },
  { id: "s3", projectId: "p8", type: "Install", date: "2026-04-12", notes: "Day 2 install" },
  { id: "s4", projectId: "p7", type: "Delivery", date: "2026-04-15" },
  { id: "s5", projectId: "p2", type: "Site Visit", date: "2026-04-16", notes: "Confirm finish samples" },
];

export const seedInvoices: Invoice[] = [
  { id: "i1", invoiceNumber: "INV-3001", projectId: "p2", amount: 5000, status: "Paid", dueDate: "2026-04-01", issuedAt: "2026-03-25" },
  { id: "i2", invoiceNumber: "INV-3002", projectId: "p3", amount: 4750, status: "Paid", dueDate: "2026-04-05", issuedAt: "2026-03-29" },
  { id: "i3", invoiceNumber: "INV-3003", projectId: "p4", amount: 15900, status: "Paid", dueDate: "2026-04-10", issuedAt: "2026-04-01" },
  { id: "i4", invoiceNumber: "INV-3004", projectId: "p5", amount: 7350, status: "Paid", dueDate: "2026-04-08", issuedAt: "2026-03-28" },
  { id: "i5", invoiceNumber: "INV-3005", projectId: "p6", amount: 6450, status: "Sent", dueDate: "2026-04-20", issuedAt: "2026-04-05" },
  { id: "i6", invoiceNumber: "INV-3006", projectId: "p1", amount: 16200, status: "Draft", dueDate: "2026-04-25", issuedAt: "2026-04-08" },
];
