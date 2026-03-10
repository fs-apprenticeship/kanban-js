import { describe, it, expect, vi, beforeEach } from "vitest";
import { createProject } from "./createProject";
import { prisma } from "@/src/lib/prisma";
import * as guards from "../auth/guards";
import { badRequest } from "@/src/lib/http/errors";

// Mock prisma
vi.mock("@/src/lib/prisma", () => ({
    prisma: {
        project: {
            create: vi.fn(),
        },
    },
}));

// Mock requireRole from guards
vi.mock("../auth/guards", () => ({
    requireRole: vi.fn(),
}));

describe("createProject", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it ("throws badRequest if name is missing", async () => {
        await expect(createProject({ name: "" })).rejects.toThrow("Project name is required.");
    });

    it("calls requireRole with ADMIN", async () => {
        (guards.requireRole as any).mockResolvedValue(undefined);
        (prisma.project.create as any).mockResolvedValue({ id: "p1", name: "Test Project" });

        await createProject({ name: "Test Project" });

        expect(guards.requireRole).toHaveBeenCalledWith(prisma, "ADMIN");
    });

    it("creates a project successfully", async () => {
        (guards.requireRole as any).mockResolvedValue(undefined);

        const mockProject = { id: "p1", name: "New Project" };
        (prisma.project.create as any).mockResolvedValue(mockProject);

        const project = await createProject({ name: "New Project" });

        expect(project).toEqual(mockProject);
        expect(prisma.project.create).toHaveBeenCalledWith({
            data: { name: "New Project", description: undefined },
        })
    });

    it ("throws badRequest if project name already exists(P2002)", async () => {
        (guards.requireRole as any).mockResolvedValue(undefined);
        (prisma.project.create as any).mockRejectedValue({ code: "P2002" });

        await expect(createProject({ name: "Duplicate Project "})).rejects.toThrow(
            "Project name already exists"
        );
    });

    it("propagates unknown Prisma errors", async () => {
        (guards.requireRole as any).mockResolvedValue(undefined);
        const unknownError = new Error("Unexpected");
        (prisma.project.create as any).mockRejectedValue(unknownError);

        await expect(createProject({ name: "Test Project" })).rejects.toThrow(unknownError);
    })
})