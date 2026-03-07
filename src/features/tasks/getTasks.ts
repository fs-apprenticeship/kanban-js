import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "../auth/guards";

// Task type for personal view
export type TaskForUser = {
  id: string;
  description?: string | null;
  status: string;
  project: {
    id: string;
    name: string;
  };
  assignees: { id: string; name: string }[]
}

// Fetch tasks for the current user(Personal View)
export async function getTasks(): Promise<TaskForUser[]> {
  //ensure user is authenticated
  const cts = await requireAuth(prisma);
  const user = cts.user!;

  // Fetch tasks where user is assigned
  const taskAssignments = await prisma.taskAssignee.findMany({
    where: { userId: user.id },
    include: {
      task: {
        include: {
          status: true,
          project: { select: { id: true, name: true }},
          assignees: { include: { user: true }},
        },
      },
    },
    orderBy: { task: { createdAt: "desc" }},
  });

  // Map to frontend-friendly type
  return taskAssignments.map(ta => {
    const task = ta.task;
    return {
      id: task.id,
      description: task.description ?? null,
      status: task.status.name,
      project: { id: task.project.id, name: task.project.name },
      assignees: task.assignees.map(a => ({
        id: a.user.id,
        name: `${a.user.firstName} ${a.user.lastName}`,
      })),
    };
  });
}

