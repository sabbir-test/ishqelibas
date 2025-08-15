import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const fabrics = await db.fabric.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    })

    return NextResponse.json({ fabrics })
  } catch (error) {
    console.error("Error fetching fabrics:", error)
    return NextResponse.json({ error: "Failed to fetch fabrics" }, { status: 500 })
  }
}