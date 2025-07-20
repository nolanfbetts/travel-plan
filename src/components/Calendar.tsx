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

interface CalendarProps {
  items: ItineraryItem[]
  tripId: string
  tripStartDate?: string | null
  tripEndDate?: string | null
}

type ViewType = 'month' | 'week' | 'day'

export default function Calendar({ items, tripId, tripStartDate, tripEndDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (tripStartDate) {
      return new Date(tripStartDate)
    }
    return new Date()
  })
  const [viewType, setViewType] = useState<ViewType>('month')
  const [hoveredEvent, setHoveredEvent] = useState<ItineraryItem | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  const getCategoryIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flight':
        return '✈️'
      case 'hotel':
        return '🏨'
      case 'event':
        return '🎫'
      case 'transport':
        return '🚗'
      case 'activity':
        return '🎯'
      default:
        return '📅'
    }
  }

  const getCategoryColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flight':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'hotel':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'event':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'transport':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'activity':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryColorSolid = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flight':
        return 'bg-blue-500'
      case 'hotel':
        return 'bg-purple-500'
      case 'event':
        return 'bg-green-500'
      case 'transport':
        return 'bg-yellow-500'
      case 'activity':
        return 'bg-pink-500'
      default:
        return 'bg-gray-500'
    }
  }

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const dayItems = items.filter(item => {
        if (!item.startDate) return false
        const itemDate = new Date(item.startDate)
        return itemDate.toDateString() === current.toDateString()
      })
      
      days.push({
        date: new Date(current),
        items: dayItems,
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString()
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
        date: new Date(date),
        items: dayItems,
        isToday: date.toDateString() === new Date().toDateString()
      })
    }
    
    return days
  }, [currentDate, items])

  const dayData = useMemo(() => {
    const dayItems = items.filter(item => {
      if (!item.startDate) return false
      const itemDate = new Date(item.startDate)
      return itemDate.toDateString() === currentDate.toDateString()
    })
    
    return dayItems.sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })
  }, [currentDate, items])

  const currentMonthEvents = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    return items.filter(item => {
      if (!item.startDate) return false
      const itemDate = new Date(item.startDate)
      return itemDate.getFullYear() === year && itemDate.getMonth() === month
    })
  }, [currentDate, items])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const goToPrevious = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
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
      return newDate
    })
  }

  const goToNext = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
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
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const goToTripStart = () => {
    if (tripStartDate) {
      setCurrentDate(new Date(tripStartDate))
    }
  }

  const handleEventHover = (event: ItineraryItem, e: React.MouseEvent) => {
    setHoveredEvent(event)
    setHoverPosition({ x: e.clientX, y: e.clientY })
  }

  const handleEventLeave = () => {
    setHoveredEvent(null)
  }

  const renderMonthView = () => (
    <div className="p-6">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2">
            {day.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {monthData.map((day, index) => (
          <div
            key={index}
            className={`min-h-[100px] sm:min-h-[120px] border border-gray-200 p-1 sm:p-2 hover:bg-gray-50 transition-colors ${
              !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
            } ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
          >
            {/* Date Number */}
            <div className={`text-xs sm:text-sm font-medium mb-1 ${
              !day.isCurrentMonth ? 'text-gray-400' : 
              day.isToday ? 'text-blue-600' : 'text-gray-900'
            }`}>
              {day.date.getDate()}
            </div>

            {/* Items */}
            <div className="space-y-1">
              {day.items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className={`text-xs p-1 rounded border ${getCategoryColor(item.type)} truncate cursor-pointer hover:opacity-80 transition-opacity`}
                  title={`${item.title}${item.description ? ` - ${item.description}` : ''}`}
                  onMouseEnter={(e) => handleEventHover(item, e)}
                  onMouseLeave={handleEventLeave}
                >
                  <div className="flex items-center space-x-1">
                    <span>{getCategoryIcon(item.type)}</span>
                    <span className="truncate">{item.title}</span>
                  </div>
                </div>
              ))}
              {day.items.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{day.items.length - 3} more
                </div>
              )}
              {day.items.length === 0 && (
                <div className="text-xs text-gray-400 text-center mt-2">
                  No events
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderWeekView = () => (
    <div className="p-6">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekData.map((day) => (
          <div key={day.date.toISOString()} className="text-center">
            <div className={`text-sm font-medium py-2 ${day.isToday ? 'text-blue-600' : 'text-gray-900'}`}>
              {dayNames[day.date.getDay()]}
            </div>
            <div className={`text-xs text-gray-500 ${day.isToday ? 'text-blue-600' : ''}`}>
              {day.date.getDate()} {monthNames[day.date.getMonth()].slice(0, 3)}
            </div>
          </div>
        ))}
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1">
        {weekData.map((day) => (
          <div
            key={day.date.toISOString()}
            className={`min-h-[200px] border border-gray-200 p-2 ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="space-y-1">
              {day.items.map((item) => (
                <div
                  key={item.id}
                  className={`text-xs p-2 rounded border ${getCategoryColor(item.type)} cursor-pointer hover:opacity-80 transition-opacity`}
                  onMouseEnter={(e) => handleEventHover(item, e)}
                  onMouseLeave={handleEventLeave}
                >
                  <div className="flex items-center space-x-1 mb-1">
                    <span>{getCategoryIcon(item.type)}</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {item.startDate && (
                    <div className="text-xs text-gray-600">
                      {formatDateTime(item.startDate)}
                    </div>
                  )}
                </div>
              ))}
              {day.items.length === 0 && (
                <div className="text-xs text-gray-400 text-center mt-4">
                  No events
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDayView = () => (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {dayNames[currentDate.getDay()]}, {monthNames[currentDate.getMonth()]} {currentDate.getDate()}, {currentDate.getFullYear()}
        </h3>
        <p className="text-sm text-gray-500">
          {dayData.length} event{dayData.length !== 1 ? 's' : ''} today
        </p>
      </div>

      <div className="space-y-3">
        {dayData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No events scheduled for today</p>
          </div>
        ) : (
          dayData.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border ${getCategoryColor(item.type)} cursor-pointer hover:opacity-80 transition-opacity`}
              onMouseEnter={(e) => handleEventHover(item, e)}
              onMouseLeave={handleEventLeave}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{getCategoryIcon(item.type)}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    {item.startDate && (
                      <span>{formatDateTime(item.startDate)}</span>
                    )}
                    {(item.type === 'FLIGHT' || item.type === 'TRANSPORT') ? (
                      item.startLocation && item.endLocation ? (
                        <span>📍 {item.startLocation} → {item.endLocation}</span>
                      ) : null
                    ) : (
                      item.location && (
                        <span>📍 {item.location}</span>
                      )
                    )}
                    {item.confirmationCode && (
                      <span>🔑 {item.confirmationCode}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const getViewTitle = () => {
    switch (viewType) {
      case 'month':
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
      case 'week':
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(endOfWeek.getDate() + 6)
        return `${formatDate(startOfWeek.toISOString())} - ${formatDate(endOfWeek.toISOString())}`
      case 'day':
        return `${dayNames[currentDate.getDay()]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
    }
  }

  const getEventCount = () => {
    switch (viewType) {
      case 'month':
        return currentMonthEvents.length
      case 'week':
        return weekData.reduce((total, day) => total + day.items.length, 0)
      case 'day':
        return dayData.length
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Calendar View</h3>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToTripStart}
              disabled={!tripStartDate}
              className="text-xs"
            >
              Trip Start
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
              className="text-xs"
            >
              Today
            </Button>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-1">
            {(['month', 'week', 'day'] as ViewType[]).map((view) => (
              <Button
                key={view}
                variant={viewType === view ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType(view)}
                className={`text-xs capitalize ${
                  viewType === view 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                }`}
              >
                {view}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            ← Previous
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {getViewTitle()}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {getEventCount()} event{getEventCount() !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={goToNext}>
            Next →
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      {viewType === 'month' && renderMonthView()}
      {viewType === 'week' && renderWeekView()}
      {viewType === 'day' && renderDayView()}

      {/* Legend */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {['Flight', 'Hotel', 'Event', 'Transport', 'Activity'].map(type => (
            <div key={type} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getCategoryColorSolid(type)}`}></div>
              <span className="text-xs text-gray-600">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex justify-center">
          <Link href={`/trips/${tripId}/items/new`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Add New Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Event Detail Popup */}
      {hoveredEvent && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
          style={{
            left: hoverPosition.x + 10,
            top: hoverPosition.y - 10,
            pointerEvents: 'none'
          }}
        >
          <div className="flex items-start space-x-2 mb-2">
            <span className="text-lg">{getCategoryIcon(hoveredEvent.type)}</span>
            <div>
              <h4 className="font-medium text-gray-900">{hoveredEvent.title}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(hoveredEvent.type)}`}>
                {hoveredEvent.type}
              </span>
            </div>
          </div>
          
          {hoveredEvent.description && (
            <p className="text-sm text-gray-600 mb-2">{hoveredEvent.description}</p>
          )}
          
          <div className="space-y-1 text-xs text-gray-500">
            {hoveredEvent.startDate && (
              <div>📅 Start: {formatDateTime(hoveredEvent.startDate)}</div>
            )}
            {hoveredEvent.endDate && (
              <div>📅 End: {formatDateTime(hoveredEvent.endDate)}</div>
            )}
            {(hoveredEvent.type === 'FLIGHT' || hoveredEvent.type === 'TRANSPORT') ? (
              hoveredEvent.startLocation && hoveredEvent.endLocation ? (
                <div>📍 {hoveredEvent.startLocation} → {hoveredEvent.endLocation}</div>
              ) : null
            ) : (
              hoveredEvent.location && (
                <div>📍 {hoveredEvent.location}</div>
              )
            )}
            {hoveredEvent.confirmationCode && (
              <div>🔑 Confirmation: {hoveredEvent.confirmationCode}</div>
            )}
            {hoveredEvent.notes && (
              <div>📝 {hoveredEvent.notes}</div>
            )}
            <div>👤 Added by: {hoveredEvent.createdBy.name || hoveredEvent.createdBy.email}</div>
          </div>
        </div>
      )}
    </div>
  )
} 