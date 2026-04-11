"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

export default function CampaignActions({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!confirm("Send this campaign now?")) return;
    setSending(true);
    const res = await fetch("/api/platform/campaigns/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
    });
    setSending(false);
    if (res.ok) {
      router.refresh();
    } else {
      const body = await res.json();
      alert(body.error || "Failed to send");
    }
  };

  return (
    <button onClick={send} disabled={sending} className="btn btn-primary">
      <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send Campaign"}
    </button>
  );
}
