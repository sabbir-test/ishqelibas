import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { isActive } = await request.json()

    const design = await db.blouseDesign.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json({ design })
  } catch (error) {
    console.error("Error toggling blouse design status:", error)
    return NextResponse.json({ error: "Failed to toggle blouse design status" }, { status: 500 })
  }
}