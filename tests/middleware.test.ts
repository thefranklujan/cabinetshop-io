import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

// Critical auth/routing paths: canonical host redirect, protected-route gating,
// and public paths staying public.

const getUser = vi.fn(async () => ({ data: { user: null } }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

const { middleware } = await import("@/middleware");

const request = (url: string, host?: string) =>
  new NextRequest(url, { headers: host ? { host } : undefined });

describe("canonical host", () => {
  it("308-redirects www to the apex, preserving the path", async () => {
    const res = await middleware(request("https://www.cabinetshop.io/pricing?x=1", "www.cabinetshop.io"));
    expect(res.status).toBe(308);
    const loc = res.headers.get("location")!;
    expect(loc).toBe("https://cabinetshop.io/pricing?x=1");
  });

  it("does not redirect the apex", async () => {
    const res = await middleware(request("https://cabinetshop.io/pricing", "cabinetshop.io"));
    expect(res.status).toBe(200);
  });

  it("does not redirect other hosts (preview URLs keep working)", async () => {
    const res = await middleware(request("https://app-phi-neon.vercel.app/", "app-phi-neon.vercel.app"));
    expect(res.status).toBe(200);
  });
});

describe("auth gating", () => {
  it("redirects signed-out users away from /app", async () => {
    const res = await middleware(request("https://cabinetshop.io/app/dashboard", "cabinetshop.io"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/sign-in");
  });

  it("redirects signed-out users away from /platform", async () => {
    const res = await middleware(request("https://cabinetshop.io/platform", "cabinetshop.io"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/sign-in");
  });

  it("keeps marketing pages public", async () => {
    for (const path of ["/", "/pricing", "/privacy", "/terms", "/support", "/early-access"]) {
      const res = await middleware(request(`https://cabinetshop.io${path}`, "cabinetshop.io"));
      expect(res.status, path).toBe(200);
    }
  });

  it("lets authenticated users into /app", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "u1" } } } as never);
    const res = await middleware(request("https://cabinetshop.io/app/dashboard", "cabinetshop.io"));
    expect(res.status).toBe(200);
  });
});
