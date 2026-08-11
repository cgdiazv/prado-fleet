import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Retrieve all assets/tools from Supabase
export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        assignedVehicle: {
          select: { id: true, name: true },
        },
      },
    });

    const formattedAssets = assets.map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      serialNumber: a.serialNumber || "N/A",
      assignedVehicleId: a.assignedVehicleId,
      assignedTo: a.assignedVehicle?.name || "Unassigned",
      jobLocation: a.jobLocation || "Depot Yard B",
    }));

    return NextResponse.json({ assets: formattedAssets });
  } catch (error) {
    console.error("[GET /api/assets error]:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

// POST: Create a new asset/tool in Supabase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, serialNumber, assignedVehicleId, jobLocation } = body;

    if (!name || !category) {
      return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
    }

    const newAsset = await prisma.asset.create({
      data: {
        name,
        category,
        serialNumber: serialNumber || `SN-${Date.now().toString().slice(-6)}`,
        assignedVehicleId: assignedVehicleId || null,
        jobLocation: jobLocation || "Depot Yard B",
      },
    });

    return NextResponse.json({ success: true, asset: newAsset });
  } catch (error) {
    console.error("[POST /api/assets error]:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}

// PUT: Update an existing asset/tool in Supabase
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, category, serialNumber, assignedVehicleId, jobLocation } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        name,
        category,
        serialNumber,
        assignedVehicleId: assignedVehicleId || null,
        jobLocation,
      },
    });

    return NextResponse.json({ success: true, asset: updatedAsset });
  } catch (error) {
    console.error("[PUT /api/assets error]:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}

// DELETE: Delete an asset/tool from Supabase
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }

    await prisma.asset.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("[DELETE /api/assets error]:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
