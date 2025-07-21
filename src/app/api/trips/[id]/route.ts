import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const trip = await prisma.trip.findFirst({
      where: {
        id: id,
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
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    return NextResponse.json({ trip })
  } catch (error) {
    console.error("Error fetching trip:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if trip exists and user is the creator
    const trip = await prisma.trip.findFirst({
      where: {
        id: id,
        creatorId: session.user.id
      }
    })

    if (!trip) {
      return NextResponse.json({ error: "Trip not found or you don't have permission to delete it" }, { status: 404 })
    }

    // Delete the trip and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete votes for polls in this trip
      await tx.vote.deleteMany({
        where: {
          poll: {
            tripId: id
          }
        }
      })

      // Delete polls
      await tx.poll.deleteMany({
        where: {
          tripId: id
        }
      })

      // Delete tasks
      await tx.task.deleteMany({
        where: {
          tripId: id
        }
      })

      // Delete costs
      await tx.cost.deleteMany({
        where: {
          tripId: id
        }
      })

      // Delete itinerary items
      await tx.itineraryItem.deleteMany({
        where: {
          tripId: id
        }
      })

      // Delete trip invitations
      await tx.tripInvite.deleteMany({
        where: {
          tripId: id
        }
      })

      // Delete trip members
      await tx.tripMember.deleteMany({
        where: {
          tripId: id
        }
      })

      // Finally, delete the trip
      await tx.trip.delete({
        where: {
          id: id
        }
      })
    })

    return NextResponse.json({ message: "Trip deleted successfully" })
  } catch (error) {
    console.error("Error deleting trip:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 