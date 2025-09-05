"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ModelFilterBar } from "@/components/ui/model-filter-bar"
import { 
  ArrowLeft, 
  ArrowRight, 
  Ruler, 
  Palette, 
  Scissors,
  Calendar,
  CheckCircle,
  AlertCircle,
  Upload,
  ShoppingCart,
  Loader2,
  X,
  Image as ImageIcon,
  Tag,
  Search,
  SortAsc,
  SortDesc,
  ZoomIn,
  Eye
} from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type DesignStep = "fabric" | "design" | "measurements" | "review"

interface Fabric {
  id: string
  name: string
  type: string
  color: string
  pricePerMeter: number
  image?: string
  isOwnFabric?: boolean
  description?: string
  quantity?: number
}

interface OwnFabricDetails {
  name: string
  color: string
  description?: string
  quantity: number
  image?: string
}

interface BlouseDesignVariant {
  id: string
  name: string
  image?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface BlouseDesignCategory {
  id: string
  name: string
  description?: string
  image?: string
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
  stitchCost: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  category?: BlouseDesignCategory | null
  variants?: BlouseDesignVariant[]
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

interface CustomDesign {
  fabric: Fabric | null
  frontDesign: BlouseDesign | null
  backDesign: BlouseDesign | null
  frontDesignVariant: BlouseDesignVariant | null
  backDesignVariant: BlouseDesignVariant | null
  selectedModels: {
    frontModel: BlouseModel | null
    backModel: BlouseModel | null
  }
  measurements: {
    bust: string
    waist: string
    hips: string
    shoulder: string
    sleeveLength: string
    blouseLength: string
    notes: string
  }
  appointmentDate: string | null
  appointmentType: "VIRTUAL" | "IN_PERSON" | null
  ownFabricDetails?: OwnFabricDetails | null
}

export default function CustomBlouseDesignPage() {
  const [currentStep, setCurrentStep] = useState<DesignStep>("fabric")
  const [design, setDesign] = useState<CustomDesign>({
    fabric: null,
    frontDesign: null,
    backDesign: null,
    frontDesignVariant: null,
    backDesignVariant: null,
    selectedModels: {
      frontModel: null,
      backModel: null
    },
    measurements: {
      bust: "",
      waist: "",
      hips: "",
      shoulder: "",
      sleeveLength: "",
      blouseLength: "",
      notes: ""
    },
    appointmentDate: null,
    appointmentType: null,
    ownFabricDetails: {
      name: "",
      color: "",
      quantity: 0,
      description: ""
    }
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [models, setModels] = useState<BlouseModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCollectionCard, setShowCollectionCard] = useState(true)
  const [manualMeasurementsEnabled, setManualMeasurementsEnabled] = useState(true)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name-asc")
  const [selectedModelForPreview, setSelectedModelForPreview] = useState<BlouseModel | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  
  const { addItem } = useCart()
  const { toast } = useToast()

  const steps = [
    { id: "fabric", name: "Fabric Selection", icon: Palette },
    { id: "design", name: "Design Selection", icon: Scissors },
    { id: "measurements", name: "Measurements", icon: Ruler },
    { id: "review", name: "Review & Order", icon: CheckCircle }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  useEffect(() => {
    if (currentStep === "fabric") {
      fetchFabricCollectionSetting()
      fetchFabrics()
    } else if (currentStep === "design") {
      fetchModels()
    } else if (currentStep === "measurements") {
      fetchManualMeasurementsSetting()
    }
  }, [currentStep])

  const fetchFabricCollectionSetting = async () => {
    try {
      const response = await fetch("/api/config?key=fabric_collection_enabled")
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setShowCollectionCard(data.config.value === 'true')
        } else if (data.value !== undefined) {
          setShowCollectionCard(data.value === 'true')
        } else {
          setShowCollectionCard(true)
        }
      }
    } catch (error) {
      console.error("Error fetching fabric collection setting:", error)
      setShowCollectionCard(true)
    }
  }

  const fetchManualMeasurementsSetting = async () => {
    setIsLoadingConfig(true)
    try {
      const response = await fetch("/api/config?key=manual_measurements_enabled")
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setManualMeasurementsEnabled(data.config.value === 'true')
        } else if (data.value !== undefined) {
          setManualMeasurementsEnabled(data.value === 'true')
        } else {
          setManualMeasurementsEnabled(true)
        }
      }
    } catch (error) {
      console.error("Error fetching manual measurements setting:", error)
      setManualMeasurementsEnabled(true)
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const fetchFabrics = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/fabrics")
      if (response.ok) {
        const data = await response.json()
        setFabrics(data.fabrics)
      } else {
        throw new Error("Failed to fetch fabrics")
      }
    } catch (error) {
      console.error("Error fetching fabrics:", error)
      setError("Failed to load fabrics. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load fabrics. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchModels = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/blouse-models?includeDesigns=true&page=1&limit=100")
      if (response.ok) {
        const data = await response.json()
        setModels(data.models)
      } else {
        throw new Error("Failed to fetch models")
      }
    } catch (error) {
      console.error("Error fetching models:", error)
      setError("Failed to load models. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load models. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculatePrice = () => {
    if (!design.fabric) return 0
    
    let totalPrice = 0
    
    if (!design.fabric.isOwnFabric && design.fabric.pricePerMeter) {
      totalPrice += design.fabric.pricePerMeter * 1.5
    }
    
    if (design.frontDesign && design.frontDesign.stitchCost) {
      totalPrice += design.frontDesign.stitchCost
    }
    if (design.backDesign && design.backDesign.stitchCost) {
      totalPrice += design.backDesign.stitchCost
    }
    
    if (design.selectedModels.frontModel && design.selectedModels.frontModel.finalPrice) {
      totalPrice += design.selectedModels.frontModel.finalPrice
    }
    
    if (design.selectedModels.backModel && design.selectedModels.backModel.finalPrice) {
      totalPrice += design.selectedModels.backModel.finalPrice
    }
    
    return totalPrice
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const handleModelSelect = (model: BlouseModel, designType?: "front" | "back") => {
    // If no design type specified, select as main model
    if (!designType) {
      setDesign(prev => ({
        ...prev,
        selectedModels: {
          frontModel: model,
          backModel: null
        },
        frontDesign: model.frontDesign,
        backDesign: model.backDesign
      }))
      
      toast({
        title: "Model Selected",
        description: `${model.name} selected for your custom blouse`
      })
      
      setIsPreviewOpen(false)
      return
    }

    setDesign(prev => ({
      ...prev,
      selectedModels: {
        ...prev.selectedModels,
        [designType + "Model"]: model
      },
      ...(designType === "front" && { frontDesign: model.frontDesign }),
      ...(designType === "back" && { backDesign: model.backDesign })
    }))

    toast({
      title: "Model Selected",
      description: `${model.name} selected as ${designType} design`
    })
  }

  const handleModelDeselect = (designType: "front" | "back") => {
    setDesign(prev => ({
      ...prev,
      selectedModels: {
        ...prev.selectedModels,
        [designType + "Model"]: null
      },
      ...(designType === "front" && { frontDesign: null }),
      ...(designType === "back" && { backDesign: null })
    }))

    toast({
      title: "Model Deselected",
      description: `${designType} design removed`
    })
  }

  const handleMeasurementChange = (field: string, value: string) => {
    setDesign(prev => ({
      ...prev,
      measurements: { ...prev.measurements, [field]: value }
    }))
  }

  const handleAppointmentDateChange = (date: string) => {
    setDesign(prev => ({ ...prev, appointmentDate: date }))
  }

  const handleAppointmentTypeChange = (type: "VIRTUAL" | "IN_PERSON") => {
    setDesign(prev => ({ ...prev, appointmentType: type }))
  }

  const validateMeasurements = () => {
    const { measurements } = design
    return Object.values(measurements).every(value => value.trim() !== "")
  }

  const isProfessionalMeasurementSelected = () => {
    return design.appointmentType && design.appointmentDate
  }

  const filteredAndSortedModels = () => {
    let filtered = models.filter(model => {
      // Text search filter
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.designName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Price range filter
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity
      const matchesPrice = model.finalPrice >= minPrice && model.finalPrice <= maxPrice
      
      return matchesSearch && matchesPrice
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.finalPrice - b.finalPrice
        case "price-desc":
          return b.finalPrice - a.finalPrice
        case "name-desc":
          return b.name.toLowerCase().localeCompare(a.name.toLowerCase())
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        default: // name-asc
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      }
    })
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSortBy("name-asc")
    setPriceRange({ min: "", max: "" })
  }

  const handleModelPreview = (model: BlouseModel) => {
    setSelectedModelForPreview(model)
    setIsPreviewOpen(true)
  }

  const handleAddToCart = async () => {
    if (!design.fabric) {
      toast({
        title: "Fabric required",
        description: "Please select a fabric for your custom blouse.",
        variant: "destructive"
      })
      return
    }

    if (!design.selectedModels.frontModel && !design.selectedModels.backModel) {
      toast({
        title: "Design required",
        description: "Please select at least one model (front or back) for your custom blouse.",
        variant: "destructive"
      })
      return
    }

    if (!isProfessionalMeasurementSelected() && !validateMeasurements()) {
      toast({
        title: "Measurements required",
        description: "Please fill in all required measurement fields or book a professional measurement appointment.",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      const customOrder = {
        productId: "custom-blouse",
        name: `Custom Blouse - ${design.fabric.name}`,
        price: calculatePrice(),
        finalPrice: calculatePrice(),
        quantity: 1,
        image: design.fabric.image || "/api/placeholder/200/200",
        sku: `CUSTOM-${Date.now()}`,
        customDesign: {
          ...design,
          appointmentPurpose: "blouse" // Automatically set purpose for blouse appointments
        }
      }

      addItem(customOrder)
      toast({
        title: "Added to cart",
        description: "Your custom blouse design has been added to cart.",
      })
      
      setCurrentStep("fabric")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add custom blouse to cart.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading design options...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Custom Blouse Design</h1>
              <p className="text-gray-600">Create your perfect custom-fit blouse</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/custom-design">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Design Studio
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStepIndex
                    ? "bg-pink-600 border-pink-600 text-white"
                    : "border-gray-300 text-gray-400"
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className={`ml-3 font-medium ${
                  index <= currentStepIndex ? "text-gray-900" : "text-gray-400"
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-16 h-0.5 bg-gray-300 ml-3" />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Fabric Selection Step - Same as original */}
        {currentStep === "fabric" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Choose Your Fabric</h2>
              <p className="text-gray-600">Select from our premium collection or provide your own fabric</p>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <div className={`grid ${showCollectionCard ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-8`}>
                {showCollectionCard && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Palette className="h-5 w-5 mr-2" />
                        Choose From Our Collection
                      </CardTitle>
                      <CardDescription>
                        Select from our premium fabric collection
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {fabrics.length === 0 ? (
                        <div className="text-center py-12">
                          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No fabrics available at the moment.</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {fabrics.map((fabric) => (
                            <div
                              key={fabric.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                                design.fabric?.id === fabric.id ? "ring-2 ring-pink-600 bg-pink-50" : "border-gray-200"
                              }`}
                              onClick={() => {
                                setDesign(prev => ({ 
                                  ...prev, 
                                  fabric: {
                                    ...fabric,
                                    isOwnFabric: false
                                  }
                                }))
                              }}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  {fabric.image ? (
                                    <img 
                                      src={fabric.image} 
                                      alt={fabric.name}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div 
                                      className="w-12 h-12 rounded border"
                                      style={{ backgroundColor: fabric.color.toLowerCase() }}
                                    />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg">{fabric.name}</h3>
                                  <p className="text-sm text-gray-600 mb-1">{fabric.type}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className="w-4 h-4 rounded border"
                                        style={{ backgroundColor: fabric.color.toLowerCase() }}
                                      />
                                      <span className="text-sm text-gray-600">{fabric.color}</span>
                                    </div>
                                    <p className="text-lg font-bold text-pink-600">
                                      ₹{fabric.pricePerMeter}/m
                                    </p>
                                  </div>
                                </div>
                                {design.fabric?.id === fabric.id && (
                                  <CheckCircle className="h-5 w-5 text-pink-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {design.fabric && !design.fabric.isOwnFabric && (
                        <div className="mt-6 pt-4 border-t">
                          <Button 
                            onClick={() => setCurrentStep("design")}
                            className="w-full bg-pink-600 hover:bg-pink-700"
                          >
                            Continue to Design Selection
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Upload className="h-5 w-5 mr-2" />
                      Provide Your Own Fabric
                    </CardTitle>
                    <CardDescription>
                      Use your own fabric for a truly custom blouse
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-purple-900">Bring Your Own Fabric</h4>
                          <p className="text-sm text-purple-700 mt-1">
                            Have a special fabric you'd like to use? We can create a beautiful 
                            blouse with your own material. Just provide the details below.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fabricName">Fabric Name/Type*</Label>
                        <Input
                          id="fabricName"
                          placeholder="e.g., Silk, Cotton, Georgette, Chiffon"
                          value={design.ownFabricDetails?.name || ''}
                          onChange={(e) => setDesign(prev => ({
                            ...prev,
                            ownFabricDetails: {
                              ...prev.ownFabricDetails!,
                              name: e.target.value
                            }
                          }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="fabricColor">Color*</Label>
                        <Input
                          id="fabricColor"
                          placeholder="e.g., Red, Blue, Green, etc."
                          value={design.ownFabricDetails?.color || ''}
                          onChange={(e) => setDesign(prev => ({
                            ...prev,
                            ownFabricDetails: {
                              ...prev.ownFabricDetails!,
                              color: e.target.value
                            }
                          }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="fabricQuantity">Quantity (meters)*</Label>
                        <Input
                          id="fabricQuantity"
                          type="number"
                          placeholder="1.5"
                          value={design.ownFabricDetails?.quantity || ''}
                          onChange={(e) => setDesign(prev => ({
                            ...prev,
                            ownFabricDetails: {
                              ...prev.ownFabricDetails!,
                              quantity: parseFloat(e.target.value) || 0
                            }
                          }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="fabricDescription">Description (optional)</Label>
                        <Textarea
                          id="fabricDescription"
                          placeholder="Any special characteristics of your fabric..."
                          value={design.ownFabricDetails?.description || ''}
                          onChange={(e) => setDesign(prev => ({
                            ...prev,
                            ownFabricDetails: {
                              ...prev.ownFabricDetails!,
                              description: e.target.value
                            }
                          }))}
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                          if (design.ownFabricDetails?.name && design.ownFabricDetails?.color && design.ownFabricDetails?.quantity > 0) {
                            const ownFabric: Fabric = {
                              id: `own-${Date.now()}`,
                              name: design.ownFabricDetails.name,
                              type: "Customer Provided",
                              color: design.ownFabricDetails.color,
                              pricePerMeter: 0,
                              isOwnFabric: true,
                              description: design.ownFabricDetails.description,
                              quantity: design.ownFabricDetails.quantity
                            }
                            setDesign(prev => ({ ...prev, fabric: ownFabric }))
                            setCurrentStep("design")
                          } else {
                            toast({
                              title: "Incomplete Information",
                              description: "Please fill in all required fabric details.",
                              variant: "destructive"
                            })
                          }
                        }}
                        disabled={!design.ownFabricDetails?.name || !design.ownFabricDetails?.color || !design.ownFabricDetails?.quantity || design.ownFabricDetails?.quantity <= 0}
                      >
                        Continue with Own Fabric
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Design Selection Step - Enhanced Gallery View */}
        {currentStep === "design" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Browse Blouse Models</h2>
              <p className="text-gray-600">Explore our collection and select your perfect design</p>
            </div>

            {/* Filter Bar */}
            <div className="max-w-6xl mx-auto mb-6">
              <ModelFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Models Gallery */}
            <div className="space-y-6">
              {models.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No models available</h3>
                  <p className="text-gray-600">Please check back later for available models.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedModels().map((model) => {
                    const isSelected = design.selectedModels.frontModel?.id === model.id

                    return (
                      <Card 
                        key={model.id} 
                        className={`overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group ${
                          isSelected ? "ring-2 ring-pink-500 shadow-lg" : ""
                        }`}
                        onClick={() => handleModelPreview(model)}
                      >
                        <div className="relative">
                          {model.image ? (
                            <div className="w-full h-56 bg-gray-100 overflow-hidden">
                              <img
                                src={model.image}
                                alt={model.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-56 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                              <ImageIcon className="h-16 w-16 text-pink-400" />
                            </div>
                          )}
                          
                          {/* Overlay with preview button */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>

                          {/* Badges */}
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            {isSelected && (
                              <Badge className="bg-pink-500 text-white">
                                Selected
                              </Badge>
                            )}
                            {model.discount && (
                              <Badge className="bg-red-500 text-white">
                                {model.discount}% OFF
                              </Badge>
                            )}
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg leading-tight">{model.name}</h3>
                            {model.designName && (
                              <p className="text-sm text-gray-600">{model.designName}</p>
                            )}
                            
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
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {filteredAndSortedModels().length === 0 && (searchTerm || priceRange.min || priceRange.max) && (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No models found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or price range.</p>
                  <Button 
                    variant="outline" 
                    onClick={handleClearFilters}
                    className="mt-4"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  if (!design.selectedModels.frontModel) {
                    toast({
                      title: "Selection Required",
                      description: "Please select a model to continue",
                      variant: "destructive"
                    })
                    return
                  }
                  setCurrentStep("measurements")
                }}
                className="bg-pink-600 hover:bg-pink-700 px-8"
                disabled={!design.selectedModels.frontModel}
              >
                Continue to Measurements
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Model Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {selectedModelForPreview && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{selectedModelForPreview.name}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Image Section */}
                      <div className="space-y-4">
                        {selectedModelForPreview.image ? (
                          <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={selectedModelForPreview.image}
                              alt={selectedModelForPreview.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-96 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-24 w-24 text-pink-400" />
                          </div>
                        )}
                      </div>

                      {/* Details Section */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{selectedModelForPreview.designName}</h3>
                          {selectedModelForPreview.description && (
                            <p className="text-gray-600 leading-relaxed">{selectedModelForPreview.description}</p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-medium">Price:</span>
                            <div>
                              {selectedModelForPreview.discount ? (
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-pink-600">
                                    {formatPrice(selectedModelForPreview.finalPrice)}
                                  </div>
                                  <div className="text-sm text-gray-500 line-through">
                                    {formatPrice(selectedModelForPreview.price)}
                                  </div>
                                  <Badge className="bg-red-500 text-white mt-1">
                                    {selectedModelForPreview.discount}% OFF
                                  </Badge>
                                </div>
                              ) : (
                                <div className="text-2xl font-bold text-pink-600">
                                  {formatPrice(selectedModelForPreview.finalPrice)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Design Details */}
                        {(selectedModelForPreview.frontDesign || selectedModelForPreview.backDesign) && (
                          <div className="space-y-3">
                            <h4 className="font-medium">Design Details:</h4>
                            {selectedModelForPreview.frontDesign && (
                              <div className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded">
                                <Tag className="h-4 w-4 text-green-600" />
                                <span className="text-green-600 font-medium">Front Design:</span>
                                <span className="text-gray-700">{selectedModelForPreview.frontDesign.name}</span>
                              </div>
                            )}
                            {selectedModelForPreview.backDesign && (
                              <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded">
                                <Tag className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-600 font-medium">Back Design:</span>
                                <span className="text-gray-700">{selectedModelForPreview.backDesign.name}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Selection Button */}
                        <div className="pt-4">
                          {design.selectedModels.frontModel?.id === selectedModelForPreview.id ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg border border-pink-200">
                                <CheckCircle className="h-5 w-5 text-pink-600" />
                                <span className="text-pink-800 font-medium">This model is selected</span>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  handleModelDeselect("front")
                                  setIsPreviewOpen(false)
                                }}
                                className="w-full"
                              >
                                Remove Selection
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleModelSelect(selectedModelForPreview)}
                              className="w-full bg-pink-600 hover:bg-pink-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Select This Design
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Measurements Step */}
        {currentStep === "measurements" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Measurements & Appointment</h2>
              <p className="text-gray-600">Enter your measurements manually or book a professional measurement appointment</p>
            </div>

            {isLoadingConfig ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Manual Measurements Option */}
                  {manualMeasurementsEnabled && (
                    <Card className="h-fit">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Ruler className="h-5 w-5 mr-2" />
                          Enter Measurements Manually
                        </CardTitle>
                        <CardDescription>
                          Provide your body measurements for a custom fit
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="bust">Bust/Chest (inches)*</Label>
                            <Input
                              id="bust"
                              type="number"
                              step="0.5"
                              placeholder="34"
                              value={design.measurements.bust}
                              onChange={(e) => handleMeasurementChange("bust", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="waist">Waist (inches)*</Label>
                            <Input
                              id="waist"
                              type="number"
                              step="0.5"
                              placeholder="28"
                              value={design.measurements.waist}
                              onChange={(e) => handleMeasurementChange("waist", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="hips">Hips (inches)*</Label>
                            <Input
                              id="hips"
                              type="number"
                              step="0.5"
                              placeholder="36"
                              value={design.measurements.hips}
                              onChange={(e) => handleMeasurementChange("hips", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="shoulder">Shoulder Width (inches)*</Label>
                            <Input
                              id="shoulder"
                              type="number"
                              step="0.5"
                              placeholder="14"
                              value={design.measurements.shoulder}
                              onChange={(e) => handleMeasurementChange("shoulder", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="sleeveLength">Sleeve Length (inches)*</Label>
                            <Input
                              id="sleeveLength"
                              type="number"
                              step="0.5"
                              placeholder="18"
                              value={design.measurements.sleeveLength}
                              onChange={(e) => handleMeasurementChange("sleeveLength", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="blouseLength">Blouse Length (inches)*</Label>
                            <Input
                              id="blouseLength"
                              type="number"
                              step="0.5"
                              placeholder="15"
                              value={design.measurements.blouseLength}
                              onChange={(e) => handleMeasurementChange("blouseLength", e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="notes">Additional Notes (optional)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Any specific fitting requirements or notes..."
                            value={design.measurements.notes}
                            onChange={(e) => handleMeasurementChange("notes", e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900">Measurement Tips</h4>
                              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                                <li>• Measure over your best-fitting undergarments</li>
                                <li>• Keep the measuring tape snug but not tight</li>
                                <li>• For best results, have someone help you measure</li>
                                <li>• All measurements should be in inches</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Professional Appointment Option */}
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Book Professional Measurement
                      </CardTitle>
                      <CardDescription>
                        Schedule an appointment with our expert tailors
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="appointmentType">Appointment Type*</Label>
                          <div className="grid grid-cols-1 gap-3 mt-2">
                            <div 
                              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                design.appointmentType === "VIRTUAL" 
                                  ? "ring-2 ring-pink-600 bg-pink-50 border-pink-200" 
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => handleAppointmentTypeChange("VIRTUAL")}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  design.appointmentType === "VIRTUAL" 
                                    ? "border-pink-600 bg-pink-600" 
                                    : "border-gray-300"
                                }`}>
                                  {design.appointmentType === "VIRTUAL" && (
                                    <div className="w-full h-full rounded-full bg-white scale-50" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium">Virtual Consultation</h4>
                                  <p className="text-sm text-gray-600">Video call with our expert tailor</p>
                                </div>
                              </div>
                            </div>
                            
                            <div 
                              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                design.appointmentType === "IN_PERSON" 
                                  ? "ring-2 ring-pink-600 bg-pink-50 border-pink-200" 
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => handleAppointmentTypeChange("IN_PERSON")}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  design.appointmentType === "IN_PERSON" 
                                    ? "border-pink-600 bg-pink-600" 
                                    : "border-gray-300"
                                }`}>
                                  {design.appointmentType === "IN_PERSON" && (
                                    <div className="w-full h-full rounded-full bg-white scale-50" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium">In-Person Visit</h4>
                                  <p className="text-sm text-gray-600">Visit our studio for precise measurements</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {design.appointmentType && (
                          <div>
                            <Label htmlFor="appointmentDate">Preferred Date & Time*</Label>
                            <Input
                              id="appointmentDate"
                              type="datetime-local"
                              value={design.appointmentDate || ''}
                              onChange={(e) => handleAppointmentDateChange(e.target.value)}
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-900">Professional Benefits</h4>
                            <ul className="text-sm text-green-700 mt-1 space-y-1">
                              <li>• Expert measurement by trained tailors</li>
                              <li>• Perfect fit guarantee</li>
                              <li>• Style consultation included</li>
                              <li>• Free alterations if needed</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Continue Button */}
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={() => {
                      const hasManualMeasurements = validateMeasurements()
                      const hasAppointment = isProfessionalMeasurementSelected()
                      
                      if (!hasManualMeasurements && !hasAppointment) {
                        toast({
                          title: "Measurements Required",
                          description: "Please either fill in all measurement fields or book a professional appointment.",
                          variant: "destructive"
                        })
                        return
                      }
                      
                      setCurrentStep("review")
                    }}
                    className="bg-pink-600 hover:bg-pink-700 px-8"
                    disabled={!validateMeasurements() && !isProfessionalMeasurementSelected()}
                  >
                    Continue to Review
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review Step */}
        {currentStep === "review" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Review Your Design</h2>
              <p className="text-gray-600">Review your custom blouse design and add to cart</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Design Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Design Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Fabric Details */}
                    <div>
                      <h4 className="font-medium mb-2">Fabric</h4>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          {design.fabric?.image ? (
                            <img 
                              src={design.fabric.image} 
                              alt={design.fabric.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div 
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: design.fabric?.color.toLowerCase() }}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{design.fabric?.name}</p>
                          <p className="text-sm text-gray-600">{design.fabric?.type} - {design.fabric?.color}</p>
                          {!design.fabric?.isOwnFabric && (
                            <p className="text-sm text-pink-600">₹{design.fabric?.pricePerMeter}/meter</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Selected Model */}
                    <div>
                      <h4 className="font-medium mb-2">Selected Model</h4>
                      <div className="space-y-2">
                        {design.selectedModels.frontModel && (
                          <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                              {design.selectedModels.frontModel.image ? (
                                <img 
                                  src={design.selectedModels.frontModel.image} 
                                  alt={design.selectedModels.frontModel.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-pink-800">{design.selectedModels.frontModel.name}</p>
                              <p className="text-sm text-pink-600">{design.selectedModels.frontModel.designName}</p>
                              <p className="text-sm text-pink-600">{formatPrice(design.selectedModels.frontModel.finalPrice)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Price Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        {!design.fabric?.isOwnFabric && design.fabric && (
                          <div className="flex justify-between">
                            <span>Fabric (1.5m)</span>
                            <span>₹{(design.fabric.pricePerMeter * 1.5).toLocaleString()}</span>
                          </div>
                        )}
                        {design.frontDesign && (
                          <div className="flex justify-between">
                            <span>Front Design Stitching</span>
                            <span>₹{design.frontDesign.stitchCost.toLocaleString()}</span>
                          </div>
                        )}
                        {design.backDesign && (
                          <div className="flex justify-between">
                            <span>Back Design Stitching</span>
                            <span>₹{design.backDesign.stitchCost.toLocaleString()}</span>
                          </div>
                        )}
                        {design.selectedModels.frontModel && (
                          <div className="flex justify-between">
                            <span>Selected Model</span>
                            <span>₹{design.selectedModels.frontModel.finalPrice.toLocaleString()}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span className="text-pink-600">{formatPrice(calculatePrice())}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Measurements & Appointment Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Measurements & Appointment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {validateMeasurements() && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Ruler className="h-4 w-4 mr-2" />
                          Manual Measurements
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span>Bust:</span>
                            <span>{design.measurements.bust}"</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Waist:</span>
                            <span>{design.measurements.waist}"</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Hips:</span>
                            <span>{design.measurements.hips}"</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shoulder:</span>
                            <span>{design.measurements.shoulder}"</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sleeve Length:</span>
                            <span>{design.measurements.sleeveLength}"</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Blouse Length:</span>
                            <span>{design.measurements.blouseLength}"</span>
                          </div>
                        </div>
                        {design.measurements.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm"><strong>Notes:</strong> {design.measurements.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {isProfessionalMeasurementSelected() && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Professional Appointment
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className="capitalize">
                              {design.appointmentType?.replace('_', ' ').toLowerCase()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Date & Time:</span>
                            <span>
                              {design.appointmentDate && new Date(design.appointmentDate).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                          <p className="text-sm text-green-700">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Our expert tailor will contact you to confirm the appointment details.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep("measurements")}
                        className="w-full"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Edit Measurements
                      </Button>
                      
                      <Button 
                        onClick={handleAddToCart}
                        className="w-full bg-pink-600 hover:bg-pink-700"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding to Cart...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart - {formatPrice(calculatePrice())}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}