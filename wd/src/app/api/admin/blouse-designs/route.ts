import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeVariants = searchParams.get("includeVariants") === "true"
    const includeCategories = searchParams.get("includeCategories") === "true"

    const designs = await db.blouseDesign.findMany({
      include: {
        variants: includeVariants,
        category: includeCategories
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ designs })
  } catch (error) {
    console.error("Error fetching blouse designs:", error)
    return NextResponse.json({ error: "Failed to fetch blouse designs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, image, description, stitchCost, isActive, categoryId } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const design = await db.blouseDesign.create({
      data: {
        name,
        type: "FRONT", // Default to FRONT since type is no longer user-selectable
        image: image || null,
        description: description || null,
        stitchCost: stitchCost || 0,
        isActive: isActive ?? true,
        categoryId: categoryId || null
      },
      include: {
        variants: true,
        category: true
      }
    })

    return NextResponse.json({ design })
  } catch (error) {
    console.error("Error creating blouse design:", error)
    return NextResponse.json({ error: "Failed to create blouse design" }, { status: 500 })
  }
}