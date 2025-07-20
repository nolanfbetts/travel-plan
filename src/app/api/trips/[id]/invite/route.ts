import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendTripInvitationEmail } from "@/lib/email"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if trip exists and user is a member
    const trip = await prisma.trip.findFirst({
      where: {
        id: id,
        OR: [
          { creatorId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      }
    })

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // Find the user to invite (if they exist)
    const userToInvite = await prisma.user.findUnique({
      where: { email }
    })

    // Check if user is already a member (if they exist)
    if (userToInvite) {
      const existingMember = await prisma.tripMember.findUnique({
        where: {
          tripId_userId: {
            tripId: id,
            userId: userToInvite.id
          }
        }
      })

      if (existingMember) {
        return NextResponse.json({ error: "User is already a member" }, { status: 400 })
      }

      // Check if invitation already exists for this user
      const existingInvite = await prisma.tripInvite.findUnique({
        where: {
          tripId_receiverId: {
            tripId: id,
            receiverId: userToInvite.id
          }
        }
      })

      if (existingInvite) {
        return NextResponse.json({ error: "Invitation already sent" }, { status: 400 })
      }
    } else {
      // Check if invitation already exists for this email (for non-registered users)
      const existingInvite = await prisma.tripInvite.findUnique({
        where: {
          tripId_receiverEmail: {
            tripId: id,
            receiverEmail: email
          }
        }
      })

      if (existingInvite) {
        return NextResponse.json({ error: "Invitation already sent" }, { status: 400 })
      }
    }

    // Create invitation
    const invite = await prisma.tripInvite.create({
      data: {
        tripId: id,
        senderId: session.user.id,
        receiverId: userToInvite?.id || null,
        receiverEmail: userToInvite ? null : email
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        trip: {
          select: {
            id: true,
            name: true,
            description: true,
            startDate: true,
            endDate: true
          }
        }
      }
    })

    // Send invitation email
    try {
      const emailResult = await sendTripInvitationEmail(
        userToInvite?.email || email,
        userToInvite?.name || 'Traveler',
        invite.sender.name || 'Someone',
        invite.trip.name,
        invite.trip.description,
        invite.trip.startDate?.toISOString() || null,
        invite.trip.endDate?.toISOString() || null,
        !userToInvite // isNewUser = true if user doesn't exist
      )
      
      if (emailResult.success) {
        console.log(`Trip invitation email sent successfully to ${userToInvite?.email || email}`)
      } else {
        console.error(`Failed to send trip invitation email to ${userToInvite?.email || email}:`, emailResult.error)
      }
    } catch (error) {
      console.error("Failed to send invitation email:", error)
      // Don't fail the invitation creation if email fails
    }

    return NextResponse.json(invite, { status: 201 })
  } catch (error) {
    console.error("Error creating invitation:", error)
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    )
  }
}

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
    // Check if user is a member of the trip
    const trip = await prisma.trip.findFirst({
      where: {
        id: id,
        OR: [
          { creatorId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      }
    })

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // Get all invitations for this trip (including accepted/declined)
    const invites = await prisma.tripInvite.findMany({
      where: {
        tripId: id
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(invites)
  } catch (error) {
    console.error("Error fetching invitations:", error)
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    )
  }
} 