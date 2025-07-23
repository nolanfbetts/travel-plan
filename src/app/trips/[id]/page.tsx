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
import ItemForm from "@/components/ItemForm"
import ConfirmationModal from "@/components/ConfirmationModal"

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
  const [invitations, setInvitations] = useState<Array<{
    id: string;
    receiverEmail: string;
    status: string;
    createdAt: string;
    receiver: {
      id: string;
      name: string;
      email: string;
    } | null;
    sender: {
      id: string;
      name: string;
      email: string;
    };
  }>>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [polls, setPolls] = useState<Poll[]>([])
  const [showPollForm, setShowPollForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null)
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null)
  const [deleteTripModal, setDeleteTripModal] = useState({ isOpen: false })
  const [deleteItemModal, setDeleteItemModal] = useState({ isOpen: false, itemId: '' })
  const [deleteCostModal, setDeleteCostModal] = useState({ isOpen: false, costId: '' })
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' })

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
        fetchTripData()
        setSuccessModal({ isOpen: true, message: 'Invitation sent successfully! Check your email for a notification.' })
      } else {
        const error = await response.json()
        setSuccessModal({ isOpen: true, message: error.error || 'Failed to send invitation' })
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      setSuccessModal({ isOpen: true, message: 'An error occurred while sending the invitation' })
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
        fetchTripData()
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
    setDeleteItemModal({ isOpen: true, itemId })
  }

  const confirmDeleteItem = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/items/${deleteItemModal.itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
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
    setDeleteCostModal({ isOpen: true, costId })
  }

  const confirmDeleteCost = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/costs/${deleteCostModal.costId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
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

  const handleDeleteTrip = async () => {
    setDeleteTripModal({ isOpen: true })
  }

  const confirmDeleteTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Trip deleted successfully')
        router.push('/dashboard')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete trip')
      }
    } catch (error) {
      console.error('Error deleting trip:', error)
      alert('An error occurred while deleting the trip')
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6">
          {/* Back to Dashboard */}
          <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-500 mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          {/* Trip Info */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{trip.name}</h1>
            {trip.description && (
              <p className="text-sm text-gray-600 mb-3">{trip.description}</p>
            )}
            {trip.startDate && trip.endDate && (
              <p className="text-sm text-gray-500 mb-2">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </p>
            )}
            <p className="text-xs text-gray-400">Created by {trip.creator.name}</p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z' },
              { id: 'itinerary', label: 'Itinerary', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3' },
              { id: 'calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { id: 'costs', label: 'Costs', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' },
              { id: 'tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
              { id: 'polls', label: 'Polls', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { id: 'invite', label: 'Invite', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'itinerary' | 'calendar' | 'costs' | 'tasks' | 'polls' | 'invite')}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Delete Trip Button - Only show for trip creator */}
        {trip && trip.creator.id === session?.user?.id && (
          <div className="absolute bottom-6 left-6 right-6">
            <Button 
              variant="outline" 
              onClick={handleDeleteTrip}
              className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Trip
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Tab Content */}
          {activeTab === 'overview' && (
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
          )}

          {activeTab === 'itinerary' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Itinerary Items</h3>
                  <Button 
                    disabled={!tripId} 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowItemForm(true)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Item
                  </Button>
                </div>
                <div className="p-6">
                  {(showItemForm || editingItem) && (
                    <div className="mb-6">
                      <ItemForm
                        tripId={tripId || ''}
                        onItemCreated={() => {
                          setShowItemForm(false)
                          setEditingItem(null)
                          fetchTripData()
                        }}
                        onCancel={() => {
                          setShowItemForm(false)
                          setEditingItem(null)
                        }}
                        initialData={editingItem ? {
                          id: editingItem.id,
                          type: editingItem.type,
                          title: editingItem.title,
                          description: editingItem.description || undefined,
                          startDate: editingItem.startDate || undefined,
                          endDate: editingItem.endDate || undefined,
                          location: editingItem.location || undefined,
                          startLocation: editingItem.startLocation || undefined,
                          endLocation: editingItem.endLocation || undefined,
                          confirmationCode: editingItem.confirmationCode || undefined,
                          notes: editingItem.notes || undefined
                        } : undefined}
                        isEditing={!!editingItem}
                      />
                    </div>
                  )}
                  
                  {itineraryItems.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No itinerary items yet</h3>
                      <p className="text-gray-500 mb-4">Start building your trip itinerary by adding your first item.</p>
                      <Button 
                        disabled={!tripId} 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setShowItemForm(true)}
                      >
                        Add First Item
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {itineraryItems.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-lg">{getCategoryIcon(item.type)}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getCategoryColor(item.type)}`}>
                                    {item.type}
                                  </span>
                                </div>
                                {item.description && (
                                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                  {item.startDate && (
                                    <span className="flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {formatDateTime(item.startDate)}
                                    </span>
                                  )}
                                  {(item.type === 'FLIGHT' || item.type === 'TRANSPORT') ? (
                                    item.startLocation && item.endLocation ? (
                                      <span className="flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {item.startLocation} → {item.endLocation}
                                      </span>
                                    ) : null
                                  ) : (
                                    item.location && (
                                      <span className="flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {item.location}
                                      </span>
                                    )
                                  )}
                                  {item.confirmationCode && (
                                    <span className="flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                      </svg>
                                      {item.confirmationCode}
                                    </span>
                                  )}
                                  <span className="flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {item.createdBy.name || item.createdBy.email}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 ml-3">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 w-7 p-0"
                                onClick={() => setEditingItem(item)}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 w-7 p-0 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Costs & Expenses</h3>
                <Link href={tripId ? `/trips/${tripId}/costs/new` : '#'}>
                  <Button disabled={!tripId} className="bg-blue-600 hover:bg-blue-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Add Cost
                  </Button>
                </Link>
              </div>
              <div className="p-6">
                {costs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No costs tracked yet</h3>
                    <p className="text-gray-500 mb-6">Start tracking your trip expenses by adding your first cost.</p>
                    <Link href={tripId ? `/trips/${tripId}/costs/new` : '#'}>
                      <Button disabled={!tripId} className="bg-blue-600 hover:bg-blue-700">
                        Add First Cost
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {costs.map((cost) => (
                      <div key={cost.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                                <Button size="sm" variant="outline" className="h-8 px-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Button>
                              </Link>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
                                onClick={() => handleDeleteCost(cost.id)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Tasks & To-Do List</h3>
                <Button
                  onClick={() => {
                    setEditingTask(null)
                    setShowTaskForm(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
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
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                    <p className="text-gray-500 mb-6">Start organizing your trip by adding your first task.</p>
                    <Button
                      onClick={() => {
                        setEditingTask(null)
                        setShowTaskForm(true)
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
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
          )}

          {activeTab === 'invite' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendInvite()}
                    />
                    <Button 
                      onClick={handleSendInvite}
                      disabled={!inviteEmail.trim() || isInviting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isInviting ? 'Sending...' : 'Send Invite'}
                    </Button>
                  </div>
                </div>

                {/* All Invitations */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">All Invitations</h4>
                  {invitations.length === 0 ? (
                    <p className="text-gray-500">No invitations sent.</p>
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
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 px-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
                                  onClick={() => handleDeleteInvite(invite.id)}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {invite.status === 'ACCEPTED' && (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Accepted
                              </span>
                            )}
                            {invite.status === 'DECLINED' && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
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

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={deleteTripModal.isOpen}
        onClose={() => setDeleteTripModal({ isOpen: false })}
        onConfirm={confirmDeleteTrip}
        title="Delete Trip"
        message="Are you sure you want to delete this trip? This action cannot be undone and will delete all trip data including items, costs, tasks, and polls."
        confirmText="Delete Trip"
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      <ConfirmationModal
        isOpen={deleteItemModal.isOpen}
        onClose={() => setDeleteItemModal({ isOpen: false, itemId: '' })}
        onConfirm={confirmDeleteItem}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete Item"
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      <ConfirmationModal
        isOpen={deleteCostModal.isOpen}
        onClose={() => setDeleteCostModal({ isOpen: false, costId: '' })}
        onConfirm={confirmDeleteCost}
        title="Delete Cost"
        message="Are you sure you want to delete this cost? This action cannot be undone."
        confirmText="Delete Cost"
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      <ConfirmationModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        onConfirm={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Success"
        message={successModal.message}
        confirmText="OK"
        cancelText=""
        confirmVariant="default"
      />


    </div>
  )
} 