import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) {
    return null
  }

  try {
    const { verifyToken } = await import("@/lib/auth")
    const payload = verifyToken(token)
    if (!payload) return null

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isActive: true }
    })

    if (!user || user.role !== "ADMIN" || !user.isActive) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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