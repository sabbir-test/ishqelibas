"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  FolderOpen,
  Scissors,
  Palette,
  Ruler,
  Calendar,
  User
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalSales: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  totalCustomOrders: number
  pendingCustomOrders: number
  recentOrders: any[]
  topProducts: any[]
  lowStockProducts: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalCustomOrders: 0,
    pendingCustomOrders: 0,
    recentOrders: [],
    topProducts: [],
    lowStockProducts: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockData: DashboardStats = {
          totalSales: 1250000,
          totalOrders: 856,
          totalUsers: 2341,
          totalProducts: 156,
          totalCustomOrders: 45,
          pendingCustomOrders: 8,
          recentOrders: [
            { id: "ORD-001", customer: "Priya Sharma", amount: 2999, status: "DELIVERED", date: "2024-01-15" },
            { id: "ORD-002", customer: "Ananya Reddy", amount: 1599, status: "PROCESSING", date: "2024-01-15" },
            { id: "ORD-003", customer: "Meera Patel", amount: 8999, status: "SHIPPED", date: "2024-01-14" },
            { id: "ORD-004", customer: "Sneha Nair", amount: 1299, status: "PENDING", date: "2024-01-14" },
            { id: "ORD-005", customer: "Ritu Singh", amount: 3499, status: "CONFIRMED", date: "2024-01-13" }
          ],
          topProducts: [
            { id: "1", name: "Elegant Silk Saree", sales: 234, revenue: 561666 },
            { id: "2", name: "Designer Kurti Set", sales: 189, revenue: 302211 },
            { id: "3", name: "Bridal Lehenga", sales: 45, revenue: 404955 },
            { id: "4", name: "Casual Cotton Dress", sales: 167, revenue: 150033 },
            { id: "5", name: "Party Wear Gown", sales: 89, revenue: 233561 }
          ],
          lowStockProducts: [
            { id: "6", name: "Traditional Salwar Suit", stock: 3, minStock: 10 },
            { id: "7", name: "Festive Collection Saree", stock: 5, minStock: 15 },
            { id: "8", name: "Summer Kurti", stock: 2, minStock: 20 }
          ]
        }
        
        setTimeout(() => {
          setStats(mockData)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED": return "bg-green-100 text-green-800"
      case "SHIPPED": return "bg-blue-100 text-blue-800"
      case "PROCESSING": return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED": return "bg-purple-100 text-purple-800"
      case "PENDING": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your e-commerce store</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Link href="/admin/products">
                <Button>
                  <Package className="h-4 w-4 mr-2" />
                  Products Management
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button variant="outline">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Manage Categories
                </Button>
              </Link>
              <Link href="/admin/custom-design/fabrics">
                <Button variant="outline">
                  <Palette className="h-4 w-4 mr-2" />
                  Fabrics
                </Button>
              </Link>
              <Link href="/admin/custom-design/designs">
                <Button variant="outline">
                  <Scissors className="h-4 w-4 mr-2" />
                  Blouse Designs
                </Button>
              </Link>
              <Link href="/admin/custom-design/models">
                <Button variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Blouse Models
                </Button>
              </Link>
              <Link href="/admin/salwar-kameez-models">
                <Button variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Salwar Kameez Models
                </Button>
              </Link>
              <Link href="/admin/custom-design/orders">
                <Button variant="outline">
                  <Ruler className="h-4 w-4 mr-2" />
                  Custom Orders
                </Button>
              </Link>
              <Link href="/admin/custom-design/appointments">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Appointments
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalSales)}</p>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12.5% from last month
                  </div>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xl">₹</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +8.2% from last month
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15.3% from last month
                  </div>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <div className="flex items-center text-sm text-red-600">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    -2.1% from last month
                  </div>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Design Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Custom Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCustomOrders}</p>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +25% from last month
                  </div>
                </div>
                <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Ruler className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Custom Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingCustomOrders}</p>
                  <div className="flex items-center text-sm text-yellow-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Requires attention
                  </div>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Scissors className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="inventory">Low Stock</TabsTrigger>
            <TabsTrigger value="custom">Custom Design</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customer}</p>
                        </div>
                        <div>
                          <p className="font-medium">{formatPrice(order.amount)}</p>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(product.revenue)}</p>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-red-600">
                          Only {product.stock} left (min: {product.minStock})
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Restock
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Design Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Custom Orders:</span>
                      <span className="font-semibold">{stats.totalCustomOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Pending Orders:</span>
                      <span className="font-semibold text-yellow-600">{stats.pendingCustomOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>In Production:</span>
                      <span className="font-semibold text-blue-600">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Ready for Delivery:</span>
                      <span className="font-semibold text-green-600">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Delivered:</span>
                      <span className="font-semibold text-green-600">17</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/admin/custom-design/orders">
                      <Button className="w-full justify-start" variant="outline">
                        <Ruler className="h-4 w-4 mr-2" />
                        Manage Custom Orders
                      </Button>
                    </Link>
                    <Link href="/admin/custom-design/fabrics">
                      <Button className="w-full justify-start" variant="outline">
                        <Palette className="h-4 w-4 mr-2" />
                        Manage Fabrics
                      </Button>
                    </Link>
                    <Link href="/admin/custom-design/designs">
                      <Button className="w-full justify-start" variant="outline">
                        <Scissors className="h-4 w-4 mr-2" />
                        Manage Blouse Designs
                      </Button>
                    </Link>
                    <Link href="/admin/custom-design/appointments">
                      <Button className="w-full justify-start" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Manage Appointments
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Sales chart would be displayed here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">User growth chart would be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}