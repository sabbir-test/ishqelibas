import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      token = request.cookies.get("auth-token")?.value
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
    }

    const measurement = await db.blouseMeasurement.findUnique({
      where: { id: params.id },
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
            status: true,
            fabric: true,
            fabricColor: true,
            frontDesign: true,
            backDesign: true
          }
        }
      }
    })

    if (!measurement) {
      return NextResponse.json({ error: "Measurement not found" }, { status: 404 })
    }

    return NextResponse.json({ measurement })
  } catch (error) {
    console.error("Error fetching measurement:", error)
    return NextResponse.json({ error: "Failed to fetch measurement" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      token = request.cookies.get("auth-token")?.value
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
    }

    const data = await request.json()

    // Check if measurement exists
    const existingMeasurement = await db.blouseMeasurement.findUnique({
      where: { id: params.id }
    })

    if (!existingMeasurement) {
      return NextResponse.json({ error: "Measurement not found" }, { status: 404 })
    }

    // If customOrderId is provided, check if it exists and belongs to the user
    if (data.customOrderId) {
      const customOrder = await db.customOrder.findFirst({
        where: {
          id: data.customOrderId,
          userId: existingMeasurement.userId
        }
      })

      if (!customOrder) {
        return NextResponse.json({ error: "Custom order not found or does not belong to this user" }, { status: 404 })
      }
    }

    // Update measurement
    const measurement = await db.blouseMeasurement.update({
      where: { id: params.id },
      data: {
        customOrderId: data.customOrderId || null,
        
        // BLOUSE FRONT measurements
        blouseBackLength: data.blouseBackLength !== undefined ? data.blouseBackLength : existingMeasurement.blouseBackLength,
        fullShoulder: data.fullShoulder !== undefined ? data.fullShoulder : existingMeasurement.fullShoulder,
        shoulderStrap: data.shoulderStrap !== undefined ? data.shoulderStrap : existingMeasurement.shoulderStrap,
        backNeckDepth: data.backNeckDepth !== undefined ? data.backNeckDepth : existingMeasurement.backNeckDepth,
        frontNeckDepth: data.frontNeckDepth !== undefined ? data.frontNeckDepth : existingMeasurement.frontNeckDepth,
        shoulderToApex: data.shoulderToApex !== undefined ? data.shoulderToApex : existingMeasurement.shoulderToApex,
        frontLength: data.frontLength !== undefined ? data.frontLength : existingMeasurement.frontLength,
        chest: data.chest !== undefined ? data.chest : existingMeasurement.chest,
        waist: data.waist !== undefined ? data.waist : existingMeasurement.waist,
        
        // BLOUSE BACK measurements
        sleeveLength: data.sleeveLength !== undefined ? data.sleeveLength : existingMeasurement.sleeveLength,
        armRound: data.armRound !== undefined ? data.armRound : existingMeasurement.armRound,
        sleeveRound: data.sleeveRound !== undefined ? data.sleeveRound : existingMeasurement.sleeveRound,
        armHole: data.armHole !== undefined ? data.armHole : existingMeasurement.armHole,
        
        notes: data.notes !== undefined ? data.notes : existingMeasurement.notes,
        measuredBy: data.measuredBy || existingMeasurement.measuredBy,
        measurementDate: data.measurementDate ? new Date(data.measurementDate) : existingMeasurement.measurementDate
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
            status: true,
            fabric: true,
            fabricColor: true,
            frontDesign: true,
            backDesign: true
          }
        }
      }
    })

    return NextResponse.json({ measurement })
  } catch (error) {
    console.error("Error updating measurement:", error)
    return NextResponse.json({ error: "Failed to update measurement" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      token = request.cookies.get("auth-token")?.value
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
    }

    // Check if measurement exists
    const measurement = await db.blouseMeasurement.findUnique({
      where: { id: params.id }
    })

    if (!measurement) {
      return NextResponse.json({ error: "Measurement not found" }, { status: 404 })
    }

    // Delete measurement
    await db.blouseMeasurement.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Measurement deleted successfully" })
  } catch (error) {
    console.error("Error deleting measurement:", error)
    return NextResponse.json({ error: "Failed to delete measurement" }, { status: 500 })
  }
}