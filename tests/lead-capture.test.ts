import { describe, it, expect, vi, beforeEach } from "vitest";

// Regression tests for the false-success bug: these routes must return an error
// status whenever the database write is not confirmed, and success only when it is.

const rpc = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ rpc }),
}));

const { POST: earlyAccess } = await import("@/app/api/early-access/route");
const { POST: contact } = await import("@/app/api/contact/route");

const req = (body: unknown) =>
  new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as never;

beforeEach(() => rpc.mockReset());

describe("/api/early-access", () => {
  it("returns success only when the DB confirmed the write", async () => {
    rpc.mockResolvedValue({ error: null });
    const res = await earlyAccess(req({ shopName: "Acme", email: "a@b.co" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(rpc).toHaveBeenCalledWith("submit_early_access", expect.objectContaining({
      p_shop_name: "Acme",
      p_email: "a@b.co",
    }));
  });

  it("surfaces a DB failure instead of false success", async () => {
    rpc.mockResolvedValue({ error: { message: "permission denied" } });
    const res = await earlyAccess(req({ shopName: "Acme", email: "a@b.co" }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.success).toBeUndefined();
    expect(body.error).toContain("hello@cabinetshop.io");
  });

  it("maps rate limiting to a client-facing message", async () => {
    rpc.mockResolvedValue({ error: { message: "too many requests" } });
    const res = await earlyAccess(req({ shopName: "Acme", email: "a@b.co" }));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toContain("Too many requests");
  });

  it("rejects missing required fields without calling the DB", async () => {
    const res = await earlyAccess(req({ email: "a@b.co" }));
    expect(res.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const bad = new Request("http://localhost/api/test", { method: "POST", body: "{nope" }) as never;
    const res = await earlyAccess(bad);
    expect(res.status).toBe(400);
  });
});

describe("/api/contact", () => {
  it("saves and confirms", async () => {
    rpc.mockResolvedValue({ error: null });
    const res = await contact(req({ email: "a@b.co", message: "hi there" }));
    expect(res.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("submit_contact", expect.objectContaining({
      p_email: "a@b.co",
      p_body: "hi there",
    }));
  });

  it("surfaces failure with a direct email fallback", async () => {
    rpc.mockResolvedValue({ error: { message: "permission denied" } });
    const res = await contact(req({ email: "a@b.co", message: "hi" }));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toContain("hello@cabinetshop.io");
  });

  it("rejects empty message without calling the DB", async () => {
    const res = await contact(req({ email: "a@b.co", message: "" }));
    expect(res.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });
});
