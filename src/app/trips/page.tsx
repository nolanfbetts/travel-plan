"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AppLayout from "@/components/AppLayout"

interface Trip {
  id: string
  name: string
  description: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string
}

interface Invitation {
  id: string
  status: string
  createdAt: string
  trip: {
    id: string
    name: string
  }
  sender: {
    name: string
  }
}

export default function TripsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchTrips()
    }
  }, [status])

  const fetchTrips = async () => {
    try {
      const [tripsResponse, invitationsResponse] = await Promise.all([
        fetch("/api/trips"),
        fetch("/api/invites")
      ])
      
      if (tripsResponse.ok) {
        const data = await tripsResponse.json()
        setTrips(data.trips)
      }
      
      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json()
        setInvitations(invitationsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <AppLayout currentPage="trips" invitationCount={invitations.length}>
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Trips
          </h1>
          <p className="text-gray-600">
            Manage your trips and plan your next adventure.
          </p>
        </div>
      </div>

          {/* Create New Trip Button */}
          <div className="mb-6">
            <Link href="/trips/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Trip
              </Button>
            </Link>
          </div>

          {/* Pending Invitations Alert */}
          {invitations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  </svg>
                  <div>
                                      <h3 className="text-sm font-medium text-blue-900">
                    {`You have ${invitations.length} pending invitation${invitations.length > 1 ? 's' : ''}!`}
                  </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      {invitations.length === 1 
                        ? `${invitations[0].sender.name} invited you to join "${invitations[0].trip.name}"`
                        : 'Check your invitations to join trips with friends and family.'
                      }
                    </p>
                  </div>
                </div>
                <Link href="/invitations">
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    View Invitations
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Trips Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Trips</h2>
              
              {trips.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
                  <p className="text-gray-500 mb-6">
                    Get started by creating your first trip.
                  </p>
                  <Link href="/trips/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Create Trip
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {trip.name}
                        </h3>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      
                      {trip.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {trip.description}
                        </p>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {trip.startDate && trip.endDate ? (
                          <span>
                            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span>No dates set</span>
                        )}
                      </div>
                      
                      <Link href={`/trips/${trip.id}`}>
                        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                          View Trip
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AppLayout>
  )
} 