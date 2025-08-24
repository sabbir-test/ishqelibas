"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Clock,
  IndianRupee,
  MapPin,
  CreditCard,
  ArrowRight,
  Home,
  FileText
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  subtotal: number
  shipping: number
  tax: number
  createdAt: string
  items: OrderItem[]
  shippingAddress: any
  paymentMethod: string
  estimatedDelivery?: string
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const orderNumber = searchParams.get('orderNumber')
  const { state: authState } = useAuth()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      loadOrderDetails()
    } else {
      setError("Order ID not found")
      setIsLoading(false)
    }
  }, [orderId])

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true)
      
      if (!authState.user) {
        throw new Error('User not authenticated')
      }

      const response = await fetch(`/api/orders?userId=${authState.user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const foundOrder = data.orders.find((order: any) => order.id === orderId)
        
        if (foundOrder) {
          // Transform the order data
          const transformedOrder: Order = {
            id: foundOrder.id,
            orderNumber: foundOrder.orderNumber,
            status: foundOrder.status.toLowerCase(),
            total: foundOrder.total,
            subtotal: foundOrder.subtotal,
            shipping: foundOrder.shipping,
            tax: foundOrder.tax,
            createdAt: foundOrder.createdAt,
            items: foundOrder.orderItems.map((item: any) => ({
              id: item.id,
              name: item.product?.name || 'Custom Product',
              price: item.price,
              quantity: item.quantity,
              image: item.product?.images?.split(',')[0] || '/api/placeholder/300/400',
              size: item.size,
              color: item.color
            })),
            shippingAddress: JSON.parse(foundOrder.shippingAddress || '{}'),
            paymentMethod: foundOrder.paymentMethod,
            estimatedDelivery: foundOrder.estimatedDelivery
          }
          
          setOrder(transformedOrder)
        } else {
          setError("Order not found")
        }
      } else {
        setError("Failed to load order details")
      }
    } catch (error) {
      console.error('Error loading order details:', error)
      setError('Failed to load order details')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || "We couldn't find your order details. Please contact support."}
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/orders">
                  <FileText className="h-4 w-4 mr-2" />
                  View My Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
              <p className="text-gray-600 mt-2">Thank you for your purchase</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success Message */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-green-900">
                      Order #{order.orderNumber} Confirmed!
                    </h2>
                    <p className="text-green-700 mt-1">
                      Your order has been successfully placed and is being processed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Placed on {formatDate(order.createdAt)}
                  </span>
                </div>
                
                {/* Order Timeline */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order Confirmed</p>
                      <p className="text-sm text-gray-500">Your order has been received</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' 
                        ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Package className={`h-4 w-4 ${
                        order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' 
                          ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' 
                          ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        Processing
                      </p>
                      <p className="text-sm text-gray-500">Your order is being prepared</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      order.status === 'shipped' || order.status === 'delivered' ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <Truck className={`h-4 w-4 ${
                        order.status === 'shipped' || order.status === 'delivered' ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        order.status === 'shipped' || order.status === 'delivered' ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        Shipped
                      </p>
                      <p className="text-sm text-gray-500">Your order is on the way</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      order.status === 'delivered' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <CheckCircle className={`h-4 w-4 ${
                        order.status === 'delivered' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        order.status === 'delivered' ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        Delivered
                      </p>
                      <p className="text-sm text-gray-500">Order delivered to your address</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <div className="flex gap-2 text-sm text-gray-500 mt-1">
                          <span>Qty: {item.quantity}</span>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          <IndianRupee className="inline h-3 w-3" />{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatPrice(order.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{formatPrice(order.shipping)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-bold text-pink-600">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p className="text-gray-600">{order.shippingAddress.address}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p className="text-gray-600">{order.shippingAddress.country}</p>
                  <p className="text-gray-600">📞 {order.shippingAddress.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                  </p>
                  <p className="text-gray-600">Paid: {formatPrice(order.total)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/orders">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/account">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  My Account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}