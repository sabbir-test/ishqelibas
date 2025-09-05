import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, firstName, lastName, email, phone, address, city, state, zipCode, country, isDefault } = body

    // Check if the address belongs to the user
    const existingAddress = await db.address.findFirst({
      where: { id: params.id, userId: user.id }
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // If this is set as default, unset all other default addresses for this user
    if (isDefault) {
      await db.address.updateMany({
        where: { userId: user.id, id: { not: params.id } },
        data: { isDefault: false }
      })
    }

    // Update the address
    const updatedAddress = await db.address.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json({ address: updatedAddress })
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the address belongs to the user
    const existingAddress = await db.address.findFirst({
      where: { id: params.id, userId: user.id }
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Delete the address
    await db.address.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}