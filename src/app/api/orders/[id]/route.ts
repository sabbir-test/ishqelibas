import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { validateOrder } from "@/lib/order-validation"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

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
      select: { id: true, isActive: true }
    })

    if (!authenticatedUser || !authenticatedUser.isActive) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
    }

    // Fetch the order with all related data - only for authenticated user
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        userId: authenticatedUser.id // Ensure the order belongs to the authenticated user
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                sku: true
              }
            }
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Validate that this is not a dummy/demo order
    const validation = validateOrder(order)
    if (!validation.isValid) {
      console.log(`Blocked access to invalid order ${order.orderNumber}: ${validation.issues.join(', ')}`)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Add cache-busting headers
    const response = NextResponse.json({ order })
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
