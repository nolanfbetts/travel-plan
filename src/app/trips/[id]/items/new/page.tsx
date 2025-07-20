"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const ITEM_TYPES = [
  { value: "FLIGHT", label: "Flight", icon: "✈️" },
  { value: "HOTEL", label: "Hotel", icon: "🏨" },
  { value: "EVENT", label: "Event", icon: "🎫" },
  { value: "TRANSPORT", label: "Transport", icon: "🚗" },
  { value: "ACTIVITY", label: "Activity", icon: "🎯" },
]

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'CHF', label: 'Swiss Franc (CHF)' },
  { value: 'CNY', label: 'Chinese Yuan (¥)' }
]

const COST_CATEGORIES = [
  { value: 'flight', label: 'Flight' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'transport', label: 'Transport' },
  { value: 'activity', label: 'Activity' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' }
]

export default function AddItineraryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [tripId, setTripId] = useState<string | null>(null)
  const [trip, setTrip] = useState<{ startDate: string | null; endDate: string | null } | null>(null)

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params
      setTripId(id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
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

    fetchTripData()
  }, [tripId])

  const [formData, setFormData] = useState({
    type: "FLIGHT",
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    startLocation: "",
    endLocation: "",
    confirmationCode: "",
    notes: "",
    // Cost fields
    hasCost: false,
    costAmount: "",
    costCurrency: "USD",
    costCategory: "",
    costDate: ""
  })

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/trips/${tripId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/trips/${tripId}`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create item")
      }
    } catch (error) {
      console.error("Error creating item:", error)
      alert("An error occurred while creating the item")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <Link href={`/trips/${tripId}`} className="text-blue-600 hover:text-blue-500 mb-4 inline-block">
                ← Back to Trip
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Add Itinerary Item</h1>
              <p className="mt-2 text-gray-600">
                Add a new item to your trip itinerary.
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
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any additional notes..."
                />
              </div>

              {/* Cost Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="hasCost"
                    name="hasCost"
                    checked={formData.hasCost}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasCost" className="ml-2 block text-sm font-medium text-gray-700">
                    Add cost for this item
                  </label>
                </div>

                {formData.hasCost && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="costAmount" className="block text-sm font-medium text-gray-700">
                          Amount *
                        </label>
                        <input
                          type="number"
                          id="costAmount"
                          name="costAmount"
                          required={formData.hasCost}
                          step="0.01"
                          min="0"
                          value={formData.costAmount}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label htmlFor="costCurrency" className="block text-sm font-medium text-gray-700">
                          Currency
                        </label>
                        <select
                          id="costCurrency"
                          name="costCurrency"
                          value={formData.costCurrency}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {CURRENCIES.map((currency) => (
                            <option key={currency.value} value={currency.value}>
                              {currency.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="costCategory" className="block text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <select
                          id="costCategory"
                          name="costCategory"
                          value={formData.costCategory}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a category</option>
                          {COST_CATEGORIES.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="costDate" className="block text-sm font-medium text-gray-700">
                          Date
                        </label>
                        <input
                          type="date"
                          id="costDate"
                          name="costDate"
                          value={formData.costDate}
                          onChange={handleInputChange}
                          min={trip?.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : undefined}
                          max={trip?.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : undefined}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link href={`/trips/${tripId}`}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={
                    isLoading || 
                    !formData.title.trim() || 
                    (formData.hasCost && !formData.costAmount) ||
                    ((formData.type === 'FLIGHT' || formData.type === 'TRANSPORT') && (!formData.startLocation.trim() || !formData.endLocation.trim()))
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Creating..." : "Create Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 