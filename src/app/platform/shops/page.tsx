import { createClient } from "@/lib/supabase/server";
import { Building2, Users, Hammer, Search } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function ShopsPage() {
  const supabase = createClient();

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: false });

  const shops = workspaces || [];

  // Fetch member counts and project counts per workspace
  const shopDetails = await Promise.all(
    shops.map(async (w) => {
      const [members, projects, clients] = await Promise.all([
        supabase.from("workspace_members").select("user_id", { count: "exact", head: true }).eq("workspace_id", w.id),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("workspace_id", w.id),
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("workspace_id", w.id),
      ]);
      return {
        ...w,
        memberCount: members.count || 0,
        projectCount: projects.count || 0,
        clientCount: clients.count || 0,
      };
    })
  );

  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">All Shops</h1>
          <p className="text-neutral-500 text-[14px]" style={{ marginTop: "4px" }}>
            {shops.length} shops on the platform
          </p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Shop Name</th>
              <th>Slug</th>
              <th>Plan</th>
              <th>Members</th>
              <th>Projects</th>
              <th>Clients</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {shopDetails.map((w) => (
              <tr key={w.id}>
                <td className="font-semibold text-white">{w.name}</td>
                <td className="font-mono text-[12px] text-neutral-500">{w.slug}</td>
                <td>
                  <span className={`chip ${w.plan !== "starter" ? "chip-accent" : ""}`}>{w.plan}</span>
                </td>
                <td className="font-bold text-white">{w.memberCount}</td>
                <td>
                  <span className="text-amber-500 font-bold">{w.projectCount}</span>
                </td>
                <td>{w.clientCount}</td>
                <td className="text-[12px] text-neutral-500">{w.created_at?.slice(0, 10)}</td>
              </tr>
            ))}
            {shops.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-neutral-600" style={{ padding: "40px 16px" }}>
                  No shops yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
