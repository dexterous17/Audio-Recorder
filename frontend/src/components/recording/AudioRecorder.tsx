import { useRef, useEffect, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void
}

/**
 * 🎤 AUDIO RECORDER COMPONENT
 * 
 * PURPOSE: Records audio using microphone and WaveSurfer.js
 * 
 * LIFECYCLE WORKFLOW:
 * 1. Mount → Initialize WaveSurfer → Register RecordPlugin → Setup listeners
 * 2. User Interaction → Control recording (start/pause/resume/stop)
 * 3. Recording Complete → Create audio blob → Pass to parent via callback
 * 4. Unmount → Cleanup WaveSurfer instance and audio streams
 * 
 * PARENT COMMUNICATION:
 * - Receives: onRecordingComplete callback function
 * - Sends: Audio blob when recording is finished
 * 
 * STATE MANAGEMENT:
 * - isRecording: Boolean - currently capturing audio
 * - isPaused: Boolean - recording paused (can be resumed)
 * - recordingTime: String - formatted duration display
 * - error: String - user-facing error messages
 */
function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  console.log('🚀 AudioRecorder: Component initializing')
  
  // REFS: Direct access to WaveSurfer instances and DOM elements
  const wavesurferRef = useRef<WaveSurfer | null>(null)     // Main WaveSurfer instance
  const recordRef = useRef<RecordPlugin | null>(null)       // Recording plugin
  const containerRef = useRef<HTMLDivElement | null>(null) // DOM container for waveform
  
  // STATE: Component internal state management
  const [isRecording, setIsRecording] = useState(false)    // Currently recording flag
  const [isPaused, setIsPaused] = useState(false)          // Recording paused flag
  const [recordingTime, setRecordingTime] = useState('00:00') // Time display
  const [error, setError] = useState<string | null>(null)   // Error handling

  // LOGGING: Track state changes for debugging
  useEffect(() => {
    console.log('📊 AudioRecorder: State updated:', {
      isRecording,
      isPaused,
      recordingTime,
      error: error ? `ERROR: ${error}` : 'NULL',
      wavesurferExists: !!wavesurferRef.current,
      recordPluginExists: !!recordRef.current
    })
  }, [isRecording, isPaused, recordingTime, error])

  /**
   * 🔧 COMPONENT INITIALIZATION EFFECT
   * 
   * RUNS ON: Component mount and when onRecordingComplete changes
   * 
   * PROCESS:
   * 1. Check if DOM container exists
   * 2. Destroy any existing WaveSurfer instance (cleanup)
   * 3. Create new WaveSurfer instance with recording configuration
   * 4. Register RecordPlugin with audio settings
   * 5. Setup event listeners for recording progress and completion
   * 6. Return cleanup function for component unmount
   */
  useEffect(() => {
    console.log('🔧 AudioRecorder: useEffect - initializing WaveSurfer and RecordPlugin')
    
    try {
      // STEP 1: Verify DOM container is available
      if (containerRef.current) {
        console.log('📦 AudioRecorder: Container ref exists, proceeding with initialization')
        
        // STEP 2: Cleanup previous instance if exists
        if (wavesurferRef.current) {
          console.log('🗑️ AudioRecorder: Destroying previous WaveSurfer instance')
          try {
            wavesurferRef.current.destroy()
            console.log('✅ AudioRecorder: Previous WaveSurfer instance destroyed')
          } catch (cleanupErr) {
            console.debug('⚠️ AudioRecorder: Cleanup warning (ignored):', cleanupErr)
          }
        }

        console.log('🔧 AudioRecorder: Creating new WaveSurfer instance...')
        
        // STEP 3: Create WaveSurfer instance with recording-specific configuration
        wavesurferRef.current = WaveSurfer.create({
          container: containerRef.current,    // DOM element to render waveform
          waveColor: '#4F4A85',              // Waveform color (matches app theme)
          progressColor: '#383351',          // Progress indicator color
          height: 100,                       // Waveform height in pixels
          barWidth: 2,                       // Width of each frequency bar
          barGap: 1,                         // Space between bars
          barRadius: 2,                      // Rounded corners on bars
          normalize: true,                   // Normalize amplitude for consistent display
        })

        console.log('✅ AudioRecorder: WaveSurfer instance created successfully')
        console.log('🔧 AudioRecorder: Registering RecordPlugin...')

        // STEP 4: Initialize RecordPlugin with audio recording settings
        recordRef.current = wavesurferRef.current.registerPlugin(
          RecordPlugin.create({
            renderRecordedAudio: false,        // Don't show recorded audio in waveform
            scrollingWaveform: true,           // Waveform scrolls during recording
            continuousWaveform: false,         // Don't continue waveform after stopping
            continuousWaveformDuration: 30,    // Duration limit for continuous mode
            // AUDIO ENCODING SETTINGS:
            mimeType: 'audio/webm;codecs=opus', // Modern, efficient audio format
            audioBitsPerSecond: 128000,         // Good quality for speech/music (128kbps)
          })
        )

        console.log('✅ AudioRecorder: RecordPlugin registered successfully')
        console.log('🔧 AudioRecorder: Setting up event listeners...')

        // STEP 5A: Handle recording progress updates (time display)
        recordRef.current.on('record-progress', (time: number) => {
          // Convert milliseconds to MM:SS format
          const formattedTime = [
            Math.floor((time % 3600000) / 60000), // minutes
            Math.floor((time % 60000) / 1000),    // seconds
          ]
            .map((v) => (v < 10 ? '0' + v : v))   // Zero-pad single digits
            .join(':')
          
          console.log('⏱️ AudioRecorder: Recording progress:', { time, formattedTime })
          setRecordingTime(formattedTime)
        })

        // STEP 5B: Handle recording completion (main workflow completion)
        recordRef.current.on('record-end', (blob: Blob) => {
          console.log('🏁 AudioRecorder: Recording ended, blob received:', {
            size: blob.size,
            type: blob.type,
            isValidBlob: blob instanceof Blob
          })
          
          // VALIDATION: Ensure we have valid audio data
          if (blob.size === 0) {
            console.error('❌ AudioRecorder: Empty blob received from recording')
            setError('Recording failed: Empty audio data')
            return
          }
          
          // WARNING: Check blob type (not critical but helpful for debugging)
          if (!blob.type || !blob.type.includes('audio')) {
            console.warn('⚠️ AudioRecorder: Unexpected blob type:', blob.type)
          }
          
          // RESET STATE: Clean up recording state
          console.log('🔄 AudioRecorder: Updating recording states...')
          setIsRecording(false)
          console.log('✅ AudioRecorder: isRecording set to false')
          
          setIsPaused(false)
          console.log('✅ AudioRecorder: isPaused set to false')
          
          setRecordingTime('00:00')
          console.log('✅ AudioRecorder: recordingTime reset to 00:00')
          
          setError(null)
          console.log('✅ AudioRecorder: error cleared')
          
          // PARENT COMMUNICATION: Send completed recording to parent component
          console.log('📤 AudioRecorder: Calling onRecordingComplete callback')
          onRecordingComplete(blob)
          console.log('✅ AudioRecorder: onRecordingComplete callback completed')
        })

        // STEP 5C: Handle WaveSurfer errors (non-critical during recording)
        wavesurferRef.current.on('error', (error: Error) => {
          // IGNORE: AbortError is common when switching between recordings
          if (error.name === 'AbortError') {
            console.debug('⚠️ AudioRecorder: WaveSurfer abort warning (ignored):', error)
            return
          }
          console.warn('⚠️ AudioRecorder: WaveSurfer recording warning:', error)
          // NOTE: Don't set error state for non-critical WaveSurfer warnings during recording
        })

        console.log('✅ AudioRecorder: All event listeners set up successfully')
      } else {
        console.error('❌ AudioRecorder: Container ref is null, cannot initialize')
      }
    } catch (err) {
      console.error('❌ AudioRecorder: Failed to initialize recording:', err)
      setError('Failed to initialize audio recording. Please check your microphone permissions.')
    }

    // CLEANUP FUNCTION: Called when component unmounts or dependencies change
    return () => {
      console.log('🧹 AudioRecorder: Cleanup function called')
      try {
        if (wavesurferRef.current) {
          console.log('🗑️ AudioRecorder: Destroying WaveSurfer instance in cleanup')
          try {
            wavesurferRef.current.destroy()
            console.log('✅ AudioRecorder: WaveSurfer instance destroyed in cleanup')
          } catch (cleanupErr) {
            console.debug('⚠️ AudioRecorder: Cleanup warning (ignored):', cleanupErr)
          }
        }
      } catch (err) {
        console.debug('⚠️ AudioRecorder: Cleanup warning (ignored):', err)
      }
    }
  }, [onRecordingComplete])

  /**
   * 🎤 START RECORDING HANDLER
   * 
   * WORKFLOW:
   * 1. Validate RecordPlugin availability
   * 2. Check browser microphone support
   * 3. Request microphone permissions
   * 4. Test microphone access
   * 5. Start recording process
   * 6. Update component state
   * 
   * ERROR HANDLING:
   * - Browser compatibility
   * - Microphone permissions
   * - Hardware access
   */
  const handleStartRecording = async () => {
    console.log('🎤 AudioRecorder: handleStartRecording called')
    
    try {
      // STEP 1: Verify RecordPlugin is ready
      if (!recordRef.current) {
        console.error('❌ AudioRecorder: RecordPlugin not available')
        setError('Recording not initialized')
        return
      }

      console.log('🔄 AudioRecorder: Clearing any previous errors...')
      setError(null)
      
      // STEP 2: Check browser support for audio recording
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ AudioRecorder: Browser does not support audio recording')
        setError('Your browser does not support audio recording')
        return
      }
      
      console.log('🔐 AudioRecorder: Testing microphone access...')
      
      // STEP 3: Test microphone permissions before starting recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log('✅ AudioRecorder: Microphone access granted:', {
          streamActive: stream.active,
          trackCount: stream.getTracks().length,
          audioTracks: stream.getAudioTracks().length
        })
        
        // CLEANUP: Stop the test stream immediately (we just needed to verify access)
        stream.getTracks().forEach(track => {
          track.stop()
          console.log('🛑 AudioRecorder: Test stream track stopped')
        })
        console.log('✅ AudioRecorder: Test stream cleaned up')
      } catch (permissionError) {
        console.error('❌ AudioRecorder: Microphone permission error:', permissionError)
        setError('Microphone access denied. Please allow microphone access and try again.')
        return
      }
      
      // STEP 4: Start the actual recording
      console.log('🎯 AudioRecorder: Starting recording...')
      await recordRef.current.startRecording()
      
      // STEP 5: Update component state to reflect recording status
      console.log('🔄 AudioRecorder: Updating recording states after start...')
      setIsRecording(true)
      console.log('✅ AudioRecorder: isRecording set to true')
      
      setIsPaused(false)
      console.log('✅ AudioRecorder: isPaused set to false')
      
      console.log('🎉 AudioRecorder: Recording started successfully')
    } catch (err) {
      console.error('❌ AudioRecorder: Start recording error:', err)
      setError('Failed to start recording. Please check your microphone permissions.')
    }
  }

  /**
   * ⏸️ PAUSE RECORDING HANDLER
   * 
   * WORKFLOW:
   * 1. Verify recording is active
   * 2. Pause the recording (keeps audio data)
   * 3. Update component state
   * 
   * NOTE: Paused recordings can be resumed
   */
  const handlePauseRecording = () => {
    console.log('⏸️ AudioRecorder: handlePauseRecording called')
    
    try {
      // VALIDATION: Only pause if currently recording
      if (recordRef.current && recordRef.current.isRecording()) {
        console.log('⏸️ AudioRecorder: Pausing recording...')
        recordRef.current.pauseRecording()
        
        setIsPaused(true)
        console.log('✅ AudioRecorder: isPaused set to true')
        console.log('✅ AudioRecorder: Recording paused successfully')
      } else {
        console.warn('⚠️ AudioRecorder: Cannot pause - not currently recording')
      }
    } catch (err) {
      console.error('❌ AudioRecorder: Pause recording error:', err)
      setError('Failed to pause recording')
    }
  }

  /**
   * ▶️ RESUME RECORDING HANDLER
   * 
   * WORKFLOW:
   * 1. Verify recording is paused
   * 2. Resume the recording
   * 3. Update component state
   * 
   * NOTE: Continues from where paused left off
   */
  const handleResumeRecording = () => {
    console.log('▶️ AudioRecorder: handleResumeRecording called')
    
    try {
      // VALIDATION: Only resume if currently paused
      if (recordRef.current && recordRef.current.isPaused()) {
        console.log('▶️ AudioRecorder: Resuming recording...')
        recordRef.current.resumeRecording()
        
        setIsPaused(false)
        console.log('✅ AudioRecorder: isPaused set to false')
        console.log('✅ AudioRecorder: Recording resumed successfully')
      } else {
        console.warn('⚠️ AudioRecorder: Cannot resume - not currently paused')
      }
    } catch (err) {
      console.error('❌ AudioRecorder: Resume recording error:', err)
      setError('Failed to resume recording')
    }
  }

  /**
   * 🛑 STOP RECORDING HANDLER
   * 
   * WORKFLOW:
   * 1. Verify recording is active (recording or paused)
   * 2. Stop the recording process
   * 3. Update component state
   * 4. Recording completion triggers 'record-end' event → calls onRecordingComplete
   * 
   * NOTE: This finalizes the recording and creates the audio blob
   */
  const handleStopRecording = () => {
    console.log('🛑 AudioRecorder: handleStopRecording called')
    
    try {
      // VALIDATION: Only stop if recording or paused
      if (recordRef.current && (recordRef.current.isRecording() || recordRef.current.isPaused())) {
        console.log('🛑 AudioRecorder: Stopping recording...')
        recordRef.current.stopRecording()
        
        // NOTE: State will be updated in the 'record-end' event handler
        console.log('🔄 AudioRecorder: Updating states after stop...')
        setIsRecording(false)
        console.log('✅ AudioRecorder: isRecording set to false')
        
        setIsPaused(false)
        console.log('✅ AudioRecorder: isPaused set to false')
        
        console.log('✅ AudioRecorder: Recording stopped successfully')
      } else {
        console.warn('⚠️ AudioRecorder: Cannot stop - not currently recording or paused')
      }
    } catch (err) {
      console.error('❌ AudioRecorder: Stop recording error:', err)
      setError('Failed to stop recording')
    }
  }

  // DEBUGGING: Log render decisions to understand component state
  useEffect(() => {
    console.log('🎨 AudioRecorder: Render decisions:', {
      showStartButton: !isRecording && !isPaused,
      showPauseButton: isRecording && !isPaused,
      showResumeButton: isPaused,
      showStopButton: isRecording || isPaused,
      showRecordingTime: isRecording || isPaused,
      showPausedStatus: isPaused,
      hasError: !!error
    })
  })

  console.log('🎨 AudioRecorder: Rendering component')

  /**
   * 🎨 COMPONENT RENDER
   * 
   * CONDITIONAL RENDERING LOGIC:
   * - Error message (if exists)
   * - Recording controls (different buttons based on state)
   * - Recording time display (when recording/paused)
   * - Waveform container (hidden when not recording)
   * 
   * BUTTON STATE LOGIC:
   * - Start: Show when not recording and not paused
   * - Pause/Stop: Show when actively recording
   * - Resume/Stop: Show when paused
   */
  return (
    <div className="audio-recorder-container">
      {/* ERROR DISPLAY: Show user-friendly error messages */}
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => {
            console.log('❌ AudioRecorder: Error close button clicked')
            setError(null)
            console.log('✅ AudioRecorder: Error cleared by user')
          }} className="error-close">×</button>
        </div>
      )}
      
      {/* RECORDING CONTROLS: Dynamic button display based on recording state */}
      <div className="recording-controls">
        {/* START BUTTON: Only show when not recording */}
        {!isRecording && !isPaused && (
          <button onClick={() => {
            console.log('🎤 AudioRecorder: Start recording button clicked')
            handleStartRecording()
          }} className="control-button">
            Start Recording
          </button>
        )}
        
        {/* ACTIVE RECORDING CONTROLS: Pause and Stop buttons */}
        {isRecording && !isPaused && (
          <>
            <button onClick={() => {
              console.log('⏸️ AudioRecorder: Pause button clicked')
              handlePauseRecording()
            }} className="control-button">
              Pause
            </button>
            <button onClick={() => {
              console.log('🛑 AudioRecorder: Stop button clicked')
              handleStopRecording()
            }} className="control-button stop-button">
              Stop
            </button>
          </>
        )}
        
        {/* PAUSED RECORDING CONTROLS: Resume and Stop buttons */}
        {isPaused && (
          <>
            <button onClick={() => {
              console.log('▶️ AudioRecorder: Resume button clicked')
              handleResumeRecording()
            }} className="control-button">
              Resume
            </button>
            <button onClick={() => {
              console.log('🛑 AudioRecorder: Stop button (from paused) clicked')
              handleStopRecording()
            }} className="control-button stop-button">
              Stop
            </button>
          </>
        )}
        
        {/* TIME DISPLAY: Show during recording or when paused */}
        {(isRecording || isPaused) && (
          <span className="recording-time">{recordingTime}</span>
        )}
        
        {/* PAUSED STATUS: Visual indicator */}
        {isPaused && (
          <span className="recording-status">Recording Paused</span>
        )}
      </div>
      
      {/* WAVEFORM DISPLAY: WaveSurfer.js renders here */}
      <div className="recording-waveform">
        {/* PLACEHOLDER: Show instructions when not recording */}
        {!isRecording && !isPaused && (
          <div className="empty-waveform">
            <span>Click "New Recording" to create a new one, or Choose a recording from the sidebar to start playback</span>
          </div>
        )}
        {/* WAVEFORM CONTAINER: Hidden/visible based on recording state */}
        <div 
          ref={containerRef} 
          className={(isRecording || isPaused) ? "waveform-active" : "waveform-hidden"} 
        />
      </div>
    </div>
  )
}

export default AudioRecorder 