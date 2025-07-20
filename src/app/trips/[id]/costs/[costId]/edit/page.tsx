'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
}

export default function EditCostPage({ 
  params 
}: { 
  params: Promise<{ id: string; costId: string }> 
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tripId, setTripId] = useState<string | null>(null)
  const [costId, setCostId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [cost, setCost] = useState<Cost | null>(null)
  const [trip, setTrip] = useState<{ startDate: string | null; endDate: string | null } | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    category: '',
    date: ''
  })

  useEffect(() => {
    const loadParams = async () => {
      const { id, costId: costIdParam } = await params
      setTripId(id)
      setCostId(costIdParam)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && tripId && costId) {
      fetchCost()
      fetchTripData()
    }
  }, [status, tripId, costId])

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

  const fetchCost = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/costs/${costId}`)
      if (response.ok) {
        const data = await response.json()
        setCost(data.cost)
        setFormData({
          amount: data.cost.amount.toString(),
          currency: data.cost.currency,
          description: data.cost.description,
          category: data.cost.category,
          date: data.cost.date
        })
      } else {
        alert('Cost not found')
        router.push(`/trips/${tripId}`)
      }
    } catch (error) {
      console.error('Error fetching cost:', error)
      alert('Failed to load cost')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/trips/${tripId}/costs/${costId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      })

      if (response.ok) {
        router.push(`/trips/${tripId}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update cost')
      }
    } catch (error) {
      console.error('Error updating cost:', error)
      alert('An error occurred while updating the cost')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  if (!cost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cost not found</h1>
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
              <h1 className="text-2xl font-bold text-gray-900">Edit Cost</h1>
              <p className="mt-2 text-gray-600">
                Update the details of your cost entry.
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
                <Link href={tripId ? `/trips/${tripId}` : '/dashboard'}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSaving || !formData.description.trim() || !formData.amount}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? "Updating..." : "Update Cost"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 