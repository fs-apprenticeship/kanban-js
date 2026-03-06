"use client";

import { useState } from "react";
import {
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "@heroui/react";

interface AssigneeAvatarsProps {
  assignees: string[];
}

export default function AssigneeAvatars({ assignees }: AssigneeAvatarsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Avatar Stack */}
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        {assignees.slice(0, 5).map((name, index) => (
          <Avatar
            key={name}
            name={name}
            size="sm"
            className={`border-2 border-white -ml-2 ${index === 0 ? "ml-0" : ""}`}
          />
        ))}

        {assignees.length > 5 && (
          <div className="-ml-2 text-xs bg-gray-200 rounded-full px-2 py-1 border border-white">
            +{assignees.length - 5}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Project Assignees</ModalHeader>

              <ModalBody>
                <div className="space-y-3">
                  {assignees.map((name) => (
                    <div
                      key={name}
                      className="flex items-center gap-3"
                    >
                      <Avatar name={name} size="sm" />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}