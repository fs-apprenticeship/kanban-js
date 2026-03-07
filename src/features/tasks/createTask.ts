import { prisma } from "@/src/lib/prisma";
import { requireProjectAccess } from "../auth/guards";
import { badRequest } from "@/src/lib/http/errors";

interface CreateTaskInput {
    description: string;
    projectId: string;
    statusId: string;
}

type CreatedTask = {
    id: string;
    description?: string;
    status: string;
    project: {
        id: string;
        name: string;
    }
}

export async function createTask(input: CreateTaskInput): Promise<CreatedTask> {
    const { description, projectId, statusId } = input;

    if (!description || typeof description !== "string") {
        throw badRequest("Task description is required.");
    }

    if (!projectId) {
        throw badRequest("Project is required.")
    }

    if (!statusId) {
        throw badRequest("Status is required.");
    }

    // Guard handles:
    // - authentication
    // - admin bypass
    // - apprentice team - project access

    const ctx = await requireProjectAccess(prisma, projectId);

    const task = await prisma.task.create({
        data: {
            description,
            projectId,
            statusId,
            createdById: ctx.user!.id,
        },
        select: {
            id: true,
            description: true,
            status: { select: { name: true } },
            project: { select: { id: true, name: true } },
        },
    });

    return {
        id: task.id,
        description: task.description ?? undefined,
        status: task.status.name,
        project: task.project,
    };
}