import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const measurements = await db.salwarMeasurement.findMany({
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
    console.error('Error fetching salwar measurements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch salwar measurements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      customOrderId,
      bust,
      waist,
      hip,
      kameezLength,
      shoulder,
      sleeveLength,
      armholeRound,
      wristRound,
      waistTie,
      salwarLength,
      thighRound,
      kneeRound,
      ankleRound,
      notes
    } = body

    const measurement = await db.salwarMeasurement.create({
      data: {
        userId: userId || null,
        customOrderId: customOrderId || null,
        bust: bust ? parseFloat(bust) : null,
        waist: waist ? parseFloat(waist) : null,
        hip: hip ? parseFloat(hip) : null,
        kameezLength: kameezLength ? parseFloat(kameezLength) : null,
        shoulder: shoulder ? parseFloat(shoulder) : null,
        sleeveLength: sleeveLength ? parseFloat(sleeveLength) : null,
        armholeRound: armholeRound ? parseFloat(armholeRound) : null,
        wristRound: wristRound ? parseFloat(wristRound) : null,
        waistTie: waistTie ? parseFloat(waistTie) : null,
        salwarLength: salwarLength ? parseFloat(salwarLength) : null,
        thighRound: thighRound ? parseFloat(thighRound) : null,
        kneeRound: kneeRound ? parseFloat(kneeRound) : null,
        ankleRound: ankleRound ? parseFloat(ankleRound) : null,
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
    console.error('Error creating salwar measurement:', error)
    return NextResponse.json(
      { error: 'Failed to create salwar measurement' },
      { status: 500 }
    )
  }
}