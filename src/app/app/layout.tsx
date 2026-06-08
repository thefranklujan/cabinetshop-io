import { StoreProvider, type WorkspaceRole } from "@/lib/store";
import Frame from "@/components/frame/Frame";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ACTIVE_WORKSPACE_COOKIE = "cs_workspace";

type Membership = {
  role: WorkspaceRole;
  joined_at: string;
  workspace_id: string;
  workspaces: { id: string; name: string } | null;
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Resolve through the caller's own membership rows (explicitly filtered by user_id —
  // wm_select RLS also returns co-members), ordered by join time then workspace id so the
  // default is deterministic rather than an arbitrary `.limit(1)`.
  const { data } = await supabase
    .from("workspace_members")
    .select("role, joined_at, workspace_id, workspaces ( id, name )")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .order("workspace_id", { ascending: true });

  const memberships = (data ?? []) as unknown as Membership[];
  const valid = memberships.filter((m) => m.workspaces);
  if (valid.length === 0) redirect("/onboarding");

  // Workspace switcher: honor the cs_workspace cookie when it points at a workspace the
  // user actually belongs to (a tampered/stale cookie can't escalate — it just falls back
  // to the deterministic default). The cookie is set client-side by the Frame switcher.
  const preferred = cookies().get(ACTIVE_WORKSPACE_COOKIE)?.value;
  const active = valid.find((m) => m.workspaces!.id === preferred) ?? valid[0];

  const workspaces = valid.map((m) => ({ id: m.workspaces!.id, name: m.workspaces!.name }));

  return (
    <StoreProvider workspaceId={active.workspaces!.id} role={active.role}>
      <Frame
        workspaceName={active.workspaces!.name}
        userEmail={user.email || ""}
        role={active.role}
        workspaces={workspaces}
        activeWorkspaceId={active.workspaces!.id}
      >
        {children}
      </Frame>
    </StoreProvider>
  );
}
