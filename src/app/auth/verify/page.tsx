"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")
    
    if (!token) {
      setStatus("error")
      setMessage("Missing verification token")
      return
    }

    // Call the verification API
    fetch(`/api/auth/verify?token=${token}`)
      .then(response => {
        if (response.ok) {
          setStatus("success")
          setMessage("Email verified successfully!")
          // Redirect to signin after 3 seconds
          setTimeout(() => {
            router.push("/auth/signin?verified=true")
          }, 3000)
        } else {
          return response.json()
        }
      })
      .then(data => {
        if (data?.error) {
          setStatus("error")
          setMessage(data.error)
        }
      })
      .catch(error => {
        console.error("Verification error:", error)
        setStatus("error")
        setMessage("An error occurred during verification")
      })
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>
        
        <div className="mt-8 space-y-6">
          {status === "loading" && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verifying your email address...</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-4 text-green-600">{message}</p>
              <p className="mt-2 text-sm text-gray-600">Redirecting to sign in...</p>
            </div>
          )}
          
          {status === "error" && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="mt-4 text-red-600">{message}</p>
              <div className="mt-4">
                <Link 
                  href="/auth/signin" 
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Return to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 