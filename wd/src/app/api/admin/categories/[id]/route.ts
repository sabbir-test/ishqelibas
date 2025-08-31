import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, description, image, isActive } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check if another category with the same name exists
    const nameConflict = await db.category.findFirst({
      where: {
        name,
        id: { not: id }
      }
    })

    if (nameConflict) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 })
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name,
        description,
        image,
        isActive: isActive !== undefined ? isActive : existingCategory.isActive
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json({ 
        error: "Cannot delete category with associated products. Please remove or reassign products first." 
      }, { status: 400 })
    }

    await db.category.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}