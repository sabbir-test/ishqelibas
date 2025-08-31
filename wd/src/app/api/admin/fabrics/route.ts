import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const fabrics = await db.fabric.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ fabrics })
  } catch (error) {
    console.error("Error fetching fabrics:", error)
    return NextResponse.json({ error: "Failed to fetch fabrics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, color, image, pricePerMeter, isActive } = await request.json()

    if (!name || !type || !color || pricePerMeter === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const fabric = await db.fabric.create({
      data: {
        name,
        type,
        color,
        image: image || null,
        pricePerMeter,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json({ fabric })
  } catch (error) {
    console.error("Error creating fabric:", error)
    return NextResponse.json({ error: "Failed to create fabric" }, { status: 500 })
  }
}