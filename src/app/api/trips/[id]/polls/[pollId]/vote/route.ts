import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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
    const { option } = body

    if (!option) {
      return NextResponse.json({ error: 'Vote option is required' }, { status: 400 })
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

    // Get the poll and check if it's active
    const poll = await prisma.poll.findFirst({
      where: {
        id: pollId,
        tripId,
      },
    })

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    if (poll.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Poll is not active' }, { status: 400 })
    }

    // Check if poll has expired
    if (poll.expiresAt < new Date()) {
      // Update poll status to expired
      await prisma.poll.update({
        where: { id: pollId },
        data: { status: 'EXPIRED' },
      })
      return NextResponse.json({ error: 'Poll has expired' }, { status: 400 })
    }

    // Check if the option is valid
    if (!poll.options.includes(option)) {
      return NextResponse.json({ error: 'Invalid vote option' }, { status: 400 })
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        pollId_userId: {
          pollId,
          userId: session.user.id,
        },
      },
    })

    if (existingVote) {
      // Update existing vote
      const updatedVote = await prisma.vote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          option,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return NextResponse.json({ vote: updatedVote, message: 'Vote updated successfully' })
    }

    // Create new vote
    const vote = await prisma.vote.create({
      data: {
        option,
        pollId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ vote }, { status: 201 })
  } catch (error) {
    console.error('Error submitting vote:', error)
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

    // Check if poll exists
    const poll = await prisma.poll.findFirst({
      where: {
        id: pollId,
        tripId,
      },
    })

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    // Delete user's vote
    await prisma.vote.deleteMany({
      where: {
        pollId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Vote removed successfully' })
  } catch (error) {
    console.error('Error removing vote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 