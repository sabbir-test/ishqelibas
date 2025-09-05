import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; measurementId: string } }
) {
  try {
    const body = await request.json()
    const {
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

    // Update the measurement record
    const measurement = await db.measurement.update({
      where: { id: params.measurementId },
      data: {
        ...(blouseBackLength !== undefined && { blouseBackLength: blouseBackLength ? parseFloat(blouseBackLength) : null }),
        ...(fullShoulder !== undefined && { fullShoulder: fullShoulder ? parseFloat(fullShoulder) : null }),
        ...(shoulderStrap !== undefined && { shoulderStrap: shoulderStrap ? parseFloat(shoulderStrap) : null }),
        ...(backNeckDepth !== undefined && { backNeckDepth: backNeckDepth ? parseFloat(backNeckDepth) : null }),
        ...(frontNeckDepth !== undefined && { frontNeckDepth: frontNeckDepth ? parseFloat(frontNeckDepth) : null }),
        ...(shoulderToApex !== undefined && { shoulderToApex: shoulderToApex ? parseFloat(shoulderToApex) : null }),
        ...(frontLength !== undefined && { frontLength: frontLength ? parseFloat(frontLength) : null }),
        ...(chest !== undefined && { chest: chest ? parseFloat(chest) : null }),
        ...(waist !== undefined && { waist: waist ? parseFloat(waist) : null }),
        ...(sleeveLength !== undefined && { sleeveLength: sleeveLength ? parseFloat(sleeveLength) : null }),
        ...(armRound !== undefined && { armRound: armRound ? parseFloat(armRound) : null }),
        ...(sleeveRound !== undefined && { sleeveRound: sleeveRound ? parseFloat(sleeveRound) : null }),
        ...(armHole !== undefined && { armHole: armHole ? parseFloat(armHole) : null }),
        ...(notes !== undefined && { notes })
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; measurementId: string } }
) {
  try {
    await db.measurement.delete({
      where: { id: params.measurementId }
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