import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { isActive } = await request.json()

    const fabric = await db.fabric.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json({ fabric })
  } catch (error) {
    console.error("Error toggling fabric status:", error)
    return NextResponse.json({ error: "Failed to toggle fabric status" }, { status: 500 })
  }
}