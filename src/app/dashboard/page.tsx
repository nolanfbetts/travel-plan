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

interface Task {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  priority: string
  dueDate: string | null
  createdAt: string
  trip: {
    id: string
    name: string
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
  status: string
  expiresAt: string
  createdAt: string
  trip: {
    id: string
    name: string
  }
  _count: {
    votes: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData()
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      const [tripsResponse, invitationsResponse] = await Promise.all([
        fetch("/api/trips"),
        fetch("/api/invites")
      ])
      
      if (tripsResponse.ok) {
        const data = await tripsResponse.json()
        setTrips(data.trips)
        
        // Fetch tasks and polls for all trips
        const tasksPromises = data.trips.map((trip: Trip) => 
          fetch(`/api/trips/${trip.id}/tasks`).then(res => res.ok ? res.json() : { tasks: [] })
        )
        const pollsPromises = data.trips.map((trip: Trip) => 
          fetch(`/api/trips/${trip.id}/polls`).then(res => res.ok ? res.json() : { polls: [] })
        )
        
        const [tasksResults, pollsResults] = await Promise.all([
          Promise.all(tasksPromises),
          Promise.all(pollsPromises)
        ])
        
        // Combine all tasks and polls with trip information
        const allTasks = tasksResults.flatMap((result, index) => 
          result.tasks.map((task: Task) => ({
            ...task,
            trip: { id: data.trips[index].id, name: data.trips[index].name }
          }))
        )
        
        const allPolls = pollsResults.flatMap((result, index) => 
          result.polls.map((poll: Poll) => ({
            ...poll,
            trip: { id: data.trips[index].id, name: data.trips[index].name }
          }))
        )
        
        setTasks(allTasks)
        setPolls(allPolls)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const pendingTasks = tasks.filter(task => task.status === 'PENDING')
  const activePolls = polls.filter(poll => poll.status === 'ACTIVE')
  const recentTrips = trips.slice(0, 3) // Show 3 most recent trips

  return (
    <AppLayout currentPage="dashboard" invitationCount={invitations.length}>
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here&apos;s what&apos;s happening with your trips.
          </p>
        </div>
      </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
                  <p className="text-sm text-gray-500">Total Trips</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
                  <p className="text-sm text-gray-500">Pending Tasks</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{activePolls.length}</p>
                  <p className="text-sm text-gray-500">Active Polls</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{invitations.length}</p>
                  <p className="text-sm text-gray-500">Invitations</p>
                </div>
              </div>
            </div>
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Tasks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Pending Tasks</h3>
                <Link href="/trips">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="p-6">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No pending tasks</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-500">{task.trip.name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <Link href={`/trips/${task.trip.id}`}>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Polls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Active Polls</h3>
                <Link href="/trips">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="p-6">
                {activePolls.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No active polls</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activePolls.slice(0, 5).map((poll) => (
                      <div key={poll.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{poll.question}</p>
                          <p className="text-sm text-gray-500">{poll.trip.name} • {poll._count.votes} votes</p>
                        </div>
                        <Link href={`/trips/${poll.trip.id}`}>
                          <Button size="sm" variant="outline">
                            Vote
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Recent Trips</h3>
                <Link href="/trips">
                  <Button variant="outline" size="sm">
                    View All Trips
                  </Button>
                </Link>
              </div>
              <div className="p-6">
                {recentTrips.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4">No trips yet</p>
                    <Link href="/trips/new">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Create Your First Trip
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {recentTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-medium text-gray-900 mb-2">{trip.name}</h4>
                        {trip.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{trip.description}</p>
                        )}
                        <div className="flex items-center text-sm text-gray-500 mb-3">
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
        </AppLayout>
  )
} 