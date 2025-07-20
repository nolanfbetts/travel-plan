"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

export default function DashboardPage() {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {session?.user?.name || "Traveler"}!
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your trips and plan your next adventure.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/trips/new">
                <Button>
                  Create New Trip
                </Button>
              </Link>
              <Link href="/invitations">
                <Button variant="outline">
                  Invitations {invitations.length > 0 && `(${invitations.length})`}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              >
                Logout
              </Button>
            </div>
          </div>

          {invitations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    You have {invitations.length} pending invitation{invitations.length > 1 ? 's' : ''}!
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {invitations.length === 1 
                      ? `${invitations[0].sender.name} invited you to join "${invitations[0].trip.name}"`
                      : 'Check your invitations to join trips with friends and family.'
                    }
                  </p>
                </div>
                <Link href="/invitations">
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    View Invitations
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Trips</h2>
              
              {trips.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No trips yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first trip.
                  </p>
                  <div className="mt-6">
                    <Link href="/trips/new">
                      <Button>
                        Create Trip
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {trip.name}
                      </h3>
                      {trip.description && (
                        <p className="text-gray-600 text-sm mb-4">
                          {trip.description}
                        </p>
                      )}
                      <div className="text-sm text-gray-500 mb-4">
                        {trip.startDate && trip.endDate ? (
                          <span>
                            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span>No dates set</span>
                        )}
                      </div>
                      <Link href={`/trips/${trip.id}`}>
                        <Button variant="outline" className="w-full">
                          View Trip
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 