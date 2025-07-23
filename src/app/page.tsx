"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Footer from "@/components/Footer"
import { useSession } from "next-auth/react"

export default function HomePage() {
  const { data: session, status } = useSession()
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl sm:text-2xl font-bold text-blue-600">TravelPlan</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {status === "loading" ? (
                <div className="animate-pulse">
                  <div className="h-10 w-20 bg-gray-200 rounded"></div>
                </div>
              ) : session?.user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="hidden sm:inline-flex">Dashboard</Button>
                  </Link>
                  <Link href="/profile">
                    <Button size="sm" className="hidden sm:inline-flex">Profile</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="sm" className="sm:hidden">Go</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="outline" size="sm" className="hidden sm:inline-flex">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="hidden sm:inline-flex">Get Started</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="sm:hidden">Start</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              ✈️ Plan trips with friends and family
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Plan Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Adventure</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              Collaborate seamlessly with friends and family to plan amazing trips together. 
              Track costs, manage itineraries, and create unforgettable memories.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                  Start Planning Free
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-green-200 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-purple-200 border-2 border-white"></div>
                </div>
                <span>Join 1,000+ travelers</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⭐</span>
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">🏔️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Swiss Alps Adventure</h3>
                    <p className="text-sm text-gray-600">6 people • 7 days</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Budget:</span>
                    <span className="font-semibold text-gray-600">$4,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-semibold text-gray-600">12 planned</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">🏖️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Bali Beach Trip</h3>
                    <p className="text-sm text-gray-600">4 people • 10 days</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Budget:</span>
                    <span className="font-semibold text-gray-600">$3,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-semibold text-gray-600">8 planned</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">🗽</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">NYC Weekend</h3>
                    <p className="text-sm text-gray-600">2 people • 3 days</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Budget:</span>
                    <span className="font-semibold text-gray-600">$1,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-semibold text-gray-600">5 planned</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to plan the perfect trip
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              From initial planning to expense tracking, we&apos;ve got you covered every step of the way.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 sm:p-8">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Collaborative Planning</h3>
              <p className="text-gray-600 mb-4">
                Invite friends and family to join your trip planning. Everyone can contribute ideas, 
                add items to the itinerary, and track expenses together.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Real-time collaboration</li>
                <li>• Easy invitation system</li>
                <li>• Role-based permissions</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 sm:p-8">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Smart Expense Tracking</h3>
              <p className="text-gray-600 mb-4">
                Keep track of all trip expenses in one place. Categorize costs, split bills, 
                and see who owes what with automatic calculations.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Automatic cost splitting</li>
                <li>• Multiple currencies</li>
                <li>• Expense categories</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 sm:p-8">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Detailed Itinerary</h3>
              <p className="text-gray-600 mb-4">
                Organize flights, hotels, activities, and transportation in a beautiful timeline. 
                Never miss a reservation or forget an important detail.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Visual timeline view</li>
                <li>• Confirmation codes</li>
                <li>• Location tracking</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 sm:p-8">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Budget Management</h3>
              <p className="text-gray-600 mb-4">
                Set budgets for your entire trip or individual categories. Get real-time insights 
                into your spending and stay on track financially.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Budget alerts</li>
                <li>• Spending analytics</li>
                <li>• Cost predictions</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 sm:p-8">
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Mobile Ready</h3>
              <p className="text-gray-600 mb-4">
                Access your trip plans anywhere, anytime. Our mobile-friendly design works perfectly 
                on phones, tablets, and desktops.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Responsive design</li>
                <li>• Offline access</li>
                <li>• Push notifications</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 sm:p-8">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Secure & Private</h3>
              <p className="text-gray-600 mb-4">
                Your trip data is encrypted and secure. We never share your information with third parties 
                and you have full control over your data.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• End-to-end encryption</li>
                <li>• GDPR compliant</li>
                <li>• Data export</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by travelers worldwide
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              See what our users have to say about their experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <span>⭐</span>
                  <span>⭐</span>
                  <span>⭐</span>
                  <span>⭐</span>
                  <span>⭐</span>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                &ldquo;Planning our family trip to Japan was so much easier with TravelPlan. Everyone could contribute 
                ideas and we kept track of all our expenses perfectly. Highly recommend!&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">SM</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Mitchell</p>
                  <p className="text-sm text-gray-600">Family Traveler</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <span>⭐</span>
                  <span>⭐</span>
                  <span>⭐</span>
                  <span>⭐</span>
                  <span>⭐</span>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                &ldquo;As a frequent business traveler, I love how easy it is to split costs with colleagues. 
                The expense tracking feature saves me hours of work every month.&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold">DJ</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">David Johnson</p>
                  <p className="text-sm text-gray-600">Business Traveler</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <span>⭐</span>
                  <span>⭐</span>
                  <span>⭐</span>
                  <span>⭐</span>
                  <span>⭐</span>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                &ldquo;Planning our backpacking trip through Europe was a breeze. The itinerary feature helped us 
                stay organized and never miss a train or reservation. Amazing app!&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">AL</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Alex Lee</p>
                  <p className="text-sm text-gray-600">Adventure Traveler</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to start your next adventure?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of travelers who are already planning amazing trips together. 
            It&apos;s free to get started!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            {session?.user ? (
              <>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/trips/new">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                    Create New Trip
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                    Start Planning Free
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
