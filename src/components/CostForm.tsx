"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

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

interface CostFormProps {
  tripId: string
  tripStartDate?: string | null
  tripEndDate?: string | null
  onCostCreated: () => void
  onCancel: () => void
  initialData?: {
    id?: string
    amount?: number
    currency?: string
    description?: string
    category?: string
    date?: string
  }
  isEditing?: boolean
}

export default function CostForm({ 
  tripId, 
  tripStartDate, 
  tripEndDate, 
  onCostCreated, 
  onCancel, 
  initialData,
  isEditing = false 
}: CostFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: initialData?.amount?.toString() || "",
    currency: initialData?.currency || "USD",
    description: initialData?.description || "",
    category: initialData?.category || "OTHER",
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.description.trim()) return

    setIsLoading(true)
    try {
      const url = isEditing 
        ? `/api/trips/${tripId}/costs/${initialData?.id}`
        : `/api/trips/${tripId}/costs`
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      })

      if (response.ok) {
        onCostCreated()
      } else {
        const error = await response.json()
        alert(error.error || `Failed to ${isEditing ? 'update' : 'create'} cost`)
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} cost:`, error)
      alert(`An error occurred while ${isEditing ? 'updating' : 'creating'} the cost`)
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
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {isEditing ? 'Edit Cost' : 'Add Cost'}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {isEditing ? 'Update the details of your cost entry.' : 'Track a new expense for your trip.'}
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
                min={tripStartDate ? new Date(tripStartDate).toISOString().split('T')[0] : undefined}
                max={tripEndDate ? new Date(tripEndDate).toISOString().split('T')[0] : undefined}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.amount || !formData.description.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Cost" : "Add Cost")}
            </Button>
          </div>
        </form>
      </div>
    )
  } 