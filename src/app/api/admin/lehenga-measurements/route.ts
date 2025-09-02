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

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const measurements = await db.lehengaMeasurement.findMany({
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
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(measurements)
  } catch (error) {
    console.error("Error fetching lehenga measurements:", error)
    return NextResponse.json({ error: "Failed to fetch measurements" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    const measurement = await db.lehengaMeasurement.create({
      data: {
        userId: data.userId,
        customOrderId: data.customOrderId || null,
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
    console.error("Error creating lehenga measurement:", error)
    return NextResponse.json({ error: "Failed to create measurement" }, { status: 500 })
  }
}