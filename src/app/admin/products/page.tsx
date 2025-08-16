"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  Image as ImageIcon,
  Tag,
  Box,
  Star
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  discount?: number
  finalPrice: number
  stock: number
  sku: string
  images?: string
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  category: {
    name: string
  }
}

interface ProductFormData {
  name: string
  description?: string
  price: number
  discount?: number
  stock: number
  sku: string
  images?: string
  categoryId: string
  isFeatured: boolean
}

interface Category {
  id: string
  name: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [sortBy, setSortBy] = useState("createdAt-desc")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [totalProducts, setTotalProducts] = useState(0)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    discount: 0,
    stock: 0,
    sku: "",
    images: "",
    categoryId: "",
    isFeatured: false
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts()
    }, 300) // 300ms delay

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory, priceRange, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append("search", searchTerm.trim())
      if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory)
      if (priceRange.min) params.append("minPrice", priceRange.min)
      if (priceRange.max) params.append("maxPrice", priceRange.max)
      params.append("sortBy", sortBy)

      const response = await fetch(`/api/admin/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
        setTotalProducts(data.pagination?.total || data.products.length)
      } else {
        console.error("Failed to fetch products:", response.status)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (!formData.name.trim()) {
      alert("Error: Product name is required.")
      return
    }
    
    if (!formData.sku.trim()) {
      alert("Error: SKU is required.")
      return
    }
    
    if (formData.price <= 0) {
      alert("Error: Price must be greater than 0.")
      return
    }
    
    if (formData.stock < 0) {
      alert("Error: Stock quantity cannot be negative.")
      return
    }
    
    if (!formData.categoryId) {
      alert("Error: Please select a category.")
      return
    }
    
    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products"
      const method = editingProduct ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        await fetchProducts()
        setIsDialogOpen(false)
        resetForm()
      } else {
        // Handle specific error messages
        if (data.error && data.error.includes("Unique constraint failed") && data.error.includes("sku")) {
          alert("Error: A product with this SKU already exists. Please use a different SKU.")
        } else if (data.error && data.error.includes("Missing required fields")) {
          alert("Error: Please fill in all required fields (Name, Price, Category, Stock, and SKU).")
        } else {
          alert(`Error: ${data.error || "Failed to save product"}`)
        }
      }
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Network error: Failed to connect to the server. Please try again.")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      discount: product.discount || 0,
      stock: product.stock,
      sku: product.sku,
      images: product.images || "",
      categoryId: "", // This would need to be fetched separately
      isFeatured: product.isFeatured
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product? This will also remove it from all users' carts.")) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: "DELETE"
        })
        if (response.ok) {
          const data = await response.json()
          if (data.cartItemsRemoved) {
            alert("Product deleted successfully and removed from all carts.")
          } else {
            alert("Product deleted successfully.")
          }
          await fetchProducts()
        } else {
          const errorData = await response.json()
          alert(`Error: ${errorData.error || "Failed to delete product"}`)
        }
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Network error: Failed to connect to the server. Please try again.")
      }
    }
  }

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    const action = currentStatus ? "deactivate" : "activate"
    const cartAction = currentStatus ? "remove it from all users' carts" : ""
    
    if (confirm(`Are you sure you want to ${action} this product?${cartAction ? " This will " + cartAction + "." : ""}`)) {
      try {
        const response = await fetch(`/api/admin/products/${productId}/toggle`, {
          method: "PATCH"
        })
        if (response.ok) {
          const data = await response.json()
          if (data.cartItemsRemoved) {
            alert(`Product ${action}d successfully and removed from all carts.`)
          } else {
            alert(`Product ${action}d successfully.`)
          }
          await fetchProducts()
        } else {
          const errorData = await response.json()
          alert(`Error: ${errorData.error || "Failed to ${action} product"}`)
        }
      } catch (error) {
        console.error(`Error ${action}ing product:`, error)
        alert(`Network error: Failed to connect to the server. Please try again.`)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      discount: 0,
      stock: 0,
      sku: "",
      images: "",
      categoryId: "",
      isFeatured: false
    })
    setEditingProduct(null)
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
              <Link href="/admin">
                <Button variant="outline">
                  ← Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
                <p className="text-gray-600">Add, edit, and manage your product catalog</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduct 
                      ? "Update the product information below."
                      : "Fill in the details to add a new product to your catalog."
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU *</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        required
                        placeholder="e.g., PROD-001"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        SKU must be unique (e.g., PROD-001, ITEM-123)
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock Quantity *</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <div className="flex gap-2">
                        <Select value={formData.categoryId} onValueChange={(value) => setFormData({...formData, categoryId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Link href="/admin/categories" target="_blank">
                          <Button variant="outline" size="sm" className="whitespace-nowrap">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Category
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="images">Images (JSON array)</Label>
                      <Input
                        id="images"
                        value={formData.images}
                        onChange={(e) => setFormData({...formData, images: e.target.value})}
                        placeholder='["/image1.jpg", "/image2.jpg"]'
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="isFeatured">Featured Product</Label>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products by name, description, or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Category Select */}
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By Select */}
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
                  <SelectItem value="stock-asc">Stock (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Min price"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex items-center text-gray-500">to</div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Max price"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPriceRange({ min: "", max: "" })}
                    className="px-3"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {(searchTerm || selectedCategory || priceRange.min || priceRange.max || sortBy !== "createdAt-desc") && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 font-medium">
                  Showing {products.length} of {totalProducts} products
                </p>
                <div className="text-blue-600 text-sm mt-1 space-y-1">
                  {searchTerm && <p>Search: "{searchTerm}"</p>}
                  {selectedCategory && selectedCategory !== "all" && (
                    <p>Category: {categories.find(c => c.id === selectedCategory)?.name}</p>
                  )}
                  {(priceRange.min || priceRange.max) && (
                    <p>Price Range: {priceRange.min ? `₹${priceRange.min}` : "₹0"} - {priceRange.max ? `₹${priceRange.max}` : "∞"}</p>
                  )}
                  {sortBy !== "createdAt-desc" && (
                    <p>Sort By: {sortBy.split("-")[0] === "createdAt" ? "Date" : sortBy.split("-")[0] === "name" ? "Name" : sortBy.split("-")[0] === "price" ? "Price" : "Stock"} ({sortBy.split("-")[1] === "asc" ? "Ascending" : "Descending"})</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("")
                  setPriceRange({ min: "", max: "" })
                  setSortBy("createdAt-desc")
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            let mainImage = "/api/placeholder/300/400"
            
            try {
              if (product.images && typeof product.images === 'string') {
                // Trim whitespace and check if it's not empty
                const trimmedImages = product.images.trim()
                if (trimmedImages) {
                  // Try to parse JSON
                  const parsedImages = JSON.parse(trimmedImages)
                  
                  if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                    const firstImage = parsedImages[0]
                    
                    // Validate the first image URL
                    if (typeof firstImage === 'string') {
                      const cleanImage = firstImage.trim()
                      
                      // Check if it's a valid URL format
                      if (cleanImage && 
                          (cleanImage.startsWith('/') || 
                           cleanImage.startsWith('http://') || 
                           cleanImage.startsWith('https://'))) {
                        // Additional validation for URL format
                        try {
                          new URL(cleanImage.startsWith('/') ? `http://localhost${cleanImage}` : cleanImage)
                          mainImage = cleanImage
                        } catch (urlError) {
                          console.warn(`Invalid URL for product ${product.id}:`, cleanImage)
                        }
                      } else {
                        console.warn(`Invalid image URL format for product ${product.id}:`, cleanImage)
                      }
                    } else {
                      console.warn(`First image is not a string for product ${product.id}:`, firstImage)
                    }
                  } else {
                    console.warn(`Parsed images is not an array or empty for product ${product.id}:`, parsedImages)
                  }
                } else {
                  console.warn(`Empty images string for product ${product.id}`)
                }
              } else {
                console.warn(`No images or images is not a string for product ${product.id}:`, product.images)
              }
            } catch (error) {
              console.error(`Error parsing images for product ${product.id}:`, error)
              console.warn(`Raw image data for product ${product.id}:`, product.images)
            }
            
            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isFeatured && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {product.discount && (
                      <Badge className="bg-red-500 hover:bg-red-600">
                        {product.discount}% OFF
                      </Badge>
                    )}
                    {!product.isActive && (
                      <Badge className="bg-gray-500 hover:bg-gray-600">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {product.category.name}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    SKU: {product.sku}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.finalPrice)}
                    </span>
                    {product.discount && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Box className="h-4 w-4" />
                      <span>Stock: {product.stock}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${
                      product.stock < 10 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      <Package className="h-4 w-4" />
                      <span>{product.stock < 10 ? 'Low Stock' : 'In Stock'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant={product.isActive ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleActive(product.id, product.isActive)}
                      className={product.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                    >
                      {product.isActive ? (
                        <>
                          <Package className="h-4 w-4 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4 mr-1" />
                          Show
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory 
                ? "Try adjusting your search or filters."
                : "Get started by adding your first product."
              }
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  )
}