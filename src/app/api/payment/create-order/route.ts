import { NextRequest, NextResponse } from "next/server"
import { createRazorpayOrder } from "@/lib/razorpay"

export async function POST(request: NextRequest) {
  try {
    const { amount, receipt, notes } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const order = await createRazorpayOrder({
      amount,
      receipt,
      notes: notes || {}
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    })
  } catch (error) {
    console.error("Error creating payment order:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}