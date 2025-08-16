import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const minPrice = searchParams.get("minPrice") || ""
    const maxPrice = searchParams.get("maxPrice") || ""
    const sortBy = searchParams.get("sortBy") || "featured"

    console.log('API called with params:', { search, category, minPrice, maxPrice, sortBy })

    const skip = (page - 1) * limit

    const where: any = { isActive: true }

    // Search functionality
    if (search && search.trim()) {
      const trimmedSearch = search.trim()
      where.OR = [
        { name: { contains: trimmedSearch } },
        { description: { contains: trimmedSearch } },
        { sku: { contains: trimmedSearch } }
      ]
    }

    // Category filter
    if (category && category !== "all") {
      // Filter by category name
      where.category = {
        name: {
          equals: category
        }
      }
      console.log('Category filter applied:', category)
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
    let orderBy: any[] = [{ isFeatured: "desc" }, { createdAt: "desc" }]
    
    if (sortBy) {
      switch (sortBy) {
        case "price-low":
          orderBy = [{ finalPrice: "asc" }]
          break
        case "price-high":
          orderBy = [{ finalPrice: "desc" }]
          break
        case "rating":
          // For now, sort by featured as rating isn't in the schema
          orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }]
          break
        case "newest":
          orderBy = [{ createdAt: "desc" }]
          break
        case "featured":
        default:
          orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }]
          break
      }
    }

    console.log('Where clause:', where)
    console.log('Order by:', orderBy)

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

    console.log('Found products:', products.length)

    // Transform products to match the expected interface
    const transformedProducts = products.map(product => {
      let imageUrl = "/api/placeholder/300/400"
      
      try {
        if (product.images) {
          // Try to parse as JSON array
          const parsedImages = JSON.parse(product.images)
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            const firstImage = parsedImages[0]
            if (typeof firstImage === 'string' && firstImage.trim() !== '') {
              imageUrl = firstImage
            }
          }
        }
      } catch (error) {
        // If JSON parsing fails, use the raw string if it's a valid URL
        if (product.images && product.images.trim() !== '') {
          imageUrl = product.images
        }
      }

      // Parse sizes and colors
      let sizes: string[] = []
      let colors: string[] = []
      
      try {
        if (product.sizes) {
          const parsedSizes = JSON.parse(product.sizes)
          if (Array.isArray(parsedSizes)) {
            sizes = parsedSizes
          }
        }
      } catch (error) {
        // If parsing fails, leave sizes empty
      }
      
      try {
        if (product.colors) {
          const parsedColors = JSON.parse(product.colors)
          if (Array.isArray(parsedColors)) {
            colors = parsedColors
          }
        }
      } catch (error) {
        // If parsing fails, leave colors empty
      }
      
      return {
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        finalPrice: product.finalPrice,
        images: imageUrl,
        category: product.category?.name || "uncategorized",
        sku: product.sku,
        sizes: sizes.length > 0 ? sizes : undefined,
        colors: colors.length > 0 ? colors : undefined,
        rating: 4.5, // Mock rating - in real app, this would come from reviews
        reviewCount: 100, // Mock review count
        inStock: product.stock > 0,
        // Mock design data for testing - in real app, this would come from related blouse models
        frontDesignName: "Classic Neck",
        frontDesignPrice: 1200,
        backDesignName: "Elegant Back",
        backDesignPrice: 800
      }
    })

    return NextResponse.json({
      products: transformedProducts,
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