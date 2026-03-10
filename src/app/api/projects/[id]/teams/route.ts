import { route } from "@/src/lib/http/route";
import { HttpError } from "@/src/lib/http/errors";
import { assignTeamsToProject } from "@/src/features/projects/assignTeamsToProject";

export const PATCH = route<{ params: { id: string } }>(async ( req, { params }) => {
    const { id: projectId } = await params;

    const body: { teamIds: string[] } = await req.json();

    const updatedProject = await assignTeamsToProject({
        projectId,
        teamIds: body.teamIds,
    });

    return new Response(JSON.stringify(updatedProject), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
});