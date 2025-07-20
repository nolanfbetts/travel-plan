import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { action } = await request.json()
    if (!action || !["accept", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Find the invitation (by userId or by email)
    const invite = await prisma.tripInvite.findFirst({
      where: {
        id: id,
        OR: [
          { receiverId: session.user.id },
          { receiverEmail: session.user.email }
        ],
        status: "PENDING"
      },
      include: {
        trip: true
      }
    })

    if (!invite) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    if (action === "accept") {
      // Accept the invitation
      await prisma.$transaction([
        // Update invitation status and link to user if it was a pending invitation
        prisma.tripInvite.update({
          where: { id: id },
          data: { 
            status: "ACCEPTED",
            receiverId: session.user.id,
            receiverEmail: null // Clear the email since we now have a user
          }
        }),
        // Add user as trip member
        prisma.tripMember.create({
          data: {
            tripId: invite.tripId,
            userId: session.user.id,
            role: "MEMBER"
          }
        })
      ])

      return NextResponse.json({ message: "Invitation accepted" })
    } else {
      // Decline the invitation
      await prisma.tripInvite.update({
        where: { id: id },
        data: { 
          status: "DECLINED",
          receiverId: session.user.id,
          receiverEmail: null // Clear the email since we now have a user
        }
      })

      return NextResponse.json({ message: "Invitation declined" })
    }
  } catch (error) {
    console.error("Error updating invitation:", error)
    return NextResponse.json(
      { error: "Failed to update invitation" },
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
    // Find the invitation and check if user is the sender or receiver
    const invite = await prisma.tripInvite.findFirst({
      where: {
        id: id,
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
          { receiverEmail: session.user.email }
        ]
      }
    })

    if (!invite) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    // Delete the invitation
    await prisma.tripInvite.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "Invitation deleted" })
  } catch (error) {
    console.error("Error deleting invitation:", error)
    return NextResponse.json(
      { error: "Failed to delete invitation" },
      { status: 500 }
    )
  }
} 