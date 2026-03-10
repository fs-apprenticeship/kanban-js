import { prisma } from "@/src/lib/prisma";
import { requireProjectAccess } from "../auth/guards";
import { badRequest } from "@/src/lib/http/errors";

export interface EditTaskAssigneesInput {
    taskId: string;
    userIds: string[];
}

export async function editTaskAssignees(input: EditTaskAssigneesInput) {
    const { taskId, userIds } = input;

    if (!taskId || typeof taskId !== 'string') {
        throw badRequest("Task ID is required.");
    }
    if (!Array.isArray(userIds)) {
        throw badRequest("userIds must be an array of strings.");
    }

    // Fetch task to get projectId
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { projectId: true },
    });
    if (!task) throw badRequest("Task not found.");

    // Guard: ensure user has access to the task's project
    await requireProjectAccess(prisma, task.projectId);

    // Validate users belong to the project's teams
    const validUsers = await prisma.user.findMany({
        where: {
            id: { in: userIds },
            teamMemberships: {
                some: {
                    team: {
                        projects: {
                            some: {
                                projectId: task.projectId,
                            },
                        },
                    },
                },
            },
        },
        select: { id: true },
    });

    if (validUsers.length !== userIds.length) {
        throw badRequest(
            "One or more users are not members of a team assigned to this project."
        )
    }

    // Delete existing assignees and recreate
    // Using a transaction to avoid partial updates
    await prisma.$transaction([
        prisma.taskAssignee.deleteMany({ where: { taskId } }),
        prisma.taskAssignee.createMany({
            data: userIds.map(userId => ({ taskId, userId })),
            skipDuplicates: true,
        }),
    ]);

    const updatedTask = await prisma.task.findUnique({
        where: { id: taskId },
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
        id: updatedTask!.id,
        description: updatedTask!.description ?? undefined,
        status: updatedTask!.status.name,
        project: updatedTask!.project,
        assignees: updatedTask!.assignees.map(a => ({
            id: a.user.id,
            name: `${a.user.firstName} ${a.user.lastName}`.trim()
        }))
    };
}