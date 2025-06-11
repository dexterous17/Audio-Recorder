import { useEffect } from 'react'
import { 
  AudioPlayer, 
  AudioRecorder, 
  RecordingPlayback, 
  RecordingsList, 
  Menu 
} from './components'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { 
  setCurrentUrl, 
  setRecordedBlob, 
  setShowRecorder, 
  setShowAudioPlayer,
  switchToRecording,
  clearRecordedBlob,
  clearCurrentUrl 
} from './store/slices/audioSlice'
import { 
  setActiveRecordingId, 
  setSelectedRecording, 
  triggerRefresh,
  clearRecordingState
} from './store/slices/recordingSlice'
import { setError, clearError } from './store/slices/uiSlice'
import './App.css'

function App() {
  console.log('🚀 App: Component initializing')
  
  // Redux hooks
  const dispatch = useAppDispatch()
  const { currentUrl, recordedBlob, showRecorder, showAudioPlayer } = useAppSelector(state => state.audio)
  const { activeRecordingId, selectedRecording, refreshTrigger } = useAppSelector(state => state.recording)
  const { error } = useAppSelector(state => state.ui)

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
      dispatch(setRecordedBlob(blob))
      console.log('✅ App: recordedBlob state updated')
      
      dispatch(setShowRecorder(false)) // Hide recorder and show playback
      console.log('✅ App: showRecorder set to false (hiding recorder)')
      
      dispatch(clearError())
      console.log('✅ App: error state cleared')
      
      console.log('🎉 App: Recording completion handled successfully')
    } catch (err) {
      console.error('❌ App: Error in handleRecordingComplete:', err)
      dispatch(setError('Failed to process recording. Please try again.'))
      console.error('Recording processing error:', err)
    }
  }

  const handleRetryRecording = () => {
    console.log('🔄 App: handleRetryRecording called')
    
    try {
      console.log('🔄 App: Resetting recording state...')
      dispatch(clearRecordedBlob())
      console.log('✅ App: recordedBlob cleared')
      
      dispatch(setShowRecorder(true)) // Show recorder again
      console.log('✅ App: showRecorder set to true (showing recorder)')
      
      dispatch(clearError())
      console.log('✅ App: error state cleared')
      
      console.log('🎉 App: Recording retry handled successfully')
    } catch (err) {
      console.error('❌ App: Error in handleRetryRecording:', err)
      dispatch(setError('Failed to reset recorder. Please refresh the page.'))
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
      dispatch(triggerRefresh())
      console.log('✅ App: refreshTrigger updated', { from: oldTrigger, to: oldTrigger + 1 })
      
      // IMPORTANT: Clear the recorded blob after saving
      // This will cause the main area to show the placeholder instead of RecordingPlayback
      console.log('🔄 App: Clearing recorded blob after save...')
      dispatch(clearRecordedBlob())
      console.log('✅ App: recordedBlob cleared - will show placeholder')
      
      // Keep showRecorder false so we don't automatically show the recorder
      // User can click "New Recording" if they want to record again
      dispatch(setShowRecorder(false))
      console.log('✅ App: showRecorder remains false (showing placeholder)')
      
      dispatch(clearError())
      console.log('✅ App: error state cleared')
      
      console.log('🎉 App: Recording saved and list refreshed:', savedRecording)
    } catch (err) {
      console.error('❌ App: Error in handleRecordingSaved:', err)
      dispatch(setError('Recording saved but failed to refresh the list. Please refresh the page.'))
      console.error('Recording saved callback error:', err)
    }
  }

  const handlePlay = (url: string, recording: {id: number, title: string, source: string, created_at: string}): void => {
    console.log('▶️ App: handlePlay called', { url, recording })
    
    try {
      console.log('🔄 App: Setting current audio URL...')
      dispatch(setCurrentUrl(url))
      console.log('✅ App: currentUrl updated to:', url)
      
      // Set the active recording ID and selected recording
      dispatch(setActiveRecordingId(recording.id))
      console.log('✅ App: activeRecordingId set to:', recording.id)
      
      dispatch(setSelectedRecording(recording))
      console.log('✅ App: selectedRecording set to:', recording.title)
      
      // Show AudioPlayer and keep it visible
      dispatch(setShowAudioPlayer(true))
      console.log('✅ App: showAudioPlayer set to true')
      
      // IMPORTANT: When playing from recordings list, hide recorder/playback interfaces
      // This ensures only the AudioPlayer shows, not the recording interface
      console.log('🔄 App: Hiding recording interfaces for playback...')
      
      // Clear any recorded blob (we're playing a saved recording, not a new one)
      dispatch(clearRecordedBlob())
      console.log('✅ App: recordedBlob cleared')
      
      // Hide both recorder and playback interfaces 
      // The main interface should show only the AudioPlayer when playing recordings
      dispatch(setShowRecorder(false))
      console.log('✅ App: showRecorder set to false (hiding recording interface)')
      
      dispatch(clearError())
      console.log('✅ App: error state cleared')
      
      console.log('🎉 App: Audio playback initiated successfully - AudioPlayer will show')
    } catch (err) {
      console.error('❌ App: Error in handlePlay:', err)
      dispatch(setError('Failed to load audio for playback.'))
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
      
      // Use the switchToRecording action that handles all the state changes
      dispatch(switchToRecording())
      console.log('✅ App: Switched to recording mode')
      
      // Clear recording-related state
      dispatch(clearRecordingState())
      console.log('✅ App: Recording state cleared')
      
      // Clear any errors
      dispatch(clearError())
      console.log('✅ App: error state cleared')
      
      console.log('🎉 App: Successfully switched to recording mode')
    } catch (err) {
      console.error('❌ App: Error in handleSwitchToRecording:', err)
      dispatch(setError('Failed to switch to recording mode.'))
    }
  }

  return (
    <div className="app">
      {error && (
        <div className="app-error-message">
          <span>{error}</span>
          <button onClick={() => {
            console.log('❌ App: Error message close button clicked')
            dispatch(clearError())
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
                  recordingId={selectedRecording.id}
                />
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
