"use client"

import { useState } from "react"
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
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [orderCompleted, setOrderCompleted] = useState(false)

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

  const subtotal = state.total
  const shipping = subtotal > 999 ? 0 : 99
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep("payment")
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // If COD is selected, create the order immediately
    if (paymentInfo.method === "cod") {
      try {
        const order = await createOrder()
        setCreatedOrderId(order.id)
        setOrderCompleted(true)
        clearCart()
        setCurrentStep("confirmation")
      } catch (error) {
        console.error('Error creating COD order:', error)
        alert('Failed to create COD order. Please try again.')
      }
    } else {
      // For Razorpay, move to confirmation step first
      setCurrentStep("confirmation")
    }
  }

  const createOrder = async () => {
    if (!authState.user) {
      throw new Error('User not authenticated')
    }

    if (!state.items || state.items.length === 0) {
      throw new Error('No items in cart')
    }

    // Separate regular items and custom design items
    const regularItems = state.items.filter(item => !item.isCustomDesign)
    const customItems = state.items.filter(item => item.isCustomDesign)

    // Create regular order if there are regular items
    if (regularItems.length > 0) {
      const regularOrderData = {
        items: regularItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          finalPrice: item.finalPrice
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
          notes: `Order created via ${paymentInfo.method} payment`
        },
        subtotal: regularItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0),
        tax: regularItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0) * 0.18,
        shipping: regularItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0) > 999 ? 0 : 99,
        total: regularItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0) * 1.18 + (regularItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0) > 999 ? 0 : 99)
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(regularOrderData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create regular order')
      }
    }

    // Create custom order if there are custom design items
    if (customItems.length > 0) {
      for (const customItem of customItems) {
        if (!customItem.customDesign) {
          throw new Error('Custom design data is missing')
        }

        const customOrderData = {
          fabric: customItem.customDesign.fabric?.name || 'Custom fabric',
          fabricColor: customItem.customDesign.fabric?.color || 'Custom color',
          frontDesign: customItem.customDesign.frontDesign?.name || 'Custom front design',
          backDesign: customItem.customDesign.backDesign?.name || 'Custom back design',
          frontDesignModel: customItem.customDesign.selectedModels?.frontModel?.name,
          backDesignModel: customItem.customDesign.selectedModels?.backModel?.name,
          measurements: JSON.stringify(customItem.customDesign.measurements),
          price: customItem.finalPrice,
          fabricCost: customItem.customDesign.fabric?.isOwnFabric ? 0 : (customItem.customDesign.fabric?.pricePerMeter || 0) * 1.5,
          frontModelPrice: customItem.customDesign.selectedModels?.frontModel?.finalPrice,
          backModelPrice: customItem.customDesign.selectedModels?.backModel?.finalPrice,
          isOwnFabric: customItem.customDesign.fabric?.isOwnFabric || false,
          notes: paymentInfo.notes || `Custom order created via ${paymentInfo.method} payment`,
          appointmentDate: customItem.customDesign.appointmentDate
        }

        const response = await fetch('/api/custom-orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(customOrderData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create custom order')
        }
      }
    }

    // Return a success response (in a real app, you might return the created order IDs)
    return { success: true, message: 'Order(s) created successfully' }
  }

  const handlePlaceOrder = () => {
    clearCart()
    // Order is already created, just redirect to orders page
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to your cart to continue</p>
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
            <Badge variant="secondary">{state.itemCount} items</Badge>
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
                          {paymentInfo.method === "cod" ? "Confirm COD Order" : "Continue"}
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
                    onSuccess={async (paymentId) => {
                      console.log("Payment successful:", paymentId)
                      // Create order after successful payment
                      try {
                        const order = await createOrder()
                        setCreatedOrderId(order.id)
                        setOrderCompleted(true)
                        clearCart()
                        setCurrentStep("confirmation")
                      } catch (error) {
                        console.error('Error creating order after payment:', error)
                        alert('Failed to create order after payment. Please try again.')
                      }
                    }}
                    onError={(error) => {
                      console.error("Payment failed:", error)
                      alert('Payment failed. Please try again.')
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
                        <div className="text-sm text-gray-500">
                          Click "Continue" to confirm your COD order
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {currentStep === "confirmation" && (
              <Card>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${orderCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                    <CheckCircle className="h-5 w-5" />
                    {orderCompleted ? 'Order Confirmed!' : 'Complete Your Payment'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                      orderCompleted ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <CheckCircle className={`h-8 w-8 ${orderCompleted ? 'text-green-600' : 'text-yellow-600'}`} />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        {orderCompleted ? 'Thank You for Your Order!' : 'Please Complete Your Payment'}
                      </h3>
                      <p className="text-gray-600">
                        {orderCompleted 
                          ? 'Your order has been placed successfully. You will receive a confirmation email shortly.'
                          : 'Please select a payment method and complete your payment to confirm your order.'
                        }
                      </p>
                    </div>

                    {orderCompleted && createdOrderId && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium mb-2">Order Details</p>
                        <p className="text-sm text-gray-600">
                          Order Number: #{createdOrderId.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Estimated Delivery: 3-5 business days
                        </p>
                      </div>
                    )}

                    {!orderCompleted && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="font-medium mb-2 text-yellow-800">Next Steps:</p>
                        <ul className="text-sm text-yellow-700 space-y-1 text-left">
                          <li>• Select your preferred payment method above</li>
                          <li>• Complete the payment process</li>
                          <li>• You will receive a confirmation once payment is successful</li>
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-4 justify-center">
                      {orderCompleted ? (
                        <>
                          <Button asChild>
                            <Link href="/shop">Continue Shopping</Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href="/orders">View Orders</Link>
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={() => setCurrentStep("payment")}
                          variant="outline"
                        >
                          Back to Payment
                        </Button>
                      )}
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
                  {state.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        {(item.size || item.color) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.size && item.color && <span> • </span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                        )}
                        {/* Design Pricing */}
                        {(item.frontDesignName || item.backDesignName) && (
                          <div className="text-xs text-gray-600 mt-1">
                            <div className="font-medium">Design:</div>
                            {item.frontDesignName && (
                              <div>Front: {item.frontDesignName} (₹{item.frontDesignPrice})</div>
                            )}
                            {item.backDesignName && (
                              <div>Back: {item.backDesignName} (₹{item.backDesignPrice})</div>
                            )}
                          </div>
                        )}
                        
                        {/* Custom Design Breakdown */}
                        {item.isCustomDesign && item.customDesign && (
                          <div className="text-xs text-blue-600 mt-1">
                            <div className="font-medium">Custom Design Breakdown:</div>
                            {!item.customDesign.fabric?.isOwnFabric && item.customDesign.fabric && (
                              <div>Fabric: {item.customDesign.fabric.name} (₹{(item.customDesign.fabric.pricePerMeter * 1.5).toLocaleString()})</div>
                            )}
                            {item.customDesign.selectedModels?.frontModel && (
                              <div>Front Model: {item.customDesign.selectedModels.frontModel.name} (₹{item.customDesign.selectedModels.frontModel.finalPrice.toLocaleString()})</div>
                            )}
                            {item.customDesign.selectedModels?.backModel && (
                              <div>Back Model: {item.customDesign.selectedModels.backModel.name} (₹{item.customDesign.selectedModels.backModel.finalPrice.toLocaleString()})</div>
                            )}
                            {item.customDesign.fabric?.isOwnFabric && (
                              <div className="text-green-600">Customer's own fabric (No cost)</div>
                            )}
                          </div>
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