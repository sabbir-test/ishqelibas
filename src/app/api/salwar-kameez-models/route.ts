import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    // Fetch only active salwar kameez models for public access
    const models = await db.salwarKameezModel.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    })

    const total = await db.salwarKameezModel.count({
      where: { isActive: true }
    })

    return NextResponse.json({ 
      models,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching salwar kameez models:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}