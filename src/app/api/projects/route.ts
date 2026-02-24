import { NextRequest, NextResponse } from "next/server";
import { getProjects } from "@/app/(features)/projects/projects";

export async function GET(req: NextRequest) {
    try {
        const projects = await getProjects();
        return NextResponse.json(projects, { status: 200 });
    } catch (error) {
        console.error("Error fetching projects", error);
        return NextResponse.json({ error: "Failed to fetch projects "}, { status: 500 });
    }
}