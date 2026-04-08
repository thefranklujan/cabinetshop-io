"use client";
import { PageHeader } from "@/components/frame/Frame";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Mail, Shield, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

type Member = { user_id: string; role: string; joined_at: string; email?: string };
type Invite = { id: string; email: string; role: string; created_at: string };

export default function TeamPage() {
  const { workspaceId } = useStore();
  const supabase = createClient();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member" | "viewer">("member");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const reload = async () => {
    if (!workspaceId) return;
    const { data: m } = await supabase
      .from("workspace_members")
      .select("user_id, role, joined_at")
      .eq("workspace_id", workspaceId);

    // Fetch emails by joining auth.users via an RPC would be ideal; for now just show user_id
    setMembers((m || []) as any);

    const { data: i } = await supabase
      .from("workspace_invites")
      .select("id, email, role, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    setInvites((i || []) as any);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const sendInvite = async () => {
    if (!email || !workspaceId) return;
    setLoading(true);
    setErr("");
    const { error } = await supabase.from("workspace_invites").insert({
      workspace_id: workspaceId,
      email: email.toLowerCase().trim(),
      role,
    });
    setLoading(false);
    if (error) return setErr(error.message);
    setEmail("");
    setOpen(false);
    reload();
  };

  const revoke = async (id: string) => {
    await supabase.from("workspace_invites").delete().eq("id", id);
    reload();
  };

  return (
    <>
      <PageHeader
        title="Team"
        sub={`${members.length} members · ${invites.length} pending invites`}
        action={
          <button onClick={() => setOpen(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Invite Member
          </button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-[15px] font-bold mb-5 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-500" /> Active Members
          </h2>
          <div className="space-y-3">
            {members.map((m) => (
              <div key={m.user_id} className="flex items-center justify-between py-3 border-b border-neutral-900 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 grid place-items-center text-amber-500 text-xs font-bold">
                    {m.user_id.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-white font-mono">{m.user_id.slice(0, 8)}…</div>
                    <div className="text-[11px] text-neutral-500">Joined {m.joined_at?.slice(0, 10)}</div>
                  </div>
                </div>
                <span className="chip chip-accent flex items-center gap-1">
                  <Shield className="w-3 h-3" /> {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-[15px] font-bold mb-5 flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-500" /> Pending Invites
          </h2>
          {invites.length === 0 ? (
            <div className="text-[13px] text-neutral-600">No pending invites.</div>
          ) : (
            <div className="space-y-3">
              {invites.map((i) => (
                <div key={i.id} className="flex items-center justify-between py-3 border-b border-neutral-900 last:border-0">
                  <div>
                    <div className="text-[13px] font-semibold text-white">{i.email}</div>
                    <div className="text-[11px] text-neutral-500">
                      Invited as {i.role} · {i.created_at?.slice(0, 10)}
                    </div>
                  </div>
                  <button onClick={() => revoke(i.id)} className="text-neutral-700 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-neutral-600 mt-5 border-t border-neutral-900 pt-4">
            When someone signs up at CabinetShop.io with an invited email, they're automatically added to your shop.
          </p>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-7">
            <h2 className="text-xl font-bold mb-5">Invite Team Member</h2>
            <div className="space-y-4">
              <div>
                <div className="label">Email</div>
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="crew@example.com" />
              </div>
              <div>
                <div className="label">Role</div>
                <select className="input" value={role} onChange={(e) => setRole(e.target.value as any)}>
                  <option value="admin">Admin (manage shop, can invite)</option>
                  <option value="member">Member (full access, no team)</option>
                  <option value="viewer">Viewer (read only)</option>
                </select>
              </div>
              {err && <div className="text-red-400 text-[12px]">{err}</div>}
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendInvite} disabled={loading}>
                {loading ? "Sending…" : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
