"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  CheckCircle,
  X,
  Image as ImageIcon,
  Tag
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

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
  } | null
}

interface BlouseModel {
  id: string
  name: string
  image?: string
  description?: string
  price: number
  discount?: number
  finalPrice: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  frontDesign?: BlouseDesign | null
  backDesign?: BlouseDesign | null
}

interface SelectedModels {
  frontModel: BlouseModel | null
  backModel: BlouseModel | null
}

export default function ModelsGalleryPage() {
  const [models, setModels] = useState<BlouseModel[]>([])
  const [filteredModels, setFilteredModels] = useState<BlouseModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModels, setSelectedModels] = useState<SelectedModels>({
    frontModel: null,
    backModel: null
  })

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [designTypeFilter, setDesignTypeFilter] = useState("all")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  
  // Sort states
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")

  const { toast } = useToast()

  useEffect(() => {
    fetchModels()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [models, searchTerm, designTypeFilter, priceRange, sortBy, sortOrder])

  const fetchModels = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/blouse-models?includeDesigns=true")
      if (response.ok) {
        const data = await response.json()
        setModels(data.models)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch models",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching models:", error)
      toast({
        title: "Error",
        description: "Failed to fetch models",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...models]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(model => 
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (model.description && model.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (model.frontDesign?.name && model.frontDesign.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (model.backDesign?.name && model.backDesign.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply design type filter
    if (designTypeFilter === "front") {
      filtered = filtered.filter(model => model.frontDesign && !model.backDesign)
    } else if (designTypeFilter === "back") {
      filtered = filtered.filter(model => !model.frontDesign && model.backDesign)
    } else if (designTypeFilter === "both") {
      filtered = filtered.filter(model => model.frontDesign && model.backDesign)
    }

    // Apply price range filter
    if (priceRange.min) {
      filtered = filtered.filter(model => model.price >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(model => model.price <= parseFloat(priceRange.max))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "price") {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price
      } else {
        const nameA = a.name.toLowerCase()
        const nameB = b.name.toLowerCase()
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      }
    })

    setFilteredModels(filtered)
  }

  const handleModelSelect = (model: BlouseModel, designType: "front" | "back") => {
    setSelectedModels(prev => ({
      ...prev,
      [designType + "Model"]: model
    }))

    toast({
      title: "Model Selected",
      description: `${model.name} selected as ${designType} design`
    })
  }

  const handleModelDeselect = (designType: "front" | "back") => {
    setSelectedModels(prev => ({
      ...prev,
      [designType + "Model"]: null
    }))

    toast({
      title: "Model Deselected",
      description: `${designType} design removed`
    })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setDesignTypeFilter("all")
    setPriceRange({ min: "", max: "" })
  }

  const clearSelections = () => {
    setSelectedModels({
      frontModel: null,
      backModel: null
    })
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchTerm) count++
    if (designTypeFilter !== "all") count++
    if (priceRange.min) count++
    if (priceRange.max) count++
    return count
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading models...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blouse Models Gallery</h1>
              <p className="text-gray-600">Browse and select your perfect blouse models</p>
            </div>
            <div className="flex items-center gap-4">
              {(selectedModels.frontModel || selectedModels.backModel) && (
                <Button variant="outline" onClick={clearSelections}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Selections
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {(selectedModels.frontModel || selectedModels.backModel) && (
        <div className="bg-pink-50 border-b border-pink-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-pink-800">Selected Models:</span>
              
              {selectedModels.frontModel && (
                <Badge variant="secondary" className="bg-pink-100 text-pink-800 border-pink-300">
                  Front: {selectedModels.frontModel.name} - {formatPrice(selectedModels.frontModel.finalPrice)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-2 hover:bg-transparent"
                    onClick={() => handleModelDeselect("front")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {selectedModels.backModel && (
                <Badge variant="secondary" className="bg-pink-100 text-pink-800 border-pink-300">
                  Back: {selectedModels.backModel.name} - {formatPrice(selectedModels.backModel.finalPrice)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-2 hover:bg-transparent"
                    onClick={() => handleModelDeselect("back")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {selectedModels.frontModel && selectedModels.backModel && (
                <div className="ml-auto">
                  <span className="text-sm font-medium text-pink-800">
                    Total: {formatPrice((selectedModels.frontModel.finalPrice + selectedModels.backModel.finalPrice))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search and Sort Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search models by name, design, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-700">Sort by:</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Design Type Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Design Type</Label>
              <Select value={designTypeFilter} onValueChange={setDesignTypeFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="front">Front Design Only</SelectItem>
                  <SelectItem value="back">Back Design Only</SelectItem>
                  <SelectItem value="both">Both Front & Back</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Price Range (INR)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="flex-1"
                />
                <span className="flex items-center text-gray-500">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters ({getActiveFiltersCount()})
                </Button>
              )}
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {filteredModels.length} of {models.length} models
              </span>
              {getActiveFiltersCount() > 0 && (
                <span className="text-sm text-gray-600">
                  {getActiveFiltersCount()} active filter{getActiveFiltersCount() > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredModels.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No models found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <Button onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModels.map((model) => {
              const isSelectedAsFront = selectedModels.frontModel?.id === model.id
              const isSelectedAsBack = selectedModels.backModel?.id === model.id
              const canSelectFront = !selectedModels.frontModel && model.frontDesign
              const canSelectBack = !selectedModels.backModel && model.backDesign

              return (
                <Card key={model.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="relative">
                      {model.image ? (
                        <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={model.image}
                            alt={model.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-pink-400" />
                        </div>
                      )}
                      
                      {/* Selection Indicators */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {isSelectedAsFront && (
                          <Badge className="bg-green-500 text-white">
                            Front Selected
                          </Badge>
                        )}
                        {isSelectedAsBack && (
                          <Badge className="bg-blue-500 text-white">
                            Back Selected
                          </Badge>
                        )}
                      </div>

                      {/* Discount Badge */}
                      {model.discount && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                          {model.discount}% OFF
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div>
                      <CardTitle className="text-lg mb-1">{model.name}</CardTitle>
                      {model.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{model.description}</p>
                      )}
                    </div>

                    {/* Design Information */}
                    <div className="space-y-2">
                      {model.frontDesign && (
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className="h-3 w-3 text-green-600" />
                          <span className="text-green-600 font-medium">Front:</span>
                          <span className="text-gray-600">{model.frontDesign.name}</span>
                        </div>
                      )}
                      {model.backDesign && (
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className="h-3 w-3 text-blue-600" />
                          <span className="text-blue-600 font-medium">Back:</span>
                          <span className="text-gray-600">{model.backDesign.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        {model.discount ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-pink-600">
                              {formatPrice(model.finalPrice)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(model.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-pink-600">
                            {formatPrice(model.finalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {canSelectFront && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => handleModelSelect(model, "front")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Select as Front Design
                        </Button>
                      )}
                      
                      {canSelectBack && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleModelSelect(model, "back")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Select as Back Design
                        </Button>
                      )}

                      {isSelectedAsFront && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-gray-500 text-gray-600 hover:bg-gray-50"
                          onClick={() => handleModelDeselect("front")}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove Front Selection
                        </Button>
                      )}

                      {isSelectedAsBack && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-gray-500 text-gray-600 hover:bg-gray-50"
                          onClick={() => handleModelDeselect("back")}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove Back Selection
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}