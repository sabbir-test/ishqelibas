import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
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
      
      // Recent orders
      db.order.findMany({
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
        customer: order.user.name || order.user.email,
        amount: order.total,
        status: order.status,
        date: order.createdAt.toISOString().split('T')[0]
      })),
      topProducts: topProductsWithDetails,
      lowStockProducts: lowStockProducts.map(product => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
        minStock: 10
      }))
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}