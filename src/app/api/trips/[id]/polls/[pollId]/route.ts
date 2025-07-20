import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pollId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: tripId, pollId } = await params

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

    // Get the specific poll
    const poll = await prisma.poll.findFirst({
      where: {
        id: pollId,
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
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    })

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    // Check if poll has expired and update status if needed
    if (poll.status === 'ACTIVE' && poll.expiresAt < new Date()) {
      const updatedPoll = await prisma.poll.update({
        where: { id: pollId },
        data: { status: 'EXPIRED' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
      })
      return NextResponse.json({ poll: updatedPoll })
    }

    return NextResponse.json({ poll })
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pollId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: tripId, pollId } = await params
    const body = await request.json()
    const { question, description, options, expiresAt, status } = body

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

    // Check if poll exists and belongs to the trip
    const existingPoll = await prisma.poll.findFirst({
      where: {
        id: pollId,
        tripId,
      },
    })

    if (!existingPoll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    // Only the creator can update the poll
    if (existingPoll.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Only the poll creator can update this poll' }, { status: 403 })
    }

    // Validate input
    const updateData: any = {}
    
    if (question?.trim()) {
      updateData.question = question.trim()
    }
    
    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }
    
    if (options && Array.isArray(options) && options.length >= 2) {
      updateData.options = options.map((option: string) => option.trim()).filter(Boolean)
    }
    
    if (expiresAt) {
      const expirationDate = new Date(expiresAt)
      if (expirationDate <= new Date()) {
        return NextResponse.json({ error: 'Expiration date must be in the future' }, { status: 400 })
      }
      updateData.expiresAt = expirationDate
    }
    
    if (status && ['ACTIVE', 'CLOSED', 'EXPIRED'].includes(status)) {
      updateData.status = status
    }

    // Update the poll
    const updatedPoll = await prisma.poll.update({
      where: {
        id: pollId,
      },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    })

    return NextResponse.json({ poll: updatedPoll })
  } catch (error) {
    console.error('Error updating poll:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pollId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: tripId, pollId } = await params

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

    // Check if poll exists and belongs to the trip
    const existingPoll = await prisma.poll.findFirst({
      where: {
        id: pollId,
        tripId,
      },
    })

    if (!existingPoll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    // Only the creator can delete the poll
    if (existingPoll.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Only the poll creator can delete this poll' }, { status: 403 })
    }

    // Delete the poll (votes will be deleted automatically due to cascade)
    await prisma.poll.delete({
      where: {
        id: pollId,
      },
    })

    return NextResponse.json({ message: 'Poll deleted successfully' })
  } catch (error) {
    console.error('Error deleting poll:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 