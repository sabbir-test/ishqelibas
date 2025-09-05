import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const minPrice = searchParams.get("minPrice") || ""
    const maxPrice = searchParams.get("maxPrice") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt-desc"

    const skip = (page - 1) * limit

    const where: any = {}

    // Search functionality
    if (search && search.trim()) {
      const trimmedSearch = search.trim()
      where.OR = [
        { name: { contains: trimmedSearch, mode: "insensitive" } },
        { description: { contains: trimmedSearch, mode: "insensitive" } },
        { sku: { contains: trimmedSearch, mode: "insensitive" } }
      ]
    }

    // Category filter
    if (category && category !== "all") {
      where.categoryId = category
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.finalPrice = {}
      if (minPrice) {
        where.finalPrice.gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        where.finalPrice.lte = parseFloat(maxPrice)
      }
    }

    // Sorting logic
    let orderBy: any = { createdAt: "desc" }
    
    if (sortBy) {
      const [field, direction] = sortBy.split("-")
      const sortDirection = direction === "asc" ? "asc" : "desc"
      
      switch (field) {
        case "name":
          orderBy = { name: sortDirection }
          break
        case "price":
          orderBy = { finalPrice: sortDirection }
          break
        case "stock":
          orderBy = { stock: sortDirection }
          break
        case "createdAt":
        default:
          orderBy = { createdAt: sortDirection }
          break
      }
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: {
            select: { name: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.product.count({ where })
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const product = await db.product.create({
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
      }
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}