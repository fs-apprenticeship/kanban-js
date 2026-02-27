import type { PrismaClient } from "@prisma/client";
import { forbidden } from "@/src/lib/http/errors";

export async function getDefaultApprenticeRoleId(prisma: PrismaClient) {
  const role = await prisma.role.findUnique({
    where: { name: "APPRENTICE" },
    select: { id: true },
  });
  if (!role) throw new Error('Role "APPRENTICE" not found. Seed roles first.');
  return role.id;
}

export async function createPrismaUserForSupabaseUser(
  prisma: PrismaClient,
  input: {
    supabaseUserId: string;
    email: string;
    firstName: string;
    lastName: string;
  }
) {
  const roleId = await getDefaultApprenticeRoleId(prisma);

  // TODO: If the email already exists in Prisma, we might want to handle it.
  // Here we assume signup should be unique.
  return prisma.user.create({
    data: {
      supabaseUserId: input.supabaseUserId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      roleId,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      supabaseUserId: true,
      isActive: true,
      role: { select: { name: true } },
    },
  });
}

export async function findPrismaUserBySupabaseId(prisma: PrismaClient, supabaseUserId: string) {
  const user = await prisma.user.findUnique({
    where: { supabaseUserId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      supabaseUserId: true,
      isActive: true,
      role: { select: { name: true } },
    },
  });

  if (!user) return null;
  if (!user.isActive) throw forbidden("User is deactivated");
  return user;
}