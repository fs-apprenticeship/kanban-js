import { prisma } from "@/src/lib/prisma";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { forbidden } from "@/src/lib/http/errors";

export async function getAuthUser() {
    const  supabase = await createSupabaseServerClient();

    // Validate user via Supabase Auth server
    const { data, error } = await  supabase.auth.getUser();
    if (error || !data.user) throw forbidden("Not authenticated");

    const supabaseUser = data.user;

    // Find user in Prisma DB
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

    if (!user) throw forbidden("User not found in database");
    if (!user.isActive) throw forbidden("User is deactivated");

    return user
}