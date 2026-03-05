import { describe, it, expect, vi, beforeEach } from "vitest";
import { ensurePrismaUserFromSupabase } from "./ensurePrismaUserFromSupabase";

function makePrismaMock() {
  return {
    role: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  } as any;
}

describe("ensurePrismaUserFromSupabase", () => {
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    prisma.role.findUnique.mockResolvedValue({ id: 2 }); // APPRENTICE role id
  });

  it("fails if email is missing", async () => {
    const res = await ensurePrismaUserFromSupabase(prisma, { id: "sb1", email: null });

    expect(res.prismaUser).toBeNull();
    expect(res.error).toMatch(/No email/i);
  });

  it("returns linked user found by supabaseUserId and updates email", async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 10, supabaseUserId: "sb1", email: "old@x.com", firstName: "", lastName: "" }); // linked
    prisma.user.update.mockResolvedValueOnce({ id: 10, supabaseUserId: "sb1", email: "new@x.com", firstName: "", lastName: "" });

    const res = await ensurePrismaUserFromSupabase(prisma, { id: "sb1", email: "new@x.com" });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { supabaseUserId: "sb1" } });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { email: "new@x.com" },
    });
    expect(res.error).toBeNull();
    expect(res.needsOnboarding).toBe(true);
  });

  it("attaches supabaseUserId when user exists by email", async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(null) // not linked
      .mockResolvedValueOnce({ id: 11, supabaseUserId: null, email: "a@x.com", firstName: "A", lastName: "B" }); // by email
    prisma.user.update.mockResolvedValueOnce({ id: 11, supabaseUserId: "sb1", email: "a@x.com", firstName: "A", lastName: "B" });

    const res = await ensurePrismaUserFromSupabase(prisma, { id: "sb1", email: "a@x.com" });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 11 },
      data: { supabaseUserId: "sb1" },
    });
    expect(res.error).toBeNull();
    expect(res.needsOnboarding).toBe(false);
  });

  it("returns conflict error when email already linked to different supabaseUserId", async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(null) // not linked
      .mockResolvedValueOnce({ id: 12, supabaseUserId: "sb_other", email: "a@x.com", firstName: "A", lastName: "B" });

    const res = await ensurePrismaUserFromSupabase(prisma, { id: "sb1", email: "a@x.com" });

    expect(res.prismaUser).toBeNull();
    expect(res.error).toMatch(/already linked/i);
  });

  it("creates new user with APPRENTICE role when none exists", async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(null) // not linked
      .mockResolvedValueOnce(null); // not by email

    prisma.user.create.mockResolvedValueOnce({
      id: 13,
      supabaseUserId: "sb1",
      email: "new@x.com",
      firstName: "",
      lastName: "",
      roleId: 2,
      isActive: true,
    });

    const res = await ensurePrismaUserFromSupabase(prisma, { id: "sb1", email: "new@x.com" });

    expect(prisma.role.findUnique).toHaveBeenCalledWith({
      where: { name: "APPRENTICE" },
      select: { id: true },
    });
    expect(prisma.user.create).toHaveBeenCalled();
    expect(res.error).toBeNull();
    expect(res.needsOnboarding).toBe(true);
  });

  it("throws if APPRENTICE role is missing", async () => {
    prisma.role.findUnique.mockResolvedValueOnce(null);

    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await expect(
      ensurePrismaUserFromSupabase(prisma, { id: "sb1", email: "x@x.com" }),
    ).rejects.toThrow(/APPRENTICE/);
  });
});