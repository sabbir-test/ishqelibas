"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Scissors, CheckCircle } from "lucide-react"
import Image from "next/image"

interface BlouseDesignVariant {
  id: string
  name: string
  image?: string
  description?: string
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
  isActive: boolean
  category?: {
    id: string
    name: string
    description?: string
    image?: string
  } | null
  variants?: BlouseDesignVariant[]
}

interface DesignVariantsModalProps {
  isOpen: boolean
  onClose: () => void
  design: BlouseDesign | null
  selectedVariant: BlouseDesignVariant | null
  onVariantSelect: (variant: BlouseDesignVariant) => void
  designType: "front" | "back"
}

export default function DesignVariantsModal({
  isOpen,
  onClose,
  design,
  selectedVariant,
  onVariantSelect,
  designType
}: DesignVariantsModalProps) {
  const [hoveredVariant, setHoveredVariant] = useState<string | null>(null)

  if (!design) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {design.name} - Choose Your Style
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {design.category && (
            <Badge variant="outline" className="w-fit">
              {design.category.name}
            </Badge>
          )}
          {design.description && (
            <p className="text-gray-600 mt-2">{design.description}</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Design Image */}
          {design.image && (
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={design.image}
                alt={design.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Design Variants Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Available Styles ({design.variants?.length || 0})
            </h3>
            
            {design.variants && design.variants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {design.variants.map((variant) => (
                  <Card
                    key={variant.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedVariant?.id === variant.id
                        ? "ring-2 ring-pink-600 bg-pink-50"
                        : hoveredVariant === variant.id
                        ? "ring-2 ring-pink-300"
                        : "border-gray-200 hover:border-pink-300"
                    }`}
                    onClick={() => onVariantSelect(variant)}
                    onMouseEnter={() => setHoveredVariant(variant.id)}
                    onMouseLeave={() => setHoveredVariant(null)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                        {variant.image ? (
                          <Image
                            src={variant.image}
                            alt={variant.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Scissors className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        {selectedVariant?.id === variant.id && (
                          <div className="absolute inset-0 bg-pink-600 bg-opacity-20 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-pink-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-center">{variant.name}</h4>
                        
                        {variant.description && (
                          <p className="text-sm text-gray-600 text-center">
                            {variant.description}
                          </p>
                        )}
                        
                        {selectedVariant?.id === variant.id && (
                          <Badge className="w-full justify-center bg-pink-600">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No additional styles available for this design.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Back to Designs
            </Button>
            <Button 
              onClick={onClose}
              disabled={!selectedVariant}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}