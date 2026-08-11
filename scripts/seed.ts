import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding database with initial Prado Fleet data...");

  // Seed Drivers
  const driver1 = await prisma.driver.upsert({
    where: { email: "arivera@pradofleet.com" },
    update: {},
    create: {
      name: "Alex Rivera",
      email: "arivera@pradofleet.com",
      phone: "(555) 234-5678",
      role: "COMMERCIAL_DRIVER",
      licenseNo: "TX-9482019",
      cdlExpiration: "2028-06-15",
      status: "ON_DUTY",
    },
  });

  const driver2 = await prisma.driver.upsert({
    where: { email: "cmendoza@pradofleet.com" },
    update: {},
    create: {
      name: "Carlos Mendoza",
      email: "cmendoza@pradofleet.com",
      phone: "(555) 876-5432",
      role: "COMMERCIAL_DRIVER",
      licenseNo: "TX-4819203",
      cdlExpiration: "2027-11-20",
      status: "ON_ROUTE",
    },
  });

  const driver3 = await prisma.driver.upsert({
    where: { email: "dkim@pradofleet.com" },
    update: {},
    create: {
      name: "David Kim",
      email: "dkim@pradofleet.com",
      phone: "(555) 345-6789",
      role: "COMMERCIAL_DRIVER",
      licenseNo: "TX-7391024",
      cdlExpiration: "2026-12-05",
      status: "OFF_DUTY",
    },
  });

  // Seed Vehicles
  const vehicle1 = await prisma.vehicle.upsert({
    where: { vin: "1FTFW1E50MK104001" },
    update: {},
    create: {
      name: "Truck 01 (Ford F-150)",
      vin: "1FTFW1E50MK104001",
      make: "Ford",
      model: "F-150",
      year: 2023,
      licensePlate: "TX-FLT01",
      status: "ACTIVE",
      telematicsStatus: "MOVING",
      currentSpeed: 42,
      destination: "Site #104 - Oak Ridge",
      lat: 32.7941,
      lng: -96.8185,
      assignedDriverId: driver1.id,
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { vin: "1FT8W2BT5MED04004" },
    update: {},
    create: {
      name: "Truck 04 (Ford F-250)",
      vin: "1FT8W2BT5MED04004",
      make: "Ford",
      model: "F-250",
      year: 2022,
      licensePlate: "TX-FLT04",
      status: "ACTIVE",
      telematicsStatus: "ALERT",
      currentSpeed: 0,
      destination: "Site #88 - Metro Center",
      lat: 32.7683,
      lng: -96.7967,
      assignedDriverId: driver2.id,
    },
  });

  const vehicle3 = await prisma.vehicle.upsert({
    where: { vin: "3D3WR3CL8LG09009" },
    update: {},
    create: {
      name: "Truck 09 (Ram 3500)",
      vin: "3D3WR3CL8LG09009",
      make: "Ram",
      model: "3500",
      year: 2024,
      licensePlate: "TX-FLT09",
      status: "ACTIVE",
      telematicsStatus: "IDLE",
      currentSpeed: 0,
      destination: "Warehouse Depot B",
      lat: 32.7422,
      lng: -96.8309,
      assignedDriverId: driver3.id,
    },
  });

  // Seed DVIR Inspections
  await prisma.dvirInspection.deleteMany({});

  await prisma.dvirInspection.create({
    data: {
      inspectionType: "PRE_TRIP",
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      driverName: driver1.name,
      odometer: 48210,
      passed: true,
      status: "PASSED",
      defects: [],
      notes: "Pre-trip inspection passed. All systems green.",
      signature: driver1.name,
    },
  });

  await prisma.dvirInspection.create({
    data: {
      inspectionType: "PRE_TRIP",
      vehicleId: vehicle2.id,
      driverId: driver2.id,
      driverName: driver2.name,
      odometer: 62450,
      passed: false,
      status: "DEFECTS_FOUND",
      defects: ["Brakes & Hoses (Front brake pad wear > 80%)"],
      notes: "Front brakes grinding during initial stop test.",
      signature: driver2.name,
    },
  });

  await prisma.dvirInspection.create({
    data: {
      inspectionType: "POST_TRIP",
      vehicleId: vehicle3.id,
      driverId: driver3.id,
      driverName: driver3.name,
      odometer: 31890,
      passed: true,
      status: "PASSED",
      defects: [],
      notes: "Post-trip return inspection complete.",
      signature: driver3.name,
    },
  });

  // Seed Maintenance Order
  await prisma.maintenanceOrder.create({
    data: {
      vehicleId: vehicle2.id,
      title: "Brake Pad Diagnostics & Replacement",
      description: "Telematics flagged front brake wear above 80%. Automated work order issued.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      assignedTo: "Lead Technician Dave",
      cost: 450.0,
    },
  });

  // Seed Fuel Logs
  await prisma.fuelLog.deleteMany({});
  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle1.id,
      driverName: driver1.name,
      gallons: 24.5,
      totalCost: 85.75,
      odometer: 48210,
    },
  });

  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle2.id,
      driverName: driver2.name,
      gallons: 18.2,
      totalCost: 63.70,
      odometer: 62450,
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
