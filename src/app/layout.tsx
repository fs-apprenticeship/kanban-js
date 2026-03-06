import "./globals.css";
import { ReactNode } from "react";
import TopBar from "@/components/topbar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen bg-gray-50">
        <div className="flex flex-col h-screen">

          {/* Top Navigation */}
          <TopBar />

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto w-full h-full">
              {children}
            </div>
          </main>

        </div>
      </body>
    </html>
  );
}