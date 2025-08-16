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
  X
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CustomOrder {
  id: string
  status: string
  fabric: string
  fabricColor: string
  frontDesign: string
  backDesign: string
  frontDesignModel?: string
  backDesignModel?: string
  measurements: string
  price: number
  fabricCost?: number
  frontModelPrice?: number
  backModelPrice?: number
  isOwnFabric: boolean
  notes?: string
  createdAt: string
  updatedAt: string
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
  type: 'regular' | 'custom'
}

export default function OrdersPage() {
  const { state: authState } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [filteredCustomOrders, setFilteredCustomOrders] = useState<CustomOrder[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedCustomOrder, setSelectedCustomOrder] = useState<CustomOrder | null>(null)
  const [activeTab, setActiveTab] = useState<'regular' | 'custom'>('regular')

  useEffect(() => {
    console.log('Orders page - auth state:', authState)
    if (authState.user) {
      console.log('User is authenticated, loading orders...')
      loadOrders()
      loadCustomOrders()
    } else {
      console.log('User is not authenticated')
      setOrders([])
      setCustomOrders([])
      setIsLoading(false)
    }
  }, [authState.user])

  useEffect(() => {
    filterOrders()
    filterCustomOrders()
  }, [orders, customOrders, searchQuery, statusFilter])

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      console.log('Loading orders for user:', authState.user?.id)
      const response = await fetch('/api/orders')
      
      console.log('Orders API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Orders data received:', data.orders?.length || 0, 'orders')
        // Transform real orders data to match our interface
        const transformedOrders: Order[] = data.orders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status.toLowerCase(),
          total: order.total,
          subtotal: order.subtotal,
          shipping: order.shipping,
          discount: order.discount,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: order.orderItems.map((item: any) => ({
            id: item.id,
            name: item.product?.name || "Product",
            price: item.price,
            quantity: item.quantity,
            image: item.product?.images || "/api/placeholder/300/400"
          })),
          shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : {
            name: authState.user?.name || "User",
            phone: "+91 98765 43210",
            address: "123 Fashion Street",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001"
          },
          paymentMethod: order.paymentMethod === "RAZORPAY" ? "Online" : "COD",
          estimatedDelivery: order.status === "DELIVERED" ? order.updatedAt : undefined,
          type: 'regular'
        }))
        setOrders(transformedOrders)
      } else {
        console.error('Failed to fetch orders:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        setOrders([])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
    }
  }

  const loadCustomOrders = async () => {
    try {
      console.log('Loading custom orders for user:', authState.user?.id)
      const response = await fetch('/api/custom-orders')
      
      console.log('Custom Orders API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Custom orders data received:', data.customOrders?.length || 0, 'custom orders')
        setCustomOrders(data.customOrders || [])
      } else {
        console.error('Failed to fetch custom orders:', response.status, response.statusText)
        setCustomOrders([])
      }
    } catch (error) {
      console.error('Error loading custom orders:', error)
      setCustomOrders([])
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

  const filterCustomOrders = () => {
    let filtered = customOrders

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.fabric.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.frontDesign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.backDesign.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status.toLowerCase() === statusFilter)
    }

    setFilteredCustomOrders(filtered)
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

  const cancelOrder = async (orderId: string, orderType: 'regular' | 'custom') => {
    try {
      const endpoint = orderType === 'regular' ? '/api/orders' : '/api/custom-orders'
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: 'CANCELLED'
        })
      })

      if (response.ok) {
        // Refresh orders
        await loadOrders()
        await loadCustomOrders()
        setSelectedOrder(null)
        setSelectedCustomOrder(null)
        // Show success message (you could use a toast here)
        alert('Order cancelled successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to cancel order')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert('Failed to cancel order')
    }
  }

  if (!authState.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your orders.</p>
          <Link href="/">
            <Button className="bg-pink-600 hover:bg-pink-700">
              Go to Home
            </Button>
          </Link>
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

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === 'regular' ? 'default' : 'outline'}
            onClick={() => setActiveTab('regular')}
            className="flex-1"
          >
            Regular Orders ({orders.length})
          </Button>
          <Button
            variant={activeTab === 'custom' ? 'default' : 'outline'}
            onClick={() => setActiveTab('custom')}
            className="flex-1"
          >
            Custom Orders ({customOrders.length})
          </Button>
        </div>

        {/* Regular Orders */}
        {activeTab === 'regular' && (
          <>
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No regular orders found</h3>
                    <p className="text-gray-600 mb-6">
                      {orders.length === 0 
                        ? "You haven't placed any regular orders yet." 
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
                                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
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
                                {order.shippingAddress.city}, {order.shippingAddress.state}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="lg:w-48 flex lg:flex-col gap-2">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {order.status === 'delivered' && (
                            <Button variant="outline" className="w-full">
                              <Download className="h-4 w-4 mr-2" />
                              Invoice
                            </Button>
                          )}
                          {['processing', 'shipped'].includes(order.status) && (
                            <Button variant="outline" className="w-full">
                              Track Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Custom Orders */}
        {activeTab === 'custom' && (
          <>
            {filteredCustomOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">🎨</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No custom orders found</h3>
                    <p className="text-gray-600 mb-6">
                      {customOrders.length === 0 
                        ? "You haven't placed any custom orders yet." 
                        : "No custom orders match your search criteria."
                      }
                    </p>
                    {customOrders.length === 0 && (
                      <Link href="/custom-design">
                        <Button className="bg-pink-600 hover:bg-pink-700">
                          Design Custom Blouse
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredCustomOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Order Summary */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">Custom Order #{order.id.slice(-6)}</h3>
                              <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                          </div>

                          {/* Order Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-500">Fabric</p>
                              <p className="font-medium text-gray-900">{order.fabric} ({order.fabricColor})</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Total Price</p>
                              <p className="font-semibold text-gray-900">
                                <IndianRupee className="inline h-3 w-3" />{order.price}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Front Design</p>
                              <p className="font-medium text-gray-900">{order.frontDesign}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Back Design</p>
                              <p className="font-medium text-gray-900">{order.backDesign}</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="lg:w-48 flex lg:flex-col gap-2">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setSelectedCustomOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {['pending', 'confirmed'].includes(order.status.toLowerCase()) && (
                            <Button 
                              variant="outline" 
                              className="w-full text-red-600 hover:text-red-700"
                              onClick={() => cancelOrder(order.id, 'custom')}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Details - #{selectedOrder.orderNumber}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Timeline */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Status</h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedOrder.status)}
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                    {selectedOrder.estimatedDelivery && (
                      <span className="text-sm text-gray-500">
                        Estimated delivery: {formatDate(selectedOrder.estimatedDelivery)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            <IndianRupee className="inline h-3 w-3" />{item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Price Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        <IndianRupee className="inline h-3 w-3" />{selectedOrder.subtotal}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        <IndianRupee className="inline h-3 w-3" />{selectedOrder.shipping}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">
                        -<IndianRupee className="inline h-3 w-3" />{selectedOrder.discount}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-lg text-gray-900">
                          <IndianRupee className="inline h-4 w-4" />{selectedOrder.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.name}</p>
                    <p className="text-gray-600">{selectedOrder.shippingAddress.phone}</p>
                    <p className="text-gray-600">{selectedOrder.shippingAddress.address}</p>
                    <p className="text-gray-600">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  {['pending', 'confirmed'].includes(selectedOrder.status) && (
                    <Button 
                      variant="outline" 
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => cancelOrder(selectedOrder.id, 'regular')}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Custom Order Details Modal */}
        {selectedCustomOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Custom Order Details - #{selectedCustomOrder.id.slice(-6)}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCustomOrder(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Timeline */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Status</h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedCustomOrder.status)}
                    <Badge className={getStatusColor(selectedCustomOrder.status)}>
                      {selectedCustomOrder.status.charAt(0).toUpperCase() + selectedCustomOrder.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Fabric Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Fabric Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Fabric Type</p>
                        <p className="font-medium text-gray-900">{selectedCustomOrder.fabric}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fabric Color</p>
                        <p className="font-medium text-gray-900">{selectedCustomOrder.fabricColor}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Using Own Fabric</p>
                        <p className="font-medium text-gray-900">
                          {selectedCustomOrder.isOwnFabric ? "Yes" : "No"}
                        </p>
                      </div>
                      {selectedCustomOrder.fabricCost && (
                        <div>
                          <p className="text-sm text-gray-500">Fabric Cost</p>
                          <p className="font-medium text-gray-900">
                            <IndianRupee className="inline h-3 w-3" />{selectedCustomOrder.fabricCost}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Design Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Design Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Front Design */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-3">Front Design</h5>
                      <p className="text-gray-700 mb-3">{selectedCustomOrder.frontDesign}</p>
                      {selectedCustomOrder.frontDesignModel && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Front Model: {selectedCustomOrder.frontDesignModel}</p>
                          {selectedCustomOrder.frontModelPrice && (
                            <p className="font-medium text-gray-900">
                              Model Price: <IndianRupee className="inline h-3 w-3" />{selectedCustomOrder.frontModelPrice}
                            </p>
                          )}
                          {/* Model Image Placeholder */}
                          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Back Design */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-3">Back Design</h5>
                      <p className="text-gray-700 mb-3">{selectedCustomOrder.backDesign}</p>
                      {selectedCustomOrder.backDesignModel && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Back Model: {selectedCustomOrder.backDesignModel}</p>
                          {selectedCustomOrder.backModelPrice && (
                            <p className="font-medium text-gray-900">
                              Model Price: <IndianRupee className="inline h-3 w-3" />{selectedCustomOrder.backModelPrice}
                            </p>
                          )}
                          {/* Model Image Placeholder */}
                          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Measurements */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Measurements</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedCustomOrder.measurements}</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Price Breakdown</h4>
                  <div className="space-y-2">
                    {selectedCustomOrder.fabricCost && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fabric Cost</span>
                        <span className="font-medium">
                          <IndianRupee className="inline h-3 w-3" />{selectedCustomOrder.fabricCost}
                        </span>
                      </div>
                    )}
                    {selectedCustomOrder.frontModelPrice && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Front Model Price</span>
                        <span className="font-medium">
                          <IndianRupee className="inline h-3 w-3" />{selectedCustomOrder.frontModelPrice}
                        </span>
                      </div>
                    )}
                    {selectedCustomOrder.backModelPrice && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Back Model Price</span>
                        <span className="font-medium">
                          <IndianRupee className="inline h-3 w-3" />{selectedCustomOrder.backModelPrice}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total Price</span>
                        <span className="font-bold text-lg text-gray-900">
                          <IndianRupee className="inline h-4 w-4" />{selectedCustomOrder.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {selectedCustomOrder.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Additional Notes</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedCustomOrder.notes}</p>
                    </div>
                  </div>
                )}

                {/* Order Dates */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Order Placed</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedCustomOrder.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Updated</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedCustomOrder.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Details
                  </Button>
                  {['pending', 'confirmed'].includes(selectedCustomOrder.status.toLowerCase()) && (
                    <Button 
                      variant="outline" 
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => cancelOrder(selectedCustomOrder.id, 'custom')}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}