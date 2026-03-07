import { route } from "@/src/lib/http/route";
import { badRequest } from "@/src/lib/http/errors";
 import { getTaskDetail } from "@/src/features/tasks/getTaskDetail";

// GET /api/task/[id] - fetch project details
export const GET = route<{ params: { id: string } }>(async (req, { params }) => {
  // params is a Promise, must await
  const { id: taskId } = await params;

  if (!taskId) throw badRequest("Task ID is required");

  const taskDetail = await getTaskDetail(taskId);

  return new Response(JSON.stringify(taskDetail), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});