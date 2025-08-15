import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const orders = await db.customOrder.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching custom orders:", error)
    return NextResponse.json({ error: "Failed to fetch custom orders" }, { status: 500 })
  }
}