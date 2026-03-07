import { route } from "@/src/lib/http/route";
import { getTasks } from "@/src/features/tasks/getTasks";
import { createTask } from "@/src/features/tasks/createTask";

export const GET = route(async () => {
    const tasks = await getTasks();
    return new Response(JSON.stringify(tasks), { status: 200 });
})

export const POST = route(async (req: Request) => {
    const body = await req.json()
    const task = await createTask(body);
    return new Response(JSON.stringify({ task }), { status: 201 })
})