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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, designName, image, description, price, discount, isActive } = await request.json()

    if (!name || !designName || !price || price <= 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if model exists
    const existingModel = await db.salwarKameezModel.findUnique({
      where: { id: params.id }
    })

    if (!existingModel) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Check for duplicate name (excluding current model)
    const duplicateModel = await db.salwarKameezModel.findFirst({
      where: { 
        name,
        id: { not: params.id }
      }
    })

    if (duplicateModel) {
      return NextResponse.json({ error: "Model with this name already exists" }, { status: 400 })
    }

    const finalPrice = discount ? price - (price * discount / 100) : price

    const model = await db.salwarKameezModel.update({
      where: { id: params.id },
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
    console.error("Error updating salwar kameez model:", error)
    return NextResponse.json({ error: "Failed to update model" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if model exists
    const existingModel = await db.salwarKameezModel.findUnique({
      where: { id: params.id }
    })

    if (!existingModel) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    await db.salwarKameezModel.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Model deleted successfully" })
  } catch (error) {
    console.error("Error deleting salwar kameez model:", error)
    return NextResponse.json({ error: "Failed to delete model" }, { status: 500 })
  }
}