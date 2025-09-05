import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, image, description, isActive, designId } = await request.json()
    const { id } = params

    // Check if variant exists
    const existingVariant = await db.blouseDesignVariant.findUnique({
      where: { id }
    })

    if (!existingVariant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 })
    }

    // If designId is provided, check if design exists
    if (designId) {
      const design = await db.blouseDesign.findUnique({
        where: { id: designId }
      })

      if (!design) {
        return NextResponse.json({ error: "Design not found" }, { status: 404 })
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (image !== undefined) updateData.image = image || null
    if (description !== undefined) updateData.description = description || null
    if (isActive !== undefined) updateData.isActive = isActive
    if (designId !== undefined) updateData.designId = designId

    const variant = await db.blouseDesignVariant.update({
      where: { id },
      data: updateData,
      include: {
        design: {
          select: { id: true, name: true, type: true }
        }
      }
    })

    return NextResponse.json({ variant })
  } catch (error) {
    console.error("Error updating blouse design variant:", error)
    return NextResponse.json({ error: "Failed to update blouse design variant" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if variant exists
    const existingVariant = await db.blouseDesignVariant.findUnique({
      where: { id }
    })

    if (!existingVariant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 })
    }

    await db.blouseDesignVariant.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Variant deleted successfully" })
  } catch (error) {
    console.error("Error deleting blouse design variant:", error)
    return NextResponse.json({ error: "Failed to delete blouse design variant" }, { status: 500 })
  }
}