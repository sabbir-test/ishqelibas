import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      userId,
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

    const measurement = await db.salwarMeasurement.update({
      where: { id: params.id },
      data: {
        userId: userId || null,
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
    console.error('Error updating salwar measurement:', error)
    return NextResponse.json(
      { error: 'Failed to update salwar measurement' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.salwarMeasurement.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting salwar measurement:', error)
    return NextResponse.json(
      { error: 'Failed to delete salwar measurement' },
      { status: 500 }
    )
  }
}