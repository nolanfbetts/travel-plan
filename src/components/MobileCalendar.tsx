"use client"

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { formatDate, formatDateTime } from '@/lib/utils'
import Link from 'next/link'

interface ItineraryItem {
  id: string
  type: string
  title: string
  description: string | null
  startDate: string | null
  endDate: string | null
  location: string | null
  startLocation: string | null
  endLocation: string | null
  confirmationCode: string | null
  notes: string | null
  createdAt: string
  createdBy: {
    id: string
    name: string | null
    email: string
  }
}

interface MobileCalendarProps {
  items: ItineraryItem[]
  tripId: string
  tripStartDate?: string | null
  tripEndDate?: string | null
}

type ViewType = 'month' | 'week' | 'day'

export default function MobileCalendar({ items, tripId, tripStartDate, tripEndDate }: MobileCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (tripStartDate) {
      return new Date(tripStartDate)
    }
    return new Date()
  })
  const [viewType, setViewType] = useState<ViewType>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const getCategoryIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flight':
        return '✈️'
      case 'hotel':
      case 'accommodation':
        return '🏨'
      case 'event':
        return '🎫'
      case 'transport':
        return '🚗'
      case 'activity':
        return '🎯'
      case 'food':
        return '🍽️'
      case 'shopping':
        return '🛍️'
      case 'other':
        return '📅'
      default:
        return '📅'
    }
  }

  const getCategoryColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flight':
        return 'bg-blue-500'
      case 'hotel':
      case 'accommodation':
        return 'bg-purple-500'
      case 'event':
        return 'bg-green-500'
      case 'transport':
        return 'bg-yellow-500'
      case 'activity':
        return 'bg-pink-500'
      case 'food':
        return 'bg-orange-500'
      case 'shopping':
        return 'bg-indigo-500'
      case 'other':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getCategoryColorLight = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flight':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'hotel':
      case 'accommodation':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'event':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'transport':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'activity':
        return 'bg-pink-50 text-pink-700 border-pink-200'
      case 'food':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'shopping':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'other':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= lastDay || current.getDay() !== 0) {
      const date = new Date(current)
      const dayItems = items.filter(item => {
        if (!item.startDate) return false
        const itemDate = new Date(item.startDate)
        return itemDate.toDateString() === date.toDateString()
      })
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        items: dayItems
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [currentDate, items])

  const weekData = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      
      const dayItems = items.filter(item => {
        if (!item.startDate) return false
        const itemDate = new Date(item.startDate)
        return itemDate.toDateString() === date.toDateString()
      })
      
      days.push({
        date,
        isToday: date.toDateString() === new Date().toDateString(),
        items: dayItems
      })
    }
    
    return days
  }, [currentDate, items])

  const dayData = useMemo(() => {
    return items.filter(item => {
      if (!item.startDate) return false
      const itemDate = new Date(item.startDate)
      return itemDate.toDateString() === currentDate.toDateString()
    }).sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })
  }, [currentDate, items])

  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    switch (viewType) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() - 7)
        break
      case 'day':
        newDate.setDate(newDate.getDate() - 1)
        break
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    switch (viewType) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() + 7)
        break
      case 'day':
        newDate.setDate(newDate.getDate() + 1)
        break
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(null)
  }

  const goToTripStart = () => {
    if (tripStartDate) {
      setCurrentDate(new Date(tripStartDate))
      setSelectedDate(null)
    }
  }

  const getViewTitle = () => {
    switch (viewType) {
      case 'month':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      case 'week':
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(endOfWeek.getDate() + 6)
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      case 'day':
        return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    }
  }

  const getEventCount = () => {
    switch (viewType) {
      case 'month':
        return monthData.reduce((total, day) => total + day.items.length, 0)
      case 'week':
        return weekData.reduce((total, day) => total + day.items.length, 0)
      case 'day':
        return dayData.length
    }
  }

  const renderMonthView = () => (
    <div className="p-4">
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthData.map((day, index) => (
          <button
            key={index}
            onClick={() => setSelectedDate(day.date)}
            className={`min-h-[60px] p-2 text-left rounded-lg transition-colors ${
              day.isToday
                ? 'bg-blue-100 border-2 border-blue-300 text-gray-900'
                : day.isCurrentMonth
                ? 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-900'
                : 'bg-gray-50 text-gray-400'
            } ${selectedDate?.toDateString() === day.date.toDateString() ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="text-sm font-medium mb-1">
              {day.date.getDate()}
            </div>
            {day.items.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {day.items.slice(0, 4).map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`w-2 h-2 rounded-full ${getCategoryColor(item.type)}`}
                    title={item.title}
                  />
                ))}
                {day.items.length > 4 && (
                  <div className="text-xs text-gray-500">+{day.items.length - 4}</div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )

  const renderWeekView = () => (
    <div className="p-4">
      <div className="space-y-3">
        {weekData.map((day, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-sm ${day.isToday ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                {day.isToday && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Today</span>
                )}
              </div>
              <span className="text-xs text-gray-500">{day.items.length} events</span>
            </div>
            
            {day.items.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-4">No events</div>
            ) : (
              <div className="space-y-2">
                {day.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(item.type)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{item.title}</div>
                      {item.startDate && (
                        <div className="text-xs text-gray-500">
                          {formatDateTime(item.startDate)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderDayView = () => (
    <div className="p-4">
      {dayData.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled for today</h3>
          <p className="text-gray-500 mb-6">Add your first event to get started</p>
          <Link href={`/trips/${tripId}/itinerary`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Add New Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {dayData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className={`w-4 h-4 rounded-full mt-1 ${getCategoryColor(item.type)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getCategoryIcon(item.type)}</span>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColorLight(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  )}
                  
                  <div className="space-y-1 text-sm text-gray-500">
                    {item.startDate && (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Start: {formatDateTime(item.startDate)}</span>
                      </div>
                    )}
                    {item.endDate && (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>End: {formatDateTime(item.endDate)}</span>
                      </div>
                    )}
                    {(item.type === 'FLIGHT' || item.type === 'TRANSPORT') ? (
                      item.startLocation && item.endLocation ? (
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{item.startLocation} → {item.endLocation}</span>
                        </div>
                      ) : null
                    ) : (
                      item.location && (
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{item.location}</span>
                        </div>
                      )
                    )}
                    {item.confirmationCode && (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <span>Confirmation: {item.confirmationCode}</span>
                      </div>
                    )}
                    {item.notes && (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>{item.notes}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Added by: {item.createdBy.name || item.createdBy.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Calendar Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Calendar</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevious}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Next"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
              Today
            </button>
            {tripStartDate && (
              <button
                onClick={goToTripStart}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Trip Start
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewType === 'month'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewType === 'week'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewType('day')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewType === 'day'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-700'
              }`}
            >
              Day
            </button>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">{getViewTitle()}</h2>
          <p className="text-sm text-gray-500 mt-1">{getEventCount()} events</p>
        </div>
      </div>

      {/* Calendar Content */}
      {viewType === 'month' && renderMonthView()}
      {viewType === 'week' && renderWeekView()}
      {viewType === 'day' && renderDayView()}

      {/* Legend */}
      <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Event Categories
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: 'Flight', label: 'Flight', icon: '✈️' },
            { type: 'Hotel', label: 'Hotel', icon: '🏨' },
            { type: 'Event', label: 'Event', icon: '🎫' },
            { type: 'Transport', label: 'Transport', icon: '🚗' },
            { type: 'Activity', label: 'Activity', icon: '🎯' },
            { type: 'Food', label: 'Food', icon: '🍽️' },
            { type: 'Shopping', label: 'Shopping', icon: '🛍️' },
            { type: 'Other', label: 'Other', icon: '📅' }
          ].map(({ type, label, icon }) => (
            <div key={type} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white transition-colors">
              <div className="flex items-center space-x-1">
                <span className="text-sm">{icon}</span>
                <div className={`w-2 h-2 rounded-full ${getCategoryColor(type)}`}></div>
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex justify-center">
          <Link href={`/trips/${tripId}/itinerary`}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Add New Event
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 