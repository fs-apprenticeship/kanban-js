import { route } from "@/src/lib/http/route";
import { badRequest } from "@/src/lib/http/errors";
import { getProjectDetail } from "@/src/features/projects/getProjectDetail";

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
