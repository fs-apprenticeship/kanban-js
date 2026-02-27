import { prisma } from "@/src/lib/prisma";
import { requireRole } from "../auth/guards";
import { badRequest } from "@/src/lib/http/errors";

interface CreateProjectInput {
    name: string;
    description?: string;
}

export async function createProject(input: CreateProjectInput) {
    // Only admins can create projects
    await requireRole(prisma, "ADMIN");

    const { name, description } = input;

    // Validate project name
    if (!name || typeof name !== "string") {
        throw badRequest("Project name is required.")
    }

    try {
        const project = await prisma.project.create({
            data: { name, description },
        });

        return project;
    } catch (err: any) {
        if (err.code === "P2002") {
            throw badRequest("Project name already exists");
        }
        console.error(err);
        throw err;
    }
}