"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ItemFormProps {
  tripId: string
  onItemCreated: () => void
  onCancel: () => void
  initialData?: {
    id?: string
    type?: string
    title?: string
    description?: string
    startDate?: string
    endDate?: string
    location?: string
    startLocation?: string
    endLocation?: string
    confirmationCode?: string
    notes?: string
  }
  isEditing?: boolean
}

export default function ItemForm({ 
  tripId, 
  onItemCreated, 
  onCancel, 
  initialData,
  isEditing = false 
}: ItemFormProps) {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'ACTIVITY',
    title: initialData?.title || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
    location: initialData?.location || '',
    startLocation: initialData?.startLocation || '',
    endLocation: initialData?.endLocation || '',
    confirmationCode: initialData?.confirmationCode || '',
    notes: initialData?.notes || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const types = [
    { value: 'ACTIVITY', label: 'Activity' },
    { value: 'FLIGHT', label: 'Flight' },
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'ACCOMMODATION', label: 'Accommodation' },
    { value: 'FOOD', label: 'Food' },
    { value: 'SHOPPING', label: 'Shopping' },
    { value: 'OTHER', label: 'Other' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    try {
      const url = isEditing 
        ? `/api/trips/${tripId}/items/${initialData?.id}`
        : `/api/trips/${tripId}/items`
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          location: formData.location || null,
          startLocation: formData.startLocation || null,
          endLocation: formData.endLocation || null,
          confirmationCode: formData.confirmationCode || null,
          notes: formData.notes || null,
        }),
      })

      if (response.ok) {
        onItemCreated()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save item')
      }
    } catch (error) {
      console.error('Error saving item:', error)
      alert('An error occurred while saving the item')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Edit Itinerary Item' : 'Add Itinerary Item'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter item title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter description"
            rows={3}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Location Fields */}
        {(formData.type === 'FLIGHT' || formData.type === 'TRANSPORT') ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Location
              </label>
              <input
                type="text"
                value={formData.startLocation}
                onChange={(e) => handleInputChange('startLocation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., New York, NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Location
              </label>
              <input
                type="text"
                value={formData.endLocation}
                onChange={(e) => handleInputChange('endLocation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Los Angeles, CA"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter location"
            />
          </div>
        )}

        {/* Confirmation Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmation Code
          </label>
          <input
            type="text"
            value={formData.confirmationCode}
            onChange={(e) => handleInputChange('confirmationCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter confirmation code"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter additional notes"
            rows={3}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Item' : 'Add Item')}
          </Button>
        </div>
      </form>
    </div>
  )
} 