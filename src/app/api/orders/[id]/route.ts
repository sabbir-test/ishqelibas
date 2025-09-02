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

    // Fetch custom order details and blouse model information for custom designs
    const enhancedOrderItems = await Promise.all(
      order.orderItems.map(async (item) => {
        let customDesign = null
        let blouseModel = null
        
        // If this is a custom blouse order, fetch the custom design details
        if (item.productId === 'custom-blouse') {
          const customOrder = await db.customOrder.findFirst({
            where: { userId: authenticatedUser.id },
            orderBy: { createdAt: 'desc' }
          })
          
          if (customOrder) {
            customDesign = {
              fabric: customOrder.fabric,
              fabricColor: customOrder.fabricColor,
              frontDesign: customOrder.frontDesign,
              backDesign: customOrder.backDesign,
              measurements: customOrder.oldMeasurements,
              appointmentDate: customOrder.appointmentDate,
              appointmentType: customOrder.appointmentType,
              notes: customOrder.notes
            }
            
            // Try to find matching blouse model based on design names
            if (customOrder.frontDesign || customOrder.backDesign) {
              blouseModel = await db.blouseModel.findFirst({
                where: {
                  OR: [
                    { name: { contains: customOrder.frontDesign } },
                    { designName: { contains: customOrder.frontDesign } },
                    { name: { contains: customOrder.backDesign } },
                    { designName: { contains: customOrder.backDesign } }
                  ],
                  isActive: true
                }
              })
            }
          }
        }
        
        return {
          ...item,
          customDesign,
          blouseModel
        }
      })
    )

    // Validate that this is not a dummy/demo order
    const validation = validateOrder(order)
    if (!validation.isValid) {
      console.log(`Blocked access to invalid order ${order.orderNumber}: ${validation.issues.join(', ')}`)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Return enhanced order with blouse model information
    const enhancedOrder = {
      ...order,
      orderItems: enhancedOrderItems
    }

    // Add cache-busting headers
    const response = NextResponse.json({ order: enhancedOrder })
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
