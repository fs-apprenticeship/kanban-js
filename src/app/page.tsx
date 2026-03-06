"use client";

import ProjectsList from "./components/ProjectsList";

//placeholder for TeamsList
function TeamsPlaceholder() {
  return (
    <div className="h-full border border-gray-300 rounded-lg p-4 flex items-center justify-center text-gray-500">
      Teams will appear here
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex h-screen w-screen gap-6 p-6">
        
      {/* Teams column (30%) */}
      <div className="w-1/3 h-full flex flex-col">
        <h2 className="text-xl font-bold mb-4">Teams</h2>
        <div className="flex-1">
          <TeamsPlaceholder />
        </div>
      </div>

      {/* Projects column (70%) */}
      <div className="w-2/3 h-full flex flex-col">
        <h2 className="text-xl font-bold mb-4">Projects</h2>
        <div className="flex-1 border border-gray-300 rounded-lg p-4">
          <ProjectsList />
        </div>
      </div>

    </div>
  )
}