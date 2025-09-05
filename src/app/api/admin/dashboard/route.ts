import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie and verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify token and get authenticated user
    const { verifyToken } = await import("@/lib/auth")
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    // Get authenticated user from database
    const authenticatedUser = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true, role: true }
    })

    if (!authenticatedUser || !authenticatedUser.isActive || authenticatedUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log('📊 Fetching dashboard data for admin:', authenticatedUser.id)

    // Get dashboard statistics
    const [
      totalSales,
      totalOrders,
      totalUsers,
      totalProducts,
      recentOrders,
      topProducts,
      lowStockProducts
    ] = await Promise.all([
      // Total sales from completed orders
      db.order.aggregate({
        where: { paymentStatus: "COMPLETED" },
        _sum: { total: true }
      }),
      
      // Total orders
      db.order.count(),
      
      // Total users
      db.user.count({ where: { isActive: true } }),
      
      // Total products
      db.product.count({ where: { isActive: true } }),
      
      // Recent orders (filter out test/dummy orders)
      db.order.findMany({
        where: {
          user: {
            isActive: true,
            NOT: [
              { email: { contains: 'test-dummy@' } },
              { email: { contains: 'sample@' } },
              { email: { contains: 'placeholder@' } },
              { email: { contains: 'fake@' } },
              { email: { contains: 'dummy@' } },
              { email: { contains: 'noreply@' } },
              { email: { contains: 'donotreply@' } },
              { email: 'test@example.com' },
              { email: 'sample@example.com' }
            ]
          }
        },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      
      // Top products by sales
      db.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        _count: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5
      }),
      
      // Low stock products
      db.product.findMany({
        where: {
          stock: { lte: 10 },
          isActive: true
        },
        take: 10
      })
    ])

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: { name: true, finalPrice: true }
        })
        return {
          ...product,
          sales: item._sum.quantity || 0,
          revenue: (item._sum.quantity || 0) * (product?.finalPrice || 0)
        }
      })
    )

    const dashboardData = {
      totalSales: totalSales._sum.total || 0,
      totalOrders,
      totalUsers,
      totalProducts,
      recentOrders: recentOrders.map(order => ({
        id: order.orderNumber,
        customer: order.user?.name || order.user?.email || 'Unknown Customer',
        amount: order.total,
        status: order.status,
        date: order.createdAt.toISOString().split('T')[0]
      })),
      topProducts: topProductsWithDetails.filter(p => p.name), // Filter out null products
      lowStockProducts: lowStockProducts.map(product => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
        minStock: 10
      }))
    }

    console.log('✅ Dashboard data fetched:', {
      totalOrders: dashboardData.totalOrders,
      recentOrdersCount: dashboardData.recentOrders.length,
      totalSales: dashboardData.totalSales
    })

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}