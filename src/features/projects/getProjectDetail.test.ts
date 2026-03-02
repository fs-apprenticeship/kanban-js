import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProjectDetail } from "./getProjectDetail";
import { prisma } from "@/src/lib/prisma";

// Mock Prisma
vi.mock("@/src/lib/prisma", () => ({
    prisma: {
        project: {
            findUnique: vi.fn(),
        },
    },
}));

// Mock requireProjectAccess from guards
vi.mock("@/src/features/auth/guards", () => ({
    requireProjectAccess: vi.fn().mockResolvedValue({
        user: {
            id: "u1",
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
            isActive: true,
            role: { name: "APPRENTICE" },
        },
        session: {},
        supabaesUser: {},
        error: null,
    }),
}));

describe("getProjectDetail", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    it("returns project details with tasks, assignees, and taskStats", async () => {
        // Arrange Prisma mock return
        (prisma.project.findUnique as any).mockResolvedValue({
            id: "p1",
            name: "Project 1",
            description: "Project description",
            tasks: [
                {
                    id: "t1",
                    description: "Project description",
                    status: { name: "TODO" },
                    assignees: [
                        { user: { id: "u2", firstName: "Alice", lastName: "Smith"} }
                    ],
                },
                {
                    id: "t2",
                    description: "Task 2",
                    status: { name: "DONE" },
                    assignees: [
                        { user: { id: "u3", firstName: "Bob", lastName: "Jones" } },
                        { user: { id: "u1", firstName: "Test", lastName: "User" } },
                    ],
                },
            ],
        });

        // Act
        const project = await getProjectDetail("p1");

        // Assert
        expect(project.id).toBe("p1");
        expect(project.name).toBe("Project 1");
        expect(project.description).toBe("Project description");

        expect(project.tasks).toHaveLength(2);

        // Task Stats
        expect(project.taskStats).toEqual({ TODO: 1, DONE: 1 });

        // Check first task assignee
        expect(project.tasks[0].assignees).toEqual([
            { id: "u2", name: "Alice Smith" },
        ]);

        // Check second task assignees
        expect(project.tasks[1].assignees).toEqual([
            { id: "u3", name: "Bob Jones" },
            { id: "u1", name: "Test User" },
        ]);
    });

    it("throws notFound if project does not exist", async() => {
        (prisma.project.findUnique as any).mockResolvedValue(null);

        await expect(getProjectDetail("nonexistent")).rejects.toThrow(
            "Project not found"
        );
    });
});