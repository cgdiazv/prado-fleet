import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generateVerificationToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper: validate UUID format
function isValidUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// GET: Retrieve all drivers from Supabase database
export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vehicles: {
          select: { id: true, name: true },
        },
      },
    });

    const formattedDrivers = drivers.map((driver) => ({
      id: driver.id,
      name: driver.name,
      email: driver.email,
      phone: driver.phone || "(555) 000-0000",
      role:
        driver.role === "COMMERCIAL_DRIVER"
          ? "Commercial Driver"
          : driver.role === "FLEET_MANAGER"
          ? "Fleet Manager"
          : driver.role === "LEAD_TECHNICIAN"
          ? "Lead Technician"
          : "Dispatcher",
      assignedVehicle: driver.vehicles[0]?.name || "Unassigned",
      licenseNo: driver.licenseNo || "TX-PENDING",
      cdlExpiration: driver.cdlExpiration || "2028-12-31",
      status: driver.status.toLowerCase(),
      inviteAccepted: driver.inviteAccepted ?? null,
    }));

    return NextResponse.json({ drivers: formattedDrivers });
  } catch (error) {
    console.error("[GET /api/drivers error]:", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

// POST: Create a new driver in Supabase database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, assignedVehicle, licenseNo, cdlExpiration, status } = body;

    if (!name) {
      return NextResponse.json({ error: "Driver name is required." }, { status: 400 });
    }

    let targetEmail = email?.trim().toLowerCase();
    if (!targetEmail) {
      const sanitizedName = name.toLowerCase().replace(/[^a-z0-0]/g, "");
      targetEmail = `${sanitizedName || "driver"}.${Date.now()}@pradofleet.com`;
    }

    // Check if email exists to avoid P2002 duplicate error
    const existingDriver = await prisma.driver.findUnique({
      where: { email: targetEmail },
    });

    if (existingDriver) {
      const [userPart, domainPart] = targetEmail.split("@");
      targetEmail = `${userPart}_${Math.floor(100 + Math.random() * 900)}@${domainPart || "pradofleet.com"}`;
    }

    const driverRole =
      role === "Fleet Manager"
        ? "FLEET_MANAGER"
        : role === "Lead Technician"
        ? "LEAD_TECHNICIAN"
        : role === "Dispatcher"
        ? "DISPATCHER"
        : "COMMERCIAL_DRIVER";

    const dutyStatus =
      status === "on_duty"
        ? "ON_DUTY"
        : status === "on_route"
        ? "ON_ROUTE"
        : "OFF_DUTY";

    const inviteToken = generateVerificationToken();
    const inviteExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create the driver in Supabase
    const newDriver = await prisma.driver.create({
      data: {
        name,
        email: targetEmail,
        phone: phone || "(555) 000-0000",
        role: driverRole,
        licenseNo: licenseNo || `TX-${Math.floor(100000 + Math.random() * 900000)}`,
        cdlExpiration: cdlExpiration || "2028-12-31",
        status: dutyStatus,
        inviteToken,
        inviteExpires,
      },
    });

    // Send invitation email via Resend if configured
    const apiKey = process.env.RESEND_API_KEY;
    const origin = process.env.NEXT_PUBLIC_APP_URL || "https://pradofleet.com";
    const inviteUrl = `${origin}/accept-invite?token=${inviteToken}`;

    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #d97706; margin-top: 0;">Welcome to Prado Fleet, ${name}!</h2>
            <p style="font-size: 14px; color: #475569;">
              You have been registered as a Commercial Driver in Prado Fleet. Please click the link below to set your password and activate your driver account:
            </p>
            <div style="margin: 24px 0;">
              <a href="${inviteUrl}" style="background-color: #fbbf24; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                Set Password & Start Shift
              </a>
            </div>
            <p style="font-size: 12px; color: #94a3b8;">This activation link will expire in 24 hours.</p>
          </div>
        `;

        await resend.emails.send({
          from: "Prado Fleet <notifications@pradocommerce.com>",
          to: [targetEmail],
          subject: "Welcome to Prado Fleet — Set Up Your Driver Password",
          html: emailHtml,
        });
      } catch (emailErr) {
        console.error("[Resend Driver Email Error]:", emailErr);
      }
    } else {
      console.log(`[Resend Driver Email Mock] Driver ${name} (${targetEmail}) Invite URL: ${inviteUrl}`);
    }

    // If a vehicle was assigned, link it in Supabase
    if (assignedVehicle && assignedVehicle !== "Unassigned") {
      const vehicle = await prisma.vehicle.findFirst({
        where: { name: assignedVehicle },
      });

      if (vehicle) {
        await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: { assignedDriverId: newDriver.id },
        });
      }
    }

    return NextResponse.json({ success: true, driver: newDriver, inviteUrl });
  } catch (error: any) {
    console.error("[POST /api/drivers error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create driver record." },
      { status: 500 }
    );
  }
}

// PUT: Update an existing driver in Supabase database
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, phone, role, assignedVehicle, licenseNo, cdlExpiration, status } = body;

    if (!id || !name || !email) {
      return NextResponse.json({ error: "ID, name, and email are required" }, { status: 400 });
    }

    if (!isValidUuid(id)) {
      return NextResponse.json({ error: "Invalid driver ID format" }, { status: 400 });
    }

    const driverRole =
      role === "Fleet Manager"
        ? "FLEET_MANAGER"
        : role === "Lead Technician"
        ? "LEAD_TECHNICIAN"
        : role === "Dispatcher"
        ? "DISPATCHER"
        : "COMMERCIAL_DRIVER";

    const dutyStatus =
      status === "on_duty"
        ? "ON_DUTY"
        : status === "on_route"
        ? "ON_ROUTE"
        : "OFF_DUTY";

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        role: driverRole,
        licenseNo,
        cdlExpiration,
        status: dutyStatus,
      },
    });

    // Update vehicle assignment if provided
    if (assignedVehicle) {
      // Unassign driver's previous vehicle
      await prisma.vehicle.updateMany({
        where: { assignedDriverId: id },
        data: { assignedDriverId: null },
      });

      if (assignedVehicle !== "Unassigned") {
        const vehicle = await prisma.vehicle.findFirst({
          where: { name: assignedVehicle },
        });
        if (vehicle) {
          await prisma.vehicle.update({
            where: { id: vehicle.id },
            data: { assignedDriverId: id },
          });
        }
      }
    }

    return NextResponse.json({ success: true, driver: updatedDriver });
  } catch (error) {
    console.error("[PUT /api/drivers error]:", error);
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 });
  }
}

// DELETE: Delete a driver from Supabase database
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Driver ID is required" }, { status: 400 });
    }

    // If ID is not a valid UUID (e.g. legacy static ID), return success so UI clears it
    if (!isValidUuid(id)) {
      return NextResponse.json({ success: true, deletedId: id });
    }

    // Unlink vehicles before deleting driver
    await prisma.vehicle.updateMany({
      where: { assignedDriverId: id },
      data: { assignedDriverId: null },
    });

    // Delete inspection logs associated with driver
    await prisma.dvirInspection.deleteMany({
      where: { driverId: id },
    });

    await prisma.driver.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("[DELETE /api/drivers error]:", error);
    return NextResponse.json({ error: "Failed to delete driver" }, { status: 500 });
  }
}
