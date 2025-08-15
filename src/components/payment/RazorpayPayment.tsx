"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"

interface RazorpayPaymentProps {
  amount: number
  orderId: string
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function RazorpayPayment({ amount, orderId, onSuccess, onError }: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const initializePayment = async () => {
    setIsLoading(true)
    try {
      // Create Razorpay order
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount,
          receipt: `receipt_${orderId}`,
          notes: {
            orderId: orderId
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment order")
      }

      setRazorpayOrderId(data.orderId)

      // Load Razorpay script
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => {
        openRazorpayCheckout(data)
      }
      script.onerror = () => {
        setIsLoading(false)
        onError("Failed to load payment gateway")
      }
      document.body.appendChild(script)
    } catch (error) {
      setIsLoading(false)
      onError(error instanceof Error ? error.message : "Failed to initialize payment")
    }
  }

  const openRazorpayCheckout = (razorpayOrder: any) => {
    const options = {
      key: razorpayOrder.keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Ishq-e-Libas",
      description: "Payment for your order",
      order_id: razorpayOrder.orderId,
      handler: async function (response: any) {
        try {
          // Verify payment on server
          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId
            })
          })

          const verifyData = await verifyResponse.json()

          if (verifyResponse.ok && verifyData.success) {
            onSuccess(response.razorpay_payment_id)
          } else {
            onError(verifyData.error || "Payment verification failed")
          }
        } catch (error) {
          onError("Failed to verify payment")
        }
      },
      prefill: {
        name: "",
        email: "",
        contact: ""
      },
      notes: {
        address: "Ishq-e-Libas Headquarters",
        order_id: orderId
      },
      theme: {
        color: "#ec4899"
      },
      modal: {
        ondismiss: function () {
          setIsLoading(false)
        }
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pay with Razorpay
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Amount */}
        <div className="text-center">
          <div className="text-3xl font-bold text-pink-600 mb-2">
            {formatPrice(amount)}
          </div>
          <p className="text-gray-600">Total amount to be paid</p>
        </div>

        <Separator />

        {/* Available Payment Methods */}
        <div className="space-y-4">
          <h4 className="font-medium">Available Payment Methods</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <div>
                <div className="font-medium text-sm">Credit/Debit Cards</div>
                <div className="text-xs text-gray-500">Visa, Mastercard, etc.</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Smartphone className="h-6 w-6 text-green-600" />
              <div>
                <div className="font-medium text-sm">UPI</div>
                <div className="text-xs text-gray-500">All UPI apps</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Building2 className="h-6 w-6 text-purple-600" />
              <div>
                <div className="font-medium text-sm">Net Banking</div>
                <div className="text-xs text-gray-500">All major banks</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Wallet className="h-6 w-6 text-orange-600" />
              <div>
                <div className="font-medium text-sm">Wallets</div>
                <div className="text-xs text-gray-500">Paytm, PhonePe, etc.</div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Security Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">100% Secure Payment</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• Your payment information is encrypted and secure</div>
            <div>• We do not store your card details</div>
            <div>• PCI DSS compliant payment gateway</div>
          </div>
        </div>

        {/* Pay Button */}
        <Button
          onClick={initializePayment}
          disabled={isLoading}
          className="w-full bg-pink-600 hover:bg-pink-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now
            </>
          )}
        </Button>

        {/* Terms */}
        <div className="text-xs text-gray-500 text-center">
          By clicking "Pay Now", you agree to our Terms of Service and Privacy Policy
        </div>
      </CardContent>
    </Card>
  )
}