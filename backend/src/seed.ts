import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./prisma/db.js";

async function main() {
  const people = [
    { name: "Ангеліна", role: "MANAGER" },
    { name: "Михайло", role: "MASTER" },
    { name: "Ольга", role: "MASTER" },
    { name: "Роман", role: "MASTER" },
    { name: "Гість", role: "GUEST" },
  ];
  const passwordHash = await bcrypt.hash("admin", 10);
  for (const p of people) {
    await db.orm.public.User.create({ ...p, passwordHash });
  }
  console.log("Users:", await db.orm.public.User.all());
  await db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
