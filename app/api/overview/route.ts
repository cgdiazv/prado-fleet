import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [vehicles, drivers, dvirs, workOrders, fuelLogs] = await Promise.all([
      prisma.vehicle.findMany({ include: { assignedDriver: true } }),
      prisma.driver.findMany(),
      prisma.dvirInspection.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.maintenanceOrder.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.fuelLog.findMany(),
    ]);

    // 1. Fleet Vehicle Statuses
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) => v.status === "ACTIVE").length;
    const inShopVehicles = vehicles.filter((v) => v.status === "MAINTENANCE").length;

    // 2. Pending DVIR & Maintenance Alerts
    const pendingDvirs = dvirs.filter((d) => d.status === "DEFECTS_FOUND");
    const openWorkOrders = workOrders.filter((w) => w.status === "OPEN" || w.status === "IN_PROGRESS");
    const totalAlertCount = pendingDvirs.length + openWorkOrders.length;

    // 3. Dynamic Safety Score Calculation
    const totalInspections = dvirs.length;
    const passedInspections = dvirs.filter((d) => d.status === "PASSED").length;
    const computedSafetyScore =
      totalInspections > 0 ? Math.round((passedInspections / totalInspections) * 100) : 100;

    // 4. Operating Expenses & Cost Per Mile
    const totalFuelSpend = fuelLogs.reduce((acc, f) => acc + f.totalCost, 0);
    const totalMaintenanceSpend = workOrders.reduce((acc, w) => acc + (w.cost || 0), 0);
    const totalGallons = fuelLogs.reduce((acc, f) => acc + f.gallons, 0);

    const totalOperationalCost = totalFuelSpend + totalMaintenanceSpend;
    const estimatedMiles = totalGallons * 6.5; // ~6.5 MPG fleet average
    const costPerMileNumber = estimatedMiles > 0 ? totalOperationalCost / estimatedMiles : 0;
    const formattedCostPerMile = `$${costPerMileNumber.toFixed(2)}`;

    // 5. Active Telematics Banner Alert
    const topFlaggedInspection = pendingDvirs[0];
    const topWorkOrder = openWorkOrders[0];

    const bannerAlert = topFlaggedInspection
      ? {
          title: `Defect Flagged on Vehicle ${topFlaggedInspection.vehicleId}`,
          description: `Reported by driver ${topFlaggedInspection.driverName}: ${
            topFlaggedInspection.defects.join(", ") || "Safety checklist defect"
          }`,
        }
      : topWorkOrder
      ? {
          title: `Maintenance Ticket: ${topWorkOrder.title}`,
          description: topWorkOrder.description || `Service ticket assigned to vehicle ${topWorkOrder.vehicleId}`,
        }
      : null;

    const criticalMessage = topFlaggedInspection
      ? `1 critical defect on ${topFlaggedInspection.vehicleId}`
      : topWorkOrder
      ? `Service ticket: ${topWorkOrder.title}`
      : "All fleet checks passed";

    return NextResponse.json({
      activeFleet: {
        active: activeVehicles,
        total: totalVehicles,
        inShop: inShopVehicles,
      },
      alerts: {
        count: totalAlertCount,
        criticalMessage,
      },
      safetyScore: {
        score: computedSafetyScore,
        comparison: totalInspections > 0 ? `${totalInspections} total inspections recorded` : "100% compliant",
      },
      costPerMile: formattedCostPerMile,
      onDutyDrivers: drivers.filter((d) => d.status === "ON_DUTY" || d.status === "ON_ROUTE").length,
      bannerAlert,
    });
  } catch (error) {
    console.error("[GET /api/overview error]:", error);
    return NextResponse.json({ error: "Failed to fetch overview metrics" }, { status: 500 });
  }
}
