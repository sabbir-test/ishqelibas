import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { status } = await request.json()

    const order = await db.customOrder.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error updating custom order status:", error)
    return NextResponse.json({ error: "Failed to update custom order status" }, { status: 500 })
  }
}