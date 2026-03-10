import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "../auth/guards";

// Type
export type Project = {
    id: string;
    name: string;
    description?: string | null;
    isActive: boolean
    taskStats: Record<string, number>;
}

// Fetch projects from the database
export async function getProjects(): Promise<Project[]> {

    const ctx = await requireAuth(prisma);

    const user = ctx.user!

    const whereClause = 
        user.role.name === "APPRENTICE"
            ? {
                isActive: true,
                teams: {
                    some: {
                        team: {
                            members: { some: { userId: user.id }},
                        },
                    },
                },
            }
            : {};

    const projects = await prisma.project.findMany({
        where: whereClause,
        include: {
            tasks: { include: { status: true }}, // include status for aggregation
        },
        orderBy: { createdAt: "desc" },
    });

    // Map task counts by status
    return projects.map(project => {
        const tasksByStatus: Record< string, number> = {};

        project.tasks.forEach(task => {
            const statusName = task.status?.name ?? "UNKNOWN";
            tasksByStatus[statusName] = (tasksByStatus[statusName] || 0) + 1;
        });

        return {
            id: project.id,
            name: project.name,
            description: project.description,
            isActive: project.isActive,
            taskStats: tasksByStatus,
        }
    })
}