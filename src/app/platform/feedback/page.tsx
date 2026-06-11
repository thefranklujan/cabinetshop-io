"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquarePlus } from "lucide-react";

type FeedbackItem = {
  id: string;
  workspace_id: string;
  workspace_name: string | null;
  email: string | null;
  page: string | null;
  kind: "bug" | "idea" | "question";
  message: string;
  status: "new" | "seen" | "fixed" | "closed";
  created_at: string;
};

const KIND_COLORS: Record<string, string> = {
  bug: "text-red-400",
  idea: "text-amber-500",
  question: "text-blue-400",
};

const STATUSES = ["new", "seen", "fixed", "closed"] as const;

export default function FeedbackPage() {
  const supabase = createClient();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("open");

  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("feedback").select("*").order("created_at", { ascending: false }).limit(200);
    setItems((data || []) as FeedbackItem[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { reload(); }, [reload]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("feedback").update({ status }).eq("id", id);
    if (error) alert(`Updating the report failed: ${error.message}`);
    reload();
  };

  const visible = items.filter((i) =>
    filter === "all" ? true : filter === "open" ? i.status === "new" || i.status === "seen" : i.status === filter,
  );

  return (
    <>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="text-[28px] font-extrabold tracking-tight">Feedback</h1>
        <p className="text-neutral-500 text-[14px]" style={{ marginTop: "4px" }}>
          Bug reports and ideas filed from inside shop workspaces
        </p>
      </div>

      <div className="flex gap-2 flex-wrap" style={{ marginBottom: "20px" }}>
        {["open", "new", "fixed", "closed", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-[12px] font-semibold capitalize transition ${
              filter === f ? "bg-amber-500 text-ink" : "bg-[#141414] border border-line text-neutral-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: "24px" }}>
        {loading ? (
          <div className="text-neutral-600 text-[13px]">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-10 text-neutral-600 text-[13px]">
            <MessageSquarePlus className="w-6 h-6 mx-auto mb-2 text-neutral-700" />
            No {filter === "all" ? "" : `${filter} `}reports. Shops file these via "Report an issue" in the app footer.
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((i) => (
              <div key={i.id} className="border-b border-neutral-900 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-3 flex-wrap mb-1.5">
                  <span className={`text-[11px] font-bold uppercase ${KIND_COLORS[i.kind]}`}>{i.kind}</span>
                  <span className="text-[12px] text-neutral-400">{i.workspace_name || "Unknown shop"}</span>
                  <span className="text-[12px] text-neutral-600">{i.email}</span>
                  <span className="text-[11px] text-neutral-600 font-mono">{i.page}</span>
                  <span className="text-[11px] text-neutral-600 ml-auto">{i.created_at?.slice(0, 16).replace("T", " ")}</span>
                  <select
                    value={i.status}
                    onChange={(e) => setStatus(i.id, e.target.value)}
                    className="bg-[#0f0f0f] border border-line rounded-lg px-2 py-1 text-[12px] text-white outline-none focus:border-amber-500 capitalize"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="text-[13px] text-white whitespace-pre-wrap">{i.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
