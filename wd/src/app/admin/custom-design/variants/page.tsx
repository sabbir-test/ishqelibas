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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Save,
  Scissors,
  ArrowLeft
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface BlouseDesignVariant {
  id: string
  name: string
  image?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  designId: string
  design: {
    id: string
    name: string
    type: "FRONT" | "BACK"
  }
}

interface BlouseDesign {
  id: string
  name: string
  type: "FRONT" | "BACK"
  isActive: boolean
}

export default function AdminVariantsPage() {
  const [variants, setVariants] = useState<BlouseDesignVariant[]>([])
  const [designs, setDesigns] = useState<BlouseDesign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDesign, setFilterDesign] = useState<string>("ALL")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<BlouseDesignVariant | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    description: "",
    isActive: true,
    designId: ""
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchVariants()
    fetchDesigns()
  }, [])

  const fetchVariants = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/blouse-design-variants")
      if (response.ok) {
        const data = await response.json()
        setVariants(data.variants)
      }
    } catch (error) {
      console.error("Error fetching variants:", error)
      toast({
        title: "Error",
        description: "Failed to fetch variants",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDesigns = async () => {
    try {
      const response = await fetch("/api/admin/blouse-designs")
      if (response.ok) {
        const data = await response.json()
        setDesigns(data.designs)
      }
    } catch (error) {
      console.error("Error fetching designs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch designs",
        variant: "destructive"
      })
    }
  }

  const filteredVariants = variants.filter(variant => {
    const matchesSearch = variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variant.design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (variant.description && variant.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDesign = filterDesign === "ALL" || variant.designId === filterDesign
    return matchesSearch && matchesDesign
  })

  const handleEdit = (variant: BlouseDesignVariant) => {
    setEditingVariant(variant)
    setFormData({
      name: variant.name,
      image: variant.image || "",
      description: variant.description || "",
      isActive: variant.isActive,
      designId: variant.designId
    })
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingVariant(null)
    setFormData({
      name: "",
      image: "",
      description: "",
      isActive: true,
      designId: designs.length > 0 ? designs[0].id : ""
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const url = editingVariant ? `/api/admin/blouse-design-variants/${editingVariant.id}` : "/api/admin/blouse-design-variants"
      const method = editingVariant ? "PUT" : "POST"
      
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
          description: editingVariant ? "Variant updated successfully" : "Variant created successfully"
        })
        setIsDialogOpen(false)
        fetchVariants()
      } else {
        throw new Error("Failed to save variant")
      }
    } catch (error) {
      console.error("Error saving variant:", error)
      toast({
        title: "Error",
        description: "Failed to save variant",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (variantId: string) => {
    if (!confirm("Are you sure you want to delete this variant?")) return

    try {
      const response = await fetch(`/api/admin/blouse-design-variants/${variantId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Variant deleted successfully"
        })
        fetchVariants()
      } else {
        throw new Error("Failed to delete variant")
      }
    } catch (error) {
      console.error("Error deleting variant:", error)
      toast({
        title: "Error",
        description: "Failed to delete variant",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (variantId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/blouse-design-variants/${variantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Variant ${isActive ? "activated" : "deactivated"} successfully`
        })
        fetchVariants()
      } else {
        throw new Error("Failed to toggle variant status")
      }
    } catch (error) {
      console.error("Error toggling variant status:", error)
      toast({
        title: "Error",
        description: "Failed to toggle variant status",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading variants...</p>
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
            <div className="flex items-center space-x-4">
              <Link href="/admin/custom-design/designs">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Design Variants Management</h1>
                <p className="text-gray-600">Manage different styles and models for blouse designs</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search variants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterDesign} onValueChange={setFilterDesign}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter by design" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Designs</SelectItem>
                  {designs.map((design) => (
                    <SelectItem key={design.id} value={design.id}>
                      {design.name} ({design.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Design Variants ({filteredVariants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant Name</TableHead>
                  <TableHead>Design</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVariants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.name}</TableCell>
                    <TableCell>{variant.design.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={variant.design.type === "FRONT" ? "default" : "secondary"}
                        className={variant.design.type === "FRONT" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}
                      >
                        {variant.design.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {variant.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={variant.isActive ? "default" : "secondary"}
                        className={variant.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {variant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(variant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(variant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(variant.id, !variant.isActive)}
                        >
                          {variant.isActive ? (
                            <Scissors className="h-4 w-4" />
                          ) : (
                            <Scissors className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(variant.id)}
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
              {editingVariant ? "Edit Variant" : "Add New Variant"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Variant Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Deep V-Neck"
              />
            </div>
            <div>
              <Label htmlFor="design">Parent Design</Label>
              <Select value={formData.designId} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, designId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select a design" />
                </SelectTrigger>
                <SelectContent>
                  {designs.map((design) => (
                    <SelectItem key={design.id} value={design.id}>
                      {design.name} ({design.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the variant..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/variant.jpg"
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