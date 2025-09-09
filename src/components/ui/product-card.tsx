"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Eye } from "lucide-react"
import { resolveImagePath, getFallbackImage } from "@/lib/image-utils"

interface ProductModel {
  id: string
  name: string
  image?: string
  images?: string
  price: number
  discount?: number
  finalPrice: number
  rating?: number
  reviewCount?: number
  fabric?: string
  category: "blouse" | "salwar" | "lehenga"
}

interface ProductCardProps {
  model: ProductModel
  onCardClick: (model: ProductModel) => void
}

export function ProductCard({ model, onCardClick }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  
  // Get the first available image (primary or first from array)
  const getFirstImage = () => {
    if (model.image) return model.image
    if (model.images) {
      try {
        const imageArray = JSON.parse(model.images)
        return imageArray.length > 0 ? imageArray[0] : null
      } catch {
        return null
      }
    }
    return null
  }
  
  const firstImage = getFirstImage()
  const imageSrc = imageError ? getFallbackImage() : resolveImagePath(firstImage)

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
      onClick={() => onCardClick(model)}
    >
      {/* Image Section */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {firstImage || !imageError ? (
          <img
            src={imageSrc}
            alt={model.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Eye className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Discount Badge */}
        {model.discount && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-500 text-white text-xs">
              {model.discount}% OFF
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-base leading-tight">{model.name}</h3>
        
        {/* Rating */}
        {model.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{model.rating.toFixed(1)}</span>
            {model.reviewCount && (
              <span className="text-xs text-gray-500">({model.reviewCount})</span>
            )}
          </div>
        )}

        {/* Fabric */}
        {model.fabric && (
          <p className="text-sm text-gray-600">{model.fabric}</p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{model.finalPrice.toLocaleString()}
          </span>
          {model.discount && (
            <span className="text-sm text-gray-500 line-through">
              ₹{model.price.toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}