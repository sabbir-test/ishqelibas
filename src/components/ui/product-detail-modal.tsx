"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Eye, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from "lucide-react"
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

interface ProductDetailModalProps {
  model: ProductModel | null
  isOpen: boolean
  onClose: () => void
  onSelectModel: (model: ProductModel) => void
}

export function ProductDetailModal({ 
  model, 
  isOpen, 
  onClose, 
  onSelectModel 
}: ProductDetailModalProps) {
  const [imageError, setImageError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const imageRef = useRef<HTMLImageElement>(null)
  
  if (!model) return null

  // Get all available images
  const getAllImages = () => {
    const images = []
    if (model.image) images.push(model.image)
    if (model.images) {
      try {
        const imageArray = JSON.parse(model.images)
        images.push(...imageArray)
      } catch {
        // Invalid JSON, ignore
      }
    }
    return [...new Set(images)] // Remove duplicates
  }
  
  const allImages = getAllImages()
  const currentImage = allImages[currentImageIndex] || null
  const imageSrc = imageError ? getFallbackImage() : resolveImagePath(currentImage)
  
  const nextImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
      setImageError(false)
      setIsZoomed(false)
    }
  }
  
  const prevImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
      setImageError(false)
      setIsZoomed(false)
    }
  }
  
  const handleImageClick = () => {
    setIsZoomed(!isZoomed)
  }
  
  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isZoomed || !imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{model.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
              {currentImage || !imageError ? (
                <>
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt={model.name}
                    className={`w-full h-full object-cover transition-transform duration-300 cursor-zoom-in ${
                      isZoomed ? 'scale-200 cursor-zoom-out' : ''
                    }`}
                    style={isZoomed ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                    } : {}}
                    onClick={handleImageClick}
                    onMouseMove={handleMouseMove}
                    onError={() => setImageError(true)}
                  />
                  
                  {/* Zoom indicator */}
                  <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Eye className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
              {/* Navigation arrows for multiple images */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail navigation */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index)
                      setImageError(false)
                      setIsZoomed(false)
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-blue-600' : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={resolveImagePath(image)}
                      alt={`${model.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = getFallbackImage()
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Image counter */}
            {allImages.length > 1 && (
              <div className="text-center text-sm text-gray-500">
                {currentImageIndex + 1} of {allImages.length}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* Rating */}
            {model.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{model.rating.toFixed(1)}</span>
                </div>
                {model.reviewCount && (
                  <span className="text-sm text-gray-500">({model.reviewCount} reviews)</span>
                )}
              </div>
            )}

            {/* Fabric */}
            {model.fabric && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Fabric</h4>
                <p className="text-gray-600">{model.fabric}</p>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{model.finalPrice.toLocaleString()}
                </span>
                {model.discount && (
                  <span className="text-lg text-gray-500 line-through">
                    ₹{model.price.toLocaleString()}
                  </span>
                )}
              </div>
              {model.discount && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500 text-white">
                    {model.discount}% OFF
                  </Badge>
                  <span className="text-green-600 font-medium">
                    You save ₹{(model.price - model.finalPrice).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Select Button */}
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              size="lg"
              onClick={() => onSelectModel(model)}
            >
              Select This Model
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}