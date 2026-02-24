import prisma from "@/app/lib/prisma";

export async function getProjects() {
    const projects = await prisma.project.findMany({
        include: {
            tasks: {
                include: {
                    status: true,       // Include status for each task
                    assignees: {
                        include: { user: true}  // Include assigned users
                    }
                }
            }
        }
    })

    return projects.map(project => {
        const tasksByStatus: Record<string, number> = {};

        project.tasks.forEach(task => {
            const statusName = task.status.name;
            tasksByStatus[statusName] = (tasksByStatus[statusName] || 0) + 1;
        });

        return {
            id: project.id,
            name: project.name,
            description: project.description,
            totalTasks: project.tasks.length,
            tasksByStatus,
            tasks: project.tasks.map(task => ({
                id: task.id,
                title: task.description?? "No title",
                status: task.status.name,
                assignees: task.assignees.map(a => ({
                    id: a.user.id,
                    name: `${a.user.firstName} ${a.user.lastName}`
                }))
            }))
        };
    });
}