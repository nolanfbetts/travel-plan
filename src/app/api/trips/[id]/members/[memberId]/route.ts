import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: tripId, memberId } = await params

    // Check if trip exists and user is the creator
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        creatorId: session.user.id
      }
    })

    if (!trip) {
      return NextResponse.json({ error: "Trip not found or you don't have permission to manage members" }, { status: 404 })
    }

    // Check if member exists and belongs to this trip
    const member = await prisma.tripMember.findFirst({
      where: {
        id: memberId,
        tripId: tripId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Prevent removing the creator
    if (member.userId === session.user.id) {
      return NextResponse.json({ error: "You cannot remove yourself as the trip creator" }, { status: 400 })
    }

    // Remove the member
    await prisma.tripMember.delete({
      where: {
        id: memberId
      }
    })

    return NextResponse.json({ 
      message: "Member removed successfully",
      removedMember: member.user
    })
  } catch (error) {
    console.error("Error removing member:", error)
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    )
  }
} 