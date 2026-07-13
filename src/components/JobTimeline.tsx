"use client";
import { useStore } from "@/lib/store";
import type { MessageKind } from "@/lib/types";
import { GATE_DEFS } from "@/lib/readiness";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";

// Phase 3 (docs/LEAN_PLAN_2026_06_10.md §9). One timeline per job: typed message
// entries (append-only table) merged with the Phase 1 activity stream rendered as
// system entries. "Client-visible" means part of the official record — there is no
// client portal yet; the team reads it to the client or pastes it into email.

const KIND_META: Record<MessageKind, { label: string; chip: string; clientVisible: boolean }> = {
  internal_note: { label: "Internal note", chip: "text-neutral-400", clientVisible: false },
  client_note: { label: "Client note", chip: "text-sky-400 border-sky-500/30", clientVisible: true },
  approval_request: { label: "Approval requested", chip: "text-orange-400 border-orange-500/30", clientVisible: true },
  client_response: { label: "Client response", chip: "text-emerald-400 border-emerald-500/30", clientVisible: true },
  system: { label: "System", chip: "text-neutral-600", clientVisible: false },
};

const gateLabel = (key: unknown) => GATE_DEFS.find((d) => d.key === key)?.label ?? String(key ?? "");

/** Human sentence for a Phase 1 activity row. */
function activityText(verb: string, detail: Record<string, unknown>): string {
  switch (verb) {
    case "gate_status_changed":
      return `Gate "${gateLabel(detail.gate)}" set to ${String(detail.status ?? "").replace(/_/g, " ")}`;
    case "gate_overridden":
      return `Blocking gate overridden (${(detail.gates as string[] | undefined)?.map(gateLabel).join(", ") ?? ""}) — moved ${detail.from} → ${detail.to}. Reason: ${detail.reason}`;
    case "stage_moved_past_warnings":
      return `Moved ${detail.from} → ${detail.to} past warnings (${(detail.gates as string[] | undefined)?.map(gateLabel).join(", ") ?? ""})`;
    default:
      return verb.replace(/_/g, " ");
  }
}

type Entry = {
  id: string;
  kind: MessageKind;
  body: string;
  authorUserId?: string;
  createdAt: string;
};

export default function JobTimeline({ projectId }: { projectId: string }) {
  const { messages, activity, members, canWrite, addMessage } = useStore();
  const [filter, setFilter] = useState<"all" | "client">("all");
  const [kind, setKind] = useState<Exclude<MessageKind, "approval_request" | "system">>("internal_note");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const emailOf = (userId?: string) => members.find((m) => m.userId === userId)?.email || "";

  const entries: Entry[] = [
    ...messages
      .filter((m) => m.projectId === projectId)
      .map((m) => ({ id: `m-${m.id}`, kind: m.kind, body: m.body, authorUserId: m.authorUserId, createdAt: m.createdAt })),
    ...activity
      .filter((a) => a.projectId === projectId)
      .map((a) => ({
        id: `a-${a.id}`, kind: "system" as MessageKind, body: activityText(a.verb, a.detail),
        authorUserId: a.actorUserId, createdAt: a.createdAt,
      })),
  ]
    .filter((e) => (filter === "client" ? KIND_META[e.kind].clientVisible : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const submit = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    await addMessage(projectId, kind, body.trim());
    setBody("");
    setSending(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[12px] uppercase tracking-wider font-bold text-neutral-400 flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5" /> Job timeline
        </h3>
        <div className="flex rounded-lg border border-line overflow-hidden">
          {([["all", "All"], ["client", "Client-visible"]] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`px-3 py-1.5 text-[11px] font-semibold transition ${
                filter === v ? "bg-amber-500/10 text-amber-500" : "text-neutral-500 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {canWrite && (
        <div className="mb-4 rounded-lg border border-neutral-900 bg-[#0f0f0f] p-3">
          <div className="flex gap-2 mb-2">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as any)}
              className="bg-ink border border-line rounded-lg px-2 py-1.5 text-[12px] text-neutral-300 outline-none focus:border-amber-500"
            >
              <option value="internal_note">Internal note</option>
              <option value="client_note">Client note (official record)</option>
              <option value="client_response">Client response (log what they said)</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder={
                kind === "client_response"
                  ? `e.g. "Maria approved slab white oak, per phone today"`
                  : "Write it down so it is on the record…"
              }
              className="input flex-1"
            />
            <button onClick={submit} disabled={sending || !body.trim()} className="btn btn-primary shrink-0">
              <Send className="w-4 h-4" /> Log
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {entries.map((e) => (
          <div key={e.id} className="flex gap-3 items-start py-2 border-b border-neutral-900 last:border-0">
            <span className={`chip shrink-0 whitespace-nowrap ${KIND_META[e.kind].chip}`}>
              {KIND_META[e.kind].label}
            </span>
            <div className="min-w-0 flex-1">
              <div className={`text-[13px] ${e.kind === "system" ? "text-neutral-500" : "text-white"}`}>{e.body}</div>
              <div className="text-[11px] text-neutral-600 mt-0.5">
                {e.createdAt.slice(0, 16).replace("T", " ")}
                {emailOf(e.authorUserId) ? ` · ${emailOf(e.authorUserId)}` : ""}
              </div>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-[12px] text-neutral-600 py-3">
            Nothing on the record yet. Approvals, notes, and stage moves will show up here.
          </div>
        )}
      </div>
    </div>
  );
}
