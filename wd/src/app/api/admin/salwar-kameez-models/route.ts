import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) {
    return null
  }

  try {
    const { verifyToken } = await import("@/lib/auth")
    const payload = verifyToken(token)
    if (!payload) return null

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isActive: true }
    })

    if (!user || user.role !== "ADMIN" || !user.isActive) {
      return null
    }

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

    const models = await db.salwarKameezModel.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ models })
  } catch (error) {
    console.error("Error fetching salwar kameez models:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, designName, image, description, price, discount, isActive } = await request.json()

    if (!name || !designName || !price || price <= 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check for duplicate name
    const existingModel = await db.salwarKameezModel.findFirst({
      where: { name }
    })

    if (existingModel) {
      return NextResponse.json({ error: "Model with this name already exists" }, { status: 400 })
    }

    const finalPrice = discount ? price - (price * discount / 100) : price

    const model = await db.salwarKameezModel.create({
      data: {
        name,
        designName,
        image: image || null,
        description: description || null,
        price,
        discount: discount || null,
        finalPrice,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({ model })
  } catch (error) {
    console.error("Error creating salwar kameez model:", error)
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 })
  }
}