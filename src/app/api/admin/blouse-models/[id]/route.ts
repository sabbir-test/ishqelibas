import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const model = await db.blouseModel.findUnique({
      where: { id: params.id }
    })

    if (!model) {
      return NextResponse.json({ error: "Blouse model not found" }, { status: 404 })
    }

    return NextResponse.json({ model })
  } catch (error) {
    console.error("Error fetching blouse model:", error)
    return NextResponse.json({ error: "Failed to fetch blouse model" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { name, designName, description, price, discount, stitchCost, image, images, isActive } = await request.json()

    // Validate required fields
    if (!name || !designName || !price || stitchCost === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Process multiple images
    let processedImages = null
    if (images && images.trim()) {
      const imageArray = images.split('\n')
        .map((img: string) => img.trim())
        .filter((img: string) => img.length > 0)
      
      if (imageArray.length > 0) {
        processedImages = JSON.stringify(imageArray)
      }
    }

    // Calculate final price
    const finalPrice = discount ? price - (price * discount / 100) : price

    const model = await db.blouseModel.update({
      where: { id: params.id },
      data: {
        name,
        designName,
        description,
        price: parseFloat(price),
        discount: discount ? parseFloat(discount) : null,
        finalPrice,
        stitchCost: parseFloat(stitchCost),
        image,
        images: processedImages,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({ model })
  } catch (error) {
    console.error("Error updating blouse model:", error)
    return NextResponse.json({ error: "Failed to update blouse model" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await db.blouseModel.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Blouse model deleted successfully" })
  } catch (error) {
    console.error("Error deleting blouse model:", error)
    return NextResponse.json({ error: "Failed to delete blouse model" }, { status: 500 })
  }
}