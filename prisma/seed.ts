import { PrismaClient, Prisma } from "./generated/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const roleData: Prisma.RoleCreateInput[] = [
    { name: "ADMIN", description: "Administrator with full access" },
    { name: "APPRENTICE", description: "User with limited access" },
];

async function main() {
    // --- Roles ---
    console.log("Seeding Roles...");
    for (const role of roleData) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {}, // do nothing if exists
            create: role,
        });
        console.log(`Seeded role: ${role.name}`);
    }
    console.log("Roles seeding completed!");

    // --- Users ---
    console.log("Seeding Users...");
    const users: Prisma.UserCreateInput[] = [
        {
            email: "admin@example.com",
            firstName: "Admin",
            lastName: "User",
            role: { connect: { name: "ADMIN" } },
        },
        {
            email: "apprentice@example.com",
            firstName: "Apprentice",
            lastName: "User",
            role : { connect: { name: "APPRENTICE" } },
        },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
        console.log(`Seeded user: ${user.email}`);
    }
    console.log("Users seeding completed!");

    // --- Statuses ---
    console.log("Seeding Statuses...");
    const statuses: Prisma.StatusCreateInput[] = [
        { name: "TODO", description: "Task not started" },
        { name: "IN_PROGRESS", description: "Task in progress" },
        { name: "DONE", description: "Task completed" },
    ];

    for (const status of statuses) {
        await prisma.status.upsert({
            where: { name: status.name },
            update: {},
            create: status,
        });
        console.log(`Seeded status: ${status.name}`);
    }
    console.log("Status seeding completed!");

    // --- Teams ---
    console.log("Seeding Teams...");
    const teams: Prisma.TeamCreateInput[] = [
        { name: "Alpha Team", description: "First team" },
        { name: "Beta Team", description: "Second team" },
    ];

    for (const team of teams) {
        await prisma.team.upsert({
            where: { name: team.name },
            update: {},
            create: team,
        });
        console.log(`Seeded team: ${team.name}`);
    }
    console.log("Team seeding completed!");

    // --- Projects ---
    console.log("Seeding Projects...");
    const projects: Prisma.ProjectCreateInput[] = [
        { name: "Project A", description: "Alpha project" },
        { name: "Project B", description: "Beta project" },
    ];

    for (const project of projects) {
        await prisma.project.upsert({
            where: { name: project.name },
            update: {},
            create: project,
        });
        console.log(`Seeded project: ${project.name}`);
    }
    console.log("Projects seeding completed!");

    // --- Tasks ---
    console.log("Seeding Tasks...");
    const tasks: Prisma.TaskCreateInput[] = [
        { 
            description: "Initial Task",
            project: { connect: { name: "Project A" }},
            createdBy: { connect: { email: "admin@example.com" } },
            status: { connect: { name: "TODO" }},
        },
    ];

    for (const task of tasks) {
        await prisma.task.create({ data: task })
        console.log(`Seeded task: ${task.description}`);
    }
    console.log("Task seeding completed!");

    // --- Team Memberships & Project Teams ---
    console.log("Seeding Team Memberships...");
    const teamMemberships = [
        { teamName: "Alpha Team", userEmail: "admin@example.com" },
        { teamName: "Beta Team", userEmail: "apprentice@example.com" },
    ];

    for (const membership of teamMemberships) {
        const team = await prisma.team.findUnique({ where: { name: membership.teamName} });
        const user = await prisma.user.findUnique({ where: { email: membership.userEmail } });
        if (team && user) {
            await prisma.teamMember.upsert({
                where: {teamId_userId: { teamId: team.id, userId: user.id} },
                update: {},
                create: { teamId: team.id, userId: user.id },
            });
            console.log(`Seeded Team Membership: ${team.name}-${user.email}`)
        }
    }
    console.log("Task Membership seeding completed!")

    console.log("Seeding Project Teams");
    const projectTeams = [
        { projectName: "Project A", teamName: "Alpha Team" },
        { projectName: "Project B", teamName: "Beta Team" },
    ];

    for (const pt of projectTeams) {
        const project = await prisma.project.findUnique({ where: { name: pt.projectName } });
        const team = await prisma.team.findUnique({ where: { name: pt.teamName } });
        if (project && team) {
            await prisma.projectTeam.upsert({
                where: { projectId_teamId: {projectId: project.id, teamId: team.id } },
                update: {},
                create: { projectId: project.id, teamId: team.id}
            })
            console.log(`Seeded ProjectTeam: ${project.name}-${team.name}`)
        }
    }
    console.log("Project Team seeding completed!")

    console.log("Database seeding complete!")
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });