import { prisma } from "@/src/lib/prisma";
import { requireProjectAccess } from "../auth/guards";
import { badRequest } from "@/src/lib/http/errors";

export interface EditTaskInput {
    id: string;
    description?: string;
    statusId?: string;
}

export type TaskDetail = {
    id: string;
    description?: string;
    status: string;
    project: {
        id: string;
        name: string;
    };
    assignees: { id: string; name: string }[];
}

export async function editTask(input: EditTaskInput): Promise<TaskDetail> {
    const { id, description, statusId } = input;

    // Validate required ID
    if(!id || typeof id !== "string") {
        throw badRequest("Task ID is required.");
    }

    // Optional field validations
    if (description !== undefined && typeof description !== "string") {
        throw badRequest("Task description must be a string.");
    }

    if (statusId !== undefined && typeof statusId !== "string") {
        throw badRequest("Status ID must be a string.")
    }

    // Fetch task to get projectId
    const task = await prisma.task.findUnique({
        where: { id },
        select: { projectId: true },
    });

    if (!task) throw badRequest("Task not found.");

    // Guard handles:
    // - authentication
    // - admin bypass
    // - apprentice team project access
    const ctx = await requireProjectAccess(prisma, task.projectId);

    // Build update data
    const updateData: any = {
        ...(description !== undefined && { description }),
        ...(statusId !== undefined && { statusId }),
    };

    const updatedTask = await prisma.task.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            description: true,
            status: { select: { name: true } },
            project: { select: { id: true, name: true } },
            assignees: {
                select: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
        }
    });

    return {
        id: updatedTask.id,
        description: updatedTask.description ?? undefined,
        status: updatedTask.status.name,
        project: updatedTask.project,
        assignees: updatedTask.assignees.map(a => ({
            id: a.user.id,
            name: `${a.user.firstName} ${a.user.lastName}`.trim()
        }))
    };
}