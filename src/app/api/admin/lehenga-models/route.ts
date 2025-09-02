import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie and verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify token and get authenticated user
    const { verifyToken } = await import("@/lib/auth")
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    // Get authenticated user from database
    const authenticatedUser = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true, role: true }
    })

    if (!authenticatedUser || !authenticatedUser.isActive || authenticatedUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const models = await db.lehengaModel.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ models })
  } catch (error) {
    console.error("Error fetching lehenga models:", error)
    return NextResponse.json({ error: "Failed to fetch lehenga models" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie and verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify token and get authenticated user
    const { verifyToken } = await import("@/lib/auth")
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    // Get authenticated user from database
    const authenticatedUser = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true, role: true }
    })

    if (!authenticatedUser || !authenticatedUser.isActive || authenticatedUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { name, designName, description, price, discount, image, isActive } = await request.json()

    // Validate required fields
    if (!name || !designName || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate final price
    const finalPrice = discount ? price - (price * discount / 100) : price

    const model = await db.lehengaModel.create({
      data: {
        name,
        designName,
        description,
        price: parseFloat(price),
        discount: discount ? parseFloat(discount) : null,
        finalPrice,
        image,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({ model })
  } catch (error) {
    console.error("Error creating lehenga model:", error)
    return NextResponse.json({ error: "Failed to create lehenga model" }, { status: 500 })
  }
}