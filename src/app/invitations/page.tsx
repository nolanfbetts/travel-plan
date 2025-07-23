"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import AppLayout from "@/components/AppLayout"

interface Invitation {
  id: string
  status: string
  createdAt: string
  trip: {
    id: string
    name: string
    description: string | null
    startDate: string | null
    endDate: string | null
    creator: {
      id: string
      name: string
      email: string
    }
  }
  sender: {
    id: string
    name: string
    email: string
  }
}

export default function InvitationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchInvitations()
    }
  }, [status])

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/invites')
      if (response.ok) {
        const data = await response.json()
        setInvitations(data)
      }
    } catch (error) {
      console.error("Error fetching invitations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvitation = async (inviteId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        fetchInvitations() // Refresh the list
        if (action === 'accept') {
          alert('Invitation accepted! You can now view the trip.')
        } else {
          alert('Invitation declined.')
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to process invitation')
      }
    } catch (error) {
      console.error('Error processing invitation:', error)
      alert('An error occurred while processing the invitation')
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitations...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <AppLayout currentPage="invitations" invitationCount={invitations.length}>
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trip Invitations
          </h1>
          <p className="text-gray-600">
            Manage your pending trip invitations
          </p>
        </div>
      </div>

          {/* Invitations List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pending Invitations</h3>
            </div>
            <div className="p-6">
              {invitations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
                  <p className="text-gray-500 mb-6">
                    You&apos;re all caught up! Check back later for new invitations.
                  </p>
                  <Link href="/dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invite) => (
                    <div key={invite.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="text-lg font-medium text-gray-900">{invite.trip.name}</h4>
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
                              Pending
                            </span>
                          </div>
                          
                          {invite.trip.description && (
                            <p className="text-gray-600 mb-4 line-clamp-2">{invite.trip.description}</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                            <div>
                              <p><strong>Invited by:</strong> {invite.sender.name} ({invite.sender.email})</p>
                              <p><strong>Trip creator:</strong> {invite.trip.creator.name}</p>
                            </div>
                            <div>
                              {invite.trip.startDate && invite.trip.endDate && (
                                <p><strong>Dates:</strong> {formatDate(invite.trip.startDate)} - {formatDate(invite.trip.endDate)}</p>
                              )}
                              <p><strong>Invited:</strong> {formatDate(invite.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-6">
                          <Button 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleInvitation(invite.id, 'accept')}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => handleInvitation(invite.id, 'decline')}
                          >
                            Decline
                          </Button>
                          <Link href={`/trips/${invite.trip.id}`}>
                            <Button variant="outline" className="w-full">
                              View Trip
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AppLayout>
  )
} 