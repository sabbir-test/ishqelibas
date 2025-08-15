"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  Upload,
  Save,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Fabric {
  id: string
  name: string
  type: string
  color: string
  image?: string
  pricePerMeter: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminFabricsPage() {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFabric, setEditingFabric] = useState<Fabric | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    color: "",
    image: "",
    pricePerMeter: 0,
    isActive: true
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchFabrics()
  }, [])

  const fetchFabrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/fabrics")
      if (response.ok) {
        const data = await response.json()
        setFabrics(data.fabrics)
      }
    } catch (error) {
      console.error("Error fetching fabrics:", error)
      toast({
        title: "Error",
        description: "Failed to fetch fabrics",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredFabrics = fabrics.filter(fabric =>
    fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabric.color.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (fabric: Fabric) => {
    setEditingFabric(fabric)
    setFormData({
      name: fabric.name,
      type: fabric.type,
      color: fabric.color,
      image: fabric.image || "",
      pricePerMeter: fabric.pricePerMeter,
      isActive: fabric.isActive
    })
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingFabric(null)
    setFormData({
      name: "",
      type: "",
      color: "",
      image: "",
      pricePerMeter: 0,
      isActive: true
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const url = editingFabric ? `/api/admin/fabrics/${editingFabric.id}` : "/api/admin/fabrics"
      const method = editingFabric ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: editingFabric ? "Fabric updated successfully" : "Fabric created successfully"
        })
        setIsDialogOpen(false)
        fetchFabrics()
      } else {
        throw new Error("Failed to save fabric")
      }
    } catch (error) {
      console.error("Error saving fabric:", error)
      toast({
        title: "Error",
        description: "Failed to save fabric",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (fabricId: string) => {
    if (!confirm("Are you sure you want to delete this fabric?")) return

    try {
      const response = await fetch(`/api/admin/fabrics/${fabricId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Fabric deleted successfully"
        })
        fetchFabrics()
      } else {
        throw new Error("Failed to delete fabric")
      }
    } catch (error) {
      console.error("Error deleting fabric:", error)
      toast({
        title: "Error",
        description: "Failed to delete fabric",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (fabricId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/fabrics/${fabricId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Fabric ${isActive ? "activated" : "deactivated"} successfully`
        })
        fetchFabrics()
      } else {
        throw new Error("Failed to toggle fabric status")
      }
    } catch (error) {
      console.error("Error toggling fabric status:", error)
      toast({
        title: "Error",
        description: "Failed to toggle fabric status",
        variant: "destructive"
      })
    }
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fabrics...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Fabric Management</h1>
              <p className="text-gray-600">Manage fabrics for custom blouse designs</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search fabrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fabric
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Fabrics ({filteredFabrics.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Price/Meter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFabrics.map((fabric) => (
                  <TableRow key={fabric.id}>
                    <TableCell className="font-medium">{fabric.name}</TableCell>
                    <TableCell>{fabric.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: fabric.color.toLowerCase() }}
                        />
                        <span>{fabric.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(fabric.pricePerMeter)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={fabric.isActive ? "default" : "secondary"}
                        className={fabric.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {fabric.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(fabric.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(fabric)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(fabric.id, !fabric.isActive)}
                        >
                          {fabric.isActive ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(fabric.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFabric ? "Edit Fabric" : "Add New Fabric"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Fabric Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Pure Silk"
              />
            </div>
            <div>
              <Label htmlFor="type">Fabric Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                placeholder="e.g., Silk, Cotton, Georgette"
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="e.g., Red, Blue, Pink"
              />
            </div>
            <div>
              <Label htmlFor="pricePerMeter">Price per Meter (₹)</Label>
              <Input
                id="pricePerMeter"
                type="number"
                value={formData.pricePerMeter}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerMeter: parseFloat(e.target.value) || 0 }))}
                placeholder="1200"
              />
            </div>
            <div>
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/fabric.jpg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}