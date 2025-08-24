import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.measurement.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Measurement deleted successfully' })
  } catch (error) {
    console.error('Error deleting measurement:', error)
    return NextResponse.json(
      { error: 'Failed to delete measurement' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // Update measurement record
    const measurement = await db.measurement.update({
      where: { id: params.id },
      data: {
        userId: userId || undefined,
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
        },
        customOrder: {
          select: {
            id: true,
            appointmentDate: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json(measurement)
  } catch (error) {
    console.error('Error updating measurement:', error)
    return NextResponse.json(
      { error: 'Failed to update measurement' },
      { status: 500 }
    )
  }
}