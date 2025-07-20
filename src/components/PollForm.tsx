'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface PollFormProps {
  tripId: string
  initialData?: {
    id?: string
    question?: string
    description?: string
    options?: string[]
    expiresAt?: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export default function PollForm({ tripId, initialData, onSuccess, onCancel }: PollFormProps) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    question: initialData?.question || '',
    description: initialData?.description || '',
    options: initialData?.options || ['', ''],
    expiresAt: initialData?.expiresAt || '',
  })

  const isEditing = !!initialData?.id

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] })
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ ...formData, options: newOptions })
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Validate form
    if (!formData.question.trim()) {
      setError('Question is required')
      setIsSubmitting(false)
      return
    }

    const validOptions = formData.options.filter(option => option.trim())
    if (validOptions.length < 2) {
      setError('At least 2 options are required')
      setIsSubmitting(false)
      return
    }

    if (!formData.expiresAt) {
      setError('Expiration date is required')
      setIsSubmitting(false)
      return
    }

    const expirationDate = new Date(formData.expiresAt)
    if (expirationDate <= new Date()) {
      setError('Expiration date must be in the future')
      setIsSubmitting(false)
      return
    }

    try {
      const url = isEditing 
        ? `/api/trips/${tripId}/polls/${initialData.id}`
        : `/api/trips/${tripId}/polls`
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: formData.question.trim(),
          description: formData.description.trim() || null,
          options: validOptions,
          expiresAt: formData.expiresAt,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save poll')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        {isEditing ? 'Edit Poll' : 'Create New Poll'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
            Question *
          </label>
          <input
            type="text"
            id="question"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900"
            placeholder="What would you like to vote on?"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900"
            placeholder="Add more details about this poll..."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options * (at least 2)
          </label>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900"
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Option
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
            Expires At *
          </label>
          <input
            type="datetime-local"
            id="expiresAt"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Poll' : 'Create Poll')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
} 