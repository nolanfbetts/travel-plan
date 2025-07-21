"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Task {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  priority: string
  dueDate: string | null
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  assignedTo: {
    id: string
    name: string
    email: string
  } | null
}

interface TaskCardProps {
  task: Task
  tripId: string
  tripMembers: Array<{
    id: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
  onTaskUpdated: () => void
  onTaskDeleted: () => void
  onEdit: (task: Task) => void
}

export default function TaskCard({ 
  task, 
  tripId,
  tripMembers, 
  onTaskUpdated, 
  onTaskDeleted, 
  onEdit 
}: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'TRANSPORT':
        return '🚗'
      case 'ACCOMMODATION':
        return '🏨'
      case 'FOOD':
        return '🍽️'
      case 'ACTIVITY':
        return '🎯'
      case 'SHOPPING':
        return '🛍️'
      default:
        return '📋'
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          status: newStatus,
        }),
      })

      if (response.ok) {
        onTaskUpdated()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update task status')
      }
    } catch (error) {
      console.error('Error updating task status:', error)
      alert('An error occurred while updating the task status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/tasks/${task.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onTaskDeleted()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('An error occurred while deleting the task')
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'

  return (
    <div className={`border rounded-lg p-4 ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-2xl">{getCategoryIcon(task.category)}</span>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h4>
              {isOverdue && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  Overdue
                </span>
              )}
            </div>
            {task.description && (
              <p className={`text-sm mb-2 ${task.status === 'COMPLETED' ? 'text-gray-400' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit task"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(task.category)}`}>
          {task.category}
        </span>
        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm text-gray-500 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <span>Created by: {task.createdBy.name}</span>
          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
        {task.assignedTo && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span>Assigned to: {task.assignedTo.name}</span>
          </div>
        )}
        {task.dueDate && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
          {task.status !== 'COMPLETED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              Mark Complete
            </Button>
          )}
          {task.status === 'PENDING' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('IN_PROGRESS')}
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              Start Task
            </Button>
          )}
          {task.status === 'IN_PROGRESS' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('PENDING')}
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              Pause Task
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 