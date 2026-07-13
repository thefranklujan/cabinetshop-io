"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Inbox } from "lucide-react";

// Contact form messages land here (contact_messages, written only through the
// submit_contact() definer function). This is the operator side of the promise
// that a real person reads every message.

type ContactMessage = {
  id: string;
  name: string | null;
  shop_name: string | null;
  email: string;
  body: string;
  status: "new" | "replied" | "closed";
  created_at: string;
};

const STATUSES = ["new", "replied", "closed"] as const;

export default function InboxPage() {
  const supabase = createClient();
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<string>("new");

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) setErr(`Could not load messages: ${error.message}`);
    setItems((data || []) as ContactMessage[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { reload(); }, [reload]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (error) alert(`Updating the message failed: ${error.message}`);
    reload();
  };

  const visible = items.filter((i) => (filter === "all" ? true : i.status === filter));

  return (
    <>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="text-[28px] font-extrabold tracking-tight">Inbox</h1>
        <p className="text-neutral-500 text-[14px]" style={{ marginTop: "4px" }}>
          Messages from the public contact form
        </p>
      </div>

      <div className="flex gap-2 flex-wrap" style={{ marginBottom: "20px" }}>
        {["new", "replied", "closed", "all"].map((f) => (
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

      {err && <div className="card p-4 text-[13px] text-red-400 border-red-500/20" style={{ marginBottom: "20px" }}>{err}</div>}

      <div className="card" style={{ padding: "24px" }}>
        {loading ? (
          <div className="text-neutral-600 text-[13px]">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-10 text-neutral-600 text-[13px]">
            <Inbox className="w-6 h-6 mx-auto mb-2 text-neutral-700" />
            No {filter === "all" ? "" : `${filter} `}messages.
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((i) => (
              <div key={i.id} className="border-b border-neutral-900 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-3 flex-wrap mb-1.5">
                  <a href={`mailto:${i.email}`} className="text-[13px] font-semibold text-amber-500">{i.email}</a>
                  {i.name && <span className="text-[12px] text-neutral-400">{i.name}</span>}
                  {i.shop_name && <span className="text-[12px] text-neutral-500">{i.shop_name}</span>}
                  <span className="text-[11px] text-neutral-600 ml-auto">{i.created_at?.slice(0, 16).replace("T", " ")}</span>
                  <select
                    value={i.status}
                    onChange={(e) => setStatus(i.id, e.target.value)}
                    className="bg-[#0f0f0f] border border-line rounded-lg px-2 py-1 text-[12px] text-white outline-none focus:border-amber-500 capitalize"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="text-[13px] text-white whitespace-pre-wrap">{i.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
