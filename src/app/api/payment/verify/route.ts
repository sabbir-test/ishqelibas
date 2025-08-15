import { NextRequest, NextResponse } from "next/server"
import { verifyPaymentSignature } from "@/lib/razorpay"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: "Missing payment verification data" }, { status: 400 })
    }

    // Get the Razorpay order details
    const response = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
      headers: {
        "Authorization": `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")}`
      }
    })

    const razorpayOrder = await response.json()

    // Verify the payment signature
    const isValidSignature = verifyPaymentSignature(
      {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      },
      razorpayOrder
    )

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Update the order status in the database
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "COMPLETED",
        status: "CONFIRMED"
      }
    })

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}