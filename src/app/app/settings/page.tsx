"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore } from "@/lib/store";
import { useState } from "react";

export default function SettingsPage() {
  const { resetData, canManage } = useStore();
  const [shopName, setShopName] = useState("Crafted Kitchens");
  const [shopAddress, setShopAddress] = useState("Austin, TX");

  return (
    <>
      <PageHeader title="Settings" sub="Shop information, preferences, and data management." />

      {!canManage && (
        <div className="card p-4 mb-6 text-[13px] text-neutral-400 border-amber-500/20">
          Settings are managed by the shop owner and admins. You have read-only access.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-[15px] font-bold mb-5">Shop Information</h2>
          <div className="space-y-4">
            <div><div className="label">Shop Name</div><input className="input disabled:opacity-60" disabled={!canManage} value={shopName} onChange={(e) => setShopName(e.target.value)} /></div>
            <div><div className="label">Address</div><input className="input disabled:opacity-60" disabled={!canManage} value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} /></div>
            <div><div className="label">Default Hourly Rate</div><input className="input disabled:opacity-60" disabled={!canManage} defaultValue="85" /></div>
            <div><div className="label">Currency</div><input className="input disabled:opacity-60" disabled={!canManage} defaultValue="USD ($)" /></div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-[15px] font-bold mb-5">Production Stages</h2>
          <p className="text-[13px] text-neutral-500 mb-4">CabinetShop.io ships with 13 stages tuned for custom cabinet shops.</p>
          <div className="flex flex-wrap gap-2">
            {["Quote","Design","Approved","Materials","Cut/CNC","Assembly","Sanding","Finish","QC","Delivery","Install","Punch List","Complete"].map((s) => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>
        </div>

        {canManage && (
          <div className="card p-6 lg:col-span-2 border-red-900/40">
            <h2 className="text-[15px] font-bold mb-2 text-red-400">Danger Zone</h2>
            <p className="text-[13px] text-neutral-500 mb-4">Reset all data back to seed data. This cannot be undone.</p>
            <button
              className="btn"
              onClick={() => {
                if (confirm("Reset all data back to factory seed?")) resetData();
              }}
            >
              Reset to Seed Data
            </button>
          </div>
        )}
      </div>
    </>
  );
}
