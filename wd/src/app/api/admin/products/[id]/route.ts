import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {
      name,
      description,
      price,
      discount,
      stock,
      sku,
      images,
      categoryId,
      isFeatured
    } = await request.json()

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const finalPrice = discount ? price * (1 - discount / 100) : price

    const product = await db.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        discount,
        finalPrice,
        stock,
        sku,
        images: images ? JSON.stringify(images) : null,
        categoryId,
        isFeatured: isFeatured || false
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, delete the product from all carts
    await db.cartItem.deleteMany({
      where: { productId: params.id }
    })

    // Then delete the product
    await db.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: "Product deleted successfully",
      cartItemsRemoved: true 
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}