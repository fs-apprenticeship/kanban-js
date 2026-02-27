import type { PrismaClient } from "@prisma/client";
import { getAuthSession } from "./get-auth-session";

export async function getAuthContext(prisma: PrismaClient) {
  const { session, supabaseUser, error } = await getAuthSession();

  if (error) return { session: null, supabaseUser: null, user: null, error } as const;

  if (!session || !supabaseUser) {
    return { session: null, supabaseUser: null, user: null, error: null } as const;
  }

  // supabaseUserId is optional in schema, but for authenticated users we always have one.
  const user = await prisma.user.findUnique({
    where: { supabaseUserId: supabaseUser.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      supabaseUserId: true,
      role: { select: { name: true } },
    },
  });

  return { session, supabaseUser, user, error: null } as const;
}
