"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  ShoppingBag,
  Search,
  Filter,
  IndianRupee,
  Calendar,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Ban
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
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
  discount: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  paymentMethod: string
  estimatedDelivery?: string
}

export default function OrdersPage() {
  const { state: authState } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null)
  const [cancellationReason, setCancellationReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)

  // Predefined cancellation reasons
  const cancellationReasons = [
    "Wrong size",
    "Duplicate order", 
    "Found cheaper",
    "Quality concern",
    "No longer needed",
    "Shipping delay",
    "Incorrect item",
    "Other"
  ]

  useEffect(() => {
    if (authState.user) {
      loadOrders()
    }
  }, [authState.user])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter])

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      if (!authState.user) {
        throw new Error('User not authenticated')
      }

      const response = await fetch(`/api/orders?_t=${Date.now()}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Transform database orders to match our interface
        const transformedOrders: Order[] = data.orders.map((order: any) => {
          // Handle address data from the address relationship
          const shippingAddress = order.address ? {
            name: `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim(),
            phone: order.address.phone || '',
            address: order.address.address || '',
            city: order.address.city || '',
            state: order.address.state || '',
            pincode: order.address.zipCode || ''
          } : {
            name: 'Not available',
            phone: 'Not available', 
            address: 'Address not available',
            city: '',
            state: '',
            pincode: ''
          };
          
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status.toLowerCase(),
            total: order.total,
            subtotal: order.subtotal,
            shipping: order.shipping,
            discount: order.discount,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: order.orderItems.map((item: any) => {
              let imageUrl = '/api/placeholder/300/400';
              
              // Handle custom blouse design with better fallback
              if (item.productId === 'custom-blouse') {
                imageUrl = '/images/custom-blouse-default.svg';
              } else if (item.product?.images) {
                imageUrl = item.product.images.split(',')[0];
              }
              
              return {
                id: item.id,
                name: item.product?.name || 'Custom Product',
                price: item.price,
                quantity: item.quantity,
                image: imageUrl,
                size: item.size,
                color: item.color
              };
            }),
            shippingAddress: shippingAddress,
            paymentMethod: order.paymentMethod,
            estimatedDelivery: order.estimatedDelivery
          };
        });
        
        setOrders(transformedOrders);
      } else {
        console.error('Failed to load orders:', response.status)
        setOrders([])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-600" />
      case 'processing':
        return <Package className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const confirmCancelOrder = async () => {
    if (!cancelOrder || !cancellationReason) {
      alert("Please select a reason for cancellation")
      return
    }

    setIsCancelling(true)
    try {
      const response = await fetch(`/api/orders/${cancelOrder.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reason: cancellationReason })
      })

      if (response.ok) {
        // Update order status locally
        setOrders(prev => prev.map(order => 
          order.id === cancelOrder.id 
            ? { ...order, status: 'cancelled' }
            : order
        ))
        setCancelOrder(null)
        setCancellationReason("")
        alert("Order cancelled successfully")
      } else {
        throw new Error("Failed to cancel order")
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
      alert("Failed to cancel order. Please try again.")
    } finally {
      setIsCancelling(false)
    }
  }

  if (!authState.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-gray-400 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view your orders. Please log in to see your order history.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Demo Account</h3>
            <p className="text-sm text-blue-700 mb-2">
              Use the following credentials to test the orders functionality:
            </p>
            <div className="text-left bg-white rounded p-3 text-sm">
              <p><strong>Email:</strong> demo@example.com</p>
              <p><strong>Password:</strong> demo123</p>
            </div>
          </div>
          <div className="space-y-3">
            <Link href="/">
              <Button className="bg-pink-600 hover:bg-pink-700 w-full">
                Go to Home to Login
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // Open the auth modal by clicking the user icon
                const userIcon = document.querySelector('button[aria-label="User account"]');
                if (userIcon) {
                  (userIcon as HTMLElement).click();
                }
              }}
            >
              Open Login Dialog
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading orders...</p>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-2">Track and manage your orders</p>
            </div>
            <Link href="/account">
              <Button variant="outline">
                Back to Account
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search orders by order number or product name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-6">
                  {orders.length === 0 
                    ? "You haven't placed any orders yet." 
                    : "No orders match your search criteria."
                  }
                </p>
                {orders.length === 0 && (
                  <Link href="/shop">
                    <Button className="bg-pink-600 hover:bg-pink-700">
                      Start Shopping
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Order Summary */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3 mb-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <div className="flex gap-2 text-sm text-gray-500">
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

                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Total Amount</p>
                          <p className="font-semibold text-gray-900">
                            <IndianRupee className="inline h-3 w-3" />{order.total}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Payment Method</p>
                          <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Delivery Address</p>
                          <p className="font-medium text-gray-900">
                            {order.shippingAddress.address ? `${order.shippingAddress.address}, ` : ''}
                            {order.shippingAddress.city && order.shippingAddress.state 
                              ? `${order.shippingAddress.city}, ${order.shippingAddress.state}`
                              : order.shippingAddress.city || order.shippingAddress.state || 'Address not available'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:w-48 flex lg:flex-col gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.location.href = `/orders/${order.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          // Open invoice in new window for download/print
                          const invoiceUrl = `/api/orders/${order.id}/invoice`
                          window.open(invoiceUrl, '_blank')
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </Button>
                      {['processing', 'shipped'].includes(order.status) && (
                        <>
                          <Button variant="outline" className="w-full">
                            Track Order
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                className="w-full text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                onClick={() => setCancelOrder(order)}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Cancel Order
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Clock className="h-5 w-5 text-yellow-600" />
                                  Cancel Order
                                </DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to cancel order #{order.orderNumber}? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="reason">Reason for Cancellation</Label>
                                  <Select value={cancellationReason} onValueChange={setCancellationReason}>
                                    <SelectTrigger className="mt-2">
                                      <SelectValue placeholder="Select a reason for cancellation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {cancellationReasons.map((reason) => (
                                        <SelectItem key={reason} value={reason}>
                                          {reason}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <DialogFooter>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setCancelOrder(null)
                                      setCancellationReason("")
                                    }}
                                  >
                                    Keep Order
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={confirmCancelOrder}
                                    disabled={!cancellationReason || isCancelling}
                                  >
                                    {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                                  </Button>
                                </DialogFooter>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
