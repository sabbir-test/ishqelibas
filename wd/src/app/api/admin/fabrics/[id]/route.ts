import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { name, type, color, image, pricePerMeter, isActive } = await request.json()

    const fabric = await db.fabric.update({
      where: { id },
      data: {
        name,
        type,
        color,
        image: image || null,
        pricePerMeter,
        isActive
      }
    })

    return NextResponse.json({ fabric })
  } catch (error) {
    console.error("Error updating fabric:", error)
    return NextResponse.json({ error: "Failed to update fabric" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    await db.fabric.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Fabric deleted successfully" })
  } catch (error) {
    console.error("Error deleting fabric:", error)
    return NextResponse.json({ error: "Failed to delete fabric" }, { status: 500 })
  }
}