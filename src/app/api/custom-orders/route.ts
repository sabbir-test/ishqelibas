import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization')
    let token: string | null = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // If no header, try to get token from cookie
      token = request.cookies.get("auth-token")?.value || null
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Verify the JWT token directly
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = payload.userId

    const customOrders = await db.customOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ customOrders })
  } catch (error) {
    console.error("Error fetching custom orders:", error)
    return NextResponse.json({ error: "Failed to fetch custom orders" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization')
    let token: string | null = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // If no header, try to get token from cookie
      token = request.cookies.get("auth-token")?.value || null
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Verify the JWT token directly
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the custom order belongs to the authenticated user
    const customOrder = await db.customOrder.findFirst({
      where: {
        id: orderId,
        userId: payload.userId
      }
    })

    if (!customOrder) {
      return NextResponse.json({ error: "Custom order not found" }, { status: 404 })
    }

    // Check if the order can be cancelled (only PENDING or CONFIRMED orders can be cancelled)
    if (!['PENDING', 'CONFIRMED'].includes(customOrder.status)) {
      return NextResponse.json({ 
        error: "This order cannot be cancelled. Only pending or confirmed orders can be cancelled." 
      }, { status: 400 })
    }

    // Update the custom order status
    const updatedOrder = await db.customOrder.update({
      where: { id: orderId },
      data: { 
        status: status as any,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ customOrder: updatedOrder })
  } catch (error) {
    console.error("Error updating custom order:", error)
    return NextResponse.json({ error: "Failed to update custom order" }, { status: 500 })
  }
}