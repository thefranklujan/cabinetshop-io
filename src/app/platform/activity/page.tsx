"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Activity } from "lucide-react";

type ActivityItem = {
  id: string;
  action: string;
  actor_email: string | null;
  target: string | null;
  meta: any;
  created_at: string;
};

const ACTION_COLORS: Record<string, string> = {
  campaign_sent: "text-amber-500",
  campaign_created: "text-blue-400",
  prospect_added: "text-emerald-400",
  prospect_updated: "text-blue-400",
  shop_signup: "text-amber-500",
};

export default function ActivityPage() {
  const supabase = createClient();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("platform_activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setItems((data || []) as ActivityItem[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { reload(); }, [reload]);

  return (
    <>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="text-[28px] font-extrabold tracking-tight">Platform Activity</h1>
        <p className="text-neutral-500 text-[14px]" style={{ marginTop: "4px" }}>
          Recent actions across the platform
        </p>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        {loading ? (
          <div className="text-neutral-600 text-[13px]">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-neutral-600 text-[13px]">No activity yet. Actions will appear here as you use the platform.</div>
        ) : (
          <div className="space-y-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4"
                style={{ padding: "16px 0", borderBottom: "1px solid #161616" }}
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 grid place-items-center shrink-0" style={{ marginTop: "2px" }}>
                  <Activity className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px]">
                    <span className={`font-semibold ${ACTION_COLORS[item.action] || "text-white"}`}>
                      {item.action.replace(/_/g, " ")}
                    </span>
                    {item.target && (
                      <span className="text-neutral-400"> {item.target}</span>
                    )}
                  </div>
                  {item.actor_email && (
                    <div className="text-[11px] text-neutral-500" style={{ marginTop: "2px" }}>
                      by {item.actor_email}
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-neutral-600 shrink-0">
                  {item.created_at?.slice(0, 16).replace("T", " ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
