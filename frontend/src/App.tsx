import { useState, useEffect } from 'react'
import { 
  AudioPlayer, 
  AudioRecorder, 
  RecordingPlayback, 
  RecordingsList, 
  Menu 
} from './components'
import './App.css'

function App() {
  console.log('🚀 App: Component initializing')
  
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [showRecorder, setShowRecorder] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeRecordingId, setActiveRecordingId] = useState<number | null>(null)
  const [selectedRecording, setSelectedRecording] = useState<{id: number, title: string, source: string, created_at: string} | null>(null)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)

  // Log state changes
  useEffect(() => {
    console.log('📊 App: State updated:', {
      currentUrl: currentUrl ? 'HAS_URL' : 'NULL',
      showRecorder,
      recordedBlob: recordedBlob ? 'HAS_BLOB' : 'NULL',
      selectedRecording: selectedRecording ? selectedRecording.title : 'NULL',
      activeRecordingId,
      showAudioPlayer,
      refreshTrigger
    })
  }, [currentUrl, showRecorder, recordedBlob, selectedRecording, activeRecordingId, showAudioPlayer, refreshTrigger])

  // Log rendering decisions
  useEffect(() => {
    console.log('🎨 App: Rendering decisions:', {
      willShowError: !!error,
      willShowRecorder: showRecorder,
      willShowPlayback: !showRecorder && !!recordedBlob,
      willShowAudioPlayer: !showRecorder && !recordedBlob && showAudioPlayer && !!selectedRecording,
      willShowSelectedRecording: !showRecorder && !recordedBlob && !showAudioPlayer && !!selectedRecording && !activeRecordingId && !currentUrl,
      willShowPlaceholder: !showRecorder && !recordedBlob && !selectedRecording,
      activeRecordingId,
      selectedRecording: selectedRecording?.title,
      showAudioPlayer,
      currentUrl: currentUrl ? 'HAS_URL' : 'NULL'
    })
    
    if (showRecorder) {
      console.log('🎤 App: Will render AudioRecorder component')
    } else if (recordedBlob) {
      console.log('📽️ App: Will render RecordingPlayback component')
    } else if (showAudioPlayer && selectedRecording) {
      console.log('🔊 App: Will render AudioPlayer component', { 
        url: currentUrl || 'EMPTY', 
        title: selectedRecording.title,
        isPlaying: !!currentUrl
      })
    } else if (selectedRecording && !activeRecordingId && !currentUrl) {
      console.log('📋 App: Will render selected recording info:', selectedRecording.title)
    } else if (!selectedRecording) {
      console.log('📋 App: Will render placeholder (no recording selected)')
    }
  })

  const handleRecordingComplete = (blob: Blob) => {
    console.log('🎤 App: handleRecordingComplete called', {
      blobSize: blob.size,
      blobType: blob.type,
      blobExists: !!blob
    })
    
    try {
      console.log('🔄 App: Processing recording completion...')
      setRecordedBlob(blob)
      console.log('✅ App: recordedBlob state updated')
      
      setShowRecorder(false) // Hide recorder and show playback
      console.log('✅ App: showRecorder set to false (hiding recorder)')
      
      setError(null)
      console.log('✅ App: error state cleared')
      
      console.log('🎉 App: Recording completion handled successfully')
    } catch (err) {
      console.error('❌ App: Error in handleRecordingComplete:', err)
      setError('Failed to process recording. Please try again.')
      console.error('Recording processing error:', err)
    }
  }

  const handleRetryRecording = () => {
    console.log('🔄 App: handleRetryRecording called')
    
    try {
      console.log('🔄 App: Resetting recording state...')
      setRecordedBlob(null)
      console.log('✅ App: recordedBlob cleared')
      
      setShowRecorder(true) // Show recorder again
      console.log('✅ App: showRecorder set to true (showing recorder)')
      
      setError(null)
      console.log('✅ App: error state cleared')
      
      console.log('🎉 App: Recording retry handled successfully')
    } catch (err) {
      console.error('❌ App: Error in handleRetryRecording:', err)
      setError('Failed to reset recorder. Please refresh the page.')
      console.error('Retry recording error:', err)
    }
  }

  const handleRecordingSaved = (savedRecording: { id: number; title: string; source: string }) => {
    console.log('💾 App: handleRecordingSaved called', {
      recordingId: savedRecording.id,
      title: savedRecording.title,
      source: savedRecording.source
    })
    
    try {
      console.log('🔄 App: Triggering recordings list refresh...')
      const oldTrigger = refreshTrigger
      setRefreshTrigger(prev => prev + 1)
      console.log('✅ App: refreshTrigger updated', { from: oldTrigger, to: oldTrigger + 1 })
      
      // IMPORTANT: Clear the recorded blob after saving
      // This will cause the main area to show the placeholder instead of RecordingPlayback
      console.log('🔄 App: Clearing recorded blob after save...')
      setRecordedBlob(null)
      console.log('✅ App: recordedBlob cleared - will show placeholder')
      
      // Keep showRecorder false so we don't automatically show the recorder
      // User can click "New Recording" if they want to record again
      setShowRecorder(false)
      console.log('✅ App: showRecorder remains false (showing placeholder)')
      
      setError(null)
      console.log('✅ App: error state cleared')
      
      console.log('🎉 App: Recording saved and list refreshed:', savedRecording)
    } catch (err) {
      console.error('❌ App: Error in handleRecordingSaved:', err)
      setError('Recording saved but failed to refresh the list. Please refresh the page.')
      console.error('Recording saved callback error:', err)
    }
  }

  const handlePlay = (url: string, recording: {id: number, title: string, source: string, created_at: string}): void => {
    console.log('▶️ App: handlePlay called', { url, recording })
    
    try {
      console.log('🔄 App: Setting current audio URL...')
      setCurrentUrl(url)
      console.log('✅ App: currentUrl updated to:', url)
      
      // Set the active recording ID and selected recording
      setActiveRecordingId(recording.id)
      console.log('✅ App: activeRecordingId set to:', recording.id)
      
      setSelectedRecording(recording)
      console.log('✅ App: selectedRecording set to:', recording.title)
      
      // Show AudioPlayer and keep it visible
      setShowAudioPlayer(true)
      console.log('✅ App: showAudioPlayer set to true')
      
      // IMPORTANT: When playing from recordings list, hide recorder/playback interfaces
      // This ensures only the AudioPlayer shows, not the recording interface
      console.log('🔄 App: Hiding recording interfaces for playback...')
      
      // Clear any recorded blob (we're playing a saved recording, not a new one)
      setRecordedBlob(null)
      console.log('✅ App: recordedBlob cleared')
      
      // Hide both recorder and playback interfaces 
      // The main interface should show only the AudioPlayer when playing recordings
      setShowRecorder(false)
      console.log('✅ App: showRecorder set to false (hiding recording interface)')
      
      setError(null)
      console.log('✅ App: error state cleared')
      
      console.log('🎉 App: Audio playback initiated successfully - AudioPlayer will show')
    } catch (err) {
      console.error('❌ App: Error in handlePlay:', err)
      setError('Failed to load audio for playback.')
      console.error('Audio loading error:', err)
    }
  }

  /**
   * 🎤 SWITCH TO RECORDING HANDLER
   * 
   * PURPOSE: Allows user to return to recording interface from recordings list
   * 
   * WORKFLOW:
   * 1. Clear any playing audio
   * 2. Reset recording states
   * 3. Show recording interface
   * 4. Clear any errors
   */
  const handleSwitchToRecording = () => {
    console.log('🎤 App: handleSwitchToRecording called')
    
    try {
      console.log('🔄 App: Switching to recording mode...')
      
      // Clear any currently playing audio
      setCurrentUrl(null)
      console.log('✅ App: currentUrl cleared')
      
      // Clear active recording
      setActiveRecordingId(null)
      console.log('✅ App: activeRecordingId cleared')
      
      // Clear selected recording
      setSelectedRecording(null)
      console.log('✅ App: selectedRecording cleared')
      
      // Hide AudioPlayer when switching to recording
      setShowAudioPlayer(false)
      console.log('✅ App: showAudioPlayer set to false')
      
      // Clear any recorded blob from previous session
      setRecordedBlob(null)
      console.log('✅ App: recordedBlob cleared')
      
      // Show recorder interface
      setShowRecorder(true)
      console.log('✅ App: showRecorder set to true')
      
      // Clear any errors
      setError(null)
      console.log('✅ App: error state cleared')
      
      console.log('🎉 App: Successfully switched to recording mode')
    } catch (err) {
      console.error('❌ App: Error in handleSwitchToRecording:', err)
      setError('Failed to switch to recording mode.')
    }
  }

  /**
   * 🛑 STOP AUDIO PLAYBACK HANDLER
   * 
   * PURPOSE: Stops current audio playback but keeps AudioPlayer visible
   * AudioPlayer will remain visible until new recording is selected or "New Recording" is clicked
   */
  const handleStopPlayback = () => {
    console.log('🛑 App: handleStopPlayback called')
    
    try {
      console.log('🔄 App: Stopping audio playback...')
      
      // Clear the current audio URL to stop playback
      setCurrentUrl(null)
      console.log('✅ App: currentUrl cleared (playback stopped)')
      
      // Clear active recording ID to deactivate recording card
      setActiveRecordingId(null)
      console.log('✅ App: activeRecordingId cleared')
      
      // KEEP selectedRecording and showAudioPlayer so AudioPlayer stays visible
      console.log('✅ App: selectedRecording and showAudioPlayer preserved - AudioPlayer will stay visible')
      
      // Clear any errors
      setError(null)
      console.log('✅ App: error state cleared')
      
      console.log('🎉 App: Audio playback stopped - AudioPlayer remains visible until new action')
    } catch (err) {
      console.error('❌ App: Error in handleStopPlayback:', err)
      setError('Failed to stop audio playback.')
    }
  }

  return (
    <div className="app">
      {error && (
        <div className="app-error-message">
          <span>{error}</span>
          <button onClick={() => {
            console.log('❌ App: Error message close button clicked')
            setError(null)
            console.log('✅ App: Error cleared by user')
          }} className="error-close">×</button>
        </div>
      )}
      
      <Menu />
      <div className="content">
        <div className="sidebar">
          <div className="sidebar-controls">
            <button 
              onClick={() => {
                console.log('🎤 App: New Recording button clicked')
                handleSwitchToRecording()
              }}
              className="new-recording-button"
              title="Create a new recording"
            >
              🎤 New Recording
            </button>
          </div>
          
          <RecordingsList onPlay={handlePlay} refreshTrigger={refreshTrigger} activeRecordingId={activeRecordingId} />
        </div>
        <div className="main">
          <h1>Audio Recorder</h1>
          {(() => {
            console.log('🎨 App: Render decision state:', {
              showRecorder,
              recordedBlob: !!recordedBlob,
              showAudioPlayer,
              selectedRecording: !!selectedRecording,
              activeRecordingId,
              currentUrl: !!currentUrl
            })
            
            if (showRecorder) {
              console.log('🎨 App: Rendering AudioRecorder')
              return <AudioRecorder onRecordingComplete={handleRecordingComplete} />
            } else if (recordedBlob) {
              console.log('🎨 App: Rendering RecordingPlayback')
              return (
            <RecordingPlayback 
              audioBlob={recordedBlob} 
              title="Latest Recording" 
              onRetryRecording={handleRetryRecording}
              onRecordingSaved={handleRecordingSaved}
            />
              )
            } else if (showAudioPlayer && selectedRecording) {
              console.log('🎨 App: Rendering AudioPlayer', { url: currentUrl || 'EMPTY', title: selectedRecording.title })
              return (
                <AudioPlayer 
                  url={currentUrl || ''}
                  title={selectedRecording.title}
                  recordedDate={new Date(selectedRecording.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  onStop={handleStopPlayback} 
                />
              )
            } else if (selectedRecording && !activeRecordingId && !currentUrl) {
              console.log('🎨 App: Rendering selected-recording-info (fallback)')
              return (
                <div className="selected-recording-info">
                  <h2>🎵 {selectedRecording.title}</h2>
                  <p>Recording #{selectedRecording.id}</p>
                  <p>File: {selectedRecording.source}</p>
                  <p className="recording-info-instruction">
                    Playback stopped. Use the controls below to play again, or select another recording.
                  </p>
                </div>
              )
            } else if (!selectedRecording) {
              console.log('🎨 App: Rendering placeholder')
              return (
                <div className="main-content-placeholder">
                  <h2>🎵 Select a recording to play</h2>
                  <p>Choose a recording from the sidebar to start playback, or click "New Recording" to create a new one.</p>
                </div>
              )
            } else {
              console.log('🎨 App: Rendering null (no conditions met)')
              return null
            }
          })()}
        </div>
      </div>
    </div>
  )
}

export default App
