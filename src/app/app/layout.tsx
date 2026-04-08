import { StoreProvider } from "@/lib/store";
import Frame from "@/components/frame/Frame";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name")
    .limit(1);

  if (!workspaces || workspaces.length === 0) redirect("/onboarding");

  return (
    <StoreProvider workspaceId={workspaces[0].id}>
      <Frame workspaceName={workspaces[0].name} userEmail={user.email || ""}>
        {children}
      </Frame>
    </StoreProvider>
  );
}
