"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Shirt, 
  Scissors, 
  Crown, 
  Gem,
  Sparkles,
  Heart,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Category {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  image: string
  productCount: number
  isNew?: boolean
  color: string
}

export default function ProductCategories() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const categories: Category[] = [
    {
      id: "sarees",
      name: "Sarees",
      description: "Elegant traditional sarees for every occasion",
      icon: <Shirt className="h-8 w-8" />,
      image: "/api/placeholder/400/300",
      productCount: 156,
      color: "from-pink-500 to-rose-500"
    },
    {
      id: "kurtis",
      name: "Kurtis",
      description: "Stylish and comfortable kurtis for daily wear",
      icon: <Scissors className="h-8 w-8" />,
      image: "/api/placeholder/400/300",
      productCount: 234,
      isNew: true,
      color: "from-purple-500 to-indigo-500"
    },
    {
      id: "lehengas",
      name: "Lehengas",
      description: "Bridal and festive lehengas with intricate designs",
      icon: <Crown className="h-8 w-8" />,
      image: "/api/placeholder/400/300",
      productCount: 89,
      color: "from-orange-500 to-red-500"
    },
    {
      id: "blouses",
      name: "Custom Blouses",
      description: "Design your perfect custom-fit blouses",
      icon: <Gem className="h-8 w-8" />,
      image: "/api/placeholder/400/300",
      productCount: 45,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "dresses",
      name: "Dresses",
      description: "Contemporary dresses for modern women",
      icon: <Sparkles className="h-8 w-8" />,
      image: "/api/placeholder/400/300",
      productCount: 178,
      isNew: true,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "salwar",
      name: "Salwar Suits",
      description: "Traditional salwar suits with modern twist",
      icon: <Heart className="h-8 w-8" />,
      image: "/api/placeholder/400/300",
      productCount: 267,
      color: "from-yellow-500 to-orange-500"
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our diverse range of women's fashion categories, each carefully curated to offer you the best in style and quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/categories/${category.id}`}
              className="group"
            >
              <Card 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <CardContent className="p-0">
                  {/* Category Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />
                    
                    {/* Category Icon */}
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <div className="text-gray-800">
                          {category.icon}
                        </div>
                      </div>
                    </div>

                    {/* New Badge */}
                    {category.isNew && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500 hover:bg-green-600">New</Badge>
                      </div>
                    )}

                    {/* Product Count */}
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="secondary" className="bg-white bg-opacity-90 text-gray-800">
                        {category.productCount} Products
                      </Badge>
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">
                      {category.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Custom Design CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Design Your Dream Outfit</h3>
            <p className="text-lg mb-6 opacity-90">
              Can't find what you're looking for? Create your custom design with our expert tailors.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-3"
            >
              Start Designing
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}