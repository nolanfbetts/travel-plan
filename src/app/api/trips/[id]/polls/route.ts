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

    // Get all polls for the trip with related data
    const polls = await prisma.poll.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Check if polls have expired and update their status
    const now = new Date()
    const updatedPolls = await Promise.all(
      polls.map(async (poll) => {
        if (poll.status === 'ACTIVE' && poll.expiresAt < now) {
          const updatedPoll = await prisma.poll.update({
            where: { id: poll.id },
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
          return updatedPoll
        }
        return poll
      })
    )

    return NextResponse.json({ polls: updatedPolls })
  } catch (error) {
    console.error('Error fetching polls:', error)
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
    const { question, description, options, expiresAt } = body

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: 'At least 2 options are required' }, { status: 400 })
    }

    if (!expiresAt) {
      return NextResponse.json({ error: 'Expiration date is required' }, { status: 400 })
    }

    const expirationDate = new Date(expiresAt)
    if (expirationDate <= new Date()) {
      return NextResponse.json({ error: 'Expiration date must be in the future' }, { status: 400 })
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

    // Create the poll
    const poll = await prisma.poll.create({
      data: {
        question: question.trim(),
        description: description?.trim() || null,
        options: options.map((option: string) => option.trim()).filter(Boolean),
        expiresAt: expirationDate,
        tripId,
        createdById: session.user.id,
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

    return NextResponse.json({ poll }, { status: 201 })
  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 