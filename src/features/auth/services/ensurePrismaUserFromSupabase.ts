import type { PrismaClient } from "@prisma/client";

type SupabaseUser = {
  id: string;
  email?: string | null;
};

function isBlank(s: string | null | undefined) {
  return !s || s.trim().length === 0;
}

async function getApprenticeRoleId(prisma: PrismaClient) {
  const role = await prisma.role.findUnique({
    where: { name: "APPRENTICE" },
    select: { id: true },
  });

  if (!role) {
    throw new Error(
      'Role "APPRENTICE" not found. Seed Role table (ADMIN, APPRENTICE).',
    );
  }

  return role.id;
}

export async function ensurePrismaUserFromSupabase(
  prisma: PrismaClient,
  supabaseUser: SupabaseUser,
) {
  const supabaseUserId = supabaseUser.id;
  const email = supabaseUser.email ?? null;

  // GitHub can return no email in some cases (user hides email).
  // email required + unique, we fail fast and redirect to an error page.
  if (!email) {
    return {
      prismaUser: null,
      needsOnboarding: false,
      error:
        "No email returned from GitHub. Please add a public email to your GitHub account or use a different sign-in method.",
    } as const;
  }

  // Already linked by supabaseUserId
  const linked = await prisma.user.findUnique({
    where: { supabaseUserId },
  });

  if (linked) {
    // Keep email in sync (harmless if unchanged)
    const updated = await prisma.user.update({
      where: { id: linked.id },
      data: { email },
    });

    return {
      prismaUser: updated,
      needsOnboarding: isBlank(updated.firstName) || isBlank(updated.lastName),
      error: null,
    } as const;
  }

  // Existing app user by email (avoid duplicates) -> attach mapping
  const byEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (byEmail) {
    // If already mapped to another supabase user, do NOT merge
    if (byEmail.supabaseUserId && byEmail.supabaseUserId !== supabaseUserId) {
      return {
        prismaUser: null,
        needsOnboarding: false,
        error:
          "This email is already linked to a different login. Contact an admin.",
      } as const;
    }

    const updated = await prisma.user.update({
      where: { id: byEmail.id },
      data: { supabaseUserId },
    });

    return {
      prismaUser: updated,
      needsOnboarding: isBlank(updated.firstName) || isBlank(updated.lastName),
      error: null,
    } as const;
  }

  // No user exists -> create default APPRENTICE with placeholder names
  const apprenticeRoleId = await getApprenticeRoleId(prisma);

  const created = await prisma.user.create({
    data: {
      supabaseUserId,
      email,
      firstName: "",
      lastName: "",
      roleId: apprenticeRoleId,
      isActive: true,
    },
  });

  return {
    prismaUser: created,
    needsOnboarding: true,
    error: null,
  } as const;
}
