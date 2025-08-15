import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get custom orders that have appointment dates
    const customOrders = await db.customOrder.findMany({
      where: {
        appointmentDate: {
          not: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    })

    // Transform the data to match the appointment interface
    const appointments = customOrders.map((order) => ({
      id: order.id,
      userId: order.userId,
      userName: order.user.name || 'Unknown',
      userEmail: order.user.email,
      userPhone: order.user.phone || 'Not provided',
      appointmentDate: order.appointmentDate,
      status: order.status,
      notes: order.notes,
      customOrderId: order.id,
      createdAt: order.createdAt,
    }))

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, appointmentDate, notes } = body

    if (!userId || !appointmentDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create a new custom order with appointment
    const customOrder = await db.customOrder.create({
      data: {
        userId,
        appointmentDate: new Date(appointmentDate),
        notes,
        status: 'PENDING',
        fabric: '',
        fabricColor: '',
        frontDesign: '',
        backDesign: '',
        measurements: '',
        price: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    const appointment = {
      id: customOrder.id,
      userId: customOrder.userId,
      userName: customOrder.user.name || 'Unknown',
      userEmail: customOrder.user.email,
      userPhone: customOrder.user.phone || 'Not provided',
      appointmentDate: customOrder.appointmentDate,
      status: customOrder.status,
      notes: customOrder.notes,
      customOrderId: customOrder.id,
      createdAt: customOrder.createdAt,
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}