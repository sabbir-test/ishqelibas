"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  ShoppingCart, 
  Eye, 
  Star,
  StarHalf
} from "lucide-react"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"

interface Product {
  id: string
  name: string
  price: number
  discount?: number
  finalPrice: number
  image: string
  hoverImage: string
  rating: number
  reviewCount: number
  isNew?: boolean
  isBestSeller?: boolean
  // Front and back design pricing
  frontDesignName?: string
  frontDesignPrice?: number
  backDesignName?: string
  backDesignPrice?: number
}

export default function FeaturedProducts() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const { addItem } = useCart()

  const products: Product[] = [
    {
      id: "1",
      name: "Elegant Silk Saree",
      price: 2999,
      discount: 20,
      finalPrice: 2399,
      image: "/api/placeholder/300/400",
      hoverImage: "/api/placeholder/300/400",
      rating: 4.5,
      reviewCount: 128,
      isNew: true,
      frontDesignName: "Classic Neck",
      frontDesignPrice: 1200,
      backDesignName: "Deep Cut",
      backDesignPrice: 800
    },
    {
      id: "2",
      name: "Designer Kurti Set",
      price: 1599,
      finalPrice: 1599,
      image: "/api/placeholder/300/400",
      hoverImage: "/api/placeholder/300/400",
      rating: 4.8,
      reviewCount: 89,
      isBestSeller: true,
      frontDesignName: "Round Neck",
      frontDesignPrice: 600
    },
    {
      id: "3",
      name: "Bridal Lehenga",
      price: 8999,
      discount: 15,
      finalPrice: 7649,
      image: "/api/placeholder/300/400",
      hoverImage: "/api/placeholder/300/400",
      rating: 5,
      reviewCount: 45,
      frontDesignName: "Sweetheart Neck",
      frontDesignPrice: 2500,
      backDesignName: "Low Back",
      backDesignPrice: 1800
    },
    {
      id: "4",
      name: "Casual Cotton Dress",
      price: 899,
      finalPrice: 899,
      image: "/api/placeholder/300/400",
      hoverImage: "/api/placeholder/300/400",
      rating: 4.2,
      reviewCount: 67,
      isNew: true
    },
    {
      id: "5",
      name: "Party Wear Gown",
      price: 3499,
      discount: 25,
      finalPrice: 2624,
      image: "/api/placeholder/300/400",
      hoverImage: "/api/placeholder/300/400",
      rating: 4.7,
      reviewCount: 93,
      isBestSeller: true,
      backDesignName: "Open Back",
      backDesignPrice: 1200
    },
    {
      id: "6",
      name: "Traditional Salwar Suit",
      price: 1299,
      finalPrice: 1299,
      image: "/api/placeholder/300/400",
      hoverImage: "/api/placeholder/300/400",
      rating: 4.3,
      reviewCount: 156
    }
  ]

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked collection of exquisite women's fashion, blending traditional elegance with contemporary style.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={hoveredProduct === product.id ? product.hoverImage : product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isNew && (
                      <Badge className="bg-green-500 hover:bg-green-600">New</Badge>
                    )}
                    {product.isBestSeller && (
                      <Badge className="bg-orange-500 hover:bg-orange-600">Best Seller</Badge>
                    )}
                    {product.discount && (
                      <Badge className="bg-red-500 hover:bg-red-600">
                        {product.discount}% OFF
                      </Badge>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-white hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-white hover:bg-gray-100"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Button 
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                      size="sm"
                      onClick={() => addItem({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        finalPrice: product.finalPrice,
                        quantity: 1,
                        image: product.image,
                        sku: `SKU-${product.id}`,
                        frontDesignName: product.frontDesignName,
                        frontDesignPrice: product.frontDesignPrice,
                        backDesignName: product.backDesignName,
                        backDesignPrice: product.backDesignPrice
                      })}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({product.reviewCount})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{product.finalPrice.toLocaleString()}
                    </span>
                    {product.discount && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Quick Add Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                      onClick={() => addItem({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        finalPrice: product.finalPrice,
                        quantity: 1,
                        image: product.image,
                        sku: `SKU-${product.id}`,
                        frontDesignName: product.frontDesignName,
                        frontDesignPrice: product.frontDesignPrice,
                        backDesignName: product.backDesignName,
                        backDesignPrice: product.backDesignPrice
                      })}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline"
            className="px-8 py-3"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}