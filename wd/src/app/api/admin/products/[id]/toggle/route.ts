import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current product status
    const currentProduct = await db.product.findUnique({
      where: { id: params.id }
    })

    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const newStatus = !currentProduct.isActive
    let cartItemsRemoved = false

    // If deactivating the product, remove it from all carts
    if (!newStatus) {
      const deletedCartItems = await db.cartItem.deleteMany({
        where: { productId: params.id }
      })
      cartItemsRemoved = deletedCartItems.count > 0
    }

    // Update the product status
    const updatedProduct = await db.product.update({
      where: { id: params.id },
      data: { isActive: newStatus }
    })

    return NextResponse.json({ 
      message: `Product ${newStatus ? 'activated' : 'deactivated'} successfully`,
      cartItemsRemoved,
      product: updatedProduct
    })
  } catch (error) {
    console.error("Error toggling product status:", error)
    return NextResponse.json({ error: "Failed to toggle product status" }, { status: 500 })
  }
}