import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Unset all other default addresses for this user
    await db.address.updateMany({
      where: { userId: user.id, id: { not: params.id } },
      data: { isDefault: false }
    })

    // Set this address as default
    const updatedAddress = await db.address.update({
      where: { id: params.id },
      data: { isDefault: true }
    })

    return NextResponse.json({ address: updatedAddress })
  } catch (error) {
    console.error('Error setting default address:', error)
    return NextResponse.json({ error: 'Failed to set default address' }, { status: 500 })
  }
}