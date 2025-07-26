"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import TaskForm from "@/components/TaskForm"
import TaskCard from "@/components/TaskCard"
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

export default function TripTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tripId, setTripId] = useState<string | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

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
      const [tripResponse, tasksResponse] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/tasks`)
      ])

      if (tripResponse.ok) {
        const tripData = await tripResponse.json()
        setTrip(tripData.trip)
      }

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData.tasks)
      }
    } catch (error) {
      console.error("Error fetching trip data:", error)
    } finally {
      setIsLoading(false)
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
      currentTab="tasks"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Tasks & To-Do List</h3>
          <Button
            onClick={() => {
              setEditingTask(null)
              setShowTaskForm(true)
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Task
          </Button>
        </div>
        <div className="p-6">
          {showTaskForm && (
            <div className="mb-6">
              <TaskForm
                tripId={tripId || ''}
                tripMembers={trip?.members || []}
                onTaskCreated={() => {
                  setShowTaskForm(false)
                  fetchTripData()
                }}
                onCancel={() => setShowTaskForm(false)}
                initialData={editingTask ? {
                  id: editingTask.id,
                  title: editingTask.title,
                  description: editingTask.description || undefined,
                  category: editingTask.category,
                  priority: editingTask.priority,
                  dueDate: editingTask.dueDate || undefined,
                  assignedToId: editingTask.assignedTo?.id || undefined
                } : undefined}
                isEditing={!!editingTask}
              />
            </div>
          )}
          
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-500 mb-6">Start organizing your trip by adding your first task.</p>
              <Button
                onClick={() => {
                  setEditingTask(null)
                  setShowTaskForm(true)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add First Task
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  tripId={tripId || ''}
                  tripMembers={trip?.members || []}
                  onTaskUpdated={fetchTripData}
                  onTaskDeleted={fetchTripData}
                  onEdit={(task) => {
                    setEditingTask(task)
                    setShowTaskForm(true)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </TripLayout>
  )
} 