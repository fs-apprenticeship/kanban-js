import { PrismaClient, Prisma } from "../app/generated/prisma/index.js";
import "dotenv/config";

const prisma = new PrismaClient();

const roleData: Prisma.RoleCreateInput[] = [
  { name: "ADMIN", description: "Administrator with full access" },
  { name: "APPRENTICE", description: "User with limited access" },
];

async function main() {
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });