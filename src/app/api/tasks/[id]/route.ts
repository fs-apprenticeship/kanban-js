import { route } from "@/src/lib/http/route";
import { badRequest } from "@/src/lib/http/errors";
import { getTaskDetail } from "@/src/features/tasks/getTaskDetail";
import { editTask, EditTaskInput } from "@/src/features/tasks/editTask";
import { deleteTask, DeleteTaskInput } from "@/src/features/tasks/deleteTask";
import { parseMaxPostponedStateSize } from "next/dist/server/config-shared";

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

// PATCH /api/project/[id] - update project
export const PATCH = route<{ params: { id: string } }>(async (req, { params }) => {
  const { id: taskId } = await params;
  if (!taskId) throw badRequest("Task ID is required");

  const body: Partial<Omit<EditTaskInput, "id">> = await req.json();

  const input: EditTaskInput = {id: taskId, ...body };

  const updatedTask = await editTask(input);

  return new Response(JSON.stringify(updatedTask), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

// DELETE /api/task/[id] - delete task
export const DELETE = route<{ params: { id: string } }>(async (req, { params }) => {
  const { id: taskId } = await params;
  if (!taskId) throw badRequest("Task ID is required");

  const input: DeleteTaskInput = { id: taskId };

  const deleted = await deleteTask(input);

  return new Response(JSON.stringify(deleted), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});