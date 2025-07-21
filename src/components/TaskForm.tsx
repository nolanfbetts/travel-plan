"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TaskFormProps {
  tripId: string
  tripMembers: Array<{
    id: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
  onTaskCreated: () => void
  onCancel: () => void
  initialData?: {
    id?: string
    title?: string
    description?: string
    category?: string
    priority?: string
    dueDate?: string
    assignedToId?: string
  }
  isEditing?: boolean
}

export default function TaskForm({ 
  tripId, 
  tripMembers, 
  onTaskCreated, 
  onCancel, 
  initialData,
  isEditing = false 
}: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'GENERAL',
    priority: initialData?.priority || 'MEDIUM',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
    assignedToId: initialData?.assignedToId || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    { value: 'GENERAL', label: 'General' },
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'ACCOMMODATION', label: 'Accommodation' },
    { value: 'FOOD', label: 'Food' },
    { value: 'ACTIVITY', label: 'Activity' },
    { value: 'SHOPPING', label: 'Shopping' },
    { value: 'OTHER', label: 'Other' }
  ]

  const priorities = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    try {
      const url = isEditing 
        ? `/api/trips/${tripId}/tasks/${initialData?.id}`
        : `/api/trips/${tripId}/tasks`
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          assignedToId: formData.assignedToId || null,
          dueDate: formData.dueDate || null,
        }),
      })

      if (response.ok) {
        onTaskCreated()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save task')
      }
    } catch (error) {
      console.error('Error saving task:', error)
      alert('An error occurred while saving the task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'TRANSPORT':
        return 'bg-blue-100 text-blue-800'
      case 'ACCOMMODATION':
        return 'bg-purple-100 text-purple-800'
      case 'FOOD':
        return 'bg-green-100 text-green-800'
      case 'ACTIVITY':
        return 'bg-pink-100 text-pink-800'
      case 'SHOPPING':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900"
            placeholder="Enter task title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900"
            placeholder="Enter task description (optional)"
            rows={3}
          />
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date and Assignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date (Optional)
            </label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
              Assign To (Optional)
            </label>
            <select
              id="assignedTo"
              value={formData.assignedToId}
              onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Unassigned</option>
              {tripMembers.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{formData.title || 'Task Title'}</span>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(formData.category)}`}>
                  {categories.find(c => c.value === formData.category)?.label}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(formData.priority)}`}>
                  {priorities.find(p => p.value === formData.priority)?.label}
                </span>
              </div>
            </div>
            {formData.description && (
              <p className="text-sm text-gray-600">{formData.description}</p>
            )}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {formData.dueDate && (
                <span>Due: {new Date(formData.dueDate).toLocaleDateString()}</span>
              )}
              {formData.assignedToId && (
                <span>Assigned to: {tripMembers.find(m => m.user.id === formData.assignedToId)?.user.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.title.trim()}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task')}
          </Button>
        </div>
      </form>
    </div>
  )
} 