import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      fabric,
      fabricColor,
      frontDesign,
      backDesign,
      measurements,
      price,
      notes,
      appointmentDate
    } = await request.json()

    if (!userId || !fabric || !measurements) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create custom order
    const customOrder = await db.customOrder.create({
      data: {
        userId,
        fabric,
        fabricColor,
        frontDesign,
        backDesign,
        oldMeasurements: JSON.stringify(measurements),
        price,
        notes,
        appointmentDate: appointmentDate ? new Date(appointmentDate) : null
      }
    })

    return NextResponse.json({ customOrder })
  } catch (error) {
    console.error("Error creating custom order:", error)
    return NextResponse.json({ error: "Failed to create custom order" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const customOrders = await db.customOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ customOrders })
  } catch (error) {
    console.error("Error fetching custom orders:", error)
    return NextResponse.json({ error: "Failed to fetch custom orders" }, { status: 500 })
  }
}