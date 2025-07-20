'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface Vote {
  id: string
  option: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface Poll {
  id: string
  question: string
  description?: string
  options: string[]
  status: string
  expiresAt: string
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  votes: Vote[]
  _count: {
    votes: number
  }
}

interface PollCardProps {
  poll: Poll
  tripId: string
  onUpdate?: () => void
}

export default function PollCard({ poll, tripId, onUpdate }: PollCardProps) {
  const { data: session } = useSession()
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState('')

  const isExpired = new Date(poll.expiresAt) < new Date()
  const isActive = poll.status === 'ACTIVE' && !isExpired
  const canVote = isActive && session?.user?.id
  const isCreator = session?.user?.id === poll.createdBy.id

  // Get user's current vote
  const userVote = poll.votes.find(vote => vote.user.id === session?.user?.id)

  // Calculate vote counts for each option
  const voteCounts = poll.options.map(option => ({
    option,
    count: poll.votes.filter(vote => vote.option === option).length,
    percentage: poll.votes.length > 0 
      ? Math.round((poll.votes.filter(vote => vote.option === option).length / poll.votes.length) * 100)
      : 0
  }))

  // Find the winning option(s)
  const maxVotes = Math.max(...voteCounts.map(vc => vc.count))
  const winningOptions = voteCounts.filter(vc => vc.count === maxVotes && vc.count > 0)

  const handleVote = async (option: string) => {
    if (!canVote) return

    setIsVoting(true)
    setError('')

    try {
      const response = await fetch(`/api/trips/${tripId}/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ option }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit vote')
      }

      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsVoting(false)
    }
  }

  const handleRemoveVote = async () => {
    if (!userVote) return

    setIsVoting(true)
    setError('')

    try {
      const response = await fetch(`/api/trips/${tripId}/polls/${poll.id}/vote`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove vote')
      }

      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsVoting(false)
    }
  }

  const handleDeletePoll = async () => {
    if (!isCreator) return

    if (!confirm('Are you sure you want to delete this poll?')) return

    try {
      const response = await fetch(`/api/trips/${tripId}/polls/${poll.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete poll')
      }

      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = () => {
    if (poll.status === 'EXPIRED' || isExpired) return 'bg-red-100 text-red-800'
    if (poll.status === 'CLOSED') return 'bg-gray-100 text-gray-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = () => {
    if (poll.status === 'EXPIRED' || isExpired) return 'Expired'
    if (poll.status === 'CLOSED') return 'Closed'
    return 'Active'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{poll.question}</h3>
          {poll.description && (
            <p className="text-gray-600 text-sm mb-2">{poll.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>By {poll.createdBy.name}</span>
            <span>Created {formatDate(poll.createdAt)}</span>
            <span>Expires {formatDate(poll.expiresAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          {isCreator && (
            <button
              onClick={handleDeletePoll}
              className="text-red-600 hover:text-red-800 text-sm"
              title="Delete poll"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {poll.options.map((option) => {
          const voteCount = voteCounts.find(vc => vc.option === option)
          const isWinning = winningOptions.some(wo => wo.option === option)
          const isUserVote = userVote?.option === option

          return (
            <div key={option} className="relative">
              <div className="flex items-center gap-3">
                {canVote ? (
                  <button
                    onClick={() => handleVote(option)}
                    disabled={isVoting}
                    className={`flex-1 text-left p-3 rounded-lg border-2 transition-colors text-gray-900 ${
                      isUserVote
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{option}</span>
                      {isUserVote && (
                        <span className="text-blue-600 text-sm">✓ Your vote</span>
                      )}
                    </div>
                  </button>
                ) : (
                  <div className={`flex-1 p-3 rounded-lg border-2 text-gray-900 ${
                    isWinning ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{option}</span>
                      {isWinning && (
                        <span className="text-green-600 text-sm font-medium">Winner</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Vote count and percentage */}
              <div className="mt-2 ml-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{voteCount?.count || 0} votes</span>
                  <span>{voteCount?.percentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      isWinning ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${voteCount?.percentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* User vote actions */}
      {userVote && canVote && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleRemoveVote}
            disabled={isVoting}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Remove my vote
          </button>
        </div>
      )}

      {/* Results summary */}
      {!isActive && poll.votes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Final Results</h4>
          <p className="text-sm text-gray-600">
            {winningOptions.length === 1 
              ? `Winner: ${winningOptions[0].option}`
              : `Tie between: ${winningOptions.map(wo => wo.option).join(', ')}`
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Total votes: {poll.votes.length}
          </p>
        </div>
      )}

      {/* Voters list */}
      {poll.votes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Voters</h4>
          <div className="flex flex-wrap gap-2">
            {poll.votes.map((vote) => (
              <span
                key={vote.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
              >
                {vote.user.name} → {vote.option}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 