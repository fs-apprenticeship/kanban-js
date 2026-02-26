import { route } from "@/src/lib/http/route";
import { badRequest } from "@/src/lib/http/errors";
 import { getProjectDetail } from "@/src/features/projects/getProjectDetail";
import { editProject, EditProjectInput } from "@/src/features/projects/editProject";

// GET /api/project/[id] - fetch project details
export const GET = route<{ params: { id: string } }>(async (req, { params }) => {
  // params is a Promise, must await
  const { id: projectId } = await params;

  if (!projectId) throw badRequest("Project ID is required");

  const projectDetail = await getProjectDetail(projectId);

  return new Response(JSON.stringify(projectDetail), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

// PATCH /api/project/[id] - update project
export const PATCH = route<{ params: { id: string } }>(async (req, { params }) => {
  const { id: projectId } = await params;
  if (!projectId) throw badRequest("Project ID is required");

  const body: Partial<Omit<EditProjectInput, "id">> = await req.json();

  const input: EditProjectInput = {id: projectId, ...body };

  const updatedProject = await editProject(input);

  return new Response(JSON.stringify(updatedProject), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
