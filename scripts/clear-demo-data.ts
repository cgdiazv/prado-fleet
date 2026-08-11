import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Clearing all seeded demo data from Supabase database...");

  // 1. Delete dependent child records
  const dvirsDeleted = await prisma.dvirInspection.deleteMany({});
  console.log(`Deleted ${dvirsDeleted.count} DVIR inspections.`);

  const workOrdersDeleted = await prisma.maintenanceOrder.deleteMany({});
  console.log(`Deleted ${workOrdersDeleted.count} maintenance work orders.`);

  const fuelLogsDeleted = await prisma.fuelLog.deleteMany({});
  console.log(`Deleted ${fuelLogsDeleted.count} fuel logs.`);

  const assetsDeleted = await prisma.asset.deleteMany({});
  console.log(`Deleted ${assetsDeleted.count} equipment assets.`);

  // 2. Delete vehicles and drivers
  const vehiclesDeleted = await prisma.vehicle.deleteMany({});
  console.log(`Deleted ${vehiclesDeleted.count} vehicles.`);

  const driversDeleted = await prisma.driver.deleteMany({});
  console.log(`Deleted ${driversDeleted.count} drivers.`);

  // 3. Delete demo seed user accounts
  const seedEmails = [
    "arivera@pradofleet.com",
    "cmendoza@pradofleet.com",
    "dkim@pradofleet.com",
  ];
  const demoUsersDeleted = await prisma.user.deleteMany({
    where: {
      email: { in: seedEmails },
    },
  });
  console.log(`Deleted ${demoUsersDeleted.count} demo seed user accounts.`);

  console.log("Database cleared of all seeded demo data successfully!");
}

main()
  .catch((e) => {
    console.error("Error clearing database:", e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
