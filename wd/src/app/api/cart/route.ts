import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            finalPrice: true,
            images: true,
            sku: true,
            sizes: true,
            colors: true
          }
        }
      }
    })

    return NextResponse.json({ cartItems })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, quantity = 1, size, color } = await request.json()

    if (!userId || !productId) {
      return NextResponse.json({ error: "User ID and Product ID are required" }, { status: 400 })
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if item already exists in cart with same size and color
    const existingCartItem = await db.cartItem.findFirst({
      where: {
        userId,
        productId,
        size: size || null,
        color: color || null
      }
    })

    let cartItem

    if (existingCartItem) {
      // Update quantity
      cartItem = await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity }
      })
    } else {
      // Create new cart item
      cartItem = await db.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
          size: size || null,
          color: color || null
        }
      })
    }

    return NextResponse.json({ cartItem })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}