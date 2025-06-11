import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchRecordings, setSortField, setSortOrder, type SortField } from '../../../store/slices/recordingsListSlice'
import type { Recording } from '../../../store/slices/recordingSlice'
import api from '../../../api'
import RecordingCard from './RecordingCard'
import './RecordingsList.css'

interface RecordingsListProps {
  onPlay: (url: string, recording: Recording) => void
  refreshTrigger?: number
  activeRecordingId?: number | null
}

/**
 * 📋 RECORDINGS LIST COMPONENT
 * 
 * PURPOSE: Fetches, displays, and manages saved recordings from backend
 * 
 * LIFECYCLE WORKFLOW:
 * 1. Mount → Fetch recordings from API → Display in sorted list
 * 2. User interactions → Sort controls → Play individual recordings
 * 3. Refresh trigger → Re-fetch data (when new recordings saved)
 * 4. Error handling → Show retry options
 * 
 * PARENT COMMUNICATION:
 * - Receives: onPlay callback, refreshTrigger number, activeRecordingId
 * - Sends: Audio URL when user clicks play on recording
 * 
 * CHILD COMPONENTS:
 * - RecordingCard: Individual recording display and controls
 * 
 * API INTEGRATION:
 * - GET /api/recordings: Fetches all saved recordings
 * - Expected response: { success: true, data: { items: Recording[] } }
 * 
 * STATE MANAGEMENT:
 * - recordings: Array of Recording objects
 * - loading: Boolean - API request in progress
 * - error: String - API error messages
 * - sortField: 'id' | 'title' | 'created_at' - current sort field
 * - sortOrder: 'asc' | 'desc' - sort direction
 * 
 * FEATURES:
 * - Real-time sorting (ID, Title, Date)
 * - Loading states with spinner
 * - Error handling with retry
 * - Empty state messaging
 * - Responsive grid layout
 */
function RecordingsList({ onPlay, refreshTrigger = 0, activeRecordingId = null }: RecordingsListProps) {
  console.log('🚀 RecordingsList: Component initializing', { refreshTrigger, activeRecordingId })

  // Redux hooks
  const dispatch = useAppDispatch()
  const { recordings, loading, error, sortField, sortOrder } = useAppSelector(state => state.recordingsList)

  // Log state changes
  useEffect(() => {
    console.log('📊 RecordingsList: State updated:', {
      recordingsCount: recordings.length,
      loading,
      error: error ? `ERROR: ${error}` : 'NULL',
      sortField,
      sortOrder,
      refreshTrigger
    })
  }, [recordings, loading, error, sortField, sortOrder, refreshTrigger])



  const handleRetryLoad = () => {
    console.log('🔄 RecordingsList: handleRetryLoad called')
    console.log('🔄 RecordingsList: User requested retry, refetching recordings...')
    dispatch(fetchRecordings())
  }

  const handleSort = (field: SortField) => {
    console.log('🔄 RecordingsList: handleSort called', { field, currentSortField: sortField, currentSortOrder: sortOrder })
    
    if (field === sortField) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
      console.log('🔄 RecordingsList: Toggling sort order', { from: sortOrder, to: newOrder })
      dispatch(setSortOrder(newOrder))
    } else {
      console.log('🔄 RecordingsList: Changing sort field', { from: sortField, to: field })
      dispatch(setSortField(field))
      dispatch(setSortOrder('asc'))
      console.log('🔄 RecordingsList: Sort order reset to asc')
    }
  }

  const getSortedRecordings = () => {
    console.log('🔄 RecordingsList: getSortedRecordings called', { sortField, sortOrder, recordingsCount: recordings.length })
    
    if (recordings.length === 0) {
      console.log('📊 RecordingsList: No recordings to sort, returning empty array')
      return []
    }

    const sorted = [...recordings].sort((a, b) => {
      let comparison = 0
      
      if (sortField === 'id') {
        comparison = a.id - b.id
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title)
      } else if (sortField === 'created_at') {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        comparison = dateA - dateB
      }
      
      const result = sortOrder === 'desc' ? -comparison : comparison
      return result
    })

    console.log('📊 RecordingsList: Recordings sorted', {
      originalOrder: recordings.map(r => r.id),
      sortedOrder: sorted.map(r => r.id),
      sortField,
      sortOrder
    })

    return sorted
  }

  const handlePlayRecording = (recording: Recording) => {
    console.log('▶️ RecordingsList: handlePlayRecording called', {
      recordingId: recording.id,
      title: recording.title,
      source: recording.source,
      currentActiveId: activeRecordingId
    })
    
    try {
      // Parent App component will handle setting the active recording state
      console.log('🎯 RecordingsList: Notifying parent of recording selection:', recording.id)
    
      const url = api.recordings.getPlaybackUrl(recording.source)
      console.log('🔗 RecordingsList: Generated playback URL via API management:', url)
      
      console.log('📤 RecordingsList: Calling onPlay callback with URL')
      onPlay(url, recording)
      console.log('✅ RecordingsList: onPlay callback completed')
    } catch (err) {
      console.error('❌ RecordingsList: Error in handlePlayRecording:', err)
    }
  }

  // Fetch recordings on component mount and when refreshTrigger changes
  useEffect(() => {
    console.log('🔄 RecordingsList: useEffect triggered for fetchRecordings', { refreshTrigger })
    dispatch(fetchRecordings())
  }, [refreshTrigger, dispatch])

  // Log render decisions
  useEffect(() => {
    console.log('🎨 RecordingsList: Render decisions:', {
      isLoading: loading,
      hasError: !!error,
      recordingsCount: recordings.length,
      willShowLoading: loading,
      willShowError: !!error,
      willShowRecordings: !loading && !error && recordings.length > 0,
      willShowEmptyState: !loading && !error && recordings.length === 0
    })
  })

  if (loading) {
    console.log('⏳ RecordingsList: Rendering loading state')
    return (
      <div className="recordings-list-container">
        <div className="recordings-list-header">
          <h2 className="recordings-list-title">Recordings</h2>
        </div>
        <div className="recordings-list-loading">
          <div className="recordings-list-loading-icon">⏳</div>
          <p className="recordings-list-loading-message">Loading recordings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.log('❌ RecordingsList: Rendering error state:', error)
    return (
      <div className="recordings-list-container">
        <div className="recordings-list-header">
          <h2 className="recordings-list-title">Recordings</h2>
        </div>
        <div className="recordings-list-error">
          <div className="recordings-list-error-icon">⚠️</div>
          <h3 className="recordings-list-error-title">Failed to Load Recordings</h3>
          <p className="recordings-list-error-message">{error}</p>
          <button onClick={() => {
            console.log('🔄 RecordingsList: Retry button clicked')
            handleRetryLoad()
          }} className="recordings-list-retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const sortedRecordings = getSortedRecordings()
  console.log('🎨 RecordingsList: Rendering main list view with', sortedRecordings.length, 'recordings')

  return (
    <div className="recordings-list-container">
      <div className="recordings-list-header">
        <h2 className="recordings-list-title">Recordings ({recordings.length})</h2>
        
        <div className="recordings-list-controls">
          <div className="recordings-list-sort">
            <span className="recordings-list-sort-label">Sort by:</span>
            <button 
              onClick={() => {
                console.log('🔄 RecordingsList: ID sort button clicked')
                handleSort('id')
              }}
              className={`recordings-list-sort-button ${sortField === 'id' ? 'recordings-list-sort-button-active' : ''}`}
            >
              ID {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              onClick={() => {
                console.log('🔄 RecordingsList: Title sort button clicked')
                handleSort('title')
              }}
              className={`recordings-list-sort-button ${sortField === 'title' ? 'recordings-list-sort-button-active' : ''}`}
            >
              Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              onClick={() => {
                console.log('🔄 RecordingsList: Date sort button clicked')
                handleSort('created_at')
              }}
              className={`recordings-list-sort-button ${sortField === 'created_at' ? 'recordings-list-sort-button-active' : ''}`}
            >
              Date {sortField === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {sortedRecordings.length === 0 ? (
        <>
          {console.log('📭 RecordingsList: Rendering empty state')}
          <div className="recordings-list-empty">
            <div className="recordings-list-empty-icon">🎤</div>
            <h3 className="recordings-list-empty-title">No Recordings Yet</h3>
            <p className="recordings-list-empty-message">
              Start by creating your first audio recording above.
            </p>
          </div>
        </>
      ) : (
        <>
          {console.log('📋 RecordingsList: Rendering recordings grid with', sortedRecordings.length, 'items')}
          <div className="recordings-list-grid">
            {sortedRecordings.map((recording) => {
              console.log('🎵 RecordingsList: Rendering RecordingCard for:', {
                id: recording.id,
                title: recording.title
              })
              
              return (
                <RecordingCard
                  key={recording.id}
                  recording={recording}
                  isActive={activeRecordingId === recording.id}
                  onPlay={() => {
                    console.log('▶️ RecordingsList: RecordingCard play button clicked for recording:', recording.id)
                    handlePlayRecording(recording)
                  }}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default RecordingsList 