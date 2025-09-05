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

    // Fetch custom orders with filtering for legitimate users
    const orders = await db.customOrder.findMany({
      where: {
        user: {
          isActive: true,
          // Exclude specific test/placeholder email patterns but allow demo@example.com for testing
          NOT: [
            { email: { contains: 'test-dummy@' } },
            { email: { contains: 'sample@' } },
            { email: { contains: 'placeholder@' } },
            { email: { contains: 'fake@' } },
            { email: { contains: 'dummy@' } },
            { email: { contains: 'noreply@' } },
            { email: { contains: 'donotreply@' } },
            // Exclude obvious test patterns but keep demo@example.com
            { email: 'test@example.com' },
            { email: 'sample@example.com' }
          ]
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Fetch measurements for each order's user (all types)
    const ordersWithMeasurements = await Promise.all(
      orders.map(async (order) => {
        // Determine order type from appointment purpose or design details
        const orderType = order.appointmentPurpose || 
                         (order.frontDesign?.toLowerCase().includes('lehenga') ? 'lehenga' :
                          order.frontDesign?.toLowerCase().includes('salwar') ? 'salwar-kameez' : 'blouse')
        
        let measurements = null
        
        // Fetch appropriate measurements based on order type
        if (orderType === 'lehenga') {
          const lehengaMeasurements = await db.lehengaMeasurement.findMany({
            where: { 
              OR: [
                { customOrderId: order.id },
                { userId: order.userId }
              ]
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          })
          measurements = lehengaMeasurements[0] || null
        } else if (orderType === 'salwar-kameez') {
          const salwarMeasurements = await db.salwarMeasurement.findMany({
            where: { 
              OR: [
                { customOrderId: order.id },
                { userId: order.userId }
              ]
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          })
          measurements = salwarMeasurements[0] || null
        } else {
          // Default to blouse measurements
          const blouseMeasurements = await db.measurement.findMany({
            where: { 
              OR: [
                { customOrderId: order.id },
                { userId: order.userId }
              ]
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          })
          measurements = blouseMeasurements[0] || null
        }
        
        // Log measurement lookup for auditing
        if (!measurements) {
          console.log(`📋 Measurement lookup miss - Order: ${order.id}, Type: ${orderType}, User: ${order.user?.email}, Status: Pending`)
        } else {
          console.log(`✅ Measurement found - Order: ${order.id}, Type: ${orderType}, User: ${order.user?.email}`)
        }
        
        return {
          ...order,
          orderType,
          userMeasurements: measurements
        }
      })
    )

    // Log summary for audit
    const measurementStats = {
      total: ordersWithMeasurements.length,
      withMeasurements: ordersWithMeasurements.filter(o => o.userMeasurements).length,
      pending: ordersWithMeasurements.filter(o => !o.userMeasurements).length
    }
    console.log(`📊 Admin Custom Orders - Total: ${measurementStats.total}, With Measurements: ${measurementStats.withMeasurements}, Pending: ${measurementStats.pending}`)
    console.log(`🔍 Showing orders from legitimate users (including demo@example.com for testing)`)

    // Sanitize data to prevent frontend crashes
    const sanitizedOrders = ordersWithMeasurements.map(order => ({
      ...order,
      measurements: order.oldMeasurements || '{}',
      user: order.user || { name: 'Unknown', email: 'unknown@example.com' },
      userMeasurements: order.userMeasurements
    }))

    return NextResponse.json({ 
      orders: sanitizedOrders,
      measurementStats: {
        total: sanitizedOrders.length,
        withMeasurements: sanitizedOrders.filter(o => o.userMeasurements).length,
        pending: sanitizedOrders.filter(o => !o.userMeasurements).length
      },
      meta: {
        filtered: true,
        excludedPatterns: ['test-dummy@', 'sample@', 'placeholder@', 'fake@', 'dummy@', 'noreply@'],
        allowedForTesting: ['demo@example.com'],
        message: 'Showing orders from legitimate users and demo account for testing'
      }
    })
  } catch (error) {
    console.error("Error fetching custom orders:", error)
    return NextResponse.json({ 
      error: "Failed to fetch custom orders",
      details: error.message 
    }, { status: 500 })
  }
}