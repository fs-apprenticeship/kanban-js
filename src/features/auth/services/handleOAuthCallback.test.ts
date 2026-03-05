import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleOAuthCallback } from "./handleOAuthCallback";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { ensurePrismaUserFromSupabase } from "./ensurePrismaUserFromSupabase";


vi.mock("@/src/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("./ensurePrismaUserFromSupabase", () => ({
  ensurePrismaUserFromSupabase: vi.fn(),
}));

function makeSupabaseMock() {
  return {
    auth: {
      exchangeCodeForSession: vi.fn(),
      getUser: vi.fn(),
    },
  };
}

describe("handleOAuthCallback (DI)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns exchange_failed if code exchange fails", async () => {
    const supabase = makeSupabaseMock();
    supabase.auth.exchangeCodeForSession.mockResolvedValue({ error: { message: "bad code" } });
    (createSupabaseServerClient as any).mockResolvedValue(supabase);

    const prisma = {} as any;

    const res = await handleOAuthCallback("bad", { prisma });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("exchange_failed");
      expect(res.message).toBe("bad code");
    }
  });

  it("returns user_missing if getUser fails", async () => {
    const supabase = makeSupabaseMock();
    supabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "no user" },
    });
    (createSupabaseServerClient as any).mockResolvedValue(supabase);

    const prisma = {} as any;

    const res = await handleOAuthCallback("ok", { prisma });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("user_missing");
    }
  });

  it("returns prisma_user_error if mapping fails", async () => {
    const supabase = makeSupabaseMock();
    supabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "sb1", email: "a@x.com" } },
      error: null,
    });
    (createSupabaseServerClient as any).mockResolvedValue(supabase);

    const prisma = {} as any;
    (ensurePrismaUserFromSupabase as any).mockResolvedValue({
      prismaUser: null,
      needsOnboarding: false,
      error: "conflict",
    });

    const res = await handleOAuthCallback("ok", { prisma });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("prisma_user_error");
      expect(res.message).toBe("conflict");
    }
  });

  it("returns ok with needsOnboarding true when mapping says so", async () => {
    const supabase = makeSupabaseMock();
    supabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "sb1", email: "a@x.com" } },
      error: null,
    });
    (createSupabaseServerClient as any).mockResolvedValue(supabase);

    const prisma = {} as any;
    (ensurePrismaUserFromSupabase as any).mockResolvedValue({
      prismaUser: { id: 1 },
      needsOnboarding: true,
      error: null,
    });

    const res = await handleOAuthCallback("ok", { prisma });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.needsOnboarding).toBe(true);
    }
  });
});