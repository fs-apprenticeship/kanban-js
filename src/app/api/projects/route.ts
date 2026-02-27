import { route } from "@/src/lib/http/route";
import { badRequest } from "@/src/lib/http/errors";
import { getProjects } from "@/src/features/projects/getProjects";

export const GET = route(async () => {
    try {
        const projects = await getProjects();
        return new Response(JSON.stringify(projects), { status: 200 });
    } catch (err) {
        console.error(err)
        throw badRequest("Failed to fetch projects");
    }
})
