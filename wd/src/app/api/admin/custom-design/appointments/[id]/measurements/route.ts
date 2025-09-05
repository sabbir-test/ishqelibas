import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { measurementDetails } = body

    if (!measurementDetails) {
      return NextResponse.json(
        { error: 'Measurement details are required' },
        { status: 400 }
      )
    }

    // Update the custom order with measurement details
    const updatedOrder = await db.customOrder.update({
      where: { id: params.id },
      data: {
        measurementDetails,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      measurementDetails: updatedOrder.measurementDetails
    })
  } catch (error) {
    console.error('Error updating measurements:', error)
    return NextResponse.json(
      { error: 'Failed to update measurements' },
      { status: 500 }
    )
  }
}