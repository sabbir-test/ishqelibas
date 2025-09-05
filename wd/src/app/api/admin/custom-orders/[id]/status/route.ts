import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    // Get token from cookie and verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify token and get authenticated user
    const { verifyToken } = await import("@/lib/auth")
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    // Get authenticated user from database
    const authenticatedUser = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true, role: true }
    })

    if (!authenticatedUser || !authenticatedUser.isActive || authenticatedUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { status } = await request.json()
    
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Validate status value
    const validStatuses = ["PENDING", "CONFIRMED", "IN_PRODUCTION", "READY", "DELIVERED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    // Check if order exists
    const existingOrder = await db.customOrder.findUnique({
      where: { id }
    })
    
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = await db.customOrder.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error updating custom order status:", error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    
    return NextResponse.json({ 
      error: "Failed to update custom order status",
      details: error.message 
    }, { status: 500 })
  }
}