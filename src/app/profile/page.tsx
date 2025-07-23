"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ConfirmationModal from "@/components/ConfirmationModal"
import AppLayout from "@/components/AppLayout"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user/data-deletion", {
        method: "POST",
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Account deleted successfully. ${result.message}`)
        signOut({ callbackUrl: "/" })
      } else {
        const error = await response.json()
        alert(`Failed to delete account: ${error.error}`)
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("An error occurred while deleting your account.")
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <>
      <AppLayout currentPage="profile">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile
          </h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl text-blue-600 font-semibold">
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {session?.user?.name || "User"}
                  </h3>
                  <p className="text-gray-600">{session?.user?.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{session?.user?.name || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{session?.user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session?.user?.email?.includes("@gmail.com") ? "Google Account" : "Email Account"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Sign In Method</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session?.user?.image ? "OAuth (Google)" : "Email/Password"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Sign Out</h3>
                  <p className="text-sm text-gray-600">Sign out of your current session</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                >
                  Sign Out
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                <div>
                  <h3 className="text-base font-medium text-red-900">Delete Account</h3>
                  <p className="text-sm text-red-600">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </AppLayout>

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone and will delete all your trips, tasks, costs, and other data."
        confirmText="Delete Account"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </>
  )
} 