import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireAuth, requireRole, requireProjectAccess } from "./guards";
import * as authContextModule from "@/src/features/auth/get-auth-context";

// Mock Prisma 
const mockPrisma = {
  projectTeam: {
    findFirst: vi.fn(),
  },
} as any;

//  mock getAuthContext 
function mockAuthContext(value: any) {
  vi.spyOn(authContextModule, "getAuthContext").mockResolvedValue(value);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("requireAuth", () => {
  it("throws 401 if no session", async () => {
    mockAuthContext({
      session: null,
      supabaseUser: null,
      user: null,
      error: null,
    });

    await expect(requireAuth(mockPrisma)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("throws 403 if prisma user missing", async () => {
    mockAuthContext({
      session: {},
      supabaseUser: { id: "123" },
      user: null,
      error: null,
    });

    await expect(requireAuth(mockPrisma)).rejects.toMatchObject({
      status: 403,
    });
  });

  it("returns ctx if valid user", async () => {
    const ctx = {
      session: {},
      supabaseUser: { id: "123" },
      user: {
        id: "u1",
        role: { name: "APPRENTICE" },
        isActive: true,
      },
      error: null,
    };

    mockAuthContext(ctx);

    const result = await requireAuth(mockPrisma);
    expect(result).toEqual(ctx);
  });
});

describe("requireRole", () => {
  it("allows ADMIN", async () => {
    const ctx = {
      session: {},
      supabaseUser: { id: "123" },
      user: {
        id: "u1",
        role: { name: "ADMIN" },
        isActive: true,
      },
      error: null,
    };

    mockAuthContext(ctx);

    const result = await requireRole(mockPrisma, "ADMIN");
    expect(result).toEqual(ctx);
  });

  it("forbids non-admin", async () => {
    const ctx = {
      session: {},
      supabaseUser: { id: "123" },
      user: {
        id: "u1",
        role: { name: "APPRENTICE" },
        isActive: true,
      },
      error: null,
    };

    mockAuthContext(ctx);

    await expect(requireRole(mockPrisma, "ADMIN")).rejects.toMatchObject({
      status: 403,
    });
  });
});

describe("requireProjectAccess", () => {
  it("allows ADMIN without checking membership", async () => {
    const ctx = {
      session: {},
      supabaseUser: { id: "123" },
      user: {
        id: "u1",
        role: { name: "ADMIN" },
        isActive: true,
      },
      error: null,
    };

    mockAuthContext(ctx);

    const result = await requireProjectAccess(mockPrisma, "project1");

    expect(result).toEqual(ctx);
    expect(mockPrisma.projectTeam.findFirst).not.toHaveBeenCalled();
  });

  it("allows member if membership exists", async () => {
    const ctx = {
      session: {},
      supabaseUser: { id: "123" },
      user: {
        id: "u1",
        role: { name: "APPRENTICE" },
        isActive: true,
      },
      error: null,
    };

    mockAuthContext(ctx);

    mockPrisma.projectTeam.findFirst.mockResolvedValue({ projectId: "project1" });

    const result = await requireProjectAccess(mockPrisma, "project1");

    expect(result).toEqual(ctx);
    expect(mockPrisma.projectTeam.findFirst).toHaveBeenCalled();
  });

  it("forbids member if no membership", async () => {
    const ctx = {
      session: {},
      supabaseUser: { id: "123" },
      user: {
        id: "u1",
        role: { name: "APPRENTICE" },
        isActive: true,
      },
      error: null,
    };

    mockAuthContext(ctx);

    mockPrisma.projectTeam.findFirst.mockResolvedValue(null);

    await expect(requireProjectAccess(mockPrisma, "project1")).rejects.toMatchObject({
      status: 403,
    });
  });
});