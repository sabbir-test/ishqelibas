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

    const { isActive } = await request.json()

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Invalid isActive value" }, { status: 400 })
    }

    // Check if model exists
    const existingModel = await db.salwarKameezModel.findUnique({
      where: { id: params.id }
    })

    if (!existingModel) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    const model = await db.salwarKameezModel.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json({ model })
  } catch (error) {
    console.error("Error toggling salwar kameez model status:", error)
    return NextResponse.json({ error: "Failed to toggle model status" }, { status: 500 })
  }
}