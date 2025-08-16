import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { BlouseModel } from "@prisma/client"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const includeDesigns = searchParams.get("includeDesigns") === "true"

    const models = await db.blouseModel.findMany({
      include: includeDesigns ? {
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
      } : undefined,
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ models })
  } catch (error) {
    console.error("Error fetching blouse models:", error)
    return NextResponse.json(
      { error: "Failed to fetch blouse models" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const { name, frontDesignId, backDesignId, image, description, price, discount, isActive = true } = body

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

    const model = await db.blouseModel.create({
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

    return NextResponse.json({ model }, { status: 201 })
  } catch (error) {
    console.error("Error creating blouse model:", error)
    return NextResponse.json(
      { error: "Failed to create blouse model" },
      { status: 500 }
    )
  }
}