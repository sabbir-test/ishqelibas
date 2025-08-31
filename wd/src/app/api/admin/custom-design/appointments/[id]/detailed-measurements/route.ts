import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get detailed measurements for the appointment
    const measurements = await db.measurement.findMany({
      where: { 
        OR: [
          { customOrderId: params.id },
          { 
            customOrder: { 
              userId: params.id 
            } 
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(measurements)
  } catch (error) {
    console.error('Error fetching measurements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch measurements' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      userId,
      blouseBackLength,
      fullShoulder,
      shoulderStrap,
      backNeckDepth,
      frontNeckDepth,
      shoulderToApex,
      frontLength,
      chest,
      waist,
      sleeveLength,
      armRound,
      sleeveRound,
      armHole,
      notes
    } = body

    // Create new detailed measurement record
    const measurement = await db.measurement.create({
      data: {
        customOrderId: params.id,
        userId: userId || null,
        blouseBackLength: blouseBackLength ? parseFloat(blouseBackLength) : null,
        fullShoulder: fullShoulder ? parseFloat(fullShoulder) : null,
        shoulderStrap: shoulderStrap ? parseFloat(shoulderStrap) : null,
        backNeckDepth: backNeckDepth ? parseFloat(backNeckDepth) : null,
        frontNeckDepth: frontNeckDepth ? parseFloat(frontNeckDepth) : null,
        shoulderToApex: shoulderToApex ? parseFloat(shoulderToApex) : null,
        frontLength: frontLength ? parseFloat(frontLength) : null,
        chest: chest ? parseFloat(chest) : null,
        waist: waist ? parseFloat(waist) : null,
        sleeveLength: sleeveLength ? parseFloat(sleeveLength) : null,
        armRound: armRound ? parseFloat(armRound) : null,
        sleeveRound: sleeveRound ? parseFloat(sleeveRound) : null,
        armHole: armHole ? parseFloat(armHole) : null,
        notes
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json(measurement)
  } catch (error) {
    console.error('Error creating measurement:', error)
    return NextResponse.json(
      { error: 'Failed to create measurement' },
      { status: 500 }
    )
  }
}