import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const fabrics = await db.fabric.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        pricePerMeter: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json({ fabrics })
  } catch (error) {
    console.error("Error fetching fabrics:", error)
    return NextResponse.json({ error: "Failed to fetch fabrics" }, { status: 500 })
  }
}