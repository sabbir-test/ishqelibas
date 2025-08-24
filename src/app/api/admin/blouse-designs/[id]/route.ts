import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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