"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Badge, Spinner } from "@heroui/react";

export default function ProjectsList() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProjects() {
            try {
                const res = await fetch("/api/projects");
                const data = await res.json();
                setProjects(data);
            } catch (err) {
                console.error("Failed to load projects:", err);
            } finally {
                setLoading(false);
            }
        }
        loadProjects();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen p-6">
                <Card className="max-w-md w-full flex flex-col items-center p-6 gap-4">
                    <Spinner size="lg" />
                        <CardHeader className="text-lg font-semibold">Loading Projects...</CardHeader>
                        <CardBody>
                            <p className="text-center text-sm text-gray-500">
                                Please wait while we fetch your projects.
                            </p>
                        </CardBody>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6">
            {projects.length === 0 ? (
                <p>No projects found.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {projects.map((project: any) => (
                        <Card
                            key={project.id}
                            className="p-4 border border-gray-300 rounded-lg hover:shadow-md transition-shadow"
                        >
                            <CardHeader className="font-semibold">{project.name}</CardHeader>
                            <CardBody className="flex flex-col gap-2">
                                {project.description && (
                                    <p className="text-sm text-gray-600">
                                        {project.description.length > 100
                                            ? project.description.slice(0, 100) + "..."
                                            : project.description
                                        }
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {Object.entries(project.taskStats).length === 0 ? (
                                        <p className="text-sm text-gray-500">No tasks yet</p>
                                    ) : (
                                        Object.entries(project.taskStats).map(([status, count]) => (
                                            <Badge key={status} color="default">
                                                {status}: {count as number}
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}