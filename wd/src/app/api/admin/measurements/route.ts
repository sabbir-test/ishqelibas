import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')

    // Build where clause for filtering
    const whereClause: any = {}
    
    if (userId) {
      whereClause.userId = userId
    }
    
    if (search) {
      whereClause.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    // Get measurements with user information
    const measurements = await db.measurement.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        customOrder: {
          select: {
            id: true,
            appointmentDate: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
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

export async function POST(request: NextRequest) {
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

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create new measurement record linked to user
    const measurement = await db.measurement.create({
      data: {
        userId,
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