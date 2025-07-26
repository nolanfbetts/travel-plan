import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; inviteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: tripId, inviteId } = await params

    // Check if trip exists and user is a member
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { creatorId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      }
    })

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // Check if invitation exists and belongs to this trip
    const invitation = await prisma.tripInvite.findFirst({
      where: {
        id: inviteId,
        tripId: tripId
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    // Only allow deletion if user is the sender or the trip creator
    if (invitation.senderId !== session.user.id && trip.creatorId !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to delete this invitation" }, { status: 403 })
    }

    // Delete the invitation
    await prisma.tripInvite.delete({
      where: {
        id: inviteId
      }
    })

    return NextResponse.json({ message: "Invitation deleted successfully" })
  } catch (error) {
    console.error("Error deleting invitation:", error)
    return NextResponse.json(
      { error: "Failed to delete invitation" },
      { status: 500 }
    )
  }
} 