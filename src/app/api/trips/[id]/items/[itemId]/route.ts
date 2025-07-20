import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, itemId } = await params

    // Check if user has access to this trip
    const tripAccess = await prisma.trip.findFirst({
      where: {
        id,
        OR: [
          { creatorId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    })

    if (!tripAccess) {
      return NextResponse.json({ error: 'Trip not found or access denied' }, { status: 404 })
    }

    // Get the specific item
    const item = await prisma.itineraryItem.findFirst({
      where: {
        id: itemId,
        tripId: id
      }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, itemId } = await params
    const body = await request.json()

    // Check if user has access to this trip
    const tripAccess = await prisma.trip.findFirst({
      where: {
        id,
        OR: [
          { creatorId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    })

    if (!tripAccess) {
      return NextResponse.json({ error: 'Trip not found or access denied' }, { status: 404 })
    }

    // Check if item exists and belongs to this trip
    const existingItem = await prisma.itineraryItem.findFirst({
      where: {
        id: itemId,
        tripId: id
      }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Update the item
    const updatedItem = await prisma.itineraryItem.update({
      where: {
        id: itemId
      },
      data: {
        type: body.type,
        title: body.title,
        description: body.description || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        location: (body.type === 'FLIGHT' || body.type === 'TRANSPORT') ? null : (body.location || null),
        startLocation: (body.type === 'FLIGHT' || body.type === 'TRANSPORT') ? body.startLocation : null,
        endLocation: (body.type === 'FLIGHT' || body.type === 'TRANSPORT') ? body.endLocation : null,
        confirmationCode: body.confirmationCode || null,
        notes: body.notes || null
      }
    })

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, itemId } = await params

    // Check if user has access to this trip
    const tripAccess = await prisma.trip.findFirst({
      where: {
        id,
        OR: [
          { creatorId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    })

    if (!tripAccess) {
      return NextResponse.json({ error: 'Trip not found or access denied' }, { status: 404 })
    }

    // Check if item exists and belongs to this trip
    const existingItem = await prisma.itineraryItem.findFirst({
      where: {
        id: itemId,
        tripId: id
      }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Delete the item
    await prisma.itineraryItem.delete({
      where: {
        id: itemId
      }
    })

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 