'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User, Phone, Mail, MapPin, CheckCircle, XCircle, Clock as ClockIcon, Ruler } from 'lucide-react'
import { format } from 'date-fns'

interface Appointment {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  appointmentDate: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  customOrderId: string
  createdAt: string
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, statusFilter, searchTerm])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/admin/custom-design/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.userPhone.includes(searchTerm)
      )
    }

    setFilteredAppointments(filtered)
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string, notes?: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/custom-design/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      })

      if (response.ok) {
        await fetchAppointments()
        if (selectedAppointment?.id === appointmentId) {
          setSelectedAppointment(null)
        }
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <ClockIcon className="h-4 w-4" />
      case 'CONFIRMED': return <Clock className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Measurement Appointments</h1>
          <p className="text-gray-600 mt-2">Manage customer measurement appointments</p>
        </div>
        <Button onClick={fetchAppointments} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ClockIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === 'CONFIRMED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search by name, email, or phone</Label>
              <Input
                id="search"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredAppointments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No appointments found</p>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAppointment?.id === appointment.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{appointment.userName}</span>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1">{appointment.status}</span>
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span>{appointment.userEmail}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{appointment.userPhone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(appointment.appointmentDate), 'PPP')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-3 w-3" />
                              <span>{format(new Date(appointment.appointmentDate), 'p')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAppointment ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{selectedAppointment.userName}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 ml-6">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{selectedAppointment.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{selectedAppointment.userPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Appointment Date</span>
                    </div>
                    <div className="text-sm text-gray-600 ml-6">
                      <div>{format(new Date(selectedAppointment.appointmentDate), 'PPP')}</div>
                      <div>{format(new Date(selectedAppointment.appointmentDate), 'p')}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Status</span>
                    </div>
                    <div className="ml-6">
                      <Badge className={getStatusColor(selectedAppointment.status)}>
                        {getStatusIcon(selectedAppointment.status)}
                        <span className="ml-1">{selectedAppointment.status}</span>
                      </Badge>
                    </div>
                  </div>

                  {selectedAppointment.notes && (
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Update Status</Label>
                    <Select
                      value={selectedAppointment.status}
                      onValueChange={(value) => 
                        updateAppointmentStatus(selectedAppointment.id, value, selectedAppointment.notes)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Add Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add notes about this appointment..."
                      value={selectedAppointment.notes || ''}
                      onChange={(e) => setSelectedAppointment({
                        ...selectedAppointment,
                        notes: e.target.value
                      })}
                    />
                    <Button
                      onClick={() => updateAppointmentStatus(
                        selectedAppointment.id,
                        selectedAppointment.status,
                        selectedAppointment.notes
                      )}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      {isUpdating ? 'Updating...' : 'Update Notes'}
                    </Button>
                  </div>

                  {selectedAppointment.status === 'CONFIRMED' && (
                    <div className="space-y-2">
                      <Button 
                        onClick={() => {
                          // Navigate to measurement page with pre-selected user
                          window.location.href = `/admin/measurements?userId=${selectedAppointment.userId}&customOrderId=${selectedAppointment.customOrderId}`
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Ruler className="h-4 w-4 mr-2" />
                        Take Measurements
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Select an appointment to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}