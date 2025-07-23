"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import MobileNav from "./MobileNav"
import DesktopNav from "./DesktopNav"

interface AppLayoutProps {
  children: React.ReactNode
  currentPage?: string
  invitationCount?: number
}

export default function AppLayout({ children, currentPage = "dashboard", invitationCount = 0 }: AppLayoutProps) {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Navigation */}
      <DesktopNav currentPage={currentPage} invitationCount={invitationCount} />
      
      {/* Mobile Navigation */}
      <MobileNav currentPage={currentPage} invitationCount={invitationCount} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 pt-20 md:pt-8">
          {/* Desktop Header with Logout */}
          <div className="hidden md:flex justify-end mb-8">
            <Button 
              variant="outline" 
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Button>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  )
} 