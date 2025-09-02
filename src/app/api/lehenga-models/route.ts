import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const models = await db.lehengaModel.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ models })
  } catch (error) {
    console.error("Error fetching lehenga models:", error)
    return NextResponse.json({ error: "Failed to fetch lehenga models" }, { status: 500 })
  }
}