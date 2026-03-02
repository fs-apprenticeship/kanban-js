import { Team } from "./types/types";
import { prisma } from "@/src/lib/prisma";

export async function getTeams(): Promise<Team[]> {
    const teams = await prisma.team.findMany({
        orderBy: { id: "desc" },
    });

    return teams.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
    }));
}