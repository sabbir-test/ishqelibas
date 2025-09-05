import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeDesigns = searchParams.get("includeDesigns") === "true"
    const designType = searchParams.get("designType") // "FRONT", "BACK", or "both"
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "name" // "name" or "price"
    const sortOrder = searchParams.get("sortOrder") || "asc" // "asc" or "desc"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    // Build where clause for filtering
    const where: any = {
      isActive: true // Only show active models to clients
    }

    // Add design type filter
    if (designType === "FRONT") {
      where.frontDesignId = { not: null }
    } else if (designType === "BACK") {
      where.backDesignId = { not: null }
    } else if (designType === "both") {
      where.frontDesignId = { not: null }
      where.backDesignId = { not: null }
    }

    // Add price range filter
    if (minPrice) {
      where.price = { gte: parseFloat(minPrice) }
    }
    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) }
    }

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    }

    // Build order clause for sorting
    let orderBy: any = {}
    if (sortBy === "price") {
      orderBy.price = sortOrder
    } else {
      orderBy.name = sortOrder
    }

    const skip = (page - 1) * limit

    const [models, totalCount] = await Promise.all([
      db.blouseModel.findMany({
        where,
        select: {
          id: true,
          name: true,
          image: true,
          description: true,
          price: true,
          discount: true,
          finalPrice: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          frontDesignId: true,
          backDesignId: true,
          frontDesign: includeDesigns ? {
            select: {
              id: true,
              name: true,
              type: true,
              image: true,
              description: true,
              stitchCost: true,
              categoryId: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  image: true,
                  isActive: true,
                  createdAt: true,
                  updatedAt: true
                }
              }
            }
          } : undefined,
          backDesign: includeDesigns ? {
            select: {
              id: true,
              name: true,
              type: true,
              image: true,
              description: true,
              stitchCost: true,
              categoryId: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  image: true,
                  isActive: true,
                  createdAt: true,
                  updatedAt: true
                }
              }
            }
          } : undefined
        },
        orderBy,
        skip,
        take: limit
      }),
      db.blouseModel.count({ where })
    ])

    const hasMore = skip + models.length < totalCount

    return NextResponse.json({ 
      models,
      pagination: {
        page,
        limit,
        totalCount,
        hasMore
      }
    })
  } catch (error) {
    console.error("Error fetching blouse models:", error)
    return NextResponse.json(
      { error: "Failed to fetch blouse models" },
      { status: 500 }
    )
  }
}