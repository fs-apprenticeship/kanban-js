"use client";

import { useState } from "react";
import TaskCard from "./taskcard";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/react";

type Status = "active" | "pending" | "complete" | "error";

interface CardItem {
  id: string;
  title: string;
  description: string;
  status: Status;
}

interface CardGridProps {
  cards: CardItem[];
}

export default function CardGrid({ cards }: CardGridProps) {
  const [filter, setFilter] = useState<Status | "all">("all");

  const filteredCards =
    filter === "all"
      ? cards
      : cards.filter((card) => card.status === filter);

  return (
    <div className="space-y-4">

      {/* Filter Bar */}
      <div className="flex justify-end">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="flat" size="sm">
              Filter: {filter}
            </Button>
          </DropdownTrigger>

          <DropdownMenu
            aria-label="Filter Cards"
            onAction={(key) => setFilter(key as Status | "all")}
          >
            <DropdownItem key="all">All</DropdownItem>
            <DropdownItem key="active">Active</DropdownItem>
            <DropdownItem key="pending">Pending</DropdownItem>
            <DropdownItem key="complete">Complete</DropdownItem>
            <DropdownItem key="error">Error</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Card Grid */}
      <div
        className="
          grid
          gap-4
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {filteredCards.map((card) => (
          <TaskCard
            key={card.id}
            title={card.title}
            description={card.description}
            status={card.status}
          />
        ))}
      </div>
    </div>
  );
}