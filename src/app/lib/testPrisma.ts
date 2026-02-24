import prisma from "./prisma.ts";

async function main() {
  const roles = await prisma.role.findMany();
  console.log(roles);
}

main();