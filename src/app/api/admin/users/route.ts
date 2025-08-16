import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      token = request.cookies.get("auth-token")?.value
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let whereClause: any = {
      role: 'USER' // Only fetch regular users, not admins
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    }

    const users = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            customOrders: true,
            measurements: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}