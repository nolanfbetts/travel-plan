"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import PollForm from "@/components/PollForm"
import PollCard from "@/components/PollCard"
import TripLayout from "@/components/TripLayout"

interface Trip {
  id: string
  name: string
  description: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  creator: {
    id: string
    name: string
    email: string
  }
  members: Array<{
    id: string
    role: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
}

interface Poll {
  id: string
  question: string
  description?: string
  options: string[]
  status: string
  expiresAt: string
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  votes: Array<{
    id: string
    option: string
    createdAt: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
  _count: {
    votes: number
  }
}

export default function TripPollsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tripId, setTripId] = useState<string | null>(null)
  const [showPollForm, setShowPollForm] = useState(false)
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null)

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setTripId(resolvedParams.id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (tripId) {
      fetchTripData()
    }
  }, [tripId])

  const fetchTripData = async () => {
    if (!tripId) return
    
    try {
      const [tripResponse, pollsResponse] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/polls`)
      ])

      if (tripResponse.ok) {
        const tripData = await tripResponse.json()
        setTrip(tripData.trip)
      }

      if (pollsResponse.ok) {
        const pollsData = await pollsResponse.json()
        setPolls(pollsData.polls)
      }
    } catch (error) {
      console.error("Error fetching trip data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip not found</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
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
      tripCreator={trip.creator.name}
      currentTab="polls"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Voting & Polls</h3>
          <Button
            onClick={() => {
              setEditingPoll(null)
              setShowPollForm(true)
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Create Poll
          </Button>
        </div>
        <div className="p-6">
          {showPollForm && (
            <div className="mb-6">
              <PollForm
                tripId={tripId || ''}
                onSuccess={() => {
                  setShowPollForm(false)
                  fetchTripData()
                }}
                onCancel={() => setShowPollForm(false)}
                initialData={editingPoll ? {
                  id: editingPoll.id,
                  question: editingPoll.question,
                  description: editingPoll.description,
                  options: editingPoll.options,
                  expiresAt: editingPoll.expiresAt
                } : undefined}
              />
            </div>
          )}
          
          {polls.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No polls yet</h3>
              <p className="text-gray-500 mb-6">Start making decisions together by creating your first poll.</p>
              <Button
                onClick={() => {
                  setEditingPoll(null)
                  setShowPollForm(true)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create First Poll
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  tripId={tripId || ''}
                  onUpdate={fetchTripData}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </TripLayout>
  )
} 