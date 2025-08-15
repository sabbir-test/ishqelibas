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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Eye,
  ShoppingCart,
  Loader2,
  DollarSign
} from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import DesignVariantsModal from "@/components/custom-design/DesignVariantsModal"

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
  isActive: boolean
  createdAt: string
  updatedAt: string
  category?: BlouseDesignCategory | null
  variants?: BlouseDesignVariant[]
}

interface CustomDesign {
  fabric: Fabric | null
  frontDesign: BlouseDesign | null
  backDesign: BlouseDesign | null
  frontDesignVariant: BlouseDesignVariant | null
  backDesignVariant: BlouseDesignVariant | null
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
  ownFabricDetails?: OwnFabricDetails | null
}

export default function CustomDesignPage() {
  const [currentStep, setCurrentStep] = useState<DesignStep>("fabric")
  const [design, setDesign] = useState<CustomDesign>({
    fabric: null,
    frontDesign: null,
    backDesign: null,
    frontDesignVariant: null,
    backDesignVariant: null,
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
    ownFabricDetails: {
      name: "",
      color: "",
      quantity: 0,
      description: ""
    }
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [frontDesigns, setFrontDesigns] = useState<BlouseDesign[]>([])
  const [backDesigns, setBackDesigns] = useState<BlouseDesign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showVariantsModal, setShowVariantsModal] = useState(false)
  const [selectedDesignForVariants, setSelectedDesignForVariants] = useState<BlouseDesign | null>(null)
  const [variantsModalDesignType, setVariantsModalDesignType] = useState<"front" | "back">("front")
  
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
    fetchFabrics()
    fetchDesigns()
  }, [])

  const fetchFabrics = async () => {
    try {
      const response = await fetch("/api/fabrics")
      if (response.ok) {
        const data = await response.json()
        setFabrics(data.fabrics)
      }
    } catch (error) {
      console.error("Error fetching fabrics:", error)
      toast({
        title: "Error",
        description: "Failed to load fabrics. Please try again.",
        variant: "destructive"
      })
    }
  }

  const fetchDesigns = async () => {
    try {
      const [frontResponse, backResponse] = await Promise.all([
        fetch("/api/blouse-designs?type=FRONT&includeVariants=true"),
        fetch("/api/blouse-designs?type=BACK&includeVariants=true")
      ])

      if (frontResponse.ok) {
        const frontData = await frontResponse.json()
        setFrontDesigns(frontData.designs)
      }

      if (backResponse.ok) {
        const backData = await backResponse.json()
        setBackDesigns(backData.designs)
      }
    } catch (error) {
      console.error("Error fetching designs:", error)
      toast({
        title: "Error",
        description: "Failed to load designs. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && (currentStep === "fabric" || currentStep === "design")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading design options...</p>
        </div>
      </div>
    )
  }

  const calculatePrice = () => {
    if (!design.fabric) return 0
    
    // Base price for custom blouse
    let basePrice = 1500
    
    // Add fabric cost (only if not customer's own fabric)
    if (!design.fabric.isOwnFabric) {
      basePrice += design.fabric.pricePerMeter * 1.5
    }
    
    // Add design complexity cost
    if (design.frontDesign) basePrice += 300
    if (design.backDesign) basePrice += 300
    
    return basePrice
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const handleFabricSelect = (fabric: Fabric) => {
    setDesign(prev => ({ ...prev, fabric }))
    setCurrentStep("design")
  }

  const handleDesignSelect = (designType: "front" | "back", selectedDesign: BlouseDesign) => {
    setSelectedDesignForVariants(selectedDesign)
    setVariantsModalDesignType(designType)
    setShowVariantsModal(true)
  }

  const handleDesignConfirm = (designType: "front" | "back", selectedDesign: BlouseDesign, selectedVariant: BlouseDesignVariant | null) => {
    if (designType === "front") {
      setDesign(prev => ({ 
        ...prev, 
        frontDesign: selectedDesign,
        frontDesignVariant: selectedVariant
      }))
    } else {
      setDesign(prev => ({ 
        ...prev, 
        backDesign: selectedDesign,
        backDesignVariant: selectedVariant
      }))
    }
    setShowVariantsModal(false)
    setSelectedDesignForVariants(null)
  }

  const handleDesignVariantSelect = (designType: "front" | "back", selectedVariant: BlouseDesignVariant) => {
    if (designType === "front") {
      setDesign(prev => ({ ...prev, frontDesignVariant: selectedVariant }))
    } else {
      setDesign(prev => ({ ...prev, backDesignVariant: selectedVariant }))
    }
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

  const validateMeasurements = () => {
    const { measurements } = design
    return Object.values(measurements).every(value => value.trim() !== "")
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
        customDesign: design
      }

      addItem(customOrder)
      toast({
        title: "Added to cart",
        description: "Your custom blouse design has been added to cart.",
      })
      
      // Reset form
      setDesign({
        fabric: null,
        frontDesign: null,
        backDesign: null,
        frontDesignVariant: null,
        backDesignVariant: null,
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
        ownFabricDetails: {
          name: "",
          color: "",
          quantity: 0,
          description: ""
        }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Custom Blouse Design</h1>
              <p className="text-gray-600">Create your perfect custom-fit blouse</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === "fabric" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Choose Your Fabric</h2>
              <p className="text-gray-600">Select from our premium collection or provide your own fabric</p>
            </div>
            
            {/* Fabric Options */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Option 1: Choose from Collection */}
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
                  </CardContent>
                </Card>

                {/* Option 2: Provide Own Fabric */}
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

        {currentStep === "design" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Select Your Design</h2>
              <p className="text-gray-600">Choose front and back designs for your blouse</p>
            </div>

            {/* Front Designs */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Front Design</h3>
              {frontDesigns.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No front designs available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {frontDesigns.map((designOption) => (
                    <Card 
                      key={designOption.id} 
                      className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        design.frontDesign?.id === designOption.id 
                          ? "ring-2 ring-pink-600 bg-pink-50" 
                          : "border-gray-200 hover:border-pink-300"
                      }`}
                      onClick={() => handleDesignSelect("front", designOption)}
                    >
                      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                        {designOption.image ? (
                          <img 
                            src={designOption.image} 
                            alt={designOption.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Scissors className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                        {design.frontDesign?.id === designOption.id && (
                          <div className="absolute top-2 right-2 bg-pink-600 text-white rounded-full p-1">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        )}
                        {designOption.variants && designOption.variants.length > 0 && (
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                            {designOption.variants.length} styles
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">{designOption.name}</CardTitle>
                          
                          {designOption.category && (
                            <Badge variant="outline" className="w-fit">
                              {designOption.category.name}
                            </Badge>
                          )}
                          
                          {designOption.description && (
                            <CardDescription className="text-sm">
                              {designOption.description}
                            </CardDescription>
                          )}
                          
                          {designOption.variants && designOption.variants.length > 0 && (
                            <div className="flex items-center space-x-2 mt-3">
                              <div className="flex -space-x-2">
                                {designOption.variants.slice(0, 3).map((variant, index) => (
                                  <div 
                                    key={variant.id}
                                    className="w-8 h-8 bg-gray-200 rounded border-2 border-white overflow-hidden"
                                  >
                                    {variant.image ? (
                                      <img 
                                        src={variant.image} 
                                        alt={variant.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Scissors className="h-4 w-4 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {designOption.variants.length > 3 && (
                                  <div className="w-8 h-8 bg-gray-300 rounded border-2 border-white flex items-center justify-center text-xs font-medium">
                                    +{designOption.variants.length - 3}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-gray-600">
                                Click to view styles
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Back Designs */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Back Design</h3>
              {backDesigns.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No back designs available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {backDesigns.map((designOption) => (
                    <Card 
                      key={designOption.id} 
                      className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        design.backDesign?.id === designOption.id 
                          ? "ring-2 ring-pink-600 bg-pink-50" 
                          : "border-gray-200 hover:border-pink-300"
                      }`}
                      onClick={() => handleDesignSelect("back", designOption)}
                    >
                      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                        {designOption.image ? (
                          <img 
                            src={designOption.image} 
                            alt={designOption.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Scissors className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                        {design.backDesign?.id === designOption.id && (
                          <div className="absolute top-2 right-2 bg-pink-600 text-white rounded-full p-1">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        )}
                        {designOption.variants && designOption.variants.length > 0 && (
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                            {designOption.variants.length} styles
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">{designOption.name}</CardTitle>
                          
                          {designOption.category && (
                            <Badge variant="outline" className="w-fit">
                              {designOption.category.name}
                            </Badge>
                          )}
                          
                          {designOption.description && (
                            <CardDescription className="text-sm">
                              {designOption.description}
                            </CardDescription>
                          )}
                          
                          {designOption.variants && designOption.variants.length > 0 && (
                            <div className="flex items-center space-x-2 mt-3">
                              <div className="flex -space-x-2">
                                {designOption.variants.slice(0, 3).map((variant, index) => (
                                  <div 
                                    key={variant.id}
                                    className="w-8 h-8 bg-gray-200 rounded border-2 border-white overflow-hidden"
                                  >
                                    {variant.image ? (
                                      <img 
                                        src={variant.image} 
                                        alt={variant.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Scissors className="h-4 w-4 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {designOption.variants.length > 3 && (
                                  <div className="w-8 h-8 bg-gray-300 rounded border-2 border-white flex items-center justify-center text-xs font-medium">
                                    +{designOption.variants.length - 3}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-gray-600">
                                Click to view styles
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => setCurrentStep("measurements")}
                className="bg-pink-600 hover:bg-pink-700"
                disabled={!design.frontDesign && !design.backDesign}
              >
                Continue to Measurements
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === "measurements" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Measurements & Appointment</h2>
              <p className="text-gray-600">Enter your measurements or book a professional measurement appointment</p>
            </div>

            {/* Measurement Options */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Manual Measurements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Ruler className="h-5 w-5 mr-2" />
                      Enter Measurements Manually
                    </CardTitle>
                    <CardDescription>
                      Provide your measurements for a perfect fit
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bust">Bust (inches)*</Label>
                        <Input
                          id="bust"
                          type="number"
                          placeholder="36"
                          value={design.measurements.bust}
                          onChange={(e) => handleMeasurementChange("bust", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="waist">Waist (inches)*</Label>
                        <Input
                          id="waist"
                          type="number"
                          placeholder="30"
                          value={design.measurements.waist}
                          onChange={(e) => handleMeasurementChange("waist", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="hips">Hips (inches)*</Label>
                        <Input
                          id="hips"
                          type="number"
                          placeholder="38"
                          value={design.measurements.hips}
                          onChange={(e) => handleMeasurementChange("hips", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoulder">Shoulder (inches)*</Label>
                        <Input
                          id="shoulder"
                          type="number"
                          placeholder="15"
                          value={design.measurements.shoulder}
                          onChange={(e) => handleMeasurementChange("shoulder", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="sleeveLength">Sleeve Length (inches)*</Label>
                        <Input
                          id="sleeveLength"
                          type="number"
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
                          placeholder="15"
                          value={design.measurements.blouseLength}
                          onChange={(e) => handleMeasurementChange("blouseLength", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any specific requirements or preferences..."
                        value={design.measurements.notes}
                        onChange={(e) => handleMeasurementChange("notes", e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="mt-6">
                      <Button 
                        onClick={() => {
                          if (validateMeasurements()) {
                            toast({
                              title: "Measurements Saved",
                              description: "Your measurements have been saved. Proceed to review your design.",
                            })
                            setCurrentStep("review")
                          } else {
                            toast({
                              title: "Incomplete Measurements",
                              description: "Please fill in all required measurement fields.",
                              variant: "destructive"
                            })
                          }
                        }}
                        className="w-full"
                        disabled={!validateMeasurements()}
                      >
                        Save Measurements & Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Measurement */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Book Professional Measurement
                    </CardTitle>
                    <CardDescription>
                      Our experts will take accurate measurements for the perfect fit. 
                      Available for virtual or in-person appointments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-3">
                          <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900">Professional Measurement Service</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              Let our experts take your measurements for the perfect fit. 
                              Choose between virtual video call or in-person appointment.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Appointment Type</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <Button
                            variant={design.appointmentDate ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => {
                              // For demo purposes, set a mock appointment date
                              const tomorrow = new Date()
                              tomorrow.setDate(tomorrow.getDate() + 1)
                              handleAppointmentDateChange(tomorrow.toISOString())
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Virtual Call
                          </Button>
                          <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => {
                              toast({
                                title: "In-Person Booking",
                                description: "Please visit our store for in-person measurements.",
                              })
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            In-Person
                          </Button>
                        </div>
                      </div>

                      {design.appointmentDate && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-green-900">Appointment Scheduled</h4>
                              <p className="text-sm text-green-700 mt-1">
                                Virtual measurement appointment scheduled for {new Date(design.appointmentDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-6">
                        <Button 
                          onClick={() => {
                            if (design.appointmentDate) {
                              toast({
                                title: "Appointment Confirmed",
                                description: "Your measurement appointment has been confirmed.",
                              })
                              setCurrentStep("review")
                            } else {
                              toast({
                                title: "Select Appointment",
                                description: "Please select an appointment type to continue.",
                                variant: "destructive"
                              })
                            }
                          }}
                          className="w-full"
                          disabled={!design.appointmentDate}
                        >
                          Confirm Appointment & Continue
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {currentStep === "review" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Review Your Design</h2>
              <p className="text-gray-600">Review your custom blouse design and add to cart</p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Design Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scissors className="h-5 w-5 mr-2" />
                    Design Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fabric</p>
                      <p className="font-medium">{design.fabric?.name || "Custom fabric"}</p>
                      {design.fabric?.color && (
                        <div className="flex items-center space-x-2 mt-1">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: design.fabric.color.toLowerCase() }}
                          />
                          <span className="text-sm text-gray-600">{design.fabric.color}</span>
                        </div>
                      )}
                    </div>
                    {design.frontDesign && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Front Design</p>
                        <p className="font-medium">{design.frontDesign.name}</p>
                        {design.frontDesignVariant && (
                          <p className="text-sm text-gray-500">Style: {design.frontDesignVariant.name}</p>
                        )}
                      </div>
                    )}
                    {design.backDesign && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Back Design</p>
                        <p className="font-medium">{design.backDesign.name}</p>
                        {design.backDesignVariant && (
                          <p className="text-sm text-gray-500">Style: {design.backDesignVariant.name}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Measurements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Ruler className="h-5 w-5 mr-2" />
                    Measurements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Bust: <span className="font-medium">{design.measurements.bust}"</span></div>
                    <div>Waist: <span className="font-medium">{design.measurements.waist}"</span></div>
                    <div>Hips: <span className="font-medium">{design.measurements.hips}"</span></div>
                    <div>Shoulder: <span className="font-medium">{design.measurements.shoulder}"</span></div>
                    <div>Sleeve: <span className="font-medium">{design.measurements.sleeveLength}"</span></div>
                    <div>Length: <span className="font-medium">{design.measurements.blouseLength}"</span></div>
                  </div>
                  {design.measurements.notes && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-600">Notes:</p>
                      <p className="text-sm">{design.measurements.notes}</p>
                    </div>
                  )}
                  {design.appointmentDate && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Professional Measurement</p>
                      <p className="text-sm text-blue-700">
                        Appointment on {new Date(design.appointmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Price Summary */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Price Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>₹1,500</span>
                    </div>
                    {!design.fabric?.isOwnFabric && design.fabric && (
                      <div className="flex justify-between">
                        <span>Fabric ({design.fabric.name}):</span>
                        <span>₹{(design.fabric.pricePerMeter * 1.5).toLocaleString()}</span>
                      </div>
                    )}
                    {design.frontDesign && (
                      <div className="flex justify-between">
                        <span>Front Design:</span>
                        <span>₹300</span>
                      </div>
                    )}
                    {design.backDesign && (
                      <div className="flex justify-between">
                        <span>Back Design:</span>
                        <span>₹300</span>
                      </div>
                    )}
                    {design.fabric?.isOwnFabric && (
                      <div className="flex justify-between text-green-600">
                        <span>Fabric Savings:</span>
                        <span>-₹{((design.fabric.pricePerMeter || 0) * 1.5).toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-pink-600">{formatPrice(calculatePrice())}</span>
                    </div>
                    {design.fabric?.isOwnFabric && (
                      <p className="text-sm text-green-600 mt-2">
                        💰 You saved ₹{((design.fabric.pricePerMeter || 0) * 1.5).toLocaleString()} by providing your own fabric!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleAddToCart}
                className="bg-pink-600 hover:bg-pink-700 px-8"
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
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Design Variants Modal */}
      <DesignVariantsModal
        isOpen={showVariantsModal}
        onClose={() => {
          setShowVariantsModal(false)
          setSelectedDesignForVariants(null)
        }}
        design={selectedDesignForVariants}
        selectedVariant={
          variantsModalDesignType === "front" 
            ? design.frontDesignVariant 
            : design.backDesignVariant
        }
        onVariantSelect={(variant) => {
          handleDesignConfirm(variantsModalDesignType, selectedDesignForVariants!, variant)
        }}
        designType={variantsModalDesignType}
      />
    </div>
  )
}