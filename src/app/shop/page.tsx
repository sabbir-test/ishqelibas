"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Heart,
  ShoppingCart,
  Star,
  IndianRupee
} from "lucide-react"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import ProductModal from "@/components/product/ProductModal"

interface Product {
  id: string
  name: string
  description: string
  price: number
  finalPrice: number
  images: string
  category: string
  sku: string
  rating: number
  reviewCount: number
  inStock: boolean
  sizes?: string
  colors?: string
}

interface Category {
  id: string
  name: string
}

export default function ShopPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "all")
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [categories, setCategories] = useState<string[]>(["all"])
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addItem } = useCart()
  const { state: authState } = useAuth()

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handle URL parameter changes
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam && categoryParam !== selectedCategory && initialLoadComplete) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams, initialLoadComplete])

  useEffect(() => {
    const loadData = async () => {
      console.log('Shop page mounted - loading data')
      console.log('Initial category from URL:', searchParams.get('category'))
      setLoading(true)
      setError(null)
      
      try {
        // Load categories
        const categoriesResponse = await fetch('/api/categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!categoriesResponse.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesResponse.status}`)
        }
        
        const categoriesData = await categoriesResponse.json()
        if (categoriesData.categories) {
          const categoryNames = categoriesData.categories.map((cat: Category) => cat.name)
          setCategories(["all", ...categoryNames])
          console.log('Categories loaded:', categoryNames.length)
        } else {
          throw new Error('Invalid categories data format')
        }
        
        // Load products with initial filters
        const categoryParam = searchParams.get('category')
        const params = new URLSearchParams({
          search: "",
          category: categoryParam || "all",
          minPrice: "0",
          maxPrice: "10000",
          sortBy: "featured",
          limit: '50'
        })
        
        console.log('Initial products API call with params:', Object.fromEntries(params))
        
        const productsResponse = await fetch(`/api/products?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch products: ${productsResponse.status}`)
        }
        
        const productsData = await productsResponse.json()
        if (productsData.products) {
          setProducts(productsData.products)
          console.log('Products loaded:', productsData.products.length)
          console.log('Sample product:', productsData.products[0])
        } else {
          throw new Error('Invalid products data format')
        }
        
      } catch (error) {
        console.error('Error loading data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setLoading(false)
        setInitialLoadComplete(true)
      }
    }
    
    loadData()
  }, [])

  const fetchFilteredProducts = async () => {
    console.log('Fetching filtered products:', { searchQuery: debouncedSearch, selectedCategory, sortBy, priceRange })
    // Don't show loading state for filter updates to avoid flickering
    // setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        category: selectedCategory,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        sortBy: sortBy,
        limit: '50'
      })
      
      const response = await fetch(`/api/products?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.products) {
        setProducts(data.products)
        console.log('Filtered products loaded:', data.products.length)
        console.log('Sample filtered product:', data.products[0])
      } else {
        throw new Error('Invalid products data format')
      }
    } catch (error) {
      console.error('Error fetching filtered products:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch products')
    } finally {
      // setLoading(false)
    }
  }

  useEffect(() => {
    if (initialLoadComplete) { // Only run filters after initial load is complete
      // Only fetch if something actually changed from the initial load
      const categoryParam = searchParams.get('category')
      const shouldFetch = 
        debouncedSearch !== "" || 
        (categoryParam && categoryParam !== "all") ||
        sortBy !== "featured" ||
        priceRange[0] !== 0 || 
        priceRange[1] !== 10000
      
      if (shouldFetch) {
        fetchFilteredProducts()
      }
    }
  }, [debouncedSearch, selectedCategory, sortBy, priceRange, initialLoadComplete])

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const getImageSrc = () => {
      try {
        if (!product.images || product.images.trim() === '') {
          return "/api/placeholder/300/400"
        }
        
        // Try to parse as JSON array
        const parsedImages = JSON.parse(product.images)
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          const firstImage = parsedImages[0]
          if (typeof firstImage === 'string' && firstImage.trim() !== '') {
            return firstImage
          }
        }
        
        // If parsing fails or no valid image found, return placeholder
        return "/api/placeholder/300/400"
      } catch (error) {
        // If JSON parsing fails, treat as direct image URL
        if (product.images && product.images.trim() !== '') {
          return product.images
        }
        return "/api/placeholder/300/400"
      }
    }
    
    const imageSrc = getImageSrc()
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          {imageSrc && imageSrc.trim() !== "" ? (
            <Image
              src={imageSrc}
              alt={product.name || "Product image"}
              width={400}
              height={300}
              className="w-full h-64 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/api/placeholder/300/400"
              }}
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="secondary" className="text-white bg-red-600">
              Out of Stock
            </Badge>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-pink-50"
        >
          <Heart className="h-4 w-4" />
        </Button>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{product.name || "Untitled Product"}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description || "No description available"}</p>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            ({product.reviewCount})
          </span>
        </div>
          
          {/* Size and Color indicators */}
          {(product.sizes || product.colors) && (
            <div className="mb-3">
              {product.sizes && (
                <div className="text-xs text-gray-500 mb-1">
                  Sizes: {JSON.parse(product.sizes).slice(0, 3).join(", ")}
                  {JSON.parse(product.sizes).length > 3 && "..."}
                </div>
              )}
              {product.colors && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Colors:</span>
                  <div className="flex gap-1">
                    {JSON.parse(product.colors).slice(0, 3).map((color: string, index: number) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    {product.colors.length > 3 && (
                      <span className="text-xs text-gray-400">+{product.colors.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
          <div className="flex items-center">
            <IndianRupee className="h-4 w-4" />
            <span className="text-xl font-bold">{product.price}</span>
          </div>
          <Button
            onClick={() => handleProductClick(product)}
            disabled={!product.inStock}
            className="bg-pink-600 hover:bg-pink-700"
          >
            {!product.inStock ? 'Out of Stock' : 'Quick Add'}
          </Button>
        </div>
      </div>
    </div>
  )

  const ProductList = ({ product }: { product: Product }) => {
    const getImageSrc = () => {
      try {
        if (!product.images || product.images.trim() === '') {
          return "/api/placeholder/300/400"
        }
        
        // Try to parse as JSON array
        const parsedImages = JSON.parse(product.images)
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          const firstImage = parsedImages[0]
          if (typeof firstImage === 'string' && firstImage.trim() !== '') {
            return firstImage
          }
        }
        
        // If parsing fails or no valid image found, return placeholder
        return "/api/placeholder/300/400"
      } catch (error) {
        // If JSON parsing fails, treat as direct image URL
        if (product.images && product.images.trim() !== '') {
          return product.images
        }
        return "/api/placeholder/300/400"
      }
    }
    
    const imageSrc = getImageSrc()
    
    return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        <div className="relative flex-shrink-0">
          {imageSrc && imageSrc.trim() !== "" ? (
            <Image
              src={imageSrc}
              alt={product.name || "Product image"}
              width={200}
              height={200}
              className="w-48 h-48 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/api/placeholder/300/400"
              }}
            />
          ) : (
            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <Badge variant="secondary" className="text-white bg-red-600">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-xl mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-3">{product.description}</p>
          
          {/* Size and Color indicators */}
          {(product.sizes || product.colors) && (
            <div className="mb-3">
              {product.sizes && (
                <div className="text-sm text-gray-500 mb-1">
                  Available Sizes: {JSON.parse(product.sizes).join(", ")}
                </div>
              )}
              {product.colors && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Available Colors:</span>
                  <div className="flex gap-1">
                    {JSON.parse(product.colors).map((color: string, index: number) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">
              ({product.reviewCount} reviews)
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IndianRupee className="h-5 w-5" />
              <span className="text-2xl font-bold">{product.price}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-pink-50"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleProductClick(product)}
                disabled={!product.inStock}
                className="bg-pink-600 hover:bg-pink-700"
              >
                {!product.inStock ? 'Out of Stock' : 'Quick Add'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Refresh Page
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setError(null)
                setLoading(true)
                setTimeout(() => {
                  const loadData = async () => {
                    try {
                      const categoriesResponse = await fetch('/api/categories')
                      const categoriesData = await categoriesResponse.json()
                      if (categoriesData.categories) {
                        const categoryNames = categoriesData.categories.map((cat: Category) => cat.name)
                        setCategories(["all", ...categoryNames])
                      }
                      
                      const productsResponse = await fetch('/api/products')
                      const productsData = await productsResponse.json()
                      if (productsData.products) {
                        setProducts(productsData.products)
                      }
                      setLoading(false)
                    } catch (error) {
                      console.error('Error retrying:', error)
                      setError('Failed to retry. Please refresh the page.')
                      setLoading(false)
                    }
                  }
                  loadData()
                }, 1000)
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
          <p className="text-gray-600 mt-2">Discover our latest collection of ethnic wear</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div className="flex-1">
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      category && category.trim() !== "" && (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
                        </SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setSortBy("featured")
                  setPriceRange([0, 10000])
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Header with view toggle */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {products.length} products
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products */}
            {console.log('Rendering - loading:', loading, 'products.length:', products.length, 'initialLoadComplete:', initialLoadComplete)}
            {!initialLoadComplete ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg mb-2">No products found matching your criteria.</p>
                <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search terms</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setSortBy("featured")
                    setPriceRange([0, 10000])
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }>
                {products.map((product) =>
                  viewMode === "grid" ? (
                    <ProductCard key={product.id} product={product} />
                  ) : (
                    <ProductList key={product.id} product={product} />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
}