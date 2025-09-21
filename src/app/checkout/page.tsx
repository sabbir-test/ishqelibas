"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import RazorpayPayment from "@/components/payment/RazorpayPayment"
import AddressSelector from "@/components/AddressSelector"
import { 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  Truck,
  ArrowLeft,
  ArrowRight,
  Shield,
  Clock,
  ShoppingCart
} from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

type CheckoutStep = "shipping" | "payment" | "confirmation"

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface PaymentInfo {
  method: "razorpay" | "cod"
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardName?: string
}

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const { state: authState } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const itemId = searchParams.get('itemId')
  
  // Filter items for single item checkout
  const checkoutItems = itemId ? state.items.filter(item => item.id === itemId) : state.items
  const isSingleItemCheckout = !!itemId
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India"
  })
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: "razorpay"
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  const steps = [
    { id: "shipping", name: "Shipping", icon: MapPin },
    { id: "payment", name: "Payment", icon: CreditCard },
    { id: "confirmation", name: "Confirmation", icon: CheckCircle }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  // Calculate totals based on checkout items
  const checkoutItemCount = checkoutItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0)
  const shipping = subtotal > 999 ? 0 : 99
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep("payment")
  }

  const handleContinueToPayment = () => {
    setCurrentStep("payment")
  }

  const handleAddressSelect = (addressId: string | null) => {
    setSelectedAddressId(addressId)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate shipping info before proceeding
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || 
        !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || 
        !shippingInfo.state || !shippingInfo.zipCode) {
      alert('Please complete all shipping information before proceeding to payment.')
      setCurrentStep('shipping')
      return
    }
    
    // For COD, place order immediately
    if (paymentInfo.method === 'cod') {
      await handlePlaceOrder()
    } else {
      // For Razorpay, just proceed to show payment options
      setCurrentStep("confirmation")
    }
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    
    try {
      // Use AuthContext for user authentication
      if (!authState.user) {
        throw new Error('User not authenticated. Please log in to place an order.')
      }

      // Prepare order data
      const orderData = {
        userId: authState.user.id,
        items: checkoutItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          finalPrice: item.finalPrice,
          name: item.name,
          customDesign: item.customDesign,
          size: item.size,
          color: item.color
        })),
        shippingInfo: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country
        },
        addressId: selectedAddressId,
        paymentInfo: {
          method: paymentInfo.method,
          notes: ""
        },
        subtotal,
        tax,
        shipping,
        total
      }

      console.log("🛒 Creating order with data:", {
        userId: orderData.userId,
        itemCount: orderData.items.length,
        total: orderData.total
      })

      // Create order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include auth cookies
        body: JSON.stringify(orderData)
      })

      console.log("📡 Order API response status:", response.status)
      
      const responseText = await response.text()
      console.log("📡 Raw response:", responseText)

      if (response.ok) {
        let responseData
        try {
          responseData = JSON.parse(responseText)
        } catch (parseError) {
          console.error("❌ Failed to parse response:", parseError)
          throw new Error('Invalid response from server')
        }
        
        const { order } = responseData
        console.log("✅ Order created successfully:", order)
        
        clearCart()
        // Use Next.js router for navigation to preserve authentication context
        router.push(`/order-confirmation?orderId=${order.id}&orderNumber=${order.orderNumber}`)
      } else {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: responseText || 'Unknown server error' }
        }
        
        console.error("❌ Order creation failed:", {
          status: response.status,
          statusText: response.statusText,
          rawResponse: responseText,
          parsedError: errorData
        })
        
        const errorMessage = errorData.error || errorData.details || `Server error (${response.status})`
        alert(`Order creation failed: ${errorMessage}`)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('❌ Error placing order:', {
        message: error.message,
        stack: error.stack,
        authUser: authState.user?.email
      })
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to place order: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {isSingleItemCheckout ? "Item not found" : "Your cart is empty"}
            </h2>
            <p className="text-gray-600 mb-6">
              {isSingleItemCheckout 
                ? "The requested item could not be found in your cart." 
                : "Add some items to your cart to continue"
              }
            </p>
            <Button asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Checkout</h1>
              <p className="text-gray-600">Complete your order in just a few steps</p>
            </div>
            <Badge variant="secondary">{checkoutItemCount} items</Badge>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStepIndex
                    ? "bg-pink-600 border-pink-600 text-white"
                    : "border-gray-300 text-gray-400"
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className={`ml-3 font-medium ${
                  index <= currentStepIndex ? "text-gray-900" : "text-gray-400"
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-16 h-0.5 bg-gray-300 ml-3" />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === "shipping" && (
              <AddressSelector
                shippingInfo={shippingInfo}
                onShippingInfoChange={setShippingInfo}
                onAddressSelect={handleAddressSelect}
                onContinue={handleContinueToPayment}
                isAuthenticated={!!authState.user}
              />
            )}

            {currentStep === "payment" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      {/* Payment Method Selection */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="razorpay"
                            name="paymentMethod"
                            value="razorpay"
                            checked={paymentInfo.method === "razorpay"}
                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value as "razorpay" }))}
                            className="w-4 h-4 text-pink-600"
                          />
                          <Label htmlFor="razorpay" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Pay with Razorpay (UPI, Cards, Net Banking)
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="cod"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentInfo.method === "cod"}
                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value as "cod" }))}
                            className="w-4 h-4 text-pink-600"
                          />
                          <Label htmlFor="cod" className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Cash on Delivery (COD)
                          </Label>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep("shipping")}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back
                        </Button>
                        <Button 
                          type="submit"
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Processing...' : (
                            paymentInfo.method === 'cod' ? 'Place Order' : 'Continue'
                          )}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Razorpay Payment Component */}
                {paymentInfo.method === "razorpay" && currentStep === "confirmation" && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <CreditCard className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">Pay with Razorpay</h3>
                          <p className="text-gray-600 mb-4">
                            Secure payment with UPI, Cards, Net Banking, and Wallets.
                          </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Order Total: ₹{total.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">You will be redirected to Razorpay for secure payment</p>
                        </div>
                        <RazorpayPayment
                          amount={total}
                          orderId={`order-${Date.now()}`}
                          onSuccess={async (paymentId) => {
                            console.log("💳 Payment successful:", paymentId)
                            await handlePlaceOrder()
                          }}
                          onError={(error) => {
                            console.error("💳 Payment failed:", error)
                            alert('Payment failed. Please try again.')
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}


              </div>
            )}

            {currentStep === "confirmation" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Order Confirmed!
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Thank You for Your Order!</h3>
                      <p className="text-gray-600">
                        Your order has been placed successfully. You will receive a confirmation email shortly.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium mb-2">Order Details</p>
                      <p className="text-sm text-gray-600">
                        Order Number: #ORD-{Date.now().toString().slice(-6)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Estimated Delivery: 3-5 business days
                      </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button asChild>
                        <Link href="/shop">Continue Shopping</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/orders">View Orders</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        {isSingleItemCheckout && item.customDesign && (
                          <p className="text-xs text-blue-600">Single Item Checkout</p>
                        )}
                      </div>
                      <span className="font-medium text-sm">
                        {formatPrice(item.finalPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-600" : ""}>
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (18%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Secure checkout powered by Razorpay</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}