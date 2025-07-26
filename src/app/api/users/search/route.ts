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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const tripId = searchParams.get('tripId')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [] })
    }

    // Build the search query
    const searchQuery = query.trim().toLowerCase()
    
    // Find users that match the search query
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } }
        ],
        NOT: {
          id: session.user.id // Exclude current user
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 10 // Limit results
    })

    // If tripId is provided, filter out users who are already members or have pending invitations
    let filteredUsers = users
    if (tripId) {
      const [existingMembers, existingInvites] = await Promise.all([
        prisma.tripMember.findMany({
          where: { tripId },
          select: { userId: true }
        }),
        prisma.tripInvite.findMany({
          where: { 
            tripId,
            status: 'PENDING'
          },
          select: { receiverId: true, receiverEmail: true }
        })
      ])

      const memberIds = new Set(existingMembers.map(m => m.userId))
      const invitedIds = new Set(existingInvites.map(i => i.receiverId).filter(Boolean))
      const invitedEmails = new Set(existingInvites.map(i => i.receiverEmail).filter(Boolean))

      filteredUsers = users.filter(user => 
        !memberIds.has(user.id) && 
        !invitedIds.has(user.id) &&
        !invitedEmails.has(user.email)
      )
    }

    return NextResponse.json({ users: filteredUsers })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    )
  }
} 