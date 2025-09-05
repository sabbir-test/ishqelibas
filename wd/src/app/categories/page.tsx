"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  ArrowRight, 
  Star,
  ShoppingBag,
  Grid3X3,
  List
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Category {
  id: string
  name: string
  description: string
  image: string
  productCount: number
  featured: boolean
  slug: string
}

interface SubCategory {
  id: string
  name: string
  parentId: string
  productCount: number
}

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const categories: Category[] = [
    {
      id: "1",
      name: "sarees",
      description: "Elegant traditional sarees for every occasion",
      image: "",
      productCount: 156,
      featured: true,
      slug: "sarees"
    },
    {
      id: "2",
      name: "salwar-kameez",
      description: "Comfortable and stylish salwar kameez sets",
      image: "",
      productCount: 234,
      featured: true,
      slug: "salwar-kameez"
    },
    {
      id: "3",
      name: "lehenga-choli",
      description: "Beautiful lehengas for weddings and festivals",
      image: "",
      productCount: 89,
      featured: true,
      slug: "lehenga-choli"
    },
    {
      id: "4",
      name: "kurtis",
      description: "Trendy kurtis for casual and office wear",
      image: "",
      productCount: 312,
      featured: false,
      slug: "kurtis"
    },
    {
      id: "5",
      name: "gowns",
      description: "Elegant gowns for parties and special events",
      image: "",
      productCount: 67,
      featured: false,
      slug: "gowns"
    },
    {
      id: "6",
      name: "blouses",
      description: "Designer blouses to complement your sarees",
      image: "",
      productCount: 145,
      featured: false,
      slug: "blouses"
    }
  ]

  const subCategories: SubCategory[] = [
    { id: "1", name: "Silk Sarees", parentId: "1", productCount: 45 },
    { id: "2", name: "Cotton Sarees", parentId: "1", productCount: 67 },
    { id: "3", name: "Designer Sarees", parentId: "1", productCount: 44 },
    { id: "4", name: "Cotton Salwar", parentId: "2", productCount: 89 },
    { id: "5", name: "Designer Salwar", parentId: "2", productCount: 78 },
    { id: "6", name: "Anarkali", parentId: "2", productCount: 67 },
    { id: "7", name: "Bridal Lehenga", parentId: "3", productCount: 34 },
    { id: "8", name: "Festival Lehenga", parentId: "3", productCount: 55 },
  ]

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const featuredCategories = categories.filter(category => category.featured)

  const CategoryCard = ({ category }: { category: Category }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
        <div className="absolute bottom-4 left-4 right-4">
          <Badge variant="secondary" className="bg-white text-gray-900 mb-2">
            {category.productCount} Products
          </Badge>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{category.name.charAt(0).toUpperCase() + category.name.slice(1).replace('-', ' ')}</h3>
        <p className="text-gray-600 mb-4">{category.description}</p>
        
        {/* Sub-categories */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {subCategories
              .filter(sub => sub.parentId === category.id)
              .slice(0, 3)
              .map((sub) => (
                <Badge key={sub.id} variant="outline" className="text-xs">
                  {sub.name} ({sub.productCount})
                </Badge>
              ))}
            {subCategories.filter(sub => sub.parentId === category.id).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{subCategories.filter(sub => sub.parentId === category.id).length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <Link href={`/shop?category=${category.slug}`}>
          <Button className="w-full bg-pink-600 hover:bg-pink-700">
            Shop {category.name.charAt(0).toUpperCase() + category.name.slice(1).replace('-', ' ')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )

  const CategoryList = ({ category }: { category: Category }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex gap-6">
        <div className="relative flex-shrink-0 w-32 h-32">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">{category.name.charAt(0).toUpperCase() + category.name.slice(1).replace('-', ' ')}</h3>
              <p className="text-gray-600 mb-3">{category.description}</p>
              
              <div className="flex items-center gap-4 mb-3">
                <Badge variant="secondary">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  {category.productCount} Products
                </Badge>
                {category.featured && (
                  <Badge variant="default" className="bg-yellow-500">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              
              {/* Sub-categories */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Sub-categories:</p>
                <div className="flex flex-wrap gap-2">
                  {subCategories
                    .filter(sub => sub.parentId === category.id)
                    .map((sub) => (
                      <Badge key={sub.id} variant="outline" className="text-xs">
                        {sub.name} ({sub.productCount})
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
            
            <Link href={`/shop?category=${category.slug}`}>
              <Button className="bg-pink-600 hover:bg-pink-700">
                Shop Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">Explore our wide range of ethnic wear categories</p>
          
          {/* Search Bar */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {searchQuery ? `Search results for "${searchQuery}"` : "All Categories"}
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

        {/* Featured Categories */}
        {!searchQuery && featuredCategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        )}

        {/* All Categories */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {searchQuery ? "Search Results" : "All Categories"}
          </h2>
          
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No categories found matching your search.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
            }>
              {filteredCategories.map((category) =>
                viewMode === "grid" ? (
                  <CategoryCard key={category.id} category={category} />
                ) : (
                  <CategoryList key={category.id} category={category} />
                )
              )}
            </div>
          )}
        </div>

        {/* Category Stats */}
        {!searchQuery && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Category Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{categories.length}</div>
                <div className="text-sm text-gray-600">Total Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{featuredCategories.length}</div>
                <div className="text-sm text-gray-600">Featured Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{subCategories.length}</div>
                <div className="text-sm text-gray-600">Sub-categories</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}