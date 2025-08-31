import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json({ error: "Cancellation reason is required" }, { status: 400 })
    }

    const orderId = params.id

    // Check if order exists and can be cancelled
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 })
    }

    if (!["PENDING", "PROCESSING"].includes(order.status)) {
      return NextResponse.json({ error: "Order cannot be cancelled at this stage" }, { status: 400 })
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        notes: `Cancelled by user. Reason: ${reason}`
      }
    })

    // Restore product stock for regular products (not custom designs)
    for (const item of order.orderItems) {
      if (item.productId !== "custom-blouse") {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        })
      }
    }

    return NextResponse.json({ 
      order: updatedOrder,
      message: "Order cancelled successfully" 
    })
  } catch (error) {
    console.error("Error cancelling order:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}