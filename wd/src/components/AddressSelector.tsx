"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Plus, Home, Building, Map, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Address {
  id: string
  type: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

interface AddressFormData {
  type: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface AddressSelectorProps {
  shippingInfo: ShippingInfo
  onShippingInfoChange: (info: ShippingInfo) => void
  onAddressSelect: (addressId: string | null) => void
  onContinue: () => void
}

export default function AddressSelector({ shippingInfo, onShippingInfoChange, onAddressSelect, onContinue }: AddressSelectorProps) {
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isNewAddress, setIsNewAddress] = useState(false)
  const [formData, setFormData] = useState<AddressFormData>({
    type: "Home",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    isDefault: false
  })

  useEffect(() => {
    loadAddresses()
  }, [])

  useEffect(() => {
    // Auto-select default address if available
    const defaultAddress = addresses.find(addr => addr.isDefault)
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id)
      updateShippingInfoFromAddress(defaultAddress)
    }
  }, [addresses])

  const loadAddresses = async () => {
    try {
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.addresses || [])
      }
    } catch (error) {
      console.error('Error loading addresses:', error)
    }
  }

  const updateShippingInfoFromAddress = (address: Address) => {
    onShippingInfoChange({
      firstName: address.firstName,
      lastName: address.lastName,
      email: address.email,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country
    })
  }

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    onAddressSelect(addressId)
    const selectedAddress = addresses.find(addr => addr.id === addressId)
    if (selectedAddress) {
      updateShippingInfoFromAddress(selectedAddress)
      setIsNewAddress(false)
    }
  }

  const handleNewAddressClick = () => {
    setIsNewAddress(true)
    setSelectedAddressId(null)
    onAddressSelect(null)
    // Pre-fill with current shipping info if available
    setFormData({
      type: "Home",
      firstName: shippingInfo.firstName,
      lastName: shippingInfo.lastName,
      email: shippingInfo.email,
      phone: shippingInfo.phone,
      address: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zipCode: shippingInfo.zipCode,
      country: shippingInfo.country || "India",
      isDefault: addresses.length === 0
    })
  }

  const handleAddAddress = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const { address } = await response.json()
        setAddresses([...addresses, address])
        setSelectedAddressId(address.id)
        updateShippingInfoFromAddress(address)
        setIsModalOpen(false)
        setIsNewAddress(false)
        toast({
          title: "Address saved",
          description: "Your new address has been saved to your account.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save address.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseAddressForThisOrder = () => {
    if (isNewAddress) {
      // Validate the form
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || 
          !formData.address || !formData.city || !formData.state || !formData.zipCode) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        })
        return
      }
      
      // Update shipping info from form data
      onShippingInfoChange({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      })
      
      toast({
        title: "Address for this order",
        description: "This address will be used only for this order.",
      })
    }
    
    onContinue()
  }

  const getAddressIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'home':
        return <Home className="h-4 w-4" />
      case 'work':
        return <Building className="h-4 w-4" />
      default:
        return <Map className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Shipping Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {addresses.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Select a saved address</h3>
            <RadioGroup value={selectedAddressId || ""} onValueChange={handleAddressSelect}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="relative">
                    <RadioGroupItem
                      value={address.id}
                      id={`address-${address.id}`}
                      className="sr-only"
                    />
                    <label
                      htmlFor={`address-${address.id}`}
                      className={`block border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedAddressId === address.id
                          ? "border-pink-500 bg-pink-50 ring-2 ring-pink-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getAddressIcon(address.type)}
                          <h4 className="font-medium text-gray-900">{address.type}</h4>
                          {address.isDefault && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        {selectedAddressId === address.id && (
                          <Check className="h-5 w-5 text-pink-600" />
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>{address.firstName} {address.lastName}</strong></p>
                        <p>{address.email}</p>
                        <p>{address.phone}</p>
                        <p>{address.address}</p>
                        <p>{address.city}, {address.state} - {address.zipCode}</p>
                        <p>{address.country}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {addresses.length > 0 ? "Or use a new address" : "Enter shipping address"}
            </h3>
            {addresses.length > 0 && (
              <Button
                variant={isNewAddress ? "default" : "outline"}
                onClick={handleNewAddressClick}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Address
              </Button>
            )}
          </div>

          {(isNewAddress || addresses.length === 0) && (
            <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>

              {addresses.length > 0 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="w-4 h-4 text-pink-600"
                  />
                  <Label htmlFor="saveAddress">Save this address to my account for future orders</Label>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddAddress}
            disabled={isLoading || !isNewAddress || addresses.length === 0}
          >
            {isLoading ? "Saving..." : "Save Address"}
          </Button>
          <Button
            type="button"
            onClick={handleUseAddressForThisOrder}
            disabled={isLoading || (!selectedAddressId && !isNewAddress && addresses.length > 0)}
          >
            Continue to Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}