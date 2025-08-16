import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization')
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // If no header, try to get token from cookie
      token = request.cookies.get("auth-token")?.value
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Verify the JWT token directly
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const {
      items,
      shippingInfo,
      paymentInfo,
      subtotal,
      tax,
      shipping,
      total
    } = await request.json()

    if (!items || !shippingInfo || !paymentInfo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate that all products exist and have sufficient stock
    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId }
      })
      
      if (!product) {
        return NextResponse.json({ 
          error: `Product with ID ${item.productId} not found. Please remove this item from your cart and try again.` 
        }, { status: 400 })
      }
      
      // Check if product has sufficient stock
      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}` 
        }, { status: 400 })
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: payload.userId,
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
      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.finalPrice
        }
      })

      // Update product stock
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
    }

    // Clear user's cart
    await db.cartItem.deleteMany({
      where: { userId: payload.userId }
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization')
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // If no header, try to get token from cookie
      token = request.cookies.get("auth-token")?.value
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

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}