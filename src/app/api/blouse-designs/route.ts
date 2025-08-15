import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const includeVariants = searchParams.get("includeVariants") === "true"

    const where = { isActive: true }
    if (type && (type === "FRONT" || type === "BACK")) {
      Object.assign(where, { type })
    }

    const designs = await db.blouseDesign.findMany({
      where,
      include: {
        category: true,
        variants: includeVariants ? {
          where: { isActive: true },
          orderBy: { name: "asc" }
        } : false
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json({ designs })
  } catch (error) {
    console.error("Error fetching blouse designs:", error)
    return NextResponse.json({ error: "Failed to fetch blouse designs" }, { status: 500 })
  }
}