"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate, formatDateTime } from "@/lib/utils"
import Calendar from "@/components/Calendar"
import TaskForm from "@/components/TaskForm"
import TaskCard from "@/components/TaskCard"
import PollForm from "@/components/PollForm"
import PollCard from "@/components/PollCard"

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

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([])
  const [costs, setCosts] = useState<Cost[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'calendar' | 'costs' | 'tasks' | 'polls' | 'invite'>('overview')
  const [tripId, setTripId] = useState<string | null>(null)
  const [invitations, setInvitations] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [polls, setPolls] = useState<Poll[]>([])
  const [showPollForm, setShowPollForm] = useState(false)
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null)

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params
      setTripId(id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && tripId) {
      fetchTripData()
    }
  }, [status, tripId])

  const fetchTripData = async () => {
    if (!tripId) return
    
    try {
      const [tripResponse, itemsResponse, costsResponse, tasksResponse, pollsResponse, invitesResponse] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/items`),
        fetch(`/api/trips/${tripId}/costs`),
        fetch(`/api/trips/${tripId}/tasks`),
        fetch(`/api/trips/${tripId}/polls`),
        fetch(`/api/trips/${tripId}/invite`)
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

      if (invitesResponse.ok) {
        const invitesData = await invitesResponse.json()
        setInvitations(invitesData)
      }
    } catch (error) {
      console.error("Error fetching trip data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !tripId) return

    setIsInviting(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })

      if (response.ok) {
        setInviteEmail('')
        fetchTripData() // Refresh invitations
        alert('Invitation sent successfully! Check your email for a notification.')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('An error occurred while sending the invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to delete this invitation?')) {
      return
    }

    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTripData() // Refresh invitations
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete invitation')
      }
    } catch (error) {
      console.error('Error deleting invitation:', error)
      alert('An error occurred while deleting the invitation')
    }
  }

  const getTotalCost = () => {
    return costs.reduce((total, cost) => total + cost.amount, 0)
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh the data
        fetchTripData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('An error occurred while deleting the item')
    }
  }

  const handleDeleteCost = async (costId: string) => {
    if (!confirm('Are you sure you want to delete this cost?')) {
      return
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/costs/${costId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh the data
        fetchTripData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete cost')
      }
    } catch (error) {
      console.error('Error deleting cost:', error)
      alert('An error occurred while deleting the cost')
    }
  }

  const getCategoryIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flight':
        return '✈️'
      case 'hotel':
        return '🏨'
      case 'event':
        return '🎫'
      case 'transport':
        return '🚗'
      case 'activity':
        return '🎯'
      default:
        return '📅'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'flight':
        return 'bg-blue-100 text-blue-800'
      case 'hotel':
        return 'bg-purple-100 text-purple-800'
      case 'food':
        return 'bg-green-100 text-green-800'
      case 'transport':
        return 'bg-yellow-100 text-yellow-800'
      case 'activity':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-500 mb-4 inline-block">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
                {trip.description && (
                  <p className="mt-2 text-gray-600">{trip.description}</p>
                )}
                <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                  {trip.startDate && trip.endDate && (
                    <span>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                  )}
                  <span>Created by {trip.creator.name}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link href={tripId ? `/trips/${tripId}/items/new` : '#'}>
                  <Button disabled={!tripId}>
                    Add Item
                  </Button>
                </Link>
                <Link href={tripId ? `/trips/${tripId}/costs/new` : '#'}>
                  <Button variant="outline" disabled={!tripId}>
                    Add Cost
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('tasks')}
                  disabled={!tripId}
                >
                  Add Task
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('polls')}
                  disabled={!tripId}
                >
                  Create Poll
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('invite')}
                  disabled={!tripId}
                >
                  Invite People
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'itinerary', label: 'Itinerary' },
                { id: 'calendar', label: 'Calendar' },
                { id: 'costs', label: 'Costs' },
                { id: 'tasks', label: 'Tasks' },
                { id: 'polls', label: 'Polls' },
                { id: 'invite', label: 'Invite' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Trip Members */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Trip Members</h3>
                <div className="space-y-3">
                  {trip.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{member.user.name}</p>
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        member.role === 'CREATOR' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Summary */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${getTotalCost().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium text-gray-900">{itineraryItems.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expenses:</span>
                    <span className="font-medium text-gray-900">{costs.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tasks:</span>
                    <span className="font-medium text-gray-900">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed Tasks:</span>
                    <span className="font-medium text-gray-900">{tasks.filter(t => t.status === 'COMPLETED').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Polls:</span>
                    <span className="font-medium text-gray-900">{polls.filter(p => p.status === 'ACTIVE').length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'itinerary' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Itinerary Items</h3>
              </div>
              <div className="p-6">
                {itineraryItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No itinerary items yet.</p>
                    <Link href={tripId ? `/trips/${tripId}/items/new` : '#'}>
                      <Button disabled={!tripId}>
                        Add First Item
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {itineraryItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{getCategoryIcon(item.type)}</span>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                {item.startDate && (
                                  <span>{formatDateTime(item.startDate)}</span>
                                )}
                                {(item.type === 'FLIGHT' || item.type === 'TRANSPORT') ? (
                                  item.startLocation && item.endLocation ? (
                                    <span>📍 {item.startLocation} → {item.endLocation}</span>
                                  ) : null
                                ) : (
                                  item.location && (
                                    <span>📍 {item.location}</span>
                                  )
                                )}
                                {item.confirmationCode && (
                                  <span>🔑 {item.confirmationCode}</span>
                                )}
                                <span>Added by {item.createdBy.name || item.createdBy.email}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.type)}`}>
                              {item.type}
                            </span>
                            <div className="flex space-x-1">
                              <Link href={`/trips/${tripId}/items/${item.id}/edit`}>
                                <Button size="sm" variant="outline" className="h-8 px-2 bg-gray-100 hover:bg-gray-200 border-gray-300">
                                  ✏️
                                </Button>
                              </Link>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2 bg-red-100 hover:bg-red-200 text-red-700 border-red-300 hover:border-red-400"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <Calendar 
              items={itineraryItems}
              tripId={tripId || ''}
              tripStartDate={trip?.startDate}
              tripEndDate={trip?.endDate}
            />
          )}

          {activeTab === 'costs' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Costs & Expenses</h3>
              </div>
              <div className="p-6">
                {costs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No costs tracked yet.</p>
                    <Link href={tripId ? `/trips/${tripId}/costs/new` : '#'}>
                      <Button disabled={!tripId}>
                        Add First Cost
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {costs.map((cost) => (
                      <div key={cost.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{cost.description}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>{formatDate(cost.date)}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(cost.category)}`}>
                                {cost.category}
                              </span>
                              {cost.paidBy && (
                                <span>Paid by {cost.paidBy.name}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <span className="text-lg font-bold text-green-600">
                                ${cost.amount.toFixed(2)} {cost.currency}
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              <Link href={`/trips/${tripId}/costs/${cost.id}/edit`}>
                                <Button size="sm" variant="outline" className="h-8 px-2 bg-gray-100 hover:bg-gray-200 border-gray-300">
                                  ✏️
                                </Button>
                              </Link>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2 bg-red-100 hover:bg-red-200 text-red-700 border-red-300 hover:border-red-400"
                                onClick={() => handleDeleteCost(cost.id)}
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Tasks & To-Do List</h3>
                <Button
                  onClick={() => {
                    setEditingTask(null)
                    setShowTaskForm(true)
                  }}
                >
                  Add Task
                </Button>
              </div>
              <div className="p-6">
                {showTaskForm && (
                  <div className="mb-6">
                    <TaskForm
                      tripId={tripId || ''}
                      tripMembers={trip?.members || []}
                      onTaskCreated={() => {
                        setShowTaskForm(false)
                        fetchTripData()
                      }}
                      onCancel={() => setShowTaskForm(false)}
                      initialData={editingTask ? {
                        id: editingTask.id,
                        title: editingTask.title,
                        description: editingTask.description || undefined,
                        category: editingTask.category,
                        priority: editingTask.priority,
                        dueDate: editingTask.dueDate || undefined,
                        assignedToId: editingTask.assignedTo?.id || undefined
                      } : undefined}
                      isEditing={!!editingTask}
                    />
                  </div>
                )}
                
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No tasks yet.</p>
                    <Button
                      onClick={() => {
                        setEditingTask(null)
                        setShowTaskForm(true)
                      }}
                    >
                      Add First Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        tripId={tripId || ''}
                        tripMembers={trip?.members || []}
                        onTaskUpdated={fetchTripData}
                        onTaskDeleted={fetchTripData}
                        onEdit={(task) => {
                          setEditingTask(task)
                          setShowTaskForm(true)
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'polls' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Voting & Polls</h3>
                <Button
                  onClick={() => {
                    setEditingPoll(null)
                    setShowPollForm(true)
                  }}
                >
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
                    <p className="text-gray-500 mb-4">No polls yet.</p>
                    <Button
                      onClick={() => {
                        setEditingPoll(null)
                        setShowPollForm(true)
                      }}
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
          )}

          {activeTab === 'invite' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Invite People to Trip</h3>
              </div>
              <div className="p-6">
                {/* Send Invitation Form */}
                <div className="mb-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Send New Invitation</h4>
                  <div className="flex space-x-3">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 font-medium text-gray-800"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendInvite()}
                    />
                    <Button 
                      onClick={handleSendInvite}
                      disabled={!inviteEmail.trim() || isInviting}
                    >
                      {isInviting ? 'Sending...' : 'Send Invite'}
                    </Button>
                  </div>
                </div>

                {/* All Invitations */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">All Invitations</h4>
                  {invitations.length === 0 ? (
                    <p className="text-gray-700 font-medium">No invitations sent.</p>
                  ) : (
                    <div className="space-y-3">
                      {invitations.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              {invite.receiver ? invite.receiver.name : 'Pending Registration'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {invite.receiver ? invite.receiver.email : invite.receiverEmail}
                            </p>
                            <p className="text-xs text-gray-400">Invited by {invite.sender.name}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {invite.status === 'PENDING' && (
                              <>
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-200 text-yellow-950 font-semibold">
                                  Pending
                                </span>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 px-2 bg-red-100 hover:bg-red-200 text-red-700 border-red-300 hover:border-red-400"
                                  onClick={() => handleDeleteInvite(invite.id)}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {invite.status === 'ACCEPTED' && (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-200 text-green-950 font-semibold">
                                Accepted
                              </span>
                            )}
                            {invite.status === 'DECLINED' && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-200 text-red-950 font-semibold">
                                Declined
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 