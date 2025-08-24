import { NextRequest, NextResponse } from "next/server"

// Mock implementation for development when Razorpay credentials are not available
export async function POST(request: NextRequest) {
  try {
    const { amount, receipt, notes } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Check if Razorpay credentials are available
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      // Return a mock order for development/testing
      console.log("🧪 Using mock Razorpay order for development")
      const mockOrderId = `mock_order_${Date.now()}`
      
      return NextResponse.json({
        orderId: mockOrderId,
        amount: amount * 100, // Convert to paise
        currency: "INR",
        keyId: "mock_key_id",
        isMock: true
      })
    }

    // Import Razorpay only when credentials are available
    const { createRazorpayOrder } = await import("@/lib/razorpay")
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