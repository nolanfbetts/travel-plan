"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CookiePreferences {
  essential: boolean
  functional: boolean
  analytics: boolean
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: false,
    analytics: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    } else {
      const savedPreferences = JSON.parse(consent)
      setPreferences(savedPreferences)
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true
    }
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted))
    setPreferences(allAccepted)
    setShowBanner(false)
    setShowSettings(false)
  }

  const handleAcceptEssential = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false
    }
    localStorage.setItem('cookie-consent', JSON.stringify(essentialOnly))
    setPreferences(essentialOnly)
    setShowBanner(false)
    setShowSettings(false)
  }

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences))
    setShowBanner(false)
    setShowSettings(false)
  }

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'essential') return // Essential cookies cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  if (!showBanner && !showSettings) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-4">
        {showBanner && !showSettings && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We use cookies to enhance your experience
              </h3>
                              <p className="text-sm text-gray-600 mb-4">
                  We use cookies to help our website work properly, improve your experience, and understand how you use our site. 
                  By clicking &ldquo;Accept All&rdquo;, you consent to our use of cookies. 
                  <Link href="/cookie-policy.html" className="text-blue-600 hover:underline ml-1">
                    Learn more
                  </Link>
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="w-full sm:w-auto"
              >
                Customize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptEssential}
                className="w-full sm:w-auto"
              >
                Essential Only
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto"
              >
                Accept All
              </Button>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Cookie Preferences
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Essential Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Required for the website to function properly. Cannot be disabled.
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.essential}
                    disabled
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Functional Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Help us remember your preferences and improve your experience.
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={() => handlePreferenceChange('functional')}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Help us understand how visitors use our website to improve it.
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={() => handlePreferenceChange('analytics')}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSavePreferences}
                className="w-full sm:w-auto"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 