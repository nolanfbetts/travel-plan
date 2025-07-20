"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const COST_CATEGORIES = [
  { value: "FLIGHT", label: "Flight" },
  { value: "HOTEL", label: "Hotel" },
  { value: "FOOD", label: "Food" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "ACTIVITY", label: "Activity" },
  { value: "OTHER", label: "Other" },
]

const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CAD", label: "CAD (C$)" },
  { value: "AUD", label: "AUD (A$)" },
]

export default function AddCostPage({ params }: { params: Promise<{ id: string }> }) {
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
    amount: "",
    currency: "USD",
    description: "",
    category: "OTHER",
    date: new Date().toISOString().split('T')[0],
    paidById: session?.user?.id || ""
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
      const response = await fetch(`/api/trips/${tripId}/costs`, {
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
        alert(error.error || "Failed to create cost")
      }
    } catch (error) {
      console.error("Error creating cost:", error)
      alert("An error occurred while creating the cost")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
              <h1 className="text-2xl font-bold text-gray-900">Add Cost</h1>
              <p className="mt-2 text-gray-600">
                Track a new expense for your trip.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount *
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    required
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
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

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Flight tickets to Paris"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {COST_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={trip?.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : undefined}
                    max={trip?.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : undefined}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link href={`/trips/${tripId}`}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.amount || !formData.description.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Creating..." : "Add Cost"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 