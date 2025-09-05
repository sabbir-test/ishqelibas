import Razorpay from "razorpay"
import crypto from "crypto"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  offer_id: string | null
  status: string
  attempts: number
  notes: Record<string, string>
  created_at: number
}

export interface CreateOrderOptions {
  amount: number
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export async function createRazorpayOrder(options: CreateOrderOptions): Promise<RazorpayOrder> {
  try {
    const order = await razorpay.orders.create({
      amount: options.amount * 100, // Razorpay expects amount in paise
      currency: options.currency || "INR",
      receipt: options.receipt || "",
      notes: options.notes || {},
    })

    // Convert amount to number as Razorpay returns it as string
    return {
      ...order,
      amount: Number(order.amount),
      amount_paid: Number(order.amount_paid),
      amount_due: Number(order.amount_due),
    } as RazorpayOrder
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    throw new Error("Failed to create Razorpay order")
  }
}

export interface PaymentVerification {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export function verifyPaymentSignature(
  paymentVerification: PaymentVerification,
  order: RazorpayOrder
): boolean {
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${order.id}|${paymentVerification.razorpay_payment_id}`)
    .digest("hex")

  return generatedSignature === paymentVerification.razorpay_signature
}

export default razorpay