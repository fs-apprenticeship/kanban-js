import { prisma } from "@/src/lib/prisma";
import { requireRole } from "../auth/guards";
import { badRequest } from "@/src/lib/http/errors";

interface AssignTeamsInput {
    projectId: string;
    teamIds: string[];
}

/**
 * Assigns teams to a project.
 * Replaces any existing assignments with the provided teamIds.
 */
export async function assignTeamsToProject({ projectId, teamIds }: AssignTeamsInput) {
    // Only admins can assign teams
    await requireRole(prisma, "ADMIN");

    // Basic validation
    if (!projectId || typeof projectId !== "string") {
        throw badRequest("Project ID is required and must be a string.");
    }
    if (!Array.isArray(teamIds)) {
        throw badRequest("teamIds must be an array of strings.");
    }

    // Get current teams linked to this project
    const currentTeams = await prisma.projectTeam.findMany({
        where: { projectId },
        select: { teamId: true },
    })
    const currentTeamIds = currentTeams.map(t => t.teamId);

    // Identify teams that are being removed
    const removedTeamIds = currentTeamIds.filter(id => !teamIds.includes(id));

    if (removedTeamIds.length > 0) {
        //Check if any users in these teams have tasks in this project
        const tasksWithAssignedUsers = await prisma.taskAssignee.findFirst({
            where: {
                task: { projectId },
                user: { teamMemberships: { some: { teamId: { in: removedTeamIds } } } },
            },
        });

        if (tasksWithAssignedUsers) {
            throw badRequest(
                "Cannot remove team(s) from project: all tasks for users in these teams must be removed first."
            );
        }
    }

    const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
            teams: {
                deleteMany: {}, // remove existing assignments
                create: teamIds.map(teamId => ({ teamId })),
            },
        },
        include: {
            teams: { include: { team: true } },
        },
    });

    return updatedProject;
}