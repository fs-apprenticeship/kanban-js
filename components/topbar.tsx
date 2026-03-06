"use client";

import { Button, Avatar } from "@heroui/react";

export default function TopBar() {
  const handleLogout = () => {
    console.log("logout clicked");
  };

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-end px-6 py-3 gap-4">

        <Avatar
          name="User"
          size="sm"
          className="cursor-pointer"
        />

        <Button
          color="danger"
          variant="flat"
          size="sm"
          onPress={handleLogout}
        >
          Logout
        </Button>

      </div>
    </header>
  );
}