"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Eye,
  Calendar,
  User,
  Package,
  TrendingUp,
  Filter
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CustomOrder {
  id: string
  userId: string
  status: "PENDING" | "CONFIRMED" | "IN_PRODUCTION" | "READY" | "DELIVERED" | "CANCELLED"
  fabric: string
  fabricColor: string
  frontDesign: string
  backDesign: string
  measurements: string
  price: number
  notes?: string
  appointmentDate?: string
  createdAt: string
  updatedAt: string
  user?: {
    name: string
    email: string
  }
}

export default function AdminCustomOrdersPage() {
  const [orders, setOrders] = useState<CustomOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/custom-orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Error fetching custom orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch custom orders",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.fabric.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.fabricColor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.frontDesign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.backDesign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user?.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/custom-orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus}`
        })
        fetchOrders()
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

  const handleViewDetails = (order: CustomOrder) => {
    setSelectedOrder(order)
    setIsDetailDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-gray-100 text-gray-800"
      case "CONFIRMED": return "bg-blue-100 text-blue-800"
      case "IN_PRODUCTION": return "bg-yellow-100 text-yellow-800"
      case "READY": return "bg-purple-100 text-purple-800"
      case "DELIVERED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const getStatusStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === "PENDING").length,
      confirmed: orders.filter(o => o.status === "CONFIRMED").length,
      inProduction: orders.filter(o => o.status === "IN_PRODUCTION").length,
      ready: orders.filter(o => o.status === "READY").length,
      delivered: orders.filter(o => o.status === "DELIVERED").length,
      cancelled: orders.filter(o => o.status === "CANCELLED").length,
    }
    return stats
  }

  const stats = getStatusStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading custom orders...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Custom Orders Management</h1>
              <p className="text-gray-600">Manage custom blouse design orders and track production</p>
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
                  <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                  <SelectItem value="READY">Ready</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-gray-600 rounded-full"></div>
                </div>
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
                  <p className="text-sm font-medium text-gray-600">Production</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProduction}</p>
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
                  <p className="text-sm font-medium text-gray-600">Ready</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.ready}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-purple-600 rounded-full"></div>
                </div>
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
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                </div>
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
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-red-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Card>
          <CardHeader>
            <CardTitle>Custom Orders ({filteredOrders.length})</CardTitle>
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
                {filteredOrders.map((order) => (
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
                        onValueChange={(value) => handleStatusChange(order.id, value)}
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
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.id.slice(-6)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Name:</strong> {selectedOrder.user?.name || "Unknown"}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email || "Not available"}</p>
                </div>
              </div>

              {/* Order Details */}
              <div>
                <h3 className="font-semibold mb-2">Order Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span><strong>Fabric:</strong></span>
                    <span>{selectedOrder.fabric}</span>
                  </div>
                  <div className="flex justify-between">
                    <span><strong>Color:</strong></span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: selectedOrder.fabricColor.toLowerCase() }}
                      />
                      <span>{selectedOrder.fabricColor}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span><strong>Front Design:</strong></span>
                    <span>{selectedOrder.frontDesign}</span>
                  </div>
                  <div className="flex justify-between">
                    <span><strong>Back Design:</strong></span>
                    <span>{selectedOrder.backDesign}</span>
                  </div>
                  <div className="flex justify-between">
                    <span><strong>Price:</strong></span>
                    <span className="font-semibold">{formatPrice(selectedOrder.price)}</span>
                  </div>
                </div>
              </div>

              {/* Measurements */}
              <div>
                <h3 className="font-semibold mb-2">Measurements</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(JSON.parse(selectedOrder.measurements), null, 2)}
                  </pre>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h3 className="font-semibold mb-2">Additional Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span><strong>Status:</strong></span>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span><strong>Created:</strong></span>
                    <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                  {selectedOrder.appointmentDate && (
                    <div className="flex justify-between">
                      <span><strong>Appointment:</strong></span>
                      <span>{new Date(selectedOrder.appointmentDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedOrder.notes && (
                    <div>
                      <span><strong>Notes:</strong></span>
                      <p className="mt-1 text-sm">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}