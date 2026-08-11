import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const ads = await prisma.advertisement.findMany({
      orderBy: [{ isExclusive: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("Fetch ads error:", error);
    return NextResponse.json({ error: "Failed to fetch advertisements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { name, imageUrl, targetUrl, placement, format, isExclusive, displayOrder, isActive } = body;

    if (!name || !imageUrl || !targetUrl) {
      return NextResponse.json({ error: "Name, Image URL, and Target URL are required" }, { status: 400 });
    }

    if (isExclusive) {
      await prisma.advertisement.updateMany({
        data: { isExclusive: false },
      });
    }

    const ad = await prisma.advertisement.create({
      data: {
        name,
        imageUrl,
        targetUrl,
        placement: placement || "BOTH",
        format: format || "FULL_WIDTH",
        isExclusive: Boolean(isExclusive),
        displayOrder: isExclusive ? 1 : (Number(displayOrder) || 1),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ message: "Advertisement created successfully", ad });
  } catch (error) {
    console.error("Create ad error:", error);
    return NextResponse.json({ error: "Failed to create advertisement" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, imageUrl, targetUrl, placement, format, isExclusive, displayOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Ad ID is required" }, { status: 400 });
    }

    if (isExclusive) {
      await prisma.advertisement.updateMany({
        where: { id: { not: id } },
        data: { isExclusive: false },
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl;
    if (placement !== undefined) updateData.placement = placement;
    if (format !== undefined) updateData.format = format;
    if (isExclusive !== undefined) {
      updateData.isExclusive = Boolean(isExclusive);
      if (isExclusive) {
        updateData.isActive = true;
        updateData.displayOrder = 1;
      }
    }
    if (displayOrder !== undefined && !isExclusive) updateData.displayOrder = Number(displayOrder);
    if (isActive !== undefined && !isExclusive) updateData.isActive = Boolean(isActive);

    const ad = await prisma.advertisement.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: "Advertisement updated successfully", ad });
  } catch (error) {
    console.error("Update ad error:", error);
    return NextResponse.json({ error: "Failed to update advertisement" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Ad ID is required" }, { status: 400 });
    }

    await prisma.advertisement.delete({ where: { id } });

    return NextResponse.json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Delete ad error:", error);
    return NextResponse.json({ error: "Failed to delete advertisement" }, { status: 500 });
  }
}
