"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils"
import ItemForm from "@/components/ItemForm"
import ConfirmationModal from "@/components/ConfirmationModal"
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

export default function TripItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tripId, setTripId] = useState<string | null>(null)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null)
  const [deleteItemModal, setDeleteItemModal] = useState({ isOpen: false, itemId: '' })

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
      const [tripResponse, itemsResponse] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/items`)
      ])

      if (tripResponse.ok) {
        const tripData = await tripResponse.json()
        setTrip(tripData.trip)
      }

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setItineraryItems(itemsData.items)
      }
    } catch (error) {
      console.error("Error fetching trip data:", error)
    } finally {
      setIsLoading(false)
    }
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
    <TripLayout
      tripId={trip.id}
      tripName={trip.name}
      tripDescription={trip.description}
      tripStartDate={trip.startDate}
      tripEndDate={trip.endDate}
      tripCreator={trip.creator.name}
      currentTab="itinerary"
    >
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

      {/* Confirmation Modal */}
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
    </TripLayout>
  )
} 