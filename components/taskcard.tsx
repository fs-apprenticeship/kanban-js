"use client";

import { Card, CardBody, Chip } from "@heroui/react";

type Status = "active" | "pending" | "complete" | "error";

interface TaskCardProps {
  title: string;
  description: string;
  status: Status;
}

const statusColorMap: Record<Status, "success" | "warning" | "primary" | "danger"> = {
  active: "success",
  pending: "warning",
  complete: "primary",
  error: "danger",
};

export default function TaskCard({
  title,
  description,
  status,
}: TaskCardProps) {
  return (
    <Card className="w-full p-2">
      <CardBody className="flex flex-row items-center justify-between gap-6">

        {/* Left Content */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">
            {description}
          </p>
        </div>

        {/* Status */}
        <Chip color={statusColorMap[status]} variant="flat">
          {status}
        </Chip>

      </CardBody>
    </Card>
  );
}