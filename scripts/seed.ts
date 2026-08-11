import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Ensuring database is clean of demo seed data...");

  await prisma.dvirInspection.deleteMany({});
  await prisma.maintenanceOrder.deleteMany({});
  await prisma.fuelLog.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.driver.deleteMany({});

  console.log("Database clean!");
}

main()
  .catch((e) => {
    console.error("Error cleaning database:", e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
