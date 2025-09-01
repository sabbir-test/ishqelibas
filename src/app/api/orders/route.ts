import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { filterLegitimateOrders } from "@/lib/order-validation"

export async function POST(request: NextRequest) {
  try {
    console.log('📋 Order creation started...')
    
    const {
      userId,
      items,
      shippingInfo,
      paymentInfo,
      addressId,
      subtotal,
      tax,
      shipping,
      total
    } = await request.json()

    console.log('📊 Order data received:', {
      userId,
      itemCount: items?.length,
      total,
      paymentMethod: paymentInfo?.method
    })

    if (!userId || !items || !shippingInfo || !paymentInfo) {
      console.log('❌ Missing required fields:', { userId: !!userId, items: !!items, shippingInfo: !!shippingInfo, paymentInfo: !!paymentInfo })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
    console.log('🔢 Generated order number:', orderNumber)

    let finalAddressId = addressId

    // If no addressId provided, create a new address from shippingInfo
    if (!addressId) {
      const newAddress = await db.address.create({
        data: {
          userId,
          type: "Order Address",
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country || "India",
          isDefault: false
        }
      })
      finalAddressId = newAddress.id
    }

    // Create order
    console.log('💾 Creating order in database...')
    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        status: "PENDING",
        subtotal,
        discount: 0,
        tax,
        shipping,
        total,
        paymentMethod: paymentInfo.method.toUpperCase(),
        paymentStatus: "PENDING",
        addressId: finalAddressId,
        notes: paymentInfo.notes || ""
      },
      include: {
        address: true
      }
    })
    console.log('✅ Order created successfully:', order.orderNumber)

    // Validate all items before creating any order items
    console.log('🔍 Pre-validating all order items...')
    for (const item of items) {
      if (!item.productId) {
        throw new Error(`Missing productId for item: ${item.name}`)
      }
      
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Invalid quantity for item: ${item.name}`)
      }
      
      if (!item.finalPrice || item.finalPrice < 0) {
        throw new Error(`Invalid price for item: ${item.name}`)
      }
    }
    console.log('✅ All items pre-validated successfully')

    // Create order items
    for (const item of items) {
      console.log('📦 Processing item:', { productId: item.productId, name: item.name, quantity: item.quantity, price: item.finalPrice })
      
      // Handle custom design orders
      if (item.productId === "custom-blouse" && item.customDesign) {
        // Create custom order record
        const customOrder = await db.customOrder.create({
          data: {
            userId,
            fabric: item.customDesign.fabric?.name || "Custom Fabric",
            fabricColor: item.customDesign.fabric?.color || "#000000",
            frontDesign: item.customDesign.frontDesign?.name || "Custom Front Design",
            backDesign: item.customDesign.backDesign?.name || "Custom Back Design",
            oldMeasurements: JSON.stringify(item.customDesign.measurements || {}),
            price: item.finalPrice,
            notes: item.customDesign.ownFabricDetails?.description || "Custom blouse design",
            appointmentDate: item.customDesign.appointmentDate ? new Date(item.customDesign.appointmentDate) : null,
            appointmentType: item.customDesign.appointmentType || null
          }
        })

        // Create order item that references the virtual product
        await db.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.finalPrice,
            size: item.size,
            color: item.color
          }
        })
      } else {
        // Validate product exists before creating order item
        if (item.productId) {
          const productExists = await db.product.findUnique({
            where: { id: item.productId }
          })
          
          if (!productExists) {
            console.error('❌ Product not found:', item.productId)
            
            // Handle virtual products for custom designs
            if (item.productId === 'custom-blouse' || item.productId === 'custom-salwar-kameez') {
              console.log('🔧 Creating missing virtual product:', item.productId)
              
              // Get or create virtual category
              let virtualCategory = await db.category.findFirst({
                where: { name: 'Virtual Products' }
              })
              
              if (!virtualCategory) {
                virtualCategory = await db.category.create({
                  data: {
                    name: 'Virtual Products',
                    description: 'Virtual products for custom designs',
                    isActive: true
                  }
                })
              }
              
              // Create the virtual product
              const virtualProductData = item.productId === 'custom-blouse' ? {
                id: 'custom-blouse',
                name: 'Custom Blouse Design',
                description: 'Virtual product for custom blouse designs',
                sku: 'CUSTOM-BLOUSE-001'
              } : {
                id: 'custom-salwar-kameez',
                name: 'Custom Salwar Kameez Design',
                description: 'Virtual product for custom salwar kameez designs',
                sku: 'CUSTOM-SALWAR-001'
              }
              
              await db.product.create({
                data: {
                  ...virtualProductData,
                  price: 0,
                  finalPrice: 0,
                  stock: 999999,
                  isActive: true,
                  isFeatured: false,
                  categoryId: virtualCategory.id
                }
              })
              
              console.log('✅ Created virtual product:', item.productId)
            } else {
              throw new Error(`Product not found: ${item.productId}`)
            }
          }
        }
        
        // Handle regular product orders
        console.log('📦 Creating order item with data:', {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.finalPrice,
          size: item.size || null,
          color: item.color || null
        })
        
        const orderItem = await db.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.finalPrice,
            size: item.size || null,
            color: item.color || null
          }
        })
        
        console.log('✅ Order item created successfully:', orderItem.id)

        // Update product stock only for regular products (not custom designs)
        if (item.productId && item.productId !== 'custom-blouse' && item.productId !== 'custom-salwar-kameez') {
          try {
            await db.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } }
            })
          } catch (stockError) {
            console.warn('⚠️ Could not update stock for product:', item.productId, stockError.message)
          }
        }
      }
    }

    // Clear user's cart
    await db.cartItem.deleteMany({
      where: { userId }
    })

    console.log('🎉 Order creation completed:', order.orderNumber)
    return NextResponse.json({ order })
  } catch (error) {
    console.error("❌ Error creating order:", error)
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching orders for user...')
    
    // Get token from cookie and verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      console.log('❌ No auth token found')
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify token and get authenticated user
    const { verifyToken } = await import("@/lib/auth")
    const payload = verifyToken(token)
    if (!payload) {
      console.log('❌ Invalid auth token')
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    // Get authenticated user from database
    const authenticatedUser = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, isActive: true }
    })

    if (!authenticatedUser || !authenticatedUser.isActive) {
      console.log('❌ User not found or inactive:', payload.userId)
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
    }

    console.log(`👤 Fetching orders for user: ${authenticatedUser.email} (${authenticatedUser.id})`)

    // Only allow users to fetch their own orders
    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get("userId")
    
    if (requestedUserId && requestedUserId !== authenticatedUser.id) {
      console.log('❌ Unauthorized access attempt:', requestedUserId)
      return NextResponse.json({ error: "Unauthorized access to orders" }, { status: 403 })
    }

    // Fetch orders only for the authenticated user with enhanced data
    const allOrders = await db.order.findMany({
      where: { userId: authenticatedUser.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                sku: true,
                description: true
              }
            }
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            country: true,
            zipCode: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    console.log(`📊 Raw orders found: ${allOrders.length}`)

    // Enhanced filtering for legitimate orders
    const legitimateOrders = allOrders.filter(order => {
      // Basic validation - order must have items
      if (!order.orderItems || order.orderItems.length === 0) {
        console.log(`🚫 Filtering out order ${order.orderNumber}: No items`)
        return false
      }

      // Check for dummy email patterns (but allow demo users)
      const dummyEmailPatterns = [
        /^dummy@/i,
        /^sample@/i,
        /^fake@/i,
        /^placeholder@/i,
        /^noreply@/i,
        /^donotreply@/i,
        /^test-dummy@/i
      ]
      
      const isDummyEmail = dummyEmailPatterns.some(pattern => 
        pattern.test(order.user?.email || '')
      )
      
      if (isDummyEmail) {
        console.log(`🚫 Filtering out order ${order.orderNumber}: Dummy email ${order.user?.email}`)
        return false
      }
      
      // Allow demo@example.com for testing purposes
      // This is a legitimate test account, not dummy data

      // Check for dummy order number patterns
      const dummyOrderPatterns = [
        /^DEMO-/i,
        /^DUMMY-/i,
        /^SAMPLE-/i,
        /^ORD-(000000|111111|999999)$/i
      ]
      
      const isDummyOrder = dummyOrderPatterns.some(pattern => 
        pattern.test(order.orderNumber)
      )
      
      if (isDummyOrder) {
        console.log(`🚫 Filtering out order ${order.orderNumber}: Dummy order pattern`)
        return false
      }

      // Check for invalid order values
      if (order.total <= 0) {
        console.log(`🚫 Filtering out order ${order.orderNumber}: Invalid total ${order.total}`)
        return false
      }

      // Order passes all checks
      console.log(`✅ Order ${order.orderNumber} is legitimate`)
      return true
    })

    // Remove user data from response for security
    const sanitizedOrders = legitimateOrders.map(order => {
      const { user, ...orderData } = order
      return orderData
    })

    // Enhanced logging
    console.log(`📈 Orders summary for ${authenticatedUser.email}:`)
    console.log(`   - Raw orders: ${allOrders.length}`)
    console.log(`   - Legitimate orders: ${legitimateOrders.length}`)
    console.log(`   - Filtered out: ${allOrders.length - legitimateOrders.length}`)
    
    if (legitimateOrders.length > 0) {
      console.log('   - Order details:')
      legitimateOrders.forEach(order => {
        console.log(`     * ${order.orderNumber}: ₹${order.total}, ${order.status}, ${order.orderItems.length} items`)
      })
    }

    // Add cache-busting headers and metadata
    const response = NextResponse.json({ 
      orders: sanitizedOrders,
      meta: {
        total: legitimateOrders.length,
        filtered: allOrders.length - legitimateOrders.length,
        user: authenticatedUser.email
      }
    })
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error("❌ Error fetching orders:", error)
    return NextResponse.json({ 
      error: "Failed to fetch orders", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}