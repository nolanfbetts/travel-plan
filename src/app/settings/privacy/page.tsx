"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UserData {
  userData: {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
  }
  dataSummary: {
    trips: number
    costs: number
    tasks: number
    assignedTasks: number
    polls: number
    votes: number
    sentInvites: number
    receivedInvites: number
  }
  trips: Array<{
    id: string
    name: string
    description: string | null
    startDate: string | null
    endDate: string | null
    createdAt: string
    memberCount: number
    costCount: number
    taskCount: number
    pollCount: number
  }>
}

export default function PrivacySettingsPage() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData()
    }
  }, [session])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/data-deletion')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDataDeletion = async () => {
    if (!confirm('Are you absolutely sure? This action cannot be undone and will permanently delete all your data.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch('/api/user/data-deletion', {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        alert('Your account has been successfully deleted. You will be redirected to the home page.')
        window.location.href = '/'
      } else {
        const error = await response.json()
        alert(`Failed to delete account: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('An error occurred while deleting your account.')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You must be signed in to access privacy settings.</p>
          <Link href="/auth/signin">
            <Button className="w-full">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Settings</h1>
          <p className="text-gray-600">
            Manage your privacy and data preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Data Summary</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading your data...</p>
                </div>
              ) : userData ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{userData.dataSummary.trips}</div>
                    <div className="text-sm text-gray-600">Trips</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{userData.dataSummary.costs}</div>
                    <div className="text-sm text-gray-600">Costs</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{userData.dataSummary.tasks}</div>
                    <div className="text-sm text-gray-600">Tasks</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{userData.dataSummary.polls}</div>
                    <div className="text-sm text-gray-600">Polls</div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Failed to load data summary.</p>
              )}
            </div>

            {/* Your Trips */}
            {userData && userData.trips.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Trips</h2>
                <div className="space-y-4">
                  {userData.trips.map((trip) => (
                    <div key={trip.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900">{trip.name}</h3>
                      {trip.description && (
                        <p className="text-gray-600 text-sm mt-1">{trip.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        <span>{trip.memberCount} members</span>
                        <span>{trip.costCount} costs</span>
                        <span>{trip.taskCount} tasks</span>
                        <span>{trip.pollCount} polls</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Deletion */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Your Account</h2>
              <p className="text-gray-600 mb-4">
                This action will permanently delete your account and all associated data. 
                This includes all your trips, costs, tasks, polls, and any other data you've created.
                This action cannot be undone.
              </p>
              
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                >
                  Delete My Account
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium mb-2">⚠️ Final Warning</p>
                    <p className="text-red-700 text-sm">
                      This will permanently delete your account and all data. This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="destructive"
                      onClick={handleDataDeletion}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Rights */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Privacy Rights</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900">Right to Access</h4>
                  <p className="text-gray-600">View all data we have about you</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Rectification</h4>
                  <p className="text-gray-600">Update or correct your information</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Erasure</h4>
                  <p className="text-gray-600">Request deletion of your data</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Portability</h4>
                  <p className="text-gray-600">Download your data</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Documents</h3>
              <div className="space-y-2">
                <Link 
                  href="/privacy-policy.html" 
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms-of-service.html" 
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  Terms of Service
                </Link>
                <Link 
                  href="/cookie-policy.html" 
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
              <p className="text-gray-600 text-sm mb-3">
                Have questions about your privacy or data?
              </p>
              <a 
                href="mailto:privacy@nolanbetts.dev" 
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                privacy@nolanbetts.dev
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 