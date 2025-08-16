"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Star, ShoppingCart, IndianRupee, X } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"

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
  sizes?: string[]
  colors?: string[]
  // Front and back design pricing
  frontDesignName?: string
  frontDesignPrice?: number
  backDesignName?: string
  backDesignPrice?: number
}

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const { addItem } = useCart()

  if (!product) return null

  const getImageSrc = () => {
    try {
      if (!product.images || product.images.trim() === '') {
        return "/api/placeholder/400/500"
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
      return "/api/placeholder/400/500"
    } catch (error) {
      // If JSON parsing fails, treat as direct image URL
      if (product.images && product.images.trim() !== '') {
        return product.images
      }
      return "/api/placeholder/400/500"
    }
  }

  const parseSizes = (): string[] => {
    if (!product.sizes) return []
    try {
      const parsed = JSON.parse(product.sizes)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const parseColors = (): string[] => {
    if (!product.colors) return []
    try {
      const parsed = JSON.parse(product.colors)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const availableSizes = parseSizes()
  const availableColors = parseColors()
  const imageSrc = getImageSrc()

  const handleAddToCart = async () => {
    if (!product.inStock) return
    
    // Validate selection if options are available
    if (availableSizes.length > 0 && !selectedSize) {
      alert("Please select a size")
      return
    }
    
    if (availableColors.length > 0 && !selectedColor) {
      alert("Please select a color")
      return
    }

    setAddingToCart(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        finalPrice: product.finalPrice,
        image: product.images,
        sku: product.sku,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        frontDesignName: product.frontDesignName,
        frontDesignPrice: product.frontDesignPrice,
        backDesignName: product.backDesignName,
        backDesignPrice: product.backDesignPrice
      })
      
      // Reset selections and close modal
      setSelectedSize("")
      setSelectedColor("")
      setQuantity(1)
      onClose()
    } catch (error) {
      console.error('Error adding product to cart:', error)
      alert('Failed to add product to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const getColorSwatch = (color: string) => {
    // Simple color mapping for common colors
    const colorMap: Record<string, string> = {
      'red': '#ef4444',
      'blue': '#3b82f6',
      'green': '#22c55e',
      'yellow': '#eab308',
      'black': '#000000',
      'white': '#ffffff',
      'gray': '#6b7280',
      'pink': '#ec4899',
      'purple': '#a855f7',
      'orange': '#f97316',
      'brown': '#92400e',
      'navy': '#1e3a8a',
      'beige': '#f5f5dc',
      'cream': '#fffdd0',
      'maroon': '#800000',
      'teal': '#008080'
    }
    
    return colorMap[color.toLowerCase()] || color
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="relative">
            {imageSrc && imageSrc.trim() !== "" ? (
              <Image
                src={imageSrc}
                alt={product.name || "Product image"}
                width={500}
                height={600}
                className="w-full h-auto rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/api/placeholder/400/500"
                }}
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <Badge variant="secondary" className="text-white bg-red-600 text-lg px-4 py-2">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            {/* Price and Rating */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5" />
                  <span className="text-3xl font-bold">{product.finalPrice}</span>
                </div>
                {product.finalPrice !== product.price && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      <span className="text-lg text-gray-500 line-through">{product.price}</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      Save {Math.round((1 - product.finalPrice / product.price) * 100)}%
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Design Pricing Breakdown */}
              {(product.frontDesignName || product.backDesignName) && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Design Pricing Breakdown:</h4>
                  <div className="space-y-1 text-sm">
                    {product.frontDesignName && (
                      <div className="flex justify-between">
                        <span>Front Design ({product.frontDesignName}):</span>
                        <span className="font-medium">₹{product.frontDesignPrice}</span>
                      </div>
                    )}
                    {product.backDesignName && (
                      <div className="flex justify-between">
                        <span>Back Design ({product.backDesignName}):</span>
                        <span className="font-medium">₹{product.backDesignPrice}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-gray-200 font-medium">
                      <span>Total Design Price:</span>
                      <span>₹{(product.frontDesignPrice || 0) + (product.backDesignPrice || 0)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
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
                <span className="text-sm text-gray-500">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{product.description || "No description available"}</p>
            </div>
            
            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Size</h3>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <RadioGroupItem value={size} id={`size-${size}`} />
                        <Label
                          htmlFor={`size-${size}`}
                          className="cursor-pointer px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}
            
            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Color</h3>
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => (
                      <div key={color} className="flex items-center space-x-2">
                        <RadioGroupItem value={color} id={`color-${color}`} />
                        <Label
                          htmlFor={`color-${color}`}
                          className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: getColorSwatch(color) }}
                          />
                          <span className="capitalize">{color}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}
            
            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock || addingToCart}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 text-lg"
            >
              {addingToCart ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </div>
              ) : !product.inStock ? (
                "Out of Stock"
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </div>
              )}
            </Button>
            
            {/* Product Info */}
            <div className="text-sm text-gray-500 space-y-1">
              <p><strong>SKU:</strong> {product.sku}</p>
              <p><strong>Category:</strong> {product.category}</p>
              {product.inStock && (
                <p className="text-green-600"><strong>In Stock</strong></p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}