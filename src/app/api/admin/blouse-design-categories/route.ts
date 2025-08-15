import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const categories = await db.blouseDesignCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        designs: {
          where: { isActive: true },
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching blouse design categories:", error)
    return NextResponse.json({ error: "Failed to fetch blouse design categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, image, isActive } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const category = await db.blouseDesignCategory.create({
      data: {
        name,
        description: description || null,
        image: image || null,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Error creating blouse design category:", error)
    return NextResponse.json({ error: "Failed to create blouse design category" }, { status: 500 })
  }
}