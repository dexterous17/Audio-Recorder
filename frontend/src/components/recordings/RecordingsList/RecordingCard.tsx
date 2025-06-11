import './RecordingCard.css'
import { useState, useEffect } from 'react'
import api from '../../../api'

interface Recording {
  id: number
  title: string
  source: string
  created_at: string
}

interface RecordingCardProps {
  recording: Recording
  isActive?: boolean
  onPlay?: () => void
}

/**
 * 🎴 RECORDING CARD COMPONENT
 * 
 * PURPOSE: Individual recording item display and interactions
 * 
 * PARENT-CHILD RELATIONSHIP:
 * - Parent: RecordingsList.tsx
 * - Child: None (leaf component)
 * 
 * PROPS RECEIVED:
 * - recording: Recording data to display
 * - isActive: Boolean indicating if this card is currently active/playing
 * - onPlay: Callback to parent when user clicks play
 * 
 * FEATURES:
 * - Displays recording title, date, file info
 * - Visual feedback for active/playing state
 * - Play and download buttons
 * - Error handling for user actions
 * 
 * SINGLE-CARD SELECTION:
 * - Only one card can be active at a time (managed by parent)
 * - Active state is controlled by parent component
 * - Visual indicators show which card is currently selected
 */
function RecordingCard({ recording, isActive = false, onPlay }: RecordingCardProps) {
  console.log('🚀 RecordingCard: Component initializing', {
    recordingId: recording.id,
    title: recording.title,
    source: recording.source,
    created_at: recording.created_at,
    isActive,
    hasOnPlay: !!onPlay
  })

  const [error, setError] = useState<string | null>(null)

  // Log state changes
  useEffect(() => {
    console.log('📊 RecordingCard: State updated', {
      recordingId: recording.id,
      isActive,
      error: error ? `ERROR: ${error}` : 'NULL'
    })
  }, [recording.id, isActive, error])

  // Format the creation date for display
  const formatDate = (dateString: string) => {
    console.log('📅 RecordingCard: formatDate called', { dateString })
    
    try {
      const date = new Date(dateString)
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      console.log('✅ RecordingCard: Date formatted', { 
        original: dateString, 
        formatted: formattedDate 
      })
      
      return formattedDate
    } catch (err) {
      console.error('❌ RecordingCard: Date formatting error:', err)
      return 'Unknown date'
    }
  }



  // Get file extension from source
  const getFileExtension = (source: string) => {
    console.log('📄 RecordingCard: getFileExtension called', { source })
    
    try {
      const extension = source.split('.').pop()?.toUpperCase() || 'AUDIO'
      console.log('✅ RecordingCard: File extension extracted', { 
        source, 
        extension 
      })
      return extension
    } catch (err) {
      console.error('❌ RecordingCard: File extension extraction error:', err)
      return 'AUDIO'
    }
  }

  const handlePlayClick = () => {
    console.log('▶️ RecordingCard: handlePlayClick called', {
      recordingId: recording.id,
      title: recording.title,
      isActive,
      hasOnPlay: !!onPlay
    })
    
    try {
      if (onPlay) {
        console.log('✅ RecordingCard: error cleared')
        setError(null)
        
        console.log('📤 RecordingCard: Calling onPlay callback')
        onPlay()
        console.log('✅ RecordingCard: onPlay callback completed - parent will handle active state')
      } else {
        console.warn('⚠️ RecordingCard: No onPlay callback provided')
        setError('Play function not available')
      }
    } catch (err) {
      console.error('❌ RecordingCard: Play click error:', err)
      setError('Failed to play recording')
    }
  }

  const handleDownloadClick = () => {
    console.log('⬇️ RecordingCard: handleDownloadClick called', {
      recordingId: recording.id,
      source: recording.source
    })
    
    try {
      const downloadUrl = api.recordings.getDownloadUrl(recording.source)
      console.log('🔗 RecordingCard: Generated download URL via API management:', downloadUrl)
      
      // Create a temporary anchor element for download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = recording.source
      link.target = '_blank'
      
      console.log('🔄 RecordingCard: Creating download link element')
      document.body.appendChild(link)
      console.log('✅ RecordingCard: Download link added to DOM')
      
      console.log('⬇️ RecordingCard: Triggering download...')
      link.click()
      console.log('✅ RecordingCard: Download triggered')
      
      // Clean up the temporary link
      document.body.removeChild(link)
      console.log('🧹 RecordingCard: Download link removed from DOM')
      
      setError(null)
      console.log('✅ RecordingCard: Download completed successfully')
    } catch (err) {
      console.error('❌ RecordingCard: Download error:', err)
      setError('Failed to download recording')
    }
  }

  const handleTitleClick = () => {
    console.log('📝 RecordingCard: handleTitleClick called', {
      recordingId: recording.id,
      title: recording.title
    })
    
    // Could be used for editing title in the future
    console.log('ℹ️ RecordingCard: Title clicked - future feature placeholder')
  }

  // Log render decisions
  useEffect(() => {
    console.log('🎨 RecordingCard: Render decisions:', {
      recordingId: recording.id,
      isActive,
      showError: !!error,
      cardClassName: isActive ? 'recording-card active' : 'recording-card',
      playButtonText: isActive ? 'Playing...' : 'Play',
      formattedDate: formatDate(recording.created_at),
      fileExtension: getFileExtension(recording.source)
    })
  })

  console.log('🎨 RecordingCard: Rendering component for recording:', recording.id)

  return (
    <div className={`recording-card ${isActive ? 'active' : ''}`}>
      {error && (
        <div className="recording-card-error">
          <span>{error}</span>
          <button onClick={() => {
            console.log('❌ RecordingCard: Error close button clicked')
            setError(null)
            console.log('✅ RecordingCard: Error cleared by user')
          }} className="error-close-small">×</button>
        </div>
      )}
      
      <div className="recording-card-header">
        <h4 
          className="recording-card-title" 
          onClick={() => {
            console.log('📝 RecordingCard: Title clicked')
            handleTitleClick()
          }}
          title="Click to view details"
        >
          {recording.title}
        </h4>
        <div className="recording-card-id">#{recording.id}</div>
      </div>
      
      <div className="recording-card-body">
        <div className="recording-card-info">
          <div className="recording-card-filename" title={recording.source}>
            📄 {getFileExtension(recording.source)} - {recording.source}
          </div>
          <div className="recording-card-date">
            📅 {formatDate(recording.created_at)}
          </div>
        </div>
      </div>
      
      <div className="recording-card-footer">
        <button 
          onClick={() => {
            console.log('▶️ RecordingCard: Play button clicked')
            handlePlayClick()
          }}
          className={`recording-card-play-button ${isActive ? 'playing' : ''}`}
          disabled={isActive}
          title="Play this recording"
        >
          {isActive ? '▶️ Playing...' : '▶️ Play'}
        </button>
        
        <button 
          onClick={() => {
            console.log('⬇️ RecordingCard: Download button clicked')
            handleDownloadClick()
          }}
          className="recording-card-play-button"
          title="Download this recording"
          style={{ backgroundColor: '#28a745', marginLeft: '0.5rem' }}
        >
          ⬇️ Download
        </button>
      </div>
    </div>
  )
}

export default RecordingCard 