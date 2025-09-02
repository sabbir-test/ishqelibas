"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface LehengaModel {
  id: string
  name: string
  designName: string
  description?: string
  price: number
  discount?: number
  finalPrice: number
  image?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function LehengaModelsPage() {
  const [models, setModels] = useState<LehengaModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<LehengaModel | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    designName: "",
    description: "",
    price: "",
    discount: "",
    image: "",
    isActive: true
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/lehenga-models", {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setModels(data.models || [])
      } else {
        throw new Error("Failed to fetch models")
      }
    } catch (error) {
      console.error("Error fetching models:", error)
      toast({
        title: "Error",
        description: "Failed to fetch lehenga models",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 10MB",
          variant: "destructive"
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setFormData({ ...formData, image: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.designName || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      const url = editingModel 
        ? `/api/admin/lehenga-models/${editingModel.id}`
        : "/api/admin/lehenga-models"
      
      const method = editingModel ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Lehenga model ${editingModel ? 'updated' : 'created'} successfully`
        })
        fetchModels()
        resetForm()
        setIsDialogOpen(false)
      } else {
        throw new Error("Failed to save model")
      }
    } catch (error) {
      console.error("Error saving model:", error)
      toast({
        title: "Error",
        description: "Failed to save lehenga model",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (model: LehengaModel) => {
    setEditingModel(model)
    setFormData({
      name: model.name,
      designName: model.designName,
      description: model.description || "",
      price: model.price.toString(),
      discount: model.discount?.toString() || "",
      image: model.image || "",
      isActive: model.isActive
    })
    setImagePreview(model.image || null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lehenga model?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/lehenga-models/${id}`, {
        method: "DELETE",
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Lehenga model deleted successfully"
        })
        fetchModels()
      } else {
        throw new Error("Failed to delete model")
      }
    } catch (error) {
      console.error("Error deleting model:", error)
      toast({
        title: "Error",
        description: "Failed to delete lehenga model",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      designName: "",
      description: "",
      price: "",
      discount: "",
      image: "",
      isActive: true
    })
    setEditingModel(null)
    setImagePreview(null)
  }

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.designName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lehenga models...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Lehenga Models Management</h1>
              <p className="text-gray-600">Manage lehenga models and designs</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Model
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingModel ? "Edit Lehenga Model" : "Add New Lehenga Model"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Model Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Elegant Bridal Lehenga"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="designName">Design Name *</Label>
                      <Input
                        id="designName"
                        value={formData.designName}
                        onChange={(e) => setFormData({ ...formData, designName: e.target.value })}
                        placeholder="e.g., Handwork & Zari Embroidery"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="Enter price"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        step="0.01"
                        max="100"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        placeholder="Enter discount percentage"
                      />
                    </div>
                    
                    {/* Image Upload Section */}
                    <div>
                      <Label>Model Image</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="imageUpload"
                          />
                          <Label htmlFor="imageUpload" className="cursor-pointer">
                            <Button type="button" variant="outline" asChild>
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Image
                              </span>
                            </Button>
                          </Label>
                          <span className="text-sm text-gray-500">Max 10MB</span>
                        </div>
                        
                        {imagePreview && (
                          <div className="relative">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              width={200}
                              height={150}
                              className="rounded-lg object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => {
                                setImagePreview(null)
                                setFormData({ ...formData, image: "" })
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image URL Alternative */}
                    <div>
                      <Label htmlFor="imageUrl">Or Image URL</Label>
                      <Input
                        id="imageUrl"
                        type="url"
                        value={formData.image}
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.value })
                          setImagePreview(e.target.value || null)
                        }}
                        placeholder="Enter image URL"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingModel ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Lehenga Models ({filteredModels.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Design Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Final Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      {model.image ? (
                        <Image
                          src={model.image}
                          alt={model.name}
                          width={50}
                          height={50}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>{model.designName}</TableCell>
                    <TableCell>₹{model.price}</TableCell>
                    <TableCell>₹{model.finalPrice}</TableCell>
                    <TableCell>
                      <Badge className={model.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {model.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
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
                          onClick={() => handleDelete(model.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredModels.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No lehenga models found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}