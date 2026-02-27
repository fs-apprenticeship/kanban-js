import type { PrismaClient } from "@prisma/client";
import { forbidden, unauthorized } from "@/src/lib/http/errors" ;
import { getAuthContext } from "./get-auth-context";

export type RoleName = "ADMIN" | "APPRENTICE";

export async function requireAuth(prisma: PrismaClient) {
  const ctx = await getAuthContext(prisma);

  if (!ctx.session || !ctx.supabaseUser) {
    throw unauthorized("Not authenticated");
  }

  // This should not happen if all signups go through /api/auth/signup.
  if (!ctx.user) {
    throw forbidden("User profile not found in application database");
  }

  if (!ctx.user.isActive) {
    throw forbidden("User is deactivated");
  }

  return ctx; // { session, supabaseUser, user }
}

export async function requireRole(prisma: PrismaClient, role: RoleName) {
  const ctx = await requireAuth(prisma);

  if (ctx.user?.role.name !== role) {
    throw forbidden("Insufficient role");
  }

  return ctx;
}

/**
 * Project access rule:
 * - ADMIN: access any project
 * - Otherwise: must be a member of a team linked to the project
 */
export async function requireProjectAccess(prisma: PrismaClient, projectId: string) {
  const ctx = await requireAuth(prisma);

  // Admin bypass
  if (ctx.user?.role.name === "ADMIN") {
    return ctx;
  }

  const link = await prisma.projectTeam.findFirst({
    where: {
      projectId,
      team: {
        members: {
          some: { userId: ctx.user?.id }, // TeamMember.userId
        },
      },
    },
    select: { projectId: true },
  });

  if (!link) {
    throw forbidden("No access to this project");
  }

  return ctx;
}