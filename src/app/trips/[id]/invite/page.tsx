"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import TripLayout from "@/components/TripLayout"
import { Button } from "@/components/ui/button"
import UserSearch from "@/components/UserSearch"

interface User {
  id: string
  name: string | null
  email: string
}

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
  const [inviteEmails, setInviteEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
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

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId))
  }

  const handleAddEmail = () => {
    if (!newEmail.trim()) return
    
    // Split by commas and clean up each email
    const emails = newEmail.split(',').map(email => email.trim()).filter(email => email)
    
    // Add unique emails that aren't already in the list
    const newEmails = emails.filter(email => !inviteEmails.includes(email))
    if (newEmails.length > 0) {
      setInviteEmails([...inviteEmails, ...newEmails])
    }
    setNewEmail("")
  }

  const handleRemoveEmail = (emailToRemove: string) => {
    setInviteEmails(inviteEmails.filter(email => email !== emailToRemove))
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    const hasEmailInvites = inviteEmails.length > 0
    const hasUserInvites = selectedUsers.length > 0

    if (!hasEmailInvites && !hasUserInvites) return

    setIsInviting(true)
    setError("")
    setSuccess("")

    try {
      const resolvedParams = await params
      const results = []

      // Send invitations to selected users
      for (const user of selectedUsers) {
        const response = await fetch(`/api/trips/${resolvedParams.id}/invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        })

        if (response.ok) {
          results.push({ user: user.name || user.email, success: true })
        } else {
          const data = await response.json()
          results.push({ user: user.name || user.email, success: false, error: data.error })
        }
      }

      // Send invitations to email addresses
      for (const email of inviteEmails) {
        const response = await fetch(`/api/trips/${resolvedParams.id}/invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email }),
        })

        if (response.ok) {
          results.push({ user: email, success: true })
        } else {
          const data = await response.json()
          results.push({ user: email, success: false, error: data.error })
        }
      }

      // Show results
      const successful = results.filter(r => r.success)
      const failed = results.filter(r => !r.success)

      if (successful.length > 0) {
        setSuccess(`Successfully sent ${successful.length} invitation(s)!`)
      }
      
      if (failed.length > 0) {
        setError(`Failed to send ${failed.length} invitation(s): ${failed.map(f => f.error).join(', ')}`)
      }

      // Clear form
      setInviteEmails([])
      setNewEmail("")
      setSelectedUsers([])
      
      // Refresh invitations list
      await fetchTripData(resolvedParams.id)
    } catch (error) {
      console.error("Error sending invitation:", error)
      setError("Failed to send invitation")
    } finally {
      setIsInviting(false)
    }
  }

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return

    try {
      const resolvedParams = await params
      const response = await fetch(`/api/trips/${resolvedParams.id}/invite/${inviteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setInvitations(invitations.filter(invite => invite.id !== inviteId))
        setSuccess("Invitation cancelled successfully!")
      } else {
        setError("Failed to cancel invitation")
      }
    } catch (error) {
      console.error("Error cancelling invitation:", error)
      setError("Failed to cancel invitation")
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
            
            <form onSubmit={handleSendInvite} className="space-y-6">
              {/* User Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search for Users
                </label>
                <UserSearch
                  onUserSelect={handleUserSelect}
                  tripId={trip.id}
                  placeholder="Search by name or email..."
                  className="mb-3"
                />
                <p className="text-sm text-gray-500">
                  Search for existing users to invite them directly
                </p>
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Users ({selectedUsers.length})
                  </label>
                  <div className="space-y-2">
                    {selectedUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name || 'No name'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleRemoveUser(user.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or invite by email</span>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Addresses
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                    placeholder="Enter email(s) - separate multiple emails with commas"
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={handleAddEmail}
                    disabled={!newEmail.trim()}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    Add
                  </Button>
                </div>
                
                {/* Selected Emails */}
                {inviteEmails.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {inviteEmails.map((email) => (
                      <div key={email} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="text-gray-900">{email}</span>
                        <Button
                          type="button"
                          onClick={() => handleRemoveEmail(email)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-sm text-gray-500">
                  Use this for people who don&apos;t have an account yet. You can enter multiple email addresses separated by commas.
                </p>
              </div>
              
              {/* Summary */}
              {(selectedUsers.length > 0 || inviteEmails.length > 0) && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Invitation Summary</h3>
                  <div className="space-y-1">
                    {selectedUsers.length > 0 && (
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">{selectedUsers.length}</span> registered user(s): {selectedUsers.map(u => u.name || u.email).join(', ')}
                      </p>
                    )}
                    {inviteEmails.length > 0 && (
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">{inviteEmails.length}</span> email invitation(s): {inviteEmails.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isInviting || (inviteEmails.length === 0 && selectedUsers.length === 0)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {isInviting ? "Sending..." : `Send ${selectedUsers.length + inviteEmails.length} Invitation(s)`}
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
                          Cancel
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