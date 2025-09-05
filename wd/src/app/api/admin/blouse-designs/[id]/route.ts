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

    const { id } = params
    const { name, image, description, stitchCost, isActive, categoryId } = await request.json()

    const design = await db.blouseDesign.update({
      where: { id },
      data: {
        name,
        image: image || null,
        description: description || null,
        stitchCost: stitchCost || 0,
        isActive,
        categoryId: categoryId || null
      },
      include: {
        variants: true,
        category: true
      }
    })

    return NextResponse.json({ design })
  } catch (error) {
    console.error("Error updating blouse design:", error)
    return NextResponse.json({ error: "Failed to update blouse design" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await db.blouseDesign.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Blouse design deleted successfully" })
  } catch (error) {
    console.error("Error deleting blouse design:", error)
    return NextResponse.json({ error: "Failed to delete blouse design" }, { status: 500 })
  }
}