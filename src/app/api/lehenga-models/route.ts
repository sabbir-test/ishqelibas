import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "name-asc" // "name-asc", "name-desc", "price-asc", "price-desc", "rating"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    // Build where clause for filtering
    const where: any = {
      isActive: true // Only show active models to clients
    }

    // Add price range filter
    if (minPrice) {
      where.finalPrice = { gte: parseFloat(minPrice) }
    }
    if (maxPrice) {
      where.finalPrice = { ...where.finalPrice, lte: parseFloat(maxPrice) }
    }

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { designName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    }

    // Build order clause for sorting
    let orderBy: any = {}
    switch (sortBy) {
      case "price-asc":
        orderBy.finalPrice = "asc"
        break
      case "price-desc":
        orderBy.finalPrice = "desc"
        break
      case "name-desc":
        orderBy.name = "desc"
        break
      case "rating":
        orderBy.rating = "desc"
        break
      default: // name-asc
        orderBy.name = "asc"
    }

    const skip = (page - 1) * limit

    const [models, totalCount] = await Promise.all([
      db.lehengaModel.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      db.lehengaModel.count({ where })
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
    console.error("Error fetching lehenga models:", error)
    return NextResponse.json({ error: "Failed to fetch lehenga models" }, { status: 500 })
  }
}