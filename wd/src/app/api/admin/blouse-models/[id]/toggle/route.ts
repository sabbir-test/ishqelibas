import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      )
    }

    const model = await db.blouseModel.update({
      where: { id: params.id },
      data: { isActive },
      include: {
        frontDesign: {
          include: {
            category: true
          }
        },
        backDesign: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json({ model })
  } catch (error) {
    console.error("Error toggling blouse model status:", error)
    return NextResponse.json(
      { error: "Failed to toggle blouse model status" },
      { status: 500 }
    )
  }
}