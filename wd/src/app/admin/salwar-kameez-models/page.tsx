"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  Save,
  Package,
  Image as ImageIcon,
  Percent
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import ImageUpload from "@/components/admin/ImageUpload"

interface SalwarKameezModel {
  id: string
  name: string
  designName: string
  image?: string
  description?: string
  price: number
  discount?: number
  finalPrice: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SalwarKameezModelsPage() {
  const [models, setModels] = useState<SalwarKameezModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [designFilter, setDesignFilter] = useState("")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<SalwarKameezModel | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    designName: "",
    image: "",
    description: "",
    price: "",
    discount: "",
    isActive: true
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/salwar-kameez-models", {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setModels(data.models)
      } else if (response.status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please login again",
          variant: "destructive"
        })
        window.location.href = '/admin'
      }
    } catch (error) {
      console.error("Error fetching models:", error)
      toast({
        title: "Error",
        description: "Failed to fetch models",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.designName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (model.description && model.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && model.isActive) ||
                         (statusFilter === "inactive" && !model.isActive)
    
    const matchesDesign = !designFilter ||
                         model.designName.toLowerCase().includes(designFilter.toLowerCase())
    
    const matchesPriceRange = (!priceRange.min || model.price >= parseFloat(priceRange.min)) &&
                            (!priceRange.max || model.price <= parseFloat(priceRange.max))
    
    return matchesSearch && matchesStatus && matchesDesign && matchesPriceRange
  })

  const handleEdit = (model: SalwarKameezModel) => {
    setEditingModel(model)
    setFormData({
      name: model.name,
      designName: model.designName,
      image: model.image || "",
      description: model.description || "",
      price: model.price.toString(),
      discount: model.discount?.toString() || "",
      isActive: model.isActive
    })
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingModel(null)
    setFormData({
      name: "",
      designName: "",
      image: "",
      description: "",
      price: "",
      discount: "",
      isActive: true
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const url = editingModel ? `/api/admin/salwar-kameez-models/${editingModel.id}` : "/api/admin/salwar-kameez-models"
      const method = editingModel ? "PUT" : "POST"
      
      const payload = {
        name: formData.name,
        designName: formData.designName,
        image: formData.image,
        description: formData.description,
        price: parseFloat(formData.price),
        discount: formData.discount ? parseFloat(formData.discount) : null,
        isActive: formData.isActive
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: editingModel ? "Model updated successfully" : "Model created successfully"
        })
        setIsDialogOpen(false)
        fetchModels()
      } else if (response.status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please login again",
          variant: "destructive"
        })
        window.location.href = '/admin'
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save model")
      }
    } catch (error) {
      console.error("Error saving model:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save model",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (modelId: string) => {
    if (!confirm("Are you sure you want to delete this model?")) return

    try {
      const response = await fetch(`/api/admin/salwar-kameez-models/${modelId}`, {
        method: "DELETE",
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Model deleted successfully"
        })
        fetchModels()
      } else if (response.status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please login again",
          variant: "destructive"
        })
        window.location.href = '/admin'
      } else {
        throw new Error("Failed to delete model")
      }
    } catch (error) {
      console.error("Error deleting model:", error)
      toast({
        title: "Error",
        description: "Failed to delete model",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (modelId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/salwar-kameez-models/${modelId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Model ${isActive ? "activated" : "deactivated"} successfully`
        })
        fetchModels()
      } else if (response.status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please login again",
          variant: "destructive"
        })
        window.location.href = '/admin'
      } else {
        throw new Error("Failed to toggle model status")
      }
    } catch (error) {
      console.error("Error toggling model status:", error)
      toast({
        title: "Error",
        description: "Failed to toggle model status",
        variant: "destructive"
      })
    }
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDesignFilter("")
    setPriceRange({ min: "", max: "" })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading models...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Salwar Kameez Models Management</h1>
              <p className="text-gray-600">Manage salwar kameez models and designs</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Model
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search models by name, design, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {(searchTerm || statusFilter !== "all" || designFilter || priceRange.min || priceRange.max) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                Clear All Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Design Name</Label>
              <Input
                placeholder="Filter by design name..."
                value={designFilter}
                onChange={(e) => setDesignFilter(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Price Range (INR)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="flex-1"
                />
                <span className="flex items-center text-gray-500">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Salwar Kameez Models ({filteredModels.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Design Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Final Price</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>{model.designName}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-400 text-sm font-medium">INR</span>
                        <span className="font-medium">{formatPrice(model.price)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {model.discount ? (
                        <div className="flex items-center space-x-1">
                          <Percent className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">{model.discount}%</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="text-green-600 text-sm font-medium">INR</span>
                        <span className="font-bold text-green-600">{formatPrice(model.finalPrice)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {model.image ? (
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={model.isActive ? "default" : "secondary"}
                        className={model.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {model.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(model.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(model)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(model.id, !model.isActive)}
                        >
                          <Eye className={`h-4 w-4 ${model.isActive ? '' : 'text-gray-400'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(model.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingModel ? "Edit Model" : "Add New Salwar Kameez Model"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Model Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Elegant Anarkali Set"
              />
            </div>

            <div>
              <Label htmlFor="designName">Design Name *</Label>
              <Input
                id="designName"
                value={formData.designName}
                onChange={(e) => setFormData(prev => ({ ...prev, designName: e.target.value }))}
                placeholder="e.g., Traditional Embroidered"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">INR</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="discount"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                    placeholder="0"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the model..."
                rows={3}
              />
            </div>

            <div>
              <Label>Model Image</Label>
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                onRemove={() => setFormData(prev => ({ ...prev, image: "" }))}
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

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!formData.name || !formData.designName || !formData.price || parseFloat(formData.price) <= 0}
              >
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