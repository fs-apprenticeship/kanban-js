import CardGrid from "@/components/taskgrid";
import projectData from "@/data/mockproject.json";
import AssigneeAvatars from "@/components/assigneeavatars";

type Status = "active" | "pending" | "complete" | "error";

type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
};

type ProjectData = {
  project: {
    title: string;
    description: string;
    assignees: string[];
  };
  tasks: Task[];
};

export default function ProjectPage() {
  const { project, tasks } = projectData as ProjectData;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <p className="text-gray-500">{project.description}</p>

        <AssigneeAvatars assignees={project.assignees} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
        <CardGrid cards={tasks} />
      </div>
    </div>
  );
}