import { prisma } from "@/src/lib/prisma";
import { requireProjectAccess } from "../auth/guards";
import { badRequest } from "@/src/lib/http/errors";

export interface DeleteTaskInput {
    id: string,
}

export async function deleteTask(input: DeleteTaskInput): Promise<{ id: string }> {
    const { id } = input;

    // Validate required ID
    if (!id || typeof id !== "string") {
        throw badRequest("Task ID is required.");
    }

    // Fetch task to get projectId for access control
    const task = await prisma.task.findUnique({
        where: { id },
        select: { projectId: true }
    });

    if (!task) throw badRequest("Task not found.");

    // Guard handlesauthentication and project access
    await requireProjectAccess(prisma, task.projectId)

    // Delete the task
    await prisma.task.delete({
        where: { id }
    });

    return { id };
}