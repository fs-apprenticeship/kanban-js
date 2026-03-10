import { route } from "@/src/lib/http/route";
import { editTaskAssignees } from "@/src/features/tasks/editTaskAssignees";

// PATCH /api/tasks/[id]/assignees
export const PATCH = route<{ params: { id: string } }>(async (req, { params }) => {
    const { id: taskId } = await params;

    const body = await req.json();

    const updatedTask = await editTaskAssignees({
        taskId,
        userIds: body.userIds,
    });

    return new Response(JSON.stringify(updatedTask), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
});