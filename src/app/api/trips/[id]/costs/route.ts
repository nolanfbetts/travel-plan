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

    // Check if user has access to this trip
    const tripAccess = await prisma.trip.findFirst({
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
      }
    })

    if (!tripAccess) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    const costs = await prisma.cost.findMany({
      where: {
        tripId: id
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({ costs })
  } catch (error) {
    console.error("Error fetching costs:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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

    // Check if user has access to this trip
    const tripAccess = await prisma.trip.findFirst({
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
      }
    })

    if (!tripAccess) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    const body = await request.json()
    const { amount, currency, description, category, date, paidById } = body

    if (!amount || !description) {
      return NextResponse.json(
        { error: "Amount and description are required" },
        { status: 400 }
      )
    }

    const cost = await prisma.cost.create({
      data: {
        amount: parseFloat(amount),
        currency: currency || "USD",
        description,
        category: category || "OTHER",
        date: date ? new Date(date) : new Date(),
        paidById: paidById || session.user.id,
        tripId: id
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ cost }, { status: 201 })
  } catch (error) {
    console.error("Error creating cost:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 