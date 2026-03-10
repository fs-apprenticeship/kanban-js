import { route } from "@/src/lib/http/route";
import { getProjects } from "@/src/features/projects/getProjects";
import { createProject } from "@/src/features/projects/createProject";

export const GET = route(async () => {
    const projects = await getProjects();
    return new Response(JSON.stringify(projects), { status: 200 });
})

export const POST = route(async (req: Request) => {
    const body = await req.json()
    const project = await createProject(body);
    return new Response(JSON.stringify({ project }), { status: 201 })
})
