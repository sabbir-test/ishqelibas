import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      items,
      shippingInfo,
      paymentInfo,
      subtotal,
      tax,
      shipping,
      total
    } = await request.json()

    if (!userId || !items || !shippingInfo || !paymentInfo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        status: "PENDING",
        subtotal,
        discount: 0,
        tax,
        shipping,
        total,
        paymentMethod: paymentInfo.method.toUpperCase(),
        paymentStatus: "PENDING",
        shippingAddress: JSON.stringify(shippingInfo),
        notes: paymentInfo.notes || ""
      }
    })

    // Create order items
    for (const item of items) {
      // Handle custom design orders
      if (item.productId === "custom-blouse" && item.customDesign) {
        // Create custom order record
        const customOrder = await db.customOrder.create({
          data: {
            userId,
            fabric: item.customDesign.fabric?.name || "Custom Fabric",
            fabricColor: item.customDesign.fabric?.color || "#000000",
            frontDesign: item.customDesign.frontDesign?.name || "Custom Front Design",
            backDesign: item.customDesign.backDesign?.name || "Custom Back Design",
            oldMeasurements: JSON.stringify(item.customDesign.measurements || {}),
            price: item.finalPrice,
            notes: item.customDesign.ownFabricDetails?.description || "Custom blouse design",
            appointmentDate: item.customDesign.appointmentDate ? new Date(item.customDesign.appointmentDate) : null,
            appointmentType: item.customDesign.appointmentType || null
          }
        })

        // Create order item that references the virtual product
        await db.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.finalPrice,
            size: item.size,
            color: item.color
          }
        })
      } else {
        // Handle regular product orders
        await db.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.finalPrice,
            size: item.size,
            color: item.color
          }
        })

        // Update product stock only for regular products (not custom designs)
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }
    }

    // Clear user's cart
    await db.cartItem.deleteMany({
      where: { userId }
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const orders = await db.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Add cache-busting headers
    const response = NextResponse.json({ orders })
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}