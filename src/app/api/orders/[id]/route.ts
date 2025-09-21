import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

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
      select: { id: true, email: true, isActive: true }
    })

    if (!authenticatedUser || !authenticatedUser.isActive) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
    }

    // Fetch the specific order with all related data
    const order = await db.order.findFirst({
      where: { 
        id: orderId,
        userId: authenticatedUser.id // Ensure user can only access their own orders
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                sku: true,
                description: true
              }
            }
          }
        },
        address: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Fetch custom orders for this user to match with order items
    const customOrders = await db.customOrder.findMany({
      where: { 
        userId: authenticatedUser.id,
        createdAt: {
          gte: new Date(new Date(order.createdAt).getTime() - 24 * 60 * 60 * 1000), // 24 hours before order
          lte: new Date(new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000)  // 24 hours after order
        }
      },
      select: {
        id: true,
        fabric: true,
        fabricColor: true,
        frontDesign: true,
        backDesign: true,
        notes: true,
        appointmentPurpose: true,
        createdAt: true
      }
    })

    // Transform order data to include custom design information
    const transformedOrder = {
      ...order,
      orderItems: order.orderItems.map((item: any) => {
        let customDesignInfo = null
        let modelInfo = null

        // Check if this is a custom design item
        if (['custom-blouse', 'custom-salwar-kameez', 'custom-lehenga'].includes(item.productId)) {
          // Find matching custom order by appointment purpose and timing
          const matchingCustomOrder = customOrders.find(co => {
            const purposeMatch = (
              (item.productId === 'custom-blouse' && co.appointmentPurpose === 'blouse') ||
              (item.productId === 'custom-salwar-kameez' && co.appointmentPurpose === 'salwar') ||
              (item.productId === 'custom-lehenga' && co.appointmentPurpose === 'lehenga')
            )
            return purposeMatch
          })

          if (matchingCustomOrder) {
            customDesignInfo = {
              fabric: matchingCustomOrder.fabric,
              fabricColor: matchingCustomOrder.fabricColor,
              frontDesign: matchingCustomOrder.frontDesign,
              backDesign: matchingCustomOrder.backDesign
            }

            // Parse model information from notes if available
            try {
              const notesData = JSON.parse(matchingCustomOrder.notes || '{}')
              if (notesData.selectedModel || notesData.modelName) {
                modelInfo = {
                  name: notesData.modelName || notesData.selectedModel?.name || matchingCustomOrder.frontDesign,
                  designName: notesData.selectedModel?.designName || matchingCustomOrder.frontDesign,
                  image: notesData.modelImage || notesData.selectedModel?.image || null
                }
              }
            } catch (e) {
              // If notes is not JSON, treat as description
              console.log('Notes is not JSON, treating as description')
            }
          }
        }

        return {
          ...item,
          customDesign: customDesignInfo,
          blouseModel: modelInfo
        }
      })
    }

    return NextResponse.json({ order: transformedOrder })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ 
      error: "Failed to fetch order", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}