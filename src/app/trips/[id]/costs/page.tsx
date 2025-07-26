"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import CostForm from "@/components/CostForm"
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

export default function TripCostsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [costs, setCosts] = useState<Cost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tripId, setTripId] = useState<string | null>(null)
  const [showCostForm, setShowCostForm] = useState(false)
  const [editingCost, setEditingCost] = useState<Cost | null>(null)
  const [deleteCostModal, setDeleteCostModal] = useState({ isOpen: false, costId: '' })

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
      const [tripResponse, costsResponse] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/costs`)
      ])

      if (tripResponse.ok) {
        const tripData = await tripResponse.json()
        setTrip(tripData.trip)
      }

      if (costsResponse.ok) {
        const costsData = await costsResponse.json()
        setCosts(costsData.costs)
      }
    } catch (error) {
      console.error("Error fetching trip data:", error)
    } finally {
      setIsLoading(false)
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

  const handleCostCreated = () => {
    setShowCostForm(false)
    setEditingCost(null)
    fetchTripData()
  }

  const handleCostCancel = () => {
    setShowCostForm(false)
    setEditingCost(null)
  }

  const handleEditCost = (cost: Cost) => {
    setEditingCost(cost)
    setShowCostForm(true)
  }

  const handleAddCost = () => {
    setEditingCost(null)
    setShowCostForm(true)
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
      currentTab="costs"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Costs & Expenses</h3>
          <Button 
            onClick={handleAddCost}
            disabled={!tripId} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Add Cost
          </Button>
        </div>
        <div className="p-6">
          {showCostForm && (
            <div className="mb-6">
              <CostForm
                tripId={tripId || ''}
                tripStartDate={trip?.startDate}
                tripEndDate={trip?.endDate}
                onCostCreated={handleCostCreated}
                onCancel={handleCostCancel}
                initialData={editingCost ? {
                  id: editingCost.id,
                  amount: editingCost.amount,
                  currency: editingCost.currency,
                  description: editingCost.description,
                  category: editingCost.category,
                  date: editingCost.date
                } : undefined}
                isEditing={!!editingCost}
              />
            </div>
          )}
          
          {costs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No costs tracked yet</h3>
              <p className="text-gray-500 mb-6">Start tracking your trip expenses by adding your first cost.</p>
              <Button 
                onClick={handleAddCost}
                disabled={!tripId} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add First Cost
              </Button>
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
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 px-2"
                          onClick={() => handleEditCost(cost)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
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

      {/* Confirmation Modal */}
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
    </TripLayout>
  )
} 