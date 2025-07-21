"use client"

import Link from 'next/link'
import { useState } from 'react'
import CookieConsent from './CookieConsent'

export default function Footer() {
  const [showCookieSettings, setShowCookieSettings] = useState(false)

  const handleCookieSettings = () => {
    // Clear existing consent to show the banner again
    localStorage.removeItem('cookie-consent')
    setShowCookieSettings(true)
  }

  return (
    <>
      <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">TravelPlan</h3>
              <p className="text-gray-600 mb-4">
                The ultimate collaborative travel planning platform. Plan trips with friends and family, 
                track expenses, manage tasks, and create unforgettable memories together.
              </p>
              <div className="flex space-x-4">
                <a href="mailto:contact@nolanbetts.dev" className="text-blue-600 hover:text-blue-800">
                  Contact Us
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/trips" className="text-gray-600 hover:text-gray-900 text-sm">
                    My Trips
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 text-sm">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy.html" className="text-gray-600 hover:text-gray-900 text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service.html" className="text-gray-600 hover:text-gray-900 text-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-policy.html" className="text-gray-600 hover:text-gray-900 text-sm">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleCookieSettings}
                    className="text-gray-600 hover:text-gray-900 text-sm text-left"
                  >
                    Cookie Settings
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 TravelPlan. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy.html" className="text-gray-500 hover:text-gray-700 text-sm">
                Privacy
              </Link>
              <Link href="/terms-of-service.html" className="text-gray-500 hover:text-gray-700 text-sm">
                Terms
              </Link>
              <Link href="/cookie-policy.html" className="text-gray-500 hover:text-gray-700 text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {showCookieSettings && <CookieConsent />}
    </>
  )
} 