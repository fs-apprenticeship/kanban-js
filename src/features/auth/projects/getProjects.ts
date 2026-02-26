import { prisma } from "@/src/lib/prisma";
import { Task } from "@prisma/client";

// Type
export type Project = {
    id: string;
    name: string;
    description?: string | null;
    taskStats: Record<string, number>;
}

// Fetch projects from the database
export async function getProjects(): Promise<Project[]> {
    const projects = await prisma.project.findMany({
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
            taskStats: tasksByStatus,
        }
    })
}