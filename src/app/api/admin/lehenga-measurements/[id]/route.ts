import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  try {
    const { verifyToken } = await import("@/lib/auth")
    const payload = verifyToken(token)
    if (!payload) return null

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isActive: true }
    })

    if (!user || user.role !== "ADMIN" || !user.isActive) return null
    return user
  } catch (error) {
    return null
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    const measurement = await db.lehengaMeasurement.update({
      where: { id: params.id },
      data: {
        userId: data.userId,
        blouseBackLength: data.blouseBackLength ? parseFloat(data.blouseBackLength) : null,
        fullShoulder: data.fullShoulder ? parseFloat(data.fullShoulder) : null,
        shoulderStrap: data.shoulderStrap ? parseFloat(data.shoulderStrap) : null,
        backNeckDepth: data.backNeckDepth ? parseFloat(data.backNeckDepth) : null,
        frontNeckDepth: data.frontNeckDepth ? parseFloat(data.frontNeckDepth) : null,
        shoulderToApex: data.shoulderToApex ? parseFloat(data.shoulderToApex) : null,
        frontLength: data.frontLength ? parseFloat(data.frontLength) : null,
        chest: data.chest ? parseFloat(data.chest) : null,
        waist: data.waist ? parseFloat(data.waist) : null,
        sleeveLength: data.sleeveLength ? parseFloat(data.sleeveLength) : null,
        armRound: data.armRound ? parseFloat(data.armRound) : null,
        sleeveRound: data.sleeveRound ? parseFloat(data.sleeveRound) : null,
        armHole: data.armHole ? parseFloat(data.armHole) : null,
        lehengaWaist: data.lehengaWaist ? parseFloat(data.lehengaWaist) : null,
        lehengaHip: data.lehengaHip ? parseFloat(data.lehengaHip) : null,
        lehengaLength: data.lehengaLength ? parseFloat(data.lehengaLength) : null,
        lehengaWidth: data.lehengaWidth ? parseFloat(data.lehengaWidth) : null,
        notes: data.notes || null
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
    console.error("Error updating lehenga measurement:", error)
    return NextResponse.json({ error: "Failed to update measurement" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.lehengaMeasurement.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting lehenga measurement:", error)
    return NextResponse.json({ error: "Failed to delete measurement" }, { status: 500 })
  }
}