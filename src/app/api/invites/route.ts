import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all pending invitations for the current user (by userId and by email)
    const invites = await prisma.tripInvite.findMany({
      where: {
        OR: [
          { receiverId: session.user.id },
          { receiverEmail: session.user.email }
        ],
        status: "PENDING"
      },
      include: {
        trip: {
          select: {
            id: true,
            name: true,
            description: true,
            startDate: true,
            endDate: true,
            creator: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
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