'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Ruler, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Eye,
  ArrowLeft
} from 'lucide-react'
import { format } from 'date-fns'

interface BlouseMeasurement {
  id: string
  userId: string
  customOrderId?: string
  blouseBackLength?: number
  fullShoulder?: number
  shoulderStrap?: number
  backNeckDepth?: number
  frontNeckDepth?: number
  shoulderToApex?: number
  frontLength?: number
  chest?: number
  waist?: number
  sleeveLength?: number
  armRound?: number
  sleeveRound?: number
  armHole?: number
  notes?: string
  measuredBy?: string
  measurementDate: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name?: string
    email: string
    phone?: string
  }
  customOrder?: {
    id: string
    status: string
    fabric: string
    fabricColor: string
    frontDesign: string
    backDesign: string
  }
}

interface User {
  id: string
  name?: string
  email: string
  phone?: string
}

interface CustomOrder {
  id: string
  status: string
  fabric: string
  fabricColor: string
  frontDesign: string
  backDesign: string
}

export default function AdminMeasurementsPage() {
  const [measurements, setMeasurements] = useState<BlouseMeasurement[]>([])
  const [filteredMeasurements, setFilteredMeasurements] = useState<BlouseMeasurement[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMeasurement, setSelectedMeasurement] = useState<BlouseMeasurement | null>(null)
  const [editingMeasurement, setEditingMeasurement] = useState<BlouseMeasurement | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    customOrderId: 'none',
    blouseBackLength: '',
    fullShoulder: '',
    shoulderStrap: '',
    backNeckDepth: '',
    frontNeckDepth: '',
    shoulderToApex: '',
    frontLength: '',
    chest: '',
    waist: '',
    sleeveLength: '',
    armRound: '',
    sleeveRound: '',
    armHole: '',
    notes: '',
    measurementDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchMeasurements()
    fetchUsers()
    fetchCustomOrders()
    
    // Handle URL parameters for pre-selection
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get('userId')
    const customOrderId = urlParams.get('customOrderId')
    
    if (userId) {
      setSelectedUser(userId)
      setFormData(prev => ({
        ...prev,
        userId,
        customOrderId: customOrderId || 'none'
      }))
      setIsCreating(true)
    }
  }, [])

  useEffect(() => {
    filterMeasurements()
  }, [measurements, searchTerm, selectedUser])

  const fetchMeasurements = async () => {
    try {
      const response = await fetch('/api/admin/measurements')
      if (response.ok) {
        const data = await response.json()
        setMeasurements(data.measurements)
      }
    } catch (error) {
      console.error('Error fetching measurements:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchCustomOrders = async () => {
    try {
      const response = await fetch('/api/admin/custom-orders')
      if (response.ok) {
        const data = await response.json()
        setCustomOrders(data.customOrders || [])
      }
    } catch (error) {
      console.error('Error fetching custom orders:', error)
    }
  }

  const filterMeasurements = () => {
    let filtered = measurements

    if (selectedUser && selectedUser !== 'all') {
      filtered = filtered.filter(m => m.userId === selectedUser)
    }

    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user.phone?.includes(searchTerm)
      )
    }

    setFilteredMeasurements(filtered)
  }

  const handleCreateMeasurement = async () => {
    setIsSaving(true)
    try {
      const payload = {
        userId: formData.userId,
        customOrderId: formData.customOrderId === 'none' ? null : formData.customOrderId || null,
        blouseBackLength: formData.blouseBackLength ? parseFloat(formData.blouseBackLength) : null,
        fullShoulder: formData.fullShoulder ? parseFloat(formData.fullShoulder) : null,
        shoulderStrap: formData.shoulderStrap ? parseFloat(formData.shoulderStrap) : null,
        backNeckDepth: formData.backNeckDepth ? parseFloat(formData.backNeckDepth) : null,
        frontNeckDepth: formData.frontNeckDepth ? parseFloat(formData.frontNeckDepth) : null,
        shoulderToApex: formData.shoulderToApex ? parseFloat(formData.shoulderToApex) : null,
        frontLength: formData.frontLength ? parseFloat(formData.frontLength) : null,
        chest: formData.chest ? parseFloat(formData.chest) : null,
        waist: formData.waist ? parseFloat(formData.waist) : null,
        sleeveLength: formData.sleeveLength ? parseFloat(formData.sleeveLength) : null,
        armRound: formData.armRound ? parseFloat(formData.armRound) : null,
        sleeveRound: formData.sleeveRound ? parseFloat(formData.sleeveRound) : null,
        armHole: formData.armHole ? parseFloat(formData.armHole) : null,
        notes: formData.notes || null,
        measurementDate: formData.measurementDate
      }

      const response = await fetch('/api/admin/measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await fetchMeasurements()
        resetForm()
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Error creating measurement:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateMeasurement = async () => {
    if (!editingMeasurement) return

    setIsSaving(true)
    try {
      const payload = {
        customOrderId: formData.customOrderId === 'none' ? null : formData.customOrderId || null,
        blouseBackLength: formData.blouseBackLength ? parseFloat(formData.blouseBackLength) : null,
        fullShoulder: formData.fullShoulder ? parseFloat(formData.fullShoulder) : null,
        shoulderStrap: formData.shoulderStrap ? parseFloat(formData.shoulderStrap) : null,
        backNeckDepth: formData.backNeckDepth ? parseFloat(formData.backNeckDepth) : null,
        frontNeckDepth: formData.frontNeckDepth ? parseFloat(formData.frontNeckDepth) : null,
        shoulderToApex: formData.shoulderToApex ? parseFloat(formData.shoulderToApex) : null,
        frontLength: formData.frontLength ? parseFloat(formData.frontLength) : null,
        chest: formData.chest ? parseFloat(formData.chest) : null,
        waist: formData.waist ? parseFloat(formData.waist) : null,
        sleeveLength: formData.sleeveLength ? parseFloat(formData.sleeveLength) : null,
        armRound: formData.armRound ? parseFloat(formData.armRound) : null,
        sleeveRound: formData.sleeveRound ? parseFloat(formData.sleeveRound) : null,
        armHole: formData.armHole ? parseFloat(formData.armHole) : null,
        notes: formData.notes || null,
        measurementDate: formData.measurementDate
      }

      const response = await fetch(`/api/admin/measurements/${editingMeasurement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await fetchMeasurements()
        setEditingMeasurement(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error updating measurement:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteMeasurement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this measurement?')) return

    try {
      const response = await fetch(`/api/admin/measurements/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchMeasurements()
        if (selectedMeasurement?.id === id) {
          setSelectedMeasurement(null)
        }
      }
    } catch (error) {
      console.error('Error deleting measurement:', error)
    }
  }

  const startEdit = (measurement: BlouseMeasurement) => {
    setEditingMeasurement(measurement)
    setFormData({
      userId: measurement.userId,
      customOrderId: measurement.customOrderId || 'none',
      blouseBackLength: measurement.blouseBackLength?.toString() || '',
      fullShoulder: measurement.fullShoulder?.toString() || '',
      shoulderStrap: measurement.shoulderStrap?.toString() || '',
      backNeckDepth: measurement.backNeckDepth?.toString() || '',
      frontNeckDepth: measurement.frontNeckDepth?.toString() || '',
      shoulderToApex: measurement.shoulderToApex?.toString() || '',
      frontLength: measurement.frontLength?.toString() || '',
      chest: measurement.chest?.toString() || '',
      waist: measurement.waist?.toString() || '',
      sleeveLength: measurement.sleeveLength?.toString() || '',
      armRound: measurement.armRound?.toString() || '',
      sleeveRound: measurement.sleeveRound?.toString() || '',
      armHole: measurement.armHole?.toString() || '',
      notes: measurement.notes || '',
      measurementDate: new Date(measurement.measurementDate).toISOString().split('T')[0]
    })
  }

  const resetForm = () => {
    setFormData({
      userId: '',
      customOrderId: 'none',
      blouseBackLength: '',
      fullShoulder: '',
      shoulderStrap: '',
      backNeckDepth: '',
      frontNeckDepth: '',
      shoulderToApex: '',
      frontLength: '',
      chest: '',
      waist: '',
      sleeveLength: '',
      armRound: '',
      sleeveRound: '',
      armHole: '',
      notes: '',
      measurementDate: new Date().toISOString().split('T')[0]
    })
  }

  const startCreate = () => {
    resetForm()
    setIsCreating(true)
    setEditingMeasurement(null)
    setSelectedMeasurement(null)
  }

  const cancelEdit = () => {
    setEditingMeasurement(null)
    setIsCreating(false)
    resetForm()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Measurement Management</h1>
          <p className="text-gray-600 mt-2">Manage customer blouse measurements</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchMeasurements} variant="outline">
            Refresh
          </Button>
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Measurement
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Measurements</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{measurements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(measurements.map(m => m.userId)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Measurements</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {measurements.filter(m => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(m.measurementDate) > weekAgo
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linked to Orders</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {measurements.filter(m => m.customOrderId).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search by name, email, or phone</Label>
              <Input
                id="search"
                placeholder="Search measurements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Label htmlFor="user">Filter by User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Measurements List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Measurements ({filteredMeasurements.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredMeasurements.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No measurements found</p>
                ) : (
                  filteredMeasurements.map((measurement) => (
                    <div
                      key={measurement.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMeasurement?.id === measurement.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedMeasurement(measurement)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{measurement.user.name || measurement.user.email}</span>
                            {measurement.customOrderId && (
                              <Badge variant="secondary">Linked to Order</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span>{measurement.user.email}</span>
                            </div>
                            {measurement.user.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{measurement.user.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(measurement.measurementDate), 'PPP')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Ruler className="h-3 w-3" />
                              <span>Measured by: {measurement.measuredBy || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEdit(measurement)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteMeasurement(measurement.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Measurement Details/Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {isCreating ? 'New Measurement' : editingMeasurement ? 'Edit Measurement' : selectedMeasurement ? 'Measurement Details' : 'Measurement Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(isCreating || editingMeasurement) ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">User *</Label>
                    <Select
                      value={formData.userId}
                      onValueChange={(value) => setFormData({...formData, userId: value})}
                      disabled={!!editingMeasurement}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customOrderId">Custom Order (Optional)</Label>
                    <Select
                      value={formData.customOrderId}
                      onValueChange={(value) => setFormData({...formData, customOrderId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select custom order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No custom order</SelectItem>
                        {customOrders
                          .filter(order => !formData.userId || order.userId === formData.userId)
                          .map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              {order.fabric} - {order.frontDesign} / {order.backDesign}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measurementDate">Measurement Date</Label>
                    <Input
                      id="measurementDate"
                      type="date"
                      value={formData.measurementDate}
                      onChange={(e) => setFormData({...formData, measurementDate: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">BLOUSE FRONT</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="blouseBackLength">Blouse Back Length</Label>
                        <Input
                          id="blouseBackLength"
                          type="number"
                          step="0.1"
                          placeholder="cm"
                          value={formData.blouseBackLength}
                          onChange={(e) => setFormData({...formData, blouseBackLength: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fullShoulder">Full Shoulder</Label>
                        <Input
                          id="fullShoulder"
                          type="number"
                          step="0.1"
                          placeholder="cm"
                          value={formData.fullShoulder}
                          onChange={(e) => setFormData({...formData, fullShoulder: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoulderStrap">Shoulder Strap</Label>
                        <Input
                          id="shoulderStrap"
                          type="number"
                          step="0.1"
                          placeholder="cm"
                          value={formData.shoulderStrap}
                          onChange={(e) => setFormData({...formData, shoulderStrap: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="backNeckDepth">Back Neck Depth</Label>
                        <Input
                          id="backNeckDepth"
                          type="number"
                          step="0.1"
                          placeholder="cm"
                          value={formData.backNeckDepth}
                          onChange={(e) => setFormData({...formData, backNeckDepth: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="frontNeckDepth">Front Neck Depth</Label>
                        <Input
                          id="frontNeckDepth"
                          type="number"
                          step="0.1"
                          placeholder="cm"
                          value={formData.frontNeckDepth}
                          onChange={(e) => setFormData({...formData, frontNeckDepth: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoulderToApex">Shoulder to Apex</Label>
                        <Input
                          id="shoulderToApex"
                          type="number"
                          step="0.1"
                          placeholder="cm"
                          value={formData.shoulderToApex}
                          onChange={(e) => setFormData({...formData, shoulderToApex: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="frontLength">Front Length</Label>
                        <Input
                          id="frontLength"
                          type="number"
                          step="0.1"
                          placeholder="cm"
                          value={formData.frontLength}
                          onChange={(e) => setFormData({...formData, frontLength: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="chest">Chest</Label>
                        <Input
                          id="chest"
                          type="number"
                          step="0.1"
                          placeholder="cm"
                          value={formData.chest}
                          onChange={(e) => setFormData({...formData, chest: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="waist">Waist</Label>
                        <Input
                          id="waist"
                          type="number"
                          step="0.1"
                          placeholder="cm"
                          value={formData.waist}
                          onChange={(e) => setFormData({...formData, waist: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">BLOUSE BACK</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="sleeveLength">Sleeve Length</Label>
                        <Input
                          id="sleeveLength"
                          type="number"
                          step="0.1"
                          placeholder="cm"
                          value={formData.sleeveLength}
                          onChange={(e) => setFormData({...formData, sleeveLength: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="armRound">Arm Round</Label>
                        <Input
                          id="armRound"
                          type="number"
                          step="0.1"
                          placeholder="cm"
                          value={formData.armRound}
                          onChange={(e) => setFormData({...formData, armRound: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="sleeveRound">Sleeve Round</Label>
                        <Input
                          id="sleeveRound"
                          type="number"
                          step="0.1"
                          placeholder="cm"
                          value={formData.sleeveRound}
                          onChange={(e) => setFormData({...formData, sleeveRound: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="armHole">Arm Hole</Label>
                        <Input
                          id="armHole"
                          type="number"
                          step="0.1"
                          placeholder="cm"
                          value={formData.armHole}
                          onChange={(e) => setFormData({...formData, armHole: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about the measurement..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={isCreating ? handleCreateMeasurement : handleUpdateMeasurement}
                      disabled={isSaving || !formData.userId}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : (isCreating ? 'Create' : 'Update')}
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : selectedMeasurement ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{selectedMeasurement.user.name || selectedMeasurement.user.email}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 ml-6">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{selectedMeasurement.user.email}</span>
                      </div>
                      {selectedMeasurement.user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{selectedMeasurement.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Measurement Date</span>
                    </div>
                    <div className="text-sm text-gray-600 ml-6">
                      <div>{format(new Date(selectedMeasurement.measurementDate), 'PPP')}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      <span className="font-medium">Measured By</span>
                    </div>
                    <div className="text-sm text-gray-600 ml-6">
                      {selectedMeasurement.measuredBy || 'Unknown'}
                    </div>
                  </div>

                  {selectedMeasurement.customOrder && (
                    <div className="space-y-2">
                      <span className="font-medium">Linked Custom Order</span>
                      <div className="text-sm text-gray-600 ml-6 space-y-1">
                        <div>Fabric: {selectedMeasurement.customOrder.fabric} ({selectedMeasurement.customOrder.fabricColor})</div>
                        <div>Front: {selectedMeasurement.customOrder.frontDesign}</div>
                        <div>Back: {selectedMeasurement.customOrder.backDesign}</div>
                        <Badge variant="secondary">{selectedMeasurement.customOrder.status}</Badge>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="font-medium">BLOUSE FRONT</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Blouse Back Length: {selectedMeasurement.blouseBackLength || '-'} cm</div>
                      <div>Full Shoulder: {selectedMeasurement.fullShoulder || '-'} cm</div>
                      <div>Shoulder Strap: {selectedMeasurement.shoulderStrap || '-'} cm</div>
                      <div>Back Neck Depth: {selectedMeasurement.backNeckDepth || '-'} cm</div>
                      <div>Front Neck Depth: {selectedMeasurement.frontNeckDepth || '-'} cm</div>
                      <div>Shoulder to Apex: {selectedMeasurement.shoulderToApex || '-'} cm</div>
                      <div>Front Length: {selectedMeasurement.frontLength || '-'} cm</div>
                      <div>Chest: {selectedMeasurement.chest || '-'} cm</div>
                      <div className="col-span-2">Waist: {selectedMeasurement.waist || '-'} cm</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">BLOUSE BACK</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Sleeve Length: {selectedMeasurement.sleeveLength || '-'} cm</div>
                      <div>Arm Round: {selectedMeasurement.armRound || '-'} cm</div>
                      <div>Sleeve Round: {selectedMeasurement.sleeveRound || '-'} cm</div>
                      <div>Arm Hole: {selectedMeasurement.armHole || '-'} cm</div>
                    </div>
                  </div>

                  {selectedMeasurement.notes && (
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {selectedMeasurement.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => startEdit(selectedMeasurement)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Select a measurement to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}