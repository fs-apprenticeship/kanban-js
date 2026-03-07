import { prisma } from "@/src/lib/prisma";
import { notFound } from "@/src/lib/http/errors";
import { requireAuth } from "../auth/guards";

export type TaskDetail = {
    id: string;
    description?: string;
    status: string;
    assignees: { id: string; name: string }[];
    project: { id: string; name: string };
}

export async function getTaskDetail(taskId: string): Promise<TaskDetail> {
    // only require authentication
    const ctx = await requireAuth(prisma);

    // fetch task with assignees and project info
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
            id: true,
            description: true,
            status: { select: { name: true }},
            project: { select: { id: true, name: true }},
            assignees: {
                select: {
                    user: { select: { id: true, firstName: true, lastName: true }},
                },
            },
        },
    });

    if (!task) throw notFound("Task not found");

    return {
        id: task.id,
        description: task.description ?? undefined,
        status: task.status?.name ?? "UNKNOWN",
        project: { id: task.project.id, name: task.project.name },
        assignees: task.assignees.map(a => ({
            id: a.user.id,
            name: `${a.user.firstName} ${a.user.lastName}`,
        })),
    };
}