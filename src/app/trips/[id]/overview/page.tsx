"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
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

interface ItineraryItem {
  id: string
  type: string
  title: string
  description: string | null
  startDate: string | null
  endDate: string | null
  location: string | null
  startLocation: string | null
  endLocation: string | null
  confirmationCode: string | null
  notes: string | null
  createdAt: string
  createdBy: {
    id: string
    name: string | null
    email: string
  }
}

interface Cost {
  id: string
  amount: number
  currency: string
  description: string
  category: string
  date: string
  paidBy: {
    id: string
    name: string
  } | null
  createdAt: string
}

interface Task {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  priority: string
  dueDate: string | null
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  assignedTo: {
    id: string
    name: string
    email: string
  } | null
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

export default function TripOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([])
  const [costs, setCosts] = useState<Cost[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tripId, setTripId] = useState<string | null>(null)

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
      const [tripResponse, itemsResponse, costsResponse, tasksResponse, pollsResponse] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/items`),
        fetch(`/api/trips/${tripId}/costs`),
        fetch(`/api/trips/${tripId}/tasks`),
        fetch(`/api/trips/${tripId}/polls`)
      ])

      if (tripResponse.ok) {
        const tripData = await tripResponse.json()
        setTrip(tripData.trip)
      }

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setItineraryItems(itemsData.items)
      }

      if (costsResponse.ok) {
        const costsData = await costsResponse.json()
        setCosts(costsData.costs)
      }

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData.tasks)
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

  const getTotalCost = () => {
    return costs.reduce((total, cost) => total + cost.amount, 0)
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
      currentTab="overview"
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Trip Members */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Trip Members</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {trip.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {member.user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{member.user.name}</p>
                        <p className="text-xs text-gray-500">{member.user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      member.role === 'CREATOR' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cost Summary</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Spent:</span>
                  <span className="text-xl font-bold text-green-600">
                    ${getTotalCost().toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Items:</span>
                    <span className="text-sm font-medium text-gray-900">{itineraryItems.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Expenses:</span>
                    <span className="text-sm font-medium text-gray-900">{costs.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Tasks:</span>
                    <span className="text-sm font-medium text-gray-900">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Completed:</span>
                    <span className="text-sm font-medium text-gray-900">{tasks.filter(t => t.status === 'COMPLETED').length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Active Polls:</span>
                    <span className="text-sm font-medium text-gray-900">{polls.filter(p => p.status === 'ACTIVE').length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Members:</span>
                    <span className="text-sm font-medium text-gray-900">{trip.members.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TripLayout>
  )
} 