import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        createdTrips: {
          include: {
            members: true,
            costs: true,
            tasks: true,
            polls: true,
            invites: true
          }
        },
        sentInvites: true,
        receivedInvites: true,
        createdTasks: true,
        assignedTasks: true,
        paidCosts: true,
        createdPolls: true,
        votes: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Start a transaction to delete all user data
    await prisma.$transaction(async (tx) => {
      // Delete votes
      await tx.vote.deleteMany({
        where: { userId: user.id }
      })

      // Delete polls created by user
      await tx.poll.deleteMany({
        where: { createdById: user.id }
      })

      // Delete tasks assigned to user
      await tx.task.updateMany({
        where: { assignedToId: user.id },
        data: { assignedToId: null }
      })

      // Delete tasks created by user
      await tx.task.deleteMany({
        where: { createdById: user.id }
      })

      // Delete costs paid by user
      await tx.cost.updateMany({
        where: { paidById: user.id },
        data: { paidById: null }
      })

      // Delete invitations sent by user
      await tx.tripInvite.deleteMany({
        where: { senderId: user.id }
      })

      // Delete invitations received by user
      await tx.tripInvite.deleteMany({
        where: { receiverId: user.id }
      })

      // Remove user from trip memberships
      await tx.tripMember.deleteMany({
        where: { userId: user.id }
      })

      // Delete trips created by user (and all associated data)
      for (const trip of user.createdTrips) {
        await tx.vote.deleteMany({
          where: { poll: { tripId: trip.id } }
        })
        await tx.poll.deleteMany({
          where: { tripId: trip.id }
        })
        await tx.task.deleteMany({
          where: { tripId: trip.id }
        })
        await tx.cost.deleteMany({
          where: { tripId: trip.id }
        })
        await tx.tripInvite.deleteMany({
          where: { tripId: trip.id }
        })
        await tx.tripMember.deleteMany({
          where: { tripId: trip.id }
        })
        await tx.trip.delete({
          where: { id: trip.id }
        })
      }

      // Finally, delete the user
      await tx.user.delete({
        where: { id: user.id }
      })
    })

    return NextResponse.json({
      message: 'Your account and all associated data have been successfully deleted',
      deletedData: {
        trips: user.createdTrips.length,
        costs: user.paidCosts.length,
        tasks: user.createdTasks.length,
        polls: user.createdPolls.length,
        invitations: user.sentInvites.length + user.receivedInvites.length
      }
    })

  } catch (error) {
    console.error('Data deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        createdTrips: {
          include: {
            members: true,
            costs: true,
            tasks: true,
            polls: true,
            invites: true
          }
        },
        sentInvites: true,
        receivedInvites: true,
        createdTasks: true,
        assignedTasks: true,
        paidCosts: true,
        createdPolls: true,
        votes: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return data summary for transparency
    return NextResponse.json({
      userData: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      dataSummary: {
        trips: user.createdTrips.length,
        costs: user.paidCosts.length,
        tasks: user.createdTasks.length,
        assignedTasks: user.assignedTasks.length,
        polls: user.createdPolls.length,
        votes: user.votes.length,
        sentInvites: user.sentInvites.length,
        receivedInvites: user.receivedInvites.length
      },
      trips: user.createdTrips.map(trip => ({
        id: trip.id,
        name: trip.name,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        createdAt: trip.createdAt,
        memberCount: trip.members.length,
        costCount: trip.costs.length,
        taskCount: trip.tasks.length,
        pollCount: trip.polls.length
      }))
    })

  } catch (error) {
    console.error('Data access error:', error)
    return NextResponse.json(
      { error: 'Failed to access user data' },
      { status: 500 }
    )
  }
} 