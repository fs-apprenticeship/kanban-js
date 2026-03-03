import { describe, it, expect, vi, beforeEach } from "vitest";
import { completeOnboarding } from "./completeOnboarding";

function makePrismaMock() {
  return {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  } as any;
}

describe("completeOnboarding", () => {
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
  });

  it("returns validation error when names are blank", async () => {
    const res = await completeOnboarding(prisma, "sb1", {
      firstName: "   ",
      lastName: "",
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("validation");
    }
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns user_not_found when prisma user missing", async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    const res = await completeOnboarding(prisma, "sb1", {
      firstName: "Aiman",
      lastName: "L",
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { supabaseUserId: "sb1" },
      select: { id: true, isActive: true },
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("user_not_found");
    }
  });

  it("returns inactive when prisma user is disabled", async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 1, isActive: false });

    const res = await completeOnboarding(prisma, "sb1", {
      firstName: "Aiman",
      lastName: "L",
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("inactive");
    }
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("updates names and returns ok", async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 1, isActive: true });
    prisma.user.update.mockResolvedValueOnce({ id: 1 });

    const res = await completeOnboarding(prisma, "sb1", {
      firstName: "  Aiman ",
      lastName: " Lahmamsi  ",
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { firstName: "Aiman", lastName: "Lahmamsi" },
    });

    expect(res.ok).toBe(true);
  });
});
