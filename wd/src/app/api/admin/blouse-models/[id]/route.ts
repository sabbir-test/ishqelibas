import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const model = await db.blouseModel.findUnique({
      where: { id: params.id },
      include: {
        frontDesign: {
          include: {
            category: true
          }
        },
        backDesign: {
          include: {
            category: true
          }
        }
      }
    })

    if (!model) {
      return NextResponse.json(
        { error: "Blouse model not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ model })
  } catch (error) {
    console.error("Error fetching blouse model:", error)
    return NextResponse.json(
      { error: "Failed to fetch blouse model" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, frontDesignId, backDesignId, image, description, price, discount, isActive } = body

    if (!name || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify that the designs exist if provided
    if (frontDesignId) {
      const frontDesign = await db.blouseDesign.findUnique({
        where: { id: frontDesignId }
      })
      if (!frontDesign) {
        return NextResponse.json(
          { error: "Front design not found" },
          { status: 404 }
        )
      }
    }

    if (backDesignId) {
      const backDesign = await db.blouseDesign.findUnique({
        where: { id: backDesignId }
      })
      if (!backDesign) {
        return NextResponse.json(
          { error: "Back design not found" },
          { status: 404 }
        )
      }
    }

    const finalPrice = discount ? price - (price * discount / 100) : price

    const model = await db.blouseModel.update({
      where: { id: params.id },
      data: {
        name,
        frontDesignId,
        backDesignId,
        image,
        description,
        price,
        discount,
        finalPrice,
        isActive
      },
      include: {
        frontDesign: {
          include: {
            category: true
          }
        },
        backDesign: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json({ model })
  } catch (error) {
    console.error("Error updating blouse model:", error)
    return NextResponse.json(
      { error: "Failed to update blouse model" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.blouseModel.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Blouse model deleted successfully" })
  } catch (error) {
    console.error("Error deleting blouse model:", error)
    return NextResponse.json(
      { error: "Failed to delete blouse model" },
      { status: 500 }
    )
  }
}