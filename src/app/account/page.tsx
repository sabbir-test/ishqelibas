"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  ShoppingBag,
  Heart,
  CreditCard,
  Truck,
  Edit,
  Save,
  IndianRupee
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  items: number
}

interface Address {
  id: string
  type: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export default function AccountPage() {
  const { state: authState } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  })

  useEffect(() => {
    if (authState.user) {
      setFormData({
        name: authState.user.name || "",
        email: authState.user.email || "",
        phone: authState.user.phone || ""
      })
      loadAccountData()
    }
  }, [authState.user])

  const loadAccountData = async () => {
    setIsLoading(true)
    try {
      // Load orders
      const ordersResponse = await fetch('/api/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders || [])
      }

      // Load addresses (mock data for now)
      setAddresses([
        {
          id: "1",
          type: "Home",
          name: authState.user?.name || "User",
          phone: authState.user?.phone || "+91 98765 43210",
          address: "123 Fashion Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          isDefault: true
        }
      ])
    } catch (error) {
      console.error('Error loading account data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsEditing(false)
        // Update auth context if needed
      }
    } catch (error) {
      console.error('Error updating profile:', error)
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

  if (!authState.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your account.</p>
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
          <p className="text-gray-600 text-lg">Loading account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Manage your profile, orders, and preferences</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-10 w-10 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {authState.user.name || "User"}
                  </h3>
                  <p className="text-sm text-gray-500">{authState.user.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {authState.user.role}
                  </Badge>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Link href="/account" className="block">
                    <Button variant="outline" className="w-full justify-start bg-pink-50 text-pink-700 border-pink-200">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Link href="/orders" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      My Orders
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Addresses
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Personal Information</CardTitle>
                      {!isEditing ? (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <Button onClick={handleSaveProfile}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Account Type</label>
                        <div className="relative">
                          <Badge variant="secondary" className="w-full justify-start py-2">
                            {authState.user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-3">Security</h4>
                      <Button variant="outline" className="w-full justify-start">
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Orders</CardTitle>
                      <Link href="/orders">
                        <Button variant="outline">
                          View All Orders
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <p className="text-gray-500 text-lg mb-2">No orders yet</p>
                        <p className="text-gray-400 text-sm mb-6">Start shopping to see your orders here</p>
                        <Link href="/shop">
                          <Button className="bg-pink-600 hover:bg-pink-700">
                            Start Shopping
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">Order #{order.orderNumber}</h4>
                                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                {order.items} items • <IndianRupee className="inline h-3 w-3" />{order.total}
                              </div>
                              <div className="flex gap-2">
                                <Link href={`/orders`}>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                                {['processing', 'shipped'].includes(order.status.toLowerCase()) && (
                                  <Button variant="outline" size="sm">
                                    <Truck className="h-3 w-3 mr-1" />
                                    Track
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Saved Addresses</CardTitle>
                      <Button>
                        <MapPin className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-4 relative">
                          {address.isDefault && (
                            <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">
                              Default
                            </Badge>
                          )}
                          <h4 className="font-medium text-gray-900 mb-2">{address.type}</h4>
                          <p className="text-sm text-gray-600 mb-1">{address.name}</p>
                          <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                          <p className="text-sm text-gray-600">{address.address}</p>
                          <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                          <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm">Edit</Button>
                            {!address.isDefault && (
                              <Button variant="outline" size="sm">Set Default</Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm text-gray-700">Email notifications for orders</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm text-gray-700">SMS notifications for delivery</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm text-gray-700">Promotional emails</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Payment Methods</h4>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">Credit/Debit Cards</p>
                              <p className="text-sm text-gray-500">Saved cards will appear here</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Add Card</Button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-3 text-red-600">Danger Zone</h4>
                      <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}