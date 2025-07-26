"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import TripLayout from "@/components/TripLayout"
import { Button } from "@/components/ui/button"

interface TripInvite {
  id: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  receiver: {
    id: string
    name: string | null
    email: string
  } | null
  receiverEmail: string | null
  sender: {
    id: string
    name: string | null
    email: string
  }
}

interface Trip {
  id: string
  name: string
  description: string | null
  startDate: string | null
  endDate: string | null
  creator: {
    id: string
    name: string | null
    email: string
  }
}

export default function TripInvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [invitations, setInvitations] = useState<TripInvite[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      await fetchTripData(resolvedParams.id)
    }
    loadData()
  }, [params])

  const fetchTripData = async (tripId: string) => {
    try {
      const [tripResponse, invitesResponse] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/invite`)
      ])

      if (tripResponse.ok) {
        const tripData = await tripResponse.json()
        setTrip(tripData.trip)
      }

      if (invitesResponse.ok) {
        const invitesData = await invitesResponse.json()
        setInvitations(invitesData)
      }
    } catch (error) {
      console.error("Error fetching trip data:", error)
      setError("Failed to load trip data")
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    setError("")
    setSuccess("")

    try {
      const resolvedParams = await params
      const response = await fetch(`/api/trips/${resolvedParams.id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Invitation sent successfully!")
        setInviteEmail("")
        // Refresh invitations list
        await fetchTripData(resolvedParams.id)
      } else {
        setError(data.error || "Failed to send invitation")
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
      setError("Failed to send invitation")
    } finally {
      setIsInviting(false)
    }
  }

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm("Are you sure you want to delete this invitation?")) return

    try {
      const resolvedParams = await params
      const response = await fetch(`/api/trips/${resolvedParams.id}/invite/${inviteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setInvitations(invitations.filter(invite => invite.id !== inviteId))
        setSuccess("Invitation deleted successfully!")
      } else {
        setError("Failed to delete invitation")
      }
    } catch (error) {
      console.error("Error deleting invitation:", error)
      setError("Failed to delete invitation")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-100'
      case 'declined':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Trip not found</p>
        </div>
      </div>
    )
  }

  return (
    <TripLayout
      tripId={trip.id}
      tripName={trip.name}
      tripDescription={trip.description}
      tripStartDate={trip.startDate}
      tripEndDate={trip.endDate}
      tripCreator={trip.creator.name || trip.creator.email}
      currentTab="invite"
    >
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invite People</h1>
            <p className="text-gray-600">Invite friends and family to join your trip planning.</p>
          </div>

          {/* Send Invitation Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Send New Invitation</h2>
            
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={isInviting || !inviteEmail.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {isInviting ? "Sending..." : "Send Invitation"}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                {success}
              </div>
            )}
          </div>

          {/* Existing Invitations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invitations Sent</h2>
            
            {invitations.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <p className="text-gray-500">No invitations sent yet</p>
                <p className="text-sm text-gray-400 mt-1">Send your first invitation above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {(invite.receiver?.name || invite.receiverEmail || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {invite.receiver?.name || invite.receiverEmail || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {invite.receiver?.email || invite.receiverEmail}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invite.status)}`}>
                        {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                      </span>
                      
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Sent by {invite.sender.name}</p>
                        <p className="text-xs text-gray-400">{formatDate(invite.createdAt)}</p>
                      </div>

                      {invite.status === 'pending' && (
                        <Button
                          onClick={() => handleDeleteInvite(invite.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TripLayout>
  )
} 