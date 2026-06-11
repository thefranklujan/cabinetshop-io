"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MessageSquarePlus } from "lucide-react";

// Pilot feedback channel: every signed-in user (any role) can report a bug or
// idea from any page. Reports land in the platform console (/platform/feedback).
export default function FeedbackButton({ workspaceId, workspaceName, userEmail }: { workspaceId: string; workspaceName: string; userEmail: string }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"bug" | "idea" | "question">("bug");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");

  const submit = async () => {
    if (message.trim().length < 5) return;
    setState("sending");
    setErr("");
    const { data } = await supabase.auth.getUser();
    const { error } = await supabase.from("feedback").insert({
      workspace_id: workspaceId,
      workspace_name: workspaceName,
      user_id: data.user?.id ?? null,
      email: userEmail || data.user?.email || null,
      page: pathname,
      kind,
      message: message.trim(),
    });
    if (error) {
      setState("error");
      setErr(error.message);
      return;
    }
    setState("sent");
    setMessage("");
  };

  const close = () => {
    setOpen(false);
    setState("idle");
    setErr("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 hover:text-neutral-400 transition"
        title="Report a bug or send an idea"
      >
        <MessageSquarePlus className="w-3.5 h-3.5" /> Report an issue
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={close}>
          <div className="card max-w-md w-full p-7" onClick={(e) => e.stopPropagation()}>
            {state === "sent" ? (
              <>
                <h2 className="text-xl font-bold mb-2">Got it. Thank you!</h2>
                <p className="text-[13px] text-neutral-400 mb-6">
                  Your report went straight to the CabinetShop.io team. We read every one,
                  usually the same day.
                </p>
                <div className="flex gap-2 justify-end">
                  <button className="btn" onClick={() => setState("idle")}>Send another</button>
                  <button className="btn btn-primary" onClick={close}>Done</button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-1">Report an issue</h2>
                <p className="text-[13px] text-neutral-500 mb-5">
                  Found a bug? Something confusing? Want a feature? Tell us — it goes straight to the team.
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="label">Type</div>
                    <select className="input" value={kind} onChange={(e) => setKind(e.target.value as any)}>
                      <option value="bug">Bug — something is broken or wrong</option>
                      <option value="idea">Idea — something you wish it did</option>
                      <option value="question">Question — something is confusing</option>
                    </select>
                  </div>
                  <div>
                    <div className="label">What happened?</div>
                    <textarea
                      className="input min-h-[110px] resize-y"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What did you do, what did you expect, and what happened instead?"
                    />
                  </div>
                  {state === "error" && <div className="text-red-400 text-[12px]">Could not send: {err}</div>}
                </div>
                <div className="flex gap-2 justify-end mt-6">
                  <button className="btn" onClick={close}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    disabled={state === "sending" || message.trim().length < 5}
                    onClick={submit}
                  >
                    {state === "sending" ? "Sending…" : "Send report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
