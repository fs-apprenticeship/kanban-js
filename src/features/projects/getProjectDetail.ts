import { prisma } from "@/src/lib/prisma";
import { notFound } from "@/src/lib/http/errors";
import { requireProjectAccess } from "../auth/guards";

// Frontend-friendly Task type
export type Task = {
  id: string;
  description?: string;
  status: string;
  assignees: { id: string; name: string }[];
};

// Frontend-friendly Project type with tasks and stats
export type ProjectDetail = {
  id: string;
  name: string;
  description?: string;
  tasks: Task[];
  taskStats: Record<string, number>;
};

export async function getProjectDetail(projectId: string): Promise<ProjectDetail> {

  // Enforce access rules: Admin can see all, Apprentice only if linked to ateam
  const ctx = await requireProjectAccess(prisma, projectId);

  //cts.user is guaranteed to exist at this point

  let project;

  try {
    // Fetch project with all tasks, status, and assignees
    project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        description: true,
        tasks: {
          select: {
            id: true,
            description: true,
            status: { select: { name: true } },
            assignees: {
              select: {
                user: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { createdAt: "asc" }, // no trailing space
        },
      },
    });
  } catch (err) {
    console.error("Prisma query error:", err);
    throw new Error("Database query failed"); // will be caught in your route
  }

  if (!project) throw notFound("Project not found");

  // Map tasks and compute status counts
  const taskStats: Record<string, number> = {};
  const tasks: Task[] = project.tasks.map(task => {
    const statusName = task.status?.name ?? "UNKNOWN";
    taskStats[statusName] = (taskStats[statusName] || 0) + 1;

    return {
      id: task.id,
      description: task.description ?? undefined,
      status: statusName,
      assignees: task.assignees.map(a => ({
        id: a.user.id,
        name: `${a.user.firstName} ${a.user.lastName}`,
      })),
    };
  });

  return {
    id: project.id,
    name: project.name,
    description: project.description ?? undefined,
    tasks,
    taskStats,
  };
}
