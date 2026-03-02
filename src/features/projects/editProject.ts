import { prisma } from "@/src/lib/prisma";
import { requireRole } from "../auth/guards";
import { badRequest } from "@/src/lib/http/errors";

export interface EditProjectInput {
    id: string;
    name?: string;
    description?: string;
    isActive?: boolean;
}

export async function editProject(input: EditProjectInput) {
    // only admins can edit projects
    await requireRole(prisma, "ADMIN");

    const { id, name, description, isActive } = input;

    // Validate required ID
    if (!id || typeof id !== "string") {
        throw badRequest("Project ID is required.");
    }

    // Optional validation
    if (name !== undefined && typeof name !== "string") {
        throw badRequest("Project name must be a string.")
    }
    if (isActive !== undefined && typeof isActive !== "boolean") {
        throw badRequest("isActive must be a boolean.")
    }

    try {
        // Update project
        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(isActive !== undefined && { isActive }),
            },
        });
        return updatedProject;
    } catch (err: any) {
        if (err.code === "P2002") {
            throw badRequest("Project name already exists");
        }
        console.error(err);
        throw err;
    }
}