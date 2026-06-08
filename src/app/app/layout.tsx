import { StoreProvider, type WorkspaceRole } from "@/lib/store";
import Frame from "@/components/frame/Frame";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Deterministic workspace resolution. Resolve through the caller's own membership rows
  // (explicitly filtered by user_id — wm_select RLS also returns co-members), ordered by
  // join time then workspace id so the active workspace is stable across reloads rather
  // than an arbitrary `.limit(1)`. The membership row also carries the caller's role.
  // TODO(workspace-switcher): when memberships.length > 1, render a switcher in the Frame
  // and persist the chosen workspace id (e.g. a cookie) instead of always taking [0].
  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("role, joined_at, workspace_id, workspaces ( id, name )")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .order("workspace_id", { ascending: true });

  if (!memberships || memberships.length === 0) redirect("/onboarding");

  const active = memberships[0] as unknown as {
    role: WorkspaceRole;
    workspaces: { id: string; name: string } | null;
  };
  if (!active.workspaces) redirect("/onboarding");

  return (
    <StoreProvider workspaceId={active.workspaces.id} role={active.role}>
      <Frame workspaceName={active.workspaces.name} userEmail={user.email || ""} role={active.role}>
        {children}
      </Frame>
    </StoreProvider>
  );
}
