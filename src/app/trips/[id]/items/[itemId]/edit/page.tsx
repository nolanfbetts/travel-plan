'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const ITEM_TYPES = [
  { value: 'flight', label: 'Flight', icon: '✈️' },
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'event', label: 'Event/Booking', icon: '🎫' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'activity', label: 'Activity', icon: '🎯' },
  { value: 'other', label: 'Other', icon: '📅' }
]

interface ItineraryItem {
  id: string
  type: string
  title: string
  description: string | null
  startDate: string | null
  endDate: string | null
  location: string | null
  confirmationCode: string | null
  notes: string | null
  createdBy: {
    id: string
    name: string | null
    email: string
  }
}

export default function EditItineraryItemPage({ 
  params 
}: { 
  params: Promise<{ id: string; itemId: string }> 
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tripId, setTripId] = useState<string | null>(null)
  const [itemId, setItemId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [item, setItem] = useState<ItineraryItem | null>(null)
  const [trip, setTrip] = useState<{ startDate: string | null; endDate: string | null } | null>(null)
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    startLocation: '',
    endLocation: '',
    confirmationCode: '',
    notes: ''
  })

  useEffect(() => {
    const loadParams = async () => {
      const { id, itemId: itemIdParam } = await params
      setTripId(id)
      setItemId(itemIdParam)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && tripId && itemId) {
      fetchItem()
      fetchTripData()
    }
  }, [status, tripId, itemId])

  const fetchTripData = async () => {
    if (!tripId) return
    
    try {
      const response = await fetch(`/api/trips/${tripId}`)
      if (response.ok) {
        const tripData = await response.json()
        setTrip(tripData.trip)
      }
    } catch (error) {
      console.error("Error fetching trip data:", error)
    }
  }

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/items/${itemId}`)
      if (response.ok) {
        const data = await response.json()
        setItem(data.item)
        setFormData({
          type: data.item.type,
          title: data.item.title,
          description: data.item.description || '',
          startDate: data.item.startDate ? data.item.startDate.slice(0, 16) : '',
          endDate: data.item.endDate ? data.item.endDate.slice(0, 16) : '',
          location: data.item.location || '',
          startLocation: data.item.startLocation || '',
          endLocation: data.item.endLocation || '',
          confirmationCode: data.item.confirmationCode || '',
          notes: data.item.notes || ''
        })
      } else {
        alert('Item not found')
        router.push(`/trips/${tripId}`)
      }
    } catch (error) {
      console.error('Error fetching item:', error)
      alert('Failed to load item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/trips/${tripId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/trips/${tripId}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update item')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      alert('An error occurred while updating the item')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h1>
          <Link href={tripId ? `/trips/${tripId}` : '/dashboard'}>
            <Button>Back to Trip</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <Link href={tripId ? `/trips/${tripId}` : '/dashboard'} className="text-blue-600 hover:text-blue-500 mb-4 inline-block">
                ← Back to Trip
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Edit Itinerary Item</h1>
              <p className="mt-2 text-gray-600">
                Update the details of your itinerary item.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Item Type *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {ITEM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Flight to Paris"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional details about this item..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={trip?.startDate ? new Date(trip.startDate).toISOString().slice(0, 16) : undefined}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate || (trip?.startDate ? new Date(trip.startDate).toISOString().slice(0, 16) : undefined)}
                    max={trip?.endDate ? new Date(trip.endDate).toISOString().slice(0, 16) : undefined}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Location fields - conditional based on item type */}
              {(formData.type === 'FLIGHT' || formData.type === 'TRANSPORT') ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startLocation" className="block text-sm font-medium text-gray-700">
                      Starting Location *
                    </label>
                    <input
                      type="text"
                      id="startLocation"
                      name="startLocation"
                      required
                      value={formData.startLocation}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., New York, NY"
                    />
                  </div>
                  <div>
                    <label htmlFor="endLocation" className="block text-sm font-medium text-gray-700">
                      Ending Location *
                    </label>
                    <input
                      type="text"
                      id="endLocation"
                      name="endLocation"
                      required
                      value={formData.endLocation}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Paris, France"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Paris, France"
                  />
                </div>
              )}

              <div>
                <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700">
                  Confirmation Code
                </label>
                <input
                  type="text"
                  id="confirmationCode"
                  name="confirmationCode"
                  value={formData.confirmationCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., ABC123"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link href={tripId ? `/trips/${tripId}` : '/dashboard'}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={
                    isSaving || 
                    !formData.title.trim() ||
                    ((formData.type === 'FLIGHT' || formData.type === 'TRANSPORT') && (!formData.startLocation.trim() || !formData.endLocation.trim()))
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? "Updating..." : "Update Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 