"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Send, Eye, MousePointerClick, UserX,
  Search, Filter, Layers, ChevronDown, X, Mail,
} from "lucide-react";

interface Recipient {
  email: string;
  sent: number;
  opened: boolean;
  clicked: boolean;
  lastEvent: string;
  lastEventTime: string;
  state: string | null;
  shopName: string | null;
  unsubscribed: boolean;
}

interface Stats {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalUnsubscribed: number;
  openRate: number;
  clickRate: number;
}

const EVENT_STYLES: Record<string, { bg: string; text: string }> = {
  sent: { bg: "bg-blue-500/15", text: "text-blue-400" },
  open: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  click: { bg: "bg-purple-500/15", text: "text-purple-400" },
  bounce: { bg: "bg-red-500/15", text: "text-red-400" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function DropdownMenu({ label, icon: Icon, children, active }: {
  label: string; icon: typeof Filter; children: React.ReactNode; active?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={`flex items-center gap-2 text-sm font-semibold transition ${active ? "bg-amber-500/15 text-amber-500 border border-amber-500/30" : "bg-[#141414] text-neutral-400 border border-line hover:text-white"}`} style={{ padding: "8px 12px", borderRadius: "8px" }}>
        <Icon className="h-3.5 w-3.5" />{label}<ChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (<><div className="fixed inset-0 z-10" onClick={() => setOpen(false)} /><div className="absolute top-full left-0 mt-1 z-20 bg-[#1a1a1a] border border-line rounded-lg shadow-xl min-w-[180px] max-h-[300px] overflow-y-auto" style={{ padding: "4px 0" }}>{children}</div></>)}
    </div>
  );
}

function MenuItem({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`w-full text-left text-sm transition ${active ? "text-amber-500 bg-amber-500/10" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"}`} style={{ padding: "8px 12px" }}>{label}</button>;
}

export default function ReportsPage() {
  const [data, setData] = useState<{ recipients: Recipient[]; stats: Stats } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "opened" | "clicked" | "unsubscribed" | "no_engagement">("all");
  const [groupBy, setGroupBy] = useState<"none" | "state" | "status">("none");
  const [sortField, setSortField] = useState<"email" | "shopName" | "state" | "lastEvent">("email");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetch("/api/platform/campaigns/reports")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function handleSearch(e: React.FormEvent) { e.preventDefault(); setSearch(searchInput); }
  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data.recipients;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(r => r.email.toLowerCase().includes(s) || r.shopName?.toLowerCase().includes(s) || r.state?.toLowerCase().includes(s));
    }
    if (statusFilter === "opened") list = list.filter(r => r.opened);
    else if (statusFilter === "clicked") list = list.filter(r => r.clicked);
    else if (statusFilter === "unsubscribed") list = list.filter(r => r.unsubscribed);
    else if (statusFilter === "no_engagement") list = list.filter(r => !r.opened && !r.clicked);

    list.sort((a, b) => {
      let aVal = "", bVal = "";
      if (sortField === "email") { aVal = a.email; bVal = b.email; }
      else if (sortField === "shopName") { aVal = a.shopName || "zzz"; bVal = b.shopName || "zzz"; }
      else if (sortField === "state") { aVal = a.state || "zzz"; bVal = b.state || "zzz"; }
      else if (sortField === "lastEvent") { aVal = a.lastEventTime; bVal = b.lastEventTime; }
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    return list;
  }, [data, search, statusFilter, sortField, sortDir]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return null;
    const groups: Record<string, Recipient[]> = {};
    for (const r of filtered) {
      let key: string;
      if (groupBy === "state") key = r.state || "Unknown";
      else {
        if (r.clicked) key = "Clicked";
        else if (r.opened) key = "Opened";
        else if (r.unsubscribed) key = "Unsubscribed";
        else key = "No Engagement";
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, groupBy]);

  function SortHeader({ label, field }: { label: string; field: typeof sortField }) {
    const active = sortField === field;
    return (
      <th className={`text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-white transition ${active ? "text-amber-500" : "text-neutral-500"}`} style={{ padding: "12px 16px" }} onClick={() => toggleSort(field)}>
        {label} {active && (sortDir === "asc" ? "\u2191" : "\u2193")}
      </th>
    );
  }

  function RecipientRow({ r }: { r: Recipient }) {
    const engagementStatus = r.clicked ? "Clicked" : r.opened ? "Opened" : r.unsubscribed ? "Unsubscribed" : "Sent";
    const style = r.clicked ? EVENT_STYLES.click : r.opened ? EVENT_STYLES.open : r.unsubscribed ? EVENT_STYLES.bounce : EVENT_STYLES.sent;
    return (
      <tr className="hover:bg-neutral-900/50 transition" style={{ borderBottom: "1px solid #161616" }}>
        <td style={{ padding: "12px 16px" }}><div className="text-sm text-white font-semibold">{r.shopName || "\u2014"}</div></td>
        <td style={{ padding: "12px 16px" }}><div className="text-sm text-neutral-300">{r.email}</div></td>
        <td style={{ padding: "12px 16px" }}><div className="text-sm text-neutral-300">{r.state || "\u2014"}</div></td>
        <td style={{ padding: "12px 16px" }}><span className={`text-[10px] font-semibold rounded capitalize ${style.bg} ${style.text}`} style={{ padding: "2px 6px" }}>{engagementStatus}</span></td>
        <td style={{ padding: "12px 16px" }}><div className="text-xs text-neutral-500">{r.sent}</div></td>
        <td style={{ padding: "12px 16px" }}><div className="text-xs text-neutral-500">{timeAgo(r.lastEventTime)}</div></td>
        <td style={{ padding: "12px 16px" }} className="text-right">
          <a href={`mailto:${r.email}`} className="text-neutral-500 hover:text-amber-500 transition inline-block" style={{ padding: "6px" }}>
            <Mail className="h-4 w-4" />
          </a>
        </td>
      </tr>
    );
  }

  if (loading) return <div className="text-neutral-500 text-sm text-center" style={{ padding: "48px 0" }}>Loading reports...</div>;
  if (!data) return <div className="text-neutral-500 text-sm text-center" style={{ padding: "48px 0" }}>Failed to load.</div>;

  const { stats } = data;

  return (
    <>
      <Link href="/platform/campaigns" className="inline-flex items-center gap-1 text-neutral-500 hover:text-white text-sm" style={{ marginBottom: "16px" }}><ArrowLeft className="h-4 w-4" /> All Campaigns</Link>
      <h1 className="text-[28px] font-extrabold tracking-tight" style={{ marginBottom: "24px" }}>Campaign Reports</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: "24px" }}>
        <div onClick={() => setStatusFilter("all")} className={`bg-blue-500/10 rounded-xl cursor-pointer transition hover:border-neutral-700 ${statusFilter === "all" ? "border border-neutral-600 ring-1 ring-neutral-700" : "border border-neutral-800"}`} style={{ padding: "20px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}><span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">Total Sent</span><Send className="h-4 w-4 text-blue-400" /></div>
          <div className="text-2xl font-extrabold text-blue-400">{stats.totalSent.toLocaleString()}</div>
        </div>
        <div onClick={() => setStatusFilter(statusFilter === "opened" ? "all" : "opened")} className={`bg-emerald-500/10 rounded-xl cursor-pointer transition hover:border-neutral-700 ${statusFilter === "opened" ? "border border-neutral-600 ring-1 ring-neutral-700" : "border border-neutral-800"}`} style={{ padding: "20px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}><span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">Opened</span><Eye className="h-4 w-4 text-emerald-400" /></div>
          <div className="text-2xl font-extrabold text-emerald-400">{stats.totalOpened}</div>
          <div className="text-[11px] text-neutral-500">{stats.openRate}% open rate</div>
        </div>
        <div onClick={() => setStatusFilter(statusFilter === "clicked" ? "all" : "clicked")} className={`bg-purple-500/10 rounded-xl cursor-pointer transition hover:border-neutral-700 ${statusFilter === "clicked" ? "border border-neutral-600 ring-1 ring-neutral-700" : "border border-neutral-800"}`} style={{ padding: "20px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}><span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">Clicked</span><MousePointerClick className="h-4 w-4 text-purple-400" /></div>
          <div className="text-2xl font-extrabold text-purple-400">{stats.totalClicked}</div>
          <div className="text-[11px] text-neutral-500">{stats.clickRate}% click rate</div>
        </div>
        <div onClick={() => setStatusFilter(statusFilter === "unsubscribed" ? "all" : "unsubscribed")} className={`bg-red-500/10 rounded-xl cursor-pointer transition hover:border-neutral-700 ${statusFilter === "unsubscribed" ? "border border-neutral-600 ring-1 ring-neutral-700" : "border border-neutral-800"}`} style={{ padding: "20px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}><span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">Unsubscribed</span><UserX className="h-4 w-4 text-red-400" /></div>
          <div className="text-2xl font-extrabold text-red-400">{stats.totalUnsubscribed}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: "24px" }}>
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search emails, shops, states..." className="input" style={{ paddingLeft: "36px" }} />
          {search && <button type="button" onClick={() => { setSearch(""); setSearchInput(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"><X className="h-3.5 w-3.5" /></button>}
        </form>

        <DropdownMenu label={statusFilter === "all" ? "Engagement" : statusFilter.replace("_", " ")} icon={Filter} active={statusFilter !== "all"}>
          <MenuItem label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
          <MenuItem label="Opened" active={statusFilter === "opened"} onClick={() => setStatusFilter("opened")} />
          <MenuItem label="Clicked" active={statusFilter === "clicked"} onClick={() => setStatusFilter("clicked")} />
          <MenuItem label="Unsubscribed" active={statusFilter === "unsubscribed"} onClick={() => setStatusFilter("unsubscribed")} />
          <MenuItem label="No Engagement" active={statusFilter === "no_engagement"} onClick={() => setStatusFilter("no_engagement")} />
        </DropdownMenu>

        <DropdownMenu label={groupBy === "none" ? "Group" : `By ${groupBy}`} icon={Layers} active={groupBy !== "none"}>
          <MenuItem label="No Grouping" active={groupBy === "none"} onClick={() => setGroupBy("none")} />
          <MenuItem label="By State" active={groupBy === "state"} onClick={() => setGroupBy("state")} />
          <MenuItem label="By Status" active={groupBy === "status"} onClick={() => setGroupBy("status")} />
        </DropdownMenu>

        <span className="text-xs text-neutral-500">{filtered.length.toLocaleString()} recipients</span>

        {(statusFilter !== "all" || groupBy !== "none" || search) && (
          <button onClick={() => { setStatusFilter("all"); setGroupBy("none"); setSearch(""); setSearchInput(""); }} className="flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition" style={{ padding: "8px" }}><X className="h-3 w-3" /> Reset</button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e1e", background: "#0d0d0d" }}>
                <SortHeader label="Shop" field="shopName" />
                <SortHeader label="Email" field="email" />
                <SortHeader label="State" field="state" />
                <th className="text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider" style={{ padding: "12px 16px" }}>Status</th>
                <th className="text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider" style={{ padding: "12px 16px" }}>Sends</th>
                <SortHeader label="Last Activity" field="lastEvent" />
                <th style={{ padding: "12px 16px" }}></th>
              </tr>
            </thead>
            <tbody>
              {grouped ? (
                grouped.map(([group, recipients]) => (
                  <React.Fragment key={group}>
                    <tr style={{ borderBottom: "1px solid #1e1e1e", background: "#0e0e0e" }}>
                      <td colSpan={7} style={{ padding: "10px 16px" }}>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white uppercase tracking-wider">{group}</span>
                          <span className="chip">{recipients.length}</span>
                        </div>
                      </td>
                    </tr>
                    {recipients.map(r => <RecipientRow key={r.email} r={r} />)}
                  </React.Fragment>
                ))
              ) : (
                filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-neutral-600" style={{ padding: "40px 16px" }}>No campaign data yet. Send your first campaign to see reports.</td></tr>
                ) : (
                  filtered.map(r => <RecipientRow key={r.email} r={r} />)
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
