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
import { useSearchParams } from "next/navigation"

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

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setCurrentStep("confirmation")
    }, 2000)
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
          customDesign: item.customDesign
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      })

      console.log("📡 Order API response status:", response.status)

      if (response.ok) {
        const { order } = await response.json()
        console.log("✅ Order created successfully:", order)
        
        // Clear cart (either specific item or entire cart)
        if (isSingleItemCheckout && itemId) {
          // Remove only the specific item - this would need to be implemented in cart context
          // For now, we'll clear the entire cart
          clearCart()
        } else {
          clearCart()
        }
        
        // Redirect to order confirmation page with order ID
        window.location.href = `/order-confirmation?orderId=${order.id}&orderNumber=${order.orderNumber}`
      } else {
        const errorData = await response.json()
        console.error("❌ Order creation failed:", errorData)
        throw new Error(errorData.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={shippingInfo.firstName}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={shippingInfo.lastName}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4">
                      <Button type="button" variant="outline" asChild>
                        <Link href="/shop">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Shopping
                        </Link>
                      </Button>
                      <Button type="submit">
                        Continue to Payment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
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
                        <Button type="submit">
                          Continue
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Razorpay Payment Component */}
                {paymentInfo.method === "razorpay" && (
                  <RazorpayPayment
                    amount={total}
                    orderId={`order-${Date.now()}`}
                    onSuccess={(paymentId) => {
                      console.log("Payment successful:", paymentId)
                      setCurrentStep("confirmation")
                    }}
                    onError={(error) => {
                      console.error("Payment failed:", error)
                    }}
                  />
                )}

                {/* COD Payment Info */}
                {paymentInfo.method === "cod" && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <Truck className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">Cash on Delivery</h3>
                          <p className="text-gray-600 mb-4">
                            Pay when you receive your order. Our delivery partner will collect the payment at the time of delivery.
                          </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">COD Terms & Conditions:</h4>
                          <ul className="text-sm text-gray-600 space-y-1 text-left">
                            <li>• Only available for orders below ₹10,000</li>
                            <li>• Exact change is appreciated</li>
                            <li>• Please verify the product before paying</li>
                            <li>• Delivery partner will wait for maximum 5 minutes</li>
                          </ul>
                        </div>
                        <Button 
                          onClick={() => {
                            // Process COD order
                            setCurrentStep("confirmation")
                          }}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Confirm COD Order
                        </Button>
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