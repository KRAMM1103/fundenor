import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Crear usuario normal
  const userPassword = await bcrypt.hash("KRAMM1103", 10);
  await prisma.user.create({
    data: {
      name: "Kevin Macz",
      email: "kramaczmata@gmail.com",
      password: userPassword,
      role: "user",
    },
  });

  // Crear usuario admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      name: "Admin Fundenor",
      email: "admin@fundenor.org",
      password: adminPassword,
      role: "admin",
    },
  });

  console.log("Usuarios insertados correctamente ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
