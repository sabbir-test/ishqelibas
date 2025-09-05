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
  Eye,
  Save,
  Scissors,
  Layers
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
}

interface BlouseDesignCategory {
  id: string
  name: string
  description?: string
  image?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface BlouseDesign {
  id: string
  name: string
  type: "FRONT" | "BACK"
  image?: string
  description?: string
  stitchCost: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  categoryId?: string | null
  category?: BlouseDesignCategory | null
  variants?: BlouseDesignVariant[]
}

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<BlouseDesign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("ALL")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDesign, setEditingDesign] = useState<BlouseDesign | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    description: "",
    stitchCost: "",
    isActive: true
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchDesigns()
  }, [])

  const fetchDesigns = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/blouse-designs?includeVariants=true&includeCategories=true", {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setDesigns(data.designs)
      } else if (response.status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please login again",
          variant: "destructive"
        })
        window.location.href = '/login'
      } else {
        throw new Error("Failed to fetch designs")
      }
    } catch (error) {
      console.error("Error fetching designs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch designs",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (design.description && design.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === "ALL" || design.type === filterType
    return matchesSearch && matchesType
  })

  const handleEdit = (design: BlouseDesign) => {
    setEditingDesign(design)
    setFormData({
      name: design.name,
      image: design.image || "",
      description: design.description || "",
      stitchCost: design.stitchCost.toString(),
      isActive: design.isActive
    })
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingDesign(null)
    setFormData({
      name: "",
      image: "",
      description: "",
      stitchCost: "",
      isActive: true
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const url = editingDesign ? `/api/admin/blouse-designs/${editingDesign.id}` : "/api/admin/blouse-designs"
      const method = editingDesign ? "PUT" : "POST"
      
      const payload = {
        name: formData.name,
        image: formData.image || null,
        description: formData.description || null,
        stitchCost: parseFloat(formData.stitchCost) || 0,
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
          description: editingDesign ? "Design updated successfully" : "Design created successfully"
        })
        setIsDialogOpen(false)
        fetchDesigns()
      } else if (response.status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please login again",
          variant: "destructive"
        })
        window.location.href = '/login'
      } else {
        throw new Error("Failed to save design")
      }
    } catch (error) {
      console.error("Error saving design:", error)
      toast({
        title: "Error",
        description: "Failed to save design",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (designId: string) => {
    if (!confirm("Are you sure you want to delete this design?")) return

    try {
      const response = await fetch(`/api/admin/blouse-designs/${designId}`, {
        method: "DELETE",
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Design deleted successfully"
        })
        fetchDesigns()
      } else if (response.status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please login again",
          variant: "destructive"
        })
        window.location.href = '/login'
      } else {
        throw new Error("Failed to delete design")
      }
    } catch (error) {
      console.error("Error deleting design:", error)
      toast({
        title: "Error",
        description: "Failed to delete design",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (designId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/blouse-designs/${designId}/toggle`, {
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
          description: `Design ${isActive ? "activated" : "deactivated"} successfully`
        })
        fetchDesigns()
      } else if (response.status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please login again",
          variant: "destructive"
        })
        window.location.href = '/login'
      } else {
        throw new Error("Failed to toggle design status")
      }
    } catch (error) {
      console.error("Error toggling design status:", error)
      toast({
        title: "Error",
        description: "Failed to toggle design status",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading designs...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Blouse Designs Management</h1>
              <p className="text-gray-600">Manage front and back designs for custom blouses</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search designs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="FRONT">Front Designs</SelectItem>
                  <SelectItem value="BACK">Back Designs</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Design
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Blouse Designs ({filteredDesigns.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Stitch Cost</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDesigns.map((design) => (
                  <TableRow key={design.id}>
                    <TableCell className="font-medium">{design.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        ₹{design.stitchCost.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {design.description || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {design.variants?.length || 0} styles
                        </Badge>
                        <Link href={`/admin/custom-design/variants?designId=${design.id}`}>
                          <Button variant="ghost" size="sm">
                            <Layers className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={design.isActive ? "default" : "secondary"}
                        className={design.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {design.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(design.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(design)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(design.id, !design.isActive)}
                        >
                          {design.isActive ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(design.id)}
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
              {editingDesign ? "Edit Design" : "Add New Design"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Design Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Classic Round Neck"
              />
            </div>
            <div>
              <Label htmlFor="stitchCost">Stitch Cost (₹)</Label>
              <Input
                id="stitchCost"
                type="number"
                min="0"
                step="0.01"
                value={formData.stitchCost}
                onChange={(e) => setFormData(prev => ({ ...prev, stitchCost: e.target.value }))}
                placeholder="e.g., 299"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the design..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/design.jpg"
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