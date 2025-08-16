"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Eye,
  Calendar,
  User,
  Package,
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  size?: string
  color?: string
  product?: {
    id: string
    name: string
    images?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  userId: string
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  paymentMethod: "RAZORPAY" | "COD"
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  shippingAddress?: string
  notes?: string
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
  user?: {
    name: string
    email: string
    phone?: string
  }
}

interface CustomOrder {
  id: string
  userId: string
  status: "PENDING" | "CONFIRMED" | "IN_PRODUCTION" | "READY" | "DELIVERED" | "CANCELLED"
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
  isOwnFabric?: boolean
  notes?: string
  appointmentDate?: string
  createdAt: string
  updatedAt: string
  user?: {
    name: string
    email: string
    phone?: string
  }
}

export default function AdminOrdersPage() {
  const { state: authState } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("ALL")
  const [selectedOrder, setSelectedOrder] = useState<Order | CustomOrder | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("regular")

  const { toast } = useToast()

  useEffect(() => {
    if (authState.user?.role !== "ADMIN") {
      return
    }
    setIsLoading(true)
    Promise.all([
      fetchOrders(),
      fetchCustomOrders()
    ]).finally(() => {
      setIsLoading(false)
    })
  }, [authState.user])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      })
    }
  }

  const fetchCustomOrders = async () => {
    try {
      const response = await fetch("/api/admin/custom-orders")
      if (response.ok) {
        const data = await response.json()
        setCustomOrders(data.orders)
      }
    } catch (error) {
      console.error("Error fetching custom orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch custom orders",
        variant: "destructive"
      })
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderItems.some(item => item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const filteredCustomOrders = customOrders.filter(order => {
    const matchesSearch = 
      order.fabric.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.fabricColor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.frontDesign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.backDesign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleOrderStatusChange = async (orderId: string, newStatus: string, isCustom: boolean = false) => {
    try {
      const endpoint = isCustom ? `/api/admin/custom-orders/${orderId}/status` : `/api/admin/orders/${orderId}/status`
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus.replace(/_/g, ' ')}`
        })
        if (isCustom) {
          fetchCustomOrders()
        } else {
          fetchOrders()
        }
      } else {
        throw new Error("Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      })
    }
  }

  const handleViewDetails = (order: Order | CustomOrder, isCustom: boolean = false) => {
    setSelectedOrder({ ...order, isCustom })
    setIsDetailDialogOpen(true)
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-gray-100 text-gray-800"
      case "CONFIRMED": return "bg-blue-100 text-blue-800"
      case "PROCESSING":
      case "IN_PRODUCTION": return "bg-yellow-100 text-yellow-800"
      case "SHIPPED": return "bg-purple-100 text-purple-800"
      case "READY": return "bg-indigo-100 text-indigo-800"
      case "DELIVERED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "FAILED": return "bg-red-100 text-red-800"
      case "REFUNDED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusStats = () => {
    const allOrders = [...orders, ...customOrders]
    return {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === "PENDING").length,
      confirmed: allOrders.filter(o => o.status === "CONFIRMED").length,
      processing: allOrders.filter(o => o.status === "PROCESSING" || o.status === "IN_PRODUCTION").length,
      shipped: allOrders.filter(o => o.status === "SHIPPED" || o.status === "READY").length,
      delivered: allOrders.filter(o => o.status === "DELIVERED").length,
      cancelled: allOrders.filter(o => o.status === "CANCELLED").length,
    }
  }

  const stats = getStatusStats()

  if (authState.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600">Manage all orders and track their status</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="READY">Ready</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => {
                setIsLoading(true)
                Promise.all([
                  fetchOrders(),
                  fetchCustomOrders()
                ]).finally(() => {
                  setIsLoading(false)
                })
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-yellow-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shipped</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.shipped}</p>
                </div>
                <Truck className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="regular">Regular Orders ({filteredOrders.length})</TabsTrigger>
            <TabsTrigger value="custom">Custom Orders ({filteredCustomOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="regular">
            <Card>
              <CardHeader>
                <CardTitle>Regular Orders ({filteredOrders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="text-center">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-600">
                              {orders.length === 0 
                                ? "There are no regular orders yet." 
                                : "No orders match your search criteria."
                              }
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.user?.name || "Unknown"}</p>
                              <p className="text-sm text-gray-600">{order.user?.email || ""}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {order.orderItems.slice(0, 2).map((item, index) => (
                                <p key={index} className="text-sm truncate">
                                  {item.quantity}x {item.product?.name || "Product"}
                                </p>
                              ))}
                              {order.orderItems.length > 2 && (
                                <p className="text-sm text-gray-500">
                                  +{order.orderItems.length - 2} more
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatPrice(order.total)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                {order.paymentStatus}
                              </Badge>
                              <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={order.status} 
                              onValueChange={(value) => handleOrderStatusChange(order.id, value, false)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                <SelectItem value="PROCESSING">Processing</SelectItem>
                                <SelectItem value="SHIPPED">Shipped</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(order, false)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle>Custom Orders ({filteredCustomOrders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Fabric</TableHead>
                      <TableHead>Design</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="text-center">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No custom orders found</h3>
                            <p className="text-gray-600">
                              {customOrders.length === 0 
                                ? "There are no custom orders yet." 
                                : "No custom orders match your search criteria."
                              }
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.user?.name || "Unknown"}</p>
                              <p className="text-sm text-gray-600">{order.user?.email || ""}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.fabric}</p>
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-4 h-4 rounded border"
                                  style={{ backgroundColor: order.fabricColor.toLowerCase() }}
                                />
                                <span className="text-sm text-gray-600">{order.fabricColor}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">Front: {order.frontDesign}</p>
                              <p className="text-sm">Back: {order.backDesign}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatPrice(order.price)}</TableCell>
                          <TableCell>
                            <Select 
                              value={order.status} 
                              onValueChange={(value) => handleOrderStatusChange(order.id, value, true)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                                <SelectItem value="READY">Ready</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(order, true)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order Details - #{selectedOrder ? 'isCustom' in selectedOrder ? selectedOrder.id.slice(-6) : selectedOrder.orderNumber : ''}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {'isCustom' in selectedOrder ? (
                // Custom Order Details
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span><strong>Name:</strong> {(selectedOrder as CustomOrder).user?.name || "Unknown"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span><strong>Email:</strong> {(selectedOrder as CustomOrder).user?.email || "Not available"}</span>
                      </div>
                      {(selectedOrder as CustomOrder).user?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span><strong>Phone:</strong> {(selectedOrder as CustomOrder).user?.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Order Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span><strong>Created:</strong> {formatDate((selectedOrder as CustomOrder).createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span><strong>Status:</strong> </span>
                        <Badge className={getOrderStatusColor((selectedOrder as CustomOrder).status)}>
                          {(selectedOrder as CustomOrder).status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <span><strong>Price:</strong> {formatPrice((selectedOrder as CustomOrder).price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="font-semibold mb-2">Design Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <strong>Fabric:</strong> {(selectedOrder as CustomOrder).fabric}
                        {(selectedOrder as CustomOrder).isOwnFabric && (
                          <Badge className="ml-2 bg-green-100 text-green-800">Customer's Own Fabric</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <strong>Fabric Color:</strong>
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: (selectedOrder as CustomOrder).fabricColor.toLowerCase() }}
                        />
                        <span>{(selectedOrder as CustomOrder).fabricColor}</span>
                      </div>
                      <div><strong>Front Design:</strong> {(selectedOrder as CustomOrder).frontDesign}</div>
                      {(selectedOrder as CustomOrder).frontDesignModel && (
                        <div><strong>Front Design Model:</strong> {(selectedOrder as CustomOrder).frontDesignModel}</div>
                      )}
                      <div><strong>Back Design:</strong> {(selectedOrder as CustomOrder).backDesign}</div>
                      {(selectedOrder as CustomOrder).backDesignModel && (
                        <div><strong>Back Design Model:</strong> {(selectedOrder as CustomOrder).backDesignModel}</div>
                      )}
                      <div>
                        <strong>Measurements:</strong>
                        <pre className="mt-1 p-2 bg-white rounded text-sm overflow-x-auto">
                          {JSON.parse((selectedOrder as CustomOrder).measurements || '{}')}
                        </pre>
                      </div>
                      
                      {/* Price Breakdown */}
                      <div className="border-t pt-3">
                        <h4 className="font-medium mb-2">Price Breakdown:</h4>
                        <div className="space-y-1 text-sm">
                          {(selectedOrder as CustomOrder).fabricCost !== undefined && !((selectedOrder as CustomOrder).isOwnFabric) && (
                            <div className="flex justify-between">
                              <span>Fabric Cost:</span>
                              <span>₹{(selectedOrder as CustomOrder).fabricCost?.toLocaleString()}</span>
                            </div>
                          )}
                          {(selectedOrder as CustomOrder).frontModelPrice !== undefined && (
                            <div className="flex justify-between">
                              <span>Front Model Price:</span>
                              <span>₹{(selectedOrder as CustomOrder).frontModelPrice?.toLocaleString()}</span>
                            </div>
                          )}
                          {(selectedOrder as CustomOrder).backModelPrice !== undefined && (
                            <div className="flex justify-between">
                              <span>Back Model Price:</span>
                              <span>₹{(selectedOrder as CustomOrder).backModelPrice?.toLocaleString()}</span>
                            </div>
                          )}
                          {(selectedOrder as CustomOrder).isOwnFabric && (
                            <div className="flex justify-between text-green-600">
                              <span>Fabric Savings:</span>
                              <span>₹{(selectedOrder as CustomOrder).fabricCost?.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold border-t pt-1">
                            <span>Total Price:</span>
                            <span className="text-pink-600">₹{(selectedOrder as CustomOrder).price?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {(selectedOrder as CustomOrder).appointmentDate && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span><strong>Appointment:</strong> {formatDate((selectedOrder as CustomOrder).appointmentDate!)}</span>
                        </div>
                      )}
                      {(selectedOrder as CustomOrder).notes && (
                        <div><strong>Notes:</strong> {(selectedOrder as CustomOrder).notes}</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Regular Order Details
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span><strong>Name:</strong> {(selectedOrder as Order).user?.name || "Unknown"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span><strong>Email:</strong> {(selectedOrder as Order).user?.email || "Not available"}</span>
                      </div>
                      {(selectedOrder as Order).user?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span><strong>Phone:</strong> {(selectedOrder as Order).user?.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Order Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span><strong>Created:</strong> {formatDate((selectedOrder as Order).createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span><strong>Status:</strong> </span>
                        <Badge className={getOrderStatusColor((selectedOrder as Order).status)}>
                          {(selectedOrder as Order).status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <span><strong>Payment:</strong> </span>
                        <Badge className={getPaymentStatusColor((selectedOrder as Order).paymentStatus)}>
                          {(selectedOrder as Order).paymentStatus}
                        </Badge>
                        <span className="text-sm text-gray-500">({(selectedOrder as Order).paymentMethod})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span><strong>Total:</strong> {formatPrice((selectedOrder as Order).total)}</span>
                      </div>
                    </div>
                  </div>

                  {(selectedOrder as Order).shippingAddress && (
                    <div className="md:col-span-2">
                      <h3 className="font-semibold mb-2">Shipping Address</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                          <div>
                            {JSON.parse((selectedOrder as Order).shippingAddress!).name}<br />
                            {JSON.parse((selectedOrder as Order).shippingAddress!).address}<br />
                            {JSON.parse((selectedOrder as Order).shippingAddress!).city}, {JSON.parse((selectedOrder as Order).shippingAddress!).state} {JSON.parse((selectedOrder as Order).shippingAddress!).pincode}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <h3 className="font-semibold mb-2">Order Items</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-3">
                        {(selectedOrder as Order).orderItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium">{item.product?.name || "Product"}</p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity}
                                  {item.size && ` • Size: ${item.size}`}
                                  {item.color && ` • Color: ${item.color}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatPrice(item.price)}</p>
                              <p className="text-sm text-gray-500">each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatPrice((selectedOrder as Order).subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span>-{formatPrice((selectedOrder as Order).discount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>{formatPrice((selectedOrder as Order).tax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>{formatPrice((selectedOrder as Order).shipping)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>{formatPrice((selectedOrder as Order).total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(selectedOrder as Order).notes && (
                    <div className="md:col-span-2">
                      <h3 className="font-semibold mb-2">Order Notes</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p>{(selectedOrder as Order).notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}