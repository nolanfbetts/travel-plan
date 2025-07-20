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

    const items = await prisma.itineraryItem.findMany({
      where: {
        tripId: id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching itinerary items:", error)
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
    const { 
      type, 
      title, 
      description, 
      startDate, 
      endDate, 
      location,
      startLocation,
      endLocation,
      confirmationCode, 
      notes,
      // Cost fields
      hasCost,
      costAmount,
      costCurrency,
      costCategory,
      costDate
    } = body

    if (!type || !title) {
      return NextResponse.json(
        { error: "Type and title are required" },
        { status: 400 }
      )
    }

    // Create the itinerary item
    const item = await prisma.itineraryItem.create({
      data: {
        type,
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location: (type === 'FLIGHT' || type === 'TRANSPORT') ? null : location,
        startLocation: (type === 'FLIGHT' || type === 'TRANSPORT') ? startLocation : null,
        endLocation: (type === 'FLIGHT' || type === 'TRANSPORT') ? endLocation : null,
        confirmationCode,
        notes,
        tripId: id,
        createdById: session.user.id
      }
    })

    // If cost is provided, create a cost entry
    let cost = null
    if (hasCost && costAmount && parseFloat(costAmount) > 0) {
      cost = await prisma.cost.create({
        data: {
          amount: parseFloat(costAmount),
          currency: costCurrency || 'USD',
          description: title, // Use the item title as the cost description
          category: costCategory || 'other',
          date: costDate ? new Date(costDate) : new Date(),
          paidById: session.user.id,
          tripId: id
        }
      })
    }

    return NextResponse.json({ item, cost }, { status: 201 })
  } catch (error) {
    console.error("Error creating itinerary item:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 