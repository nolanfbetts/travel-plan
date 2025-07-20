import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; costId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, costId } = await params

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

    // Get the specific cost
    const cost = await prisma.cost.findFirst({
      where: {
        id: costId,
        tripId: id
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!cost) {
      return NextResponse.json({ error: 'Cost not found' }, { status: 404 })
    }

    return NextResponse.json({ cost })
  } catch (error) {
    console.error('Error fetching cost:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; costId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, costId } = await params
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

    // Check if cost exists and belongs to this trip
    const existingCost = await prisma.cost.findFirst({
      where: {
        id: costId,
        tripId: id
      }
    })

    if (!existingCost) {
      return NextResponse.json({ error: 'Cost not found' }, { status: 404 })
    }

    // Update the cost
    const updatedCost = await prisma.cost.update({
      where: {
        id: costId
      },
      data: {
        amount: body.amount,
        currency: body.currency,
        description: body.description,
        category: body.category,
        date: body.date ? new Date(body.date) : new Date(),
        paidById: session.user.id
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ cost: updatedCost })
  } catch (error) {
    console.error('Error updating cost:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; costId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, costId } = await params

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

    // Check if cost exists and belongs to this trip
    const existingCost = await prisma.cost.findFirst({
      where: {
        id: costId,
        tripId: id
      }
    })

    if (!existingCost) {
      return NextResponse.json({ error: 'Cost not found' }, { status: 404 })
    }

    // Delete the cost
    await prisma.cost.delete({
      where: {
        id: costId
      }
    })

    return NextResponse.json({ message: 'Cost deleted successfully' })
  } catch (error) {
    console.error('Error deleting cost:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 