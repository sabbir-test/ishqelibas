import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const designId = searchParams.get("designId")

    const where = designId ? { designId } : {}
    
    const variants = await db.blouseDesignVariant.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        design: {
          select: { id: true, name: true, type: true }
        }
      }
    })

    return NextResponse.json({ variants })
  } catch (error) {
    console.error("Error fetching blouse design variants:", error)
    return NextResponse.json({ error: "Failed to fetch blouse design variants" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, image, description, isActive, designId } = await request.json()

    if (!name || !designId) {
      return NextResponse.json({ error: "Variant name and design ID are required" }, { status: 400 })
    }

    // Check if design exists
    const design = await db.blouseDesign.findUnique({
      where: { id: designId }
    })

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 })
    }

    const variant = await db.blouseDesignVariant.create({
      data: {
        name,
        image: image || null,
        description: description || null,
        isActive: isActive ?? true,
        designId
      },
      include: {
        design: {
          select: { id: true, name: true, type: true }
        }
      }
    })

    return NextResponse.json({ variant })
  } catch (error) {
    console.error("Error creating blouse design variant:", error)
    return NextResponse.json({ error: "Failed to create blouse design variant" }, { status: 500 })
  }
}