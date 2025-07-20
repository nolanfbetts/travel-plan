import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: tripId, taskId } = await params

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

    // Get the specific task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
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
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: tripId, taskId } = await params
    const body = await request.json()
    const { title, description, category, status, priority, dueDate, assignedToId } = body

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

    // Check if task exists and belongs to the trip
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        tripId,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
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

    // Update the task
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title: title?.trim(),
        description: description?.trim(),
        category,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
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

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: tripId, taskId } = await params

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

    // Check if task exists and belongs to the trip
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        tripId,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Delete the task
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 