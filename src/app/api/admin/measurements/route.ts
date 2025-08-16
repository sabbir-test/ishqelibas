import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
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

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const userId = searchParams.get('userId')

    let whereClause: any = {}

    if (userId) {
      whereClause.userId = userId
    } else if (search) {
      whereClause.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    const measurements = await db.blouseMeasurement.findMany({
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
            status: true,
            fabric: true,
            fabricColor: true,
            frontDesign: true,
            backDesign: true
          }
        }
      },
      orderBy: { measurementDate: 'desc' }
    })

    return NextResponse.json({ measurements })
  } catch (error) {
    console.error("Error fetching measurements:", error)
    return NextResponse.json({ error: "Failed to fetch measurements" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    const requiredFields = ['userId']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: data.userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If customOrderId is provided, check if it exists and belongs to the user
    if (data.customOrderId) {
      const customOrder = await db.customOrder.findFirst({
        where: {
          id: data.customOrderId,
          userId: data.userId
        }
      })

      if (!customOrder) {
        return NextResponse.json({ error: "Custom order not found or does not belong to this user" }, { status: 404 })
      }
    }

    // Create measurement
    const measurement = await db.blouseMeasurement.create({
      data: {
        userId: data.userId,
        customOrderId: data.customOrderId || null,
        
        // BLOUSE FRONT measurements
        blouseBackLength: data.blouseBackLength || null,
        fullShoulder: data.fullShoulder || null,
        shoulderStrap: data.shoulderStrap || null,
        backNeckDepth: data.backNeckDepth || null,
        frontNeckDepth: data.frontNeckDepth || null,
        shoulderToApex: data.shoulderToApex || null,
        frontLength: data.frontLength || null,
        chest: data.chest || null,
        waist: data.waist || null,
        
        // BLOUSE BACK measurements
        sleeveLength: data.sleeveLength || null,
        armRound: data.armRound || null,
        sleeveRound: data.sleeveRound || null,
        armHole: data.armHole || null,
        
        notes: data.notes || null,
        measuredBy: data.measuredBy || admin.name || 'Admin',
        measurementDate: data.measurementDate ? new Date(data.measurementDate) : new Date()
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
    console.error("Error creating measurement:", error)
    return NextResponse.json({ error: "Failed to create measurement" }, { status: 500 })
  }
}