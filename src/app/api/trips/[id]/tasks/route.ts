import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: tripId } = await params

    // Check if user is a member of the trip
    const tripMember = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: session.user.id,
        },
      },
    })

    if (!tripMember) {
      return NextResponse.json({ error: 'Trip not found or access denied' }, { status: 404 })
    }

    // Get all tasks for the trip with related user data
    const tasks = await prisma.task.findMany({
      where: {
        tripId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: tripId } = await params
    const body = await request.json()
    const { title, description, category, priority, dueDate, assignedToId } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Check if user is a member of the trip
    const tripMember = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: session.user.id,
        },
      },
    })

    if (!tripMember) {
      return NextResponse.json({ error: 'Trip not found or access denied' }, { status: 404 })
    }

    // If assignedToId is provided, verify the user is a member of the trip
    if (assignedToId) {
      const assignedMember = await prisma.tripMember.findUnique({
        where: {
          tripId_userId: {
            tripId,
            userId: assignedToId,
          },
        },
      })

      if (!assignedMember) {
        return NextResponse.json({ error: 'Assigned user is not a member of this trip' }, { status: 400 })
      }
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        category: category || 'GENERAL',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        tripId,
        createdById: session.user.id,
        assignedToId: assignedToId || null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 