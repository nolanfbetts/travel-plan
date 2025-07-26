"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface MobileNavProps {
  currentPage?: string
  invitationCount?: number
}

export default function MobileNav({ currentPage = "dashboard", invitationCount = 0 }: MobileNavProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      page: "dashboard"
    },
    {
      name: "Trips",
      href: "/trips",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
        </svg>
      ),
      page: "trips"
    },
    {
      name: "Invitations",
      href: "/invitations",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
        </svg>
      ),
      page: "invitations"
    },
    {
      name: "Profile",
      href: "/profile",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      page: "profile"
    }
  ]

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-lg font-bold text-gray-900">TravelPlan</span>
          </Link>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed top-0 left-0 z-50 h-full w-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TravelPlan</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-medium text-sm">
                  {session?.user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{session?.user?.name || "User"}</p>
                <p className="text-gray-500 text-xs">Traveler</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu - Scrollable */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                    currentPage === item.page
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3 font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                signOut({ callbackUrl: '/auth/signin' })
              }}
              className="w-full flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer for mobile content */}
      <div className="md:hidden h-16" /> {/* Top spacer */}
    </>
  )
} 