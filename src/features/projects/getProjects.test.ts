import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProjects } from "./getProjects";
import { prisma } from "@/src/lib/prisma";

// Mock prisma
vi.mock("@/src/lib/prisma", () => ({
    prisma: {
        project: {
            findMany: vi.fn(),
        },
    },
}));

// Mock requireAuth from guards
vi.mock("/src/features/auth/guards", () => ({
    requireAuth: vi.fn().mockResolvedValue({
        user: {
            id: "u1",
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
            isActive: true,
            role: { name: "APPRENTICE" },
        },
        session: {},
        supabaseUser: {},
        error: null,
    }),
}));

describe("getProjects", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns mapped projects with taskStats", async () => {
        // Mock Prisma response
        (prisma.project.findMany as any).mockResolvedValue([
            {
                id: "p1",
                name: "Project 1",
                description: "Desc 1",
                tasks: [
                    { id: "t1", status: { name: "TODO" }},
                    { id: "t2", status: { name: "DONE" }},
                    { id: "t1", status: { name: "TODO" }},
                ],
            },
            {
                id: "p2",
                name: "Project 2",
                description: null,
                tasks: []
            },
        ]);

        const projects = await getProjects();

        expect(projects).toHaveLength(2);

        // Check first project taskStats
        expect(projects[0].taskStats).toEqual({
            TODO: 2,
            DONE: 1,
        });

        // Check second project with no tasks
        expect(projects[1].taskStats).toEqual({});
    });
});