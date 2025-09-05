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
import { 
  ArrowLeft, 
  ArrowRight, 
  Ruler, 
  Palette, 
  Package,
  Calendar,
  CheckCircle,
  AlertCircle,
  Upload,
  ShoppingCart,
  Loader2,
  Image as ImageIcon
} from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type DesignStep = "fabric" | "model" | "measurements" | "review"

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

interface SalwarKameezModel {
  id: string
  name: string
  designName: string
  image?: string
  description?: string
  price: number
  discount?: number
  finalPrice: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CustomSalwarDesign {
  fabric: Fabric | null
  selectedModel: SalwarKameezModel | null
  measurements: {
    bust: string
    waist: string
    hips: string
    shoulder: string
    kameezLength: string
    sleeveLength: string
    salwarLength: string
    notes: string
  }
  appointmentDate: string | null
  appointmentType: "VIRTUAL" | "IN_PERSON" | null
  ownFabricDetails?: OwnFabricDetails | null
}

export default function CustomSalwarKameezDesignPage() {
  const [currentStep, setCurrentStep] = useState<DesignStep>("fabric")
  const [design, setDesign] = useState<CustomSalwarDesign>({
    fabric: null,
    selectedModel: null,
    measurements: {
      bust: "",
      waist: "",
      hips: "",
      shoulder: "",
      kameezLength: "",
      sleeveLength: "",
      salwarLength: "",
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
  const [models, setModels] = useState<SalwarKameezModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCollectionCard, setShowCollectionCard] = useState(true)
  const [manualMeasurementsEnabled, setManualMeasurementsEnabled] = useState(true)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  
  const { addItem } = useCart()
  const { toast } = useToast()

  const steps = [
    { id: "fabric", name: "Fabric Selection", icon: Palette },
    { id: "model", name: "Model Selection", icon: Package },
    { id: "measurements", name: "Measurements", icon: Ruler },
    { id: "review", name: "Review & Order", icon: CheckCircle }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  useEffect(() => {
    if (currentStep === "fabric") {
      fetchFabricCollectionSetting()
      fetchFabrics()
    } else if (currentStep === "model") {
      fetchSalwarKameezModels()
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

  const fetchSalwarKameezModels = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/salwar-kameez-models")
      if (response.ok) {
        const data = await response.json()
        setModels(data.models.filter((model: SalwarKameezModel) => model.isActive))
      } else {
        throw new Error("Failed to fetch salwar kameez models")
      }
    } catch (error) {
      console.error("Error fetching salwar kameez models:", error)
      setError("Failed to load models. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load salwar kameez models. Please try again.",
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
      totalPrice += design.fabric.pricePerMeter * 3 // More fabric needed for salwar kameez
    }
    
    if (design.selectedModel && design.selectedModel.finalPrice) {
      totalPrice += design.selectedModel.finalPrice
    }
    
    return totalPrice
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const handleModelSelect = (model: SalwarKameezModel) => {
    setDesign(prev => ({
      ...prev,
      selectedModel: model
    }))

    toast({
      title: "Model Selected",
      description: `${model.name} selected for your salwar kameez`
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

  const handleAddToCart = async () => {
    if (!design.fabric) {
      toast({
        title: "Fabric required",
        description: "Please select a fabric for your custom salwar kameez.",
        variant: "destructive"
      })
      return
    }

    if (!design.selectedModel) {
      toast({
        title: "Model required",
        description: "Please select a model for your custom salwar kameez.",
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
        productId: "custom-salwar-kameez",
        name: `Custom Salwar Kameez - ${design.selectedModel.name}`,
        price: calculatePrice(),
        finalPrice: calculatePrice(),
        quantity: 1,
        image: design.selectedModel.image || "/api/placeholder/200/200",
        sku: `CUSTOM-SK-${Date.now()}`,
        customDesign: design
      }

      addItem(customOrder)
      toast({
        title: "Added to cart",
        description: "Your custom salwar kameez design has been added to cart.",
      })
      
      setCurrentStep("fabric")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add custom salwar kameez to cart.",
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
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
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
              <h1 className="text-3xl font-bold text-gray-900">Custom Salwar Kameez Design</h1>
              <p className="text-gray-600">Create your perfect custom-fit salwar kameez</p>
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
                    ? "bg-purple-600 border-purple-600 text-white"
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
        {/* Fabric Selection Step */}
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
                                design.fabric?.id === fabric.id ? "ring-2 ring-purple-600 bg-purple-50" : "border-gray-200"
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
                                    <p className="text-lg font-bold text-purple-600">
                                      ₹{fabric.pricePerMeter}/m
                                    </p>
                                  </div>
                                </div>
                                {design.fabric?.id === fabric.id && (
                                  <CheckCircle className="h-5 w-5 text-purple-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {design.fabric && !design.fabric.isOwnFabric && (
                        <div className="mt-6 pt-4 border-t">
                          <Button 
                            onClick={() => setCurrentStep("model")}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            Continue to Model Selection
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
                      Use your own fabric for a truly custom salwar kameez
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
                            salwar kameez with your own material. Just provide the details below.
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
                          placeholder="3.0"
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
                            setCurrentStep("model")
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

        {/* Model Selection Step */}
        {currentStep === "model" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Select Your Model</h2>
              <p className="text-gray-600">Choose from our beautiful salwar kameez designs</p>
            </div>

            <div className="space-y-6">
              {models.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No models available</h3>
                  <p className="text-gray-600">Please check back later for available models.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {models.map((model) => {
                    const isSelected = design.selectedModel?.id === model.id

                    return (
                      <Card key={model.id} className={`overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer ${
                        isSelected ? "ring-2 ring-purple-600 bg-purple-50" : ""
                      }`} onClick={() => handleModelSelect(model)}>
                        <CardHeader className="pb-3">
                          <div className="relative">
                            {model.image ? (
                              <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={model.image}
                                  alt={model.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                <Package className="h-12 w-12 text-purple-400" />
                              </div>
                            )}
                            
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-green-500 text-white">
                                  Selected
                                </Badge>
                              </div>
                            )}

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
                            <p className="text-sm text-purple-600 font-medium">{model.designName}</p>
                            {model.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{model.description}</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              {model.discount ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-purple-600">
                                    {formatPrice(model.finalPrice)}
                                  </span>
                                  <span className="text-sm text-gray-500 line-through">
                                    {formatPrice(model.price)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold text-purple-600">
                                  {formatPrice(model.finalPrice)}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  if (!design.selectedModel) {
                    toast({
                      title: "Selection Required",
                      description: "Please select a model to continue",
                      variant: "destructive"
                    })
                    return
                  }
                  setCurrentStep("measurements")
                }}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!design.selectedModel}
              >
                Continue to Measurements
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Measurements Step */}
        {currentStep === "measurements" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Measurements & Appointment</h2>
              <p className="text-gray-600">Enter your measurements or book a professional measurement appointment</p>
            </div>

            <div className="max-w-4xl mx-auto">
              {isLoadingConfig ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                  <span className="text-gray-600">Loading configuration...</span>
                </div>
              ) : (
                <div className={`grid ${manualMeasurementsEnabled ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                  {manualMeasurementsEnabled && (
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
                            <Label htmlFor="kameezLength">Kameez Length (inches)*</Label>
                            <Input
                              id="kameezLength"
                              type="number"
                              placeholder="42"
                              value={design.measurements.kameezLength}
                              onChange={(e) => handleMeasurementChange("kameezLength", e.target.value)}
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
                          <div className="md:col-span-2">
                            <Label htmlFor="salwarLength">Salwar Length (inches)*</Label>
                            <Input
                              id="salwarLength"
                              type="number"
                              placeholder="38"
                              value={design.measurements.salwarLength}
                              onChange={(e) => handleMeasurementChange("salwarLength", e.target.value)}
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
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Book Professional Measurement
                      </CardTitle>
                      <CardDescription>
                        Our experts will take accurate measurements for the perfect fit.
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
                              </p>
                            </div>
                          </div>
                        </div>

                        <Label>Appointment Type</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <Button
                            variant={design.appointmentType === "VIRTUAL" ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => handleAppointmentTypeChange("VIRTUAL")}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Virtual Call
                          </Button>
                          <Button
                            variant={design.appointmentType === "IN_PERSON" ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => handleAppointmentTypeChange("IN_PERSON")}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            In-Person
                          </Button>
                        </div>

                        {design.appointmentType && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="appointmentDate">Preferred Date</Label>
                              <Input
                                id="appointmentDate"
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={design.appointmentDate ? new Date(design.appointmentDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const date = new Date(e.target.value)
                                  const existingTime = design.appointmentDate ? new Date(design.appointmentDate) : new Date()
                                  date.setHours(existingTime.getHours(), existingTime.getMinutes())
                                  handleAppointmentDateChange(date.toISOString())
                                }}
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="appointmentTime">Preferred Time</Label>
                              <Input
                                id="appointmentTime"
                                type="time"
                                value={design.appointmentDate ? new Date(design.appointmentDate).toTimeString().slice(0, 5) : ''}
                                onChange={(e) => {
                                  const time = e.target.value.split(':')
                                  const existingDate = design.appointmentDate ? new Date(design.appointmentDate) : new Date()
                                  existingDate.setHours(parseInt(time[0]), parseInt(time[1]))
                                  handleAppointmentDateChange(existingDate.toISOString())
                                }}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-6">
                          <Button 
                            onClick={() => {
                              if (design.appointmentDate && design.appointmentType) {
                                toast({
                                  title: "Appointment Confirmed",
                                  description: "Your measurement appointment has been confirmed.",
                                })
                                setCurrentStep("review")
                              } else {
                                toast({
                                  title: "Incomplete Appointment",
                                  description: "Please select both appointment type and date/time to continue.",
                                  variant: "destructive"
                                })
                              }
                            }}
                            className="w-full"
                            disabled={!design.appointmentDate || !design.appointmentType}
                          >
                            Confirm Appointment & Continue
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Review Step */}
        {currentStep === "review" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Review Your Design</h2>
              <p className="text-gray-600">Review your custom salwar kameez design and add to cart</p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Design Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {design.selectedModel && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Model Name</p>
                        <p className="font-medium">{design.selectedModel.name}</p>
                        <p className="text-sm text-purple-600">{design.selectedModel.designName}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-600">Fabric Name</p>
                      {design.fabric?.isOwnFabric ? (
                        <div className="space-y-1">
                          <p className="font-medium text-blue-600">Client-Provided Fabric</p>
                          {design.ownFabricDetails && (
                            <div className="text-sm text-gray-600 space-y-1 bg-blue-50 p-3 rounded-md">
                              <p className="font-medium text-blue-800">Client Fabric Details:</p>
                              {design.ownFabricDetails.name && (
                                <p><span className="font-medium">Type:</span> {design.ownFabricDetails.name}</p>
                              )}
                              {design.ownFabricDetails.color && (
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">Color:</span>
                                  <div 
                                    className="w-4 h-4 rounded border"
                                    style={{ backgroundColor: design.ownFabricDetails.color.toLowerCase() }}
                                  />
                                  <span>{design.ownFabricDetails.color}</span>
                                </div>
                              )}
                              {design.ownFabricDetails.description && (
                                <p><span className="font-medium">Notes:</span> {design.ownFabricDetails.description}</p>
                              )}
                              {design.ownFabricDetails.quantity && (
                                <p><span className="font-medium">Quantity:</span> {design.ownFabricDetails.quantity} meters</p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-medium">{design.fabric?.name}</p>
                          {design.fabric?.color && (
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: design.fabric.color.toLowerCase() }}
                              />
                              <span className="text-sm text-gray-600">{design.fabric.color}</span>
                            </div>
                          )}
                          {design.fabric?.type && (
                            <p className="text-sm text-gray-600">{design.fabric.type}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Ruler className="h-5 w-5 mr-2" />
                    Measurements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {design.appointmentDate && design.appointmentType ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Professional Measurement Appointment</p>
                        <div className="text-sm text-blue-700 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Type:</span>
                            <span>{design.appointmentType === 'VIRTUAL' ? 'Virtual Call' : 'In-Person'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Date:</span>
                            <span>{new Date(design.appointmentDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Time:</span>
                            <span>{new Date(design.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Measurement details will be recorded during your appointment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Bust: <span className="font-medium">{design.measurements.bust}"</span></div>
                        <div>Waist: <span className="font-medium">{design.measurements.waist}"</span></div>
                        <div>Hips: <span className="font-medium">{design.measurements.hips}"</span></div>
                        <div>Shoulder: <span className="font-medium">{design.measurements.shoulder}"</span></div>
                        <div>Kameez Length: <span className="font-medium">{design.measurements.kameezLength}"</span></div>
                        <div>Sleeve Length: <span className="font-medium">{design.measurements.sleeveLength}"</span></div>
                        <div className="col-span-2">Salwar Length: <span className="font-medium">{design.measurements.salwarLength}"</span></div>
                      </div>
                      {design.measurements.notes && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-600">Notes:</p>
                          <p className="text-sm">{design.measurements.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-lg font-bold mr-2">₹</span>
                    Price Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {!design.fabric?.isOwnFabric && design.fabric && (
                      <div className="flex justify-between">
                        <span>Fabric Price (3 meters):</span>
                        <span>₹{(design.fabric.pricePerMeter * 3).toLocaleString()}</span>
                      </div>
                    )}

                    {design.selectedModel && (
                      <div className="flex justify-between">
                        <span>Model Price:</span>
                        <span>₹{design.selectedModel.finalPrice.toLocaleString()}</span>
                      </div>
                    )}

                    {design.fabric?.isOwnFabric && (
                      <div className="flex justify-between text-green-600">
                        <span>Fabric Savings:</span>
                        <span>-₹{((design.fabric.pricePerMeter || 0) * 3).toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Price:</span>
                      <span className="text-purple-600">{formatPrice(calculatePrice())}</span>
                    </div>
                    {design.fabric?.isOwnFabric && (
                      <p className="text-sm text-green-600 mt-2">
                        💰 You saved ₹{((design.fabric.pricePerMeter || 0) * 3).toLocaleString()} by providing your own fabric!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleAddToCart}
                className="bg-purple-600 hover:bg-purple-700 px-8"
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
    </div>
  )
}