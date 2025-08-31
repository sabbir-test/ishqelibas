import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addresses = await db.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: 'desc' }
    })

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, firstName, lastName, email, phone, address, city, state, zipCode, country, isDefault } = body

    // Validate required fields
    if (!type || !firstName || !lastName || !email || !phone || !address || !city || !state || !zipCode) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    // If this is set as default, unset all other default addresses for this user
    if (isDefault) {
      await db.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      })
    }

    // Create the new address
    const newAddress = await db.address.create({
      data: {
        userId: user.id,
        type,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        country: country || 'India',
        isDefault: isDefault || false
      }
    })

    return NextResponse.json({ address: newAddress }, { status: 201 })
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 })
  }
}