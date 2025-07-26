"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import TripLayout from "@/components/TripLayout"
import { Button } from "@/components/ui/button"

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

export default function TripSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: ""
  })

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      await fetchTripData(resolvedParams.id)
    }
    loadData()
  }, [params])

  const fetchTripData = async (tripId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}`)
      if (response.ok) {
        const data = await response.json()
        setTrip(data.trip)
        setFormData({
          name: data.trip.name,
          description: data.trip.description || "",
          startDate: data.trip.startDate ? data.trip.startDate.split('T')[0] : "",
          endDate: data.trip.endDate ? data.trip.endDate.split('T')[0] : ""
        })
      }
    } catch (error) {
      console.error("Error fetching trip data:", error)
      setError("Failed to load trip data")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const resolvedParams = await params
      const response = await fetch(`/api/trips/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTrip(data.trip)
        setIsEditing(false)
        setSuccess("Trip updated successfully!")
      } else {
        setError(data.error || "Failed to update trip")
      }
    } catch (error) {
      console.error("Error updating trip:", error)
      setError("Failed to update trip")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTrip = async () => {
    if (!confirm("Are you sure you want to delete this trip? This action cannot be undone and will permanently delete all trip data including itinerary items, costs, tasks, polls, and member information.")) {
      return
    }

    setIsDeleting(true)
    setError("")

    try {
      const resolvedParams = await params
      const response = await fetch(`/api/trips/${resolvedParams.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete trip")
      }
    } catch (error) {
      console.error("Error deleting trip:", error)
      setError("Failed to delete trip")
    } finally {
      setIsDeleting(false)
    }
  }

  const isCreator = trip?.creator.id === session?.user?.id

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

  if (!isCreator) {
    return (
      <TripLayout
        tripId={trip.id}
        tripName={trip.name}
        tripDescription={trip.description}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
        tripCreator={trip.creator.name || trip.creator.email}
        currentTab="settings"
      >
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">Access Restricted</h2>
              <p className="text-yellow-700">Only the trip creator can access trip settings.</p>
            </div>
          </div>
        </div>
      </TripLayout>
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
      currentTab="settings"
    >
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Settings</h1>
            <p className="text-gray-600">Manage your trip details and preferences.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
              {success}
            </div>
          )}

          {/* Trip Details Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Trip Details</h2>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Trip Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your trip..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        name: trip.name,
                        description: trip.description || "",
                        startDate: trip.startDate ? trip.startDate.split('T')[0] : "",
                        endDate: trip.endDate ? trip.endDate.split('T')[0] : ""
                      })
                    }}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Trip Name</h3>
                  <p className="text-gray-900">{trip.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-gray-900">{trip.description || "No description provided"}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                    <p className="text-gray-900">{trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "Not set"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                    <p className="text-gray-900">{trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "Not set"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
                <p className="text-sm text-red-700">Irreversible and destructive actions</p>
              </div>
            </div>

            <div className="border-t border-red-200 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Delete Trip</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Permanently delete this trip and all associated data including itinerary items, costs, tasks, polls, and member information.
                  </p>
                </div>
                <Button
                  onClick={handleDeleteTrip}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Trip"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TripLayout>
  )
} 