import { useRef, useEffect, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import TitleModal from './TitleModal'

interface SavedRecording {
  id: number
  title: string
  source: string
}

interface RecordingPlaybackProps {
  audioBlob: Blob | null
  title?: string
  onRetryRecording?: () => void
  onRecordingSaved?: (recording: SavedRecording) => void
}

/**
 * 🎵 RECORDING PLAYBACK COMPONENT
 * 
 * PURPOSE: Previews and saves recorded audio blobs from AudioRecorder
 * 
 * LIFECYCLE WORKFLOW:
 * 1. Receive audioBlob from parent (AudioRecorder)
 * 2. Create object URL from blob → Initialize WaveSurfer for playback
 * 3. User can preview recording (play/pause/stop)
 * 4. User clicks Save → Opens TitleModal → Uploads to backend
 * 5. API saves file → Database record created → Notify parent
 * 
 * PARENT COMMUNICATION:
 * - Receives: audioBlob (Blob), title (string), onRetryRecording (callback), onRecordingSaved (callback)
 * - Sends: SavedRecording object when upload completes
 * 
 * CHILD COMPONENTS:
 * - TitleModal: Handles title input and validation
 * 
 * API INTEGRATION:
 * - POST /api/upload: Uploads audio file and creates database record
 * - FormData format: audio file + title + custom filename
 * 
 * STATE MANAGEMENT:
 * - isPlaying: Boolean - playback state
 * - isLoaded: Boolean - WaveSurfer ready state
 * - showTitleModal: Boolean - modal visibility
 * - error: String - user-facing error messages
 */
function RecordingPlayback({ audioBlob, title = "Recorded Audio", onRetryRecording, onRecordingSaved }: RecordingPlaybackProps) {
  console.log('🚀 RecordingPlayback: Component initializing', {
    hasAudioBlob: !!audioBlob,
    audioBlobSize: audioBlob?.size || 0,
    audioBlobType: audioBlob?.type || 'N/A',
    title
  })

  // REFS: Direct access to WaveSurfer instances and DOM elements
  const wavesurferRef = useRef<WaveSurfer | null>(null)     // Playback WaveSurfer instance
  const containerRef = useRef<HTMLDivElement | null>(null) // DOM container for waveform
  
  // STATE: Component internal state management
  const [isPlaying, setIsPlaying] = useState(false)        // Audio playback state
  const [error, setError] = useState<string | null>(null)   // Error handling
  const [isLoaded, setIsLoaded] = useState(false)          // WaveSurfer ready flag
  const [showTitleModal, setShowTitleModal] = useState(false) // Title input modal

  // Log state changes
  useEffect(() => {
    console.log('📊 RecordingPlayback: State updated:', {
      isPlaying,
      isLoaded,
      error: error ? `ERROR: ${error}` : 'NULL',
      showTitleModal,
      wavesurferExists: !!wavesurferRef.current
    })
  }, [isPlaying, isLoaded, error, showTitleModal])

  useEffect(() => {
    console.log('🔧 RecordingPlayback: useEffect - audioBlob changed', {
      hasAudioBlob: !!audioBlob,
      audioBlobSize: audioBlob?.size || 0,
      containerExists: !!containerRef.current
    })

    try {
      if (audioBlob && containerRef.current) {
        console.log('📽️ RecordingPlayback: Creating playback waveform...')
        createPlaybackWaveform(audioBlob)
      } else {
        console.log('⚠️ RecordingPlayback: Missing audioBlob or container, skipping waveform creation')
      }
    } catch (err) {
      console.error('❌ RecordingPlayback: Failed to initialize playback component:', err)
      setError('Failed to initialize playback component')
    }

    return () => {
      console.log('🧹 RecordingPlayback: Cleanup function called')
      try {
        if (wavesurferRef.current) {
          try {
          wavesurferRef.current.destroy()
            console.log('✅ RecordingPlayback: WaveSurfer instance destroyed in cleanup')
          } catch (cleanupErr) {
            console.debug('⚠️ RecordingPlayback: Cleanup warning (ignored):', cleanupErr)
          }
        }
      } catch (err) {
        console.debug('⚠️ RecordingPlayback: Cleanup warning (ignored):', err)
      }
    }
  }, [audioBlob])

  const createPlaybackWaveform = async (blob: Blob) => {
    console.log('🎵 RecordingPlayback: createPlaybackWaveform called', {
      blobSize: blob.size,
      blobType: blob.type
    })

    try {
      if (containerRef.current) {
        console.log('📦 RecordingPlayback: Container ref exists, proceeding...')

        // Destroy previous instance
        if (wavesurferRef.current) {
          console.log('🗑️ RecordingPlayback: Destroying previous WaveSurfer instance')
          try {
          wavesurferRef.current.destroy()
            console.log('✅ RecordingPlayback: Previous instance destroyed')
          } catch (cleanupErr) {
            console.debug('⚠️ RecordingPlayback: Cleanup warning (ignored):', cleanupErr)
          }
        }

        console.log('🔗 RecordingPlayback: Creating object URL from blob...')
        const audioUrl = URL.createObjectURL(blob)
        console.log('✅ RecordingPlayback: Object URL created:', audioUrl)
        
        console.log('🔧 RecordingPlayback: Creating new WaveSurfer instance...')
        // Create new WaveSurfer instance for playback
        wavesurferRef.current = WaveSurfer.create({
          container: containerRef.current,
          waveColor: '#4F4A85',
          progressColor: '#383351',
          height: 80,
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
        })

        console.log('✅ RecordingPlayback: WaveSurfer instance created')
        console.log('🔧 RecordingPlayback: Setting up event listeners...')

        // Handle playback events
        wavesurferRef.current.on('play', () => {
          console.log('▶️ RecordingPlayback: Playback started')
          setIsPlaying(true)
        })
        
        wavesurferRef.current.on('pause', () => {
          console.log('⏸️ RecordingPlayback: Playback paused')
          setIsPlaying(false)
        })
        
        wavesurferRef.current.on('finish', () => {
          console.log('🏁 RecordingPlayback: Playback finished')
          setIsPlaying(false)
        })
        
        wavesurferRef.current.on('ready', () => {
          console.log('✅ RecordingPlayback: WaveSurfer ready')
          setIsLoaded(true)
        })

        // Handle WaveSurfer errors more specifically
        wavesurferRef.current.on('error', (error: Error) => {
          if (error.name === 'AbortError') {
            console.debug('⚠️ RecordingPlayback: WaveSurfer abort warning (ignored):', error)
            return
          }
          console.warn('⚠️ RecordingPlayback: WaveSurfer warning:', error)
          // Don't set error state for non-critical WaveSurfer warnings
        })

        console.log('✅ RecordingPlayback: Event listeners set up')
        console.log('📡 RecordingPlayback: Loading audio from URL...')

        // Load the recorded audio
        await wavesurferRef.current.load(audioUrl)
        console.log('✅ RecordingPlayback: Audio loaded successfully')
      } else {
        console.error('❌ RecordingPlayback: Container ref is null')
      }
    } catch (err) {
      console.error('❌ RecordingPlayback: Error in createPlaybackWaveform:', err)
      
      // Check if the error is critical (wavesurfer not created or major issue)
      if (!wavesurferRef.current) {
        console.error('❌ RecordingPlayback: Critical error - WaveSurfer not created')
        setError('Failed to initialize audio playback component')
      } else {
        // Log the error but don't show it to user if playback works
        console.warn('⚠️ RecordingPlayback: Non-critical playback initialization warning:', err)
      }
    }
  }

  const handlePlayPause = () => {
    console.log('▶️⏸️ RecordingPlayback: handlePlayPause called', { isLoaded, isPlaying })
    
    try {
      if (wavesurferRef.current && isLoaded) {
        console.log('🔄 RecordingPlayback: Toggling playback...')
        wavesurferRef.current.playPause()
        console.log('✅ RecordingPlayback: Playback toggled')
      } else {
        console.warn('⚠️ RecordingPlayback: Cannot play/pause - not loaded or no wavesurfer')
      }
    } catch (err) {
      console.error('❌ RecordingPlayback: Playback error:', err)
      setError('Failed to play/pause recorded audio')
    }
  }

  const handleStop = () => {
    console.log('🛑 RecordingPlayback: handleStop called')
    
    try {
      if (wavesurferRef.current) {
        console.log('🛑 RecordingPlayback: Stopping playback...')
        wavesurferRef.current.stop()
        setIsPlaying(false)
        console.log('✅ RecordingPlayback: Playback stopped')
      } else {
        console.warn('⚠️ RecordingPlayback: Cannot stop - no wavesurfer instance')
      }
    } catch (err) {
      console.error('❌ RecordingPlayback: Stop playback error:', err)
      setError('Failed to stop playback')
    }
  }

  const handleRetryRecording = () => {
    console.log('🔄 RecordingPlayback: handleRetryRecording called')
    
    try {
      if (onRetryRecording) {
        console.log('📤 RecordingPlayback: Calling onRetryRecording callback')
        onRetryRecording()
        console.log('✅ RecordingPlayback: onRetryRecording callback completed')
      } else {
        console.warn('⚠️ RecordingPlayback: No onRetryRecording callback provided')
      }
      setError(null)
      console.log('✅ RecordingPlayback: Error cleared')
    } catch (err) {
      console.error('❌ RecordingPlayback: Retry recording error:', err)
      setError('Failed to restart recording. Please refresh the page.')
    }
  }

  const handleSaveClick = () => {
    console.log('💾 RecordingPlayback: handleSaveClick called')
    console.log('📝 RecordingPlayback: Opening title modal...')
    setShowTitleModal(true)
    console.log('✅ RecordingPlayback: Title modal opened')
  }

  const saveRecording = async (recordingTitle: string) => {
    console.log('💾 RecordingPlayback: saveRecording called', { recordingTitle })
    
    try {
      if (!audioBlob) {
        console.error('❌ RecordingPlayback: No audio data to save')
        setError('No audio data to save')
        return
      }

      console.log('🔄 RecordingPlayback: Starting save process...')
      setError(null)
      
      // Enhanced blob validation
      console.log('🔍 RecordingPlayback: Validating audio blob:', {
        exists: !!audioBlob,
        size: audioBlob.size,
        type: audioBlob.type,
        constructor: audioBlob.constructor.name,
        isBlob: audioBlob instanceof Blob
      })
      
      if (audioBlob.size === 0) {
        console.error('❌ RecordingPlayback: Audio recording is empty')
        setError('Audio recording is empty')
        return
      }
      
      // Check if it's actually a Blob
      if (!(audioBlob instanceof Blob)) {
        console.error('❌ RecordingPlayback: Invalid audio data format:', typeof audioBlob)
        setError('Invalid audio data format')
        return
      }
      
      console.log('✅ RecordingPlayback: Blob validation passed')
      console.log('📦 RecordingPlayback: Preparing form data for upload...')
      
      // Create form data for upload
      const formData = new FormData()
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `recording-${timestamp}.webm`
      console.log('📝 RecordingPlayback: Generated filename:', filename)
      
      // Create a file from the blob with explicit type
      const audioType = audioBlob.type || 'audio/webm'
      const file = new File([audioBlob], filename, { type: audioType })
      
      console.log('📄 RecordingPlayback: Created file for upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        title: recordingTitle,
        customFilename: filename,
        originalBlobSize: audioBlob.size
      })
      
      // Verify the file was created correctly
      if (file.size === 0) {
        console.error('❌ RecordingPlayback: File creation resulted in empty file')
        setError('Failed to create upload file - file is empty')
        return
      }
      
      console.log('📦 RecordingPlayback: Appending data to FormData...')
      formData.append('audio', file)
      formData.append('title', recordingTitle || 'Untitled Recording')
      formData.append('customFilename', filename)
      
      // Log form data contents and verify file is attached
      const formFile = formData.get('audio') as File
      console.log('📋 RecordingPlayback: Form data prepared:', {
        hasAudio: formData.has('audio'),
        hasTitle: formData.has('title'),
        hasCustomFilename: formData.has('customFilename'),
        title: formData.get('title'),
        customFilename: formData.get('customFilename'),
        formFileSize: formFile ? formFile.size : 'no file',
        formFileType: formFile ? formFile.type : 'no file'
      })
      
      // Upload to backend
      const uploadUrl = 'http://localhost:3000/api/upload'
      console.log('📡 API: Preparing upload request to:', uploadUrl)
      console.log('📡 API: Making POST request...')
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      })
      
      console.log('📡 API: Upload response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: {
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        }
      })
      
      if (!response.ok) {
        console.error('❌ API: Upload response not OK')
        
        let errorData
        try {
          errorData = await response.json()
          console.error('❌ API: Error response data:', errorData)
        } catch (parseError) {
          console.error('❌ API: Failed to parse error response:', parseError)
          errorData = { error: 'Unknown error' }
        }
        
        const errorMessage = `Upload failed (${response.status}): ${errorData.error || response.statusText}`
        console.error('❌ API: Upload failed:', errorMessage)
        throw new Error(errorMessage)
      }

      console.log('📡 API: Parsing successful response...')
      const result = await response.json()
      console.log('📡 API: Upload response data:', {
        hasFile: !!result.file,
        message: result.message,
        fileId: result.file?.id,
        fileTitle: result.file?.title,
        fileSource: result.file?.source
      })

      if (result.file) {
        console.log('✅ RecordingPlayback: Upload successful, processing result...')
        
        const savedRecording: SavedRecording = {
          id: result.file.id,
          title: result.file.title,
          source: result.file.source
        }
        
        console.log('📤 RecordingPlayback: Calling onRecordingSaved callback:', savedRecording)
        
        if (onRecordingSaved) {
          onRecordingSaved(savedRecording)
          console.log('✅ RecordingPlayback: onRecordingSaved callback completed')
        } else {
          console.warn('⚠️ RecordingPlayback: No onRecordingSaved callback provided')
        }
        
        console.log('🎉 RecordingPlayback: Recording saved successfully!')
      } else {
        console.error('❌ RecordingPlayback: No file data in response')
        throw new Error('No file data received from server')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('❌ RecordingPlayback: Save recording error:', {
        error: err,
        message: errorMessage,
        audioBlob: audioBlob ? { 
          size: audioBlob.size, 
          type: audioBlob.type,
          constructor: audioBlob.constructor.name,
          isBlob: audioBlob instanceof Blob
        } : null,
        title: recordingTitle
      })
      
      setError(`Failed to save recording: ${errorMessage}`)
    }
  }

  // Log render decisions
  useEffect(() => {
    console.log('🎨 RecordingPlayback: Render decisions:', {
      hasAudioBlob: !!audioBlob,
      hasError: !!error,
      isLoaded,
      isPlaying,
      showTitleModal,
      willShow: !!audioBlob
    })
  })

  if (!audioBlob) {
    console.log('⚠️ RecordingPlayback: No audio blob, not rendering')
    return null
  }

  console.log('🎨 RecordingPlayback: Rendering component')

  return (
    <div className="playback-recording-container">
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => {
            console.log('❌ RecordingPlayback: Error close button clicked')
            setError(null)
            console.log('✅ RecordingPlayback: Error cleared by user')
          }} className="error-close">×</button>
        </div>
      )}
      
      <div className="playback-header">
        <h3>{title}</h3>
      </div>
      
      <div className="playback-waveform">
        <div ref={containerRef} className="waveform-display" />
      </div>
      
      <div className="playback-controls">
        <button 
          onClick={() => {
            console.log('▶️⏸️ RecordingPlayback: Play/Pause button clicked')
            handlePlayPause()
          }}
          className="control-button"
          disabled={!isLoaded}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <button 
          onClick={() => {
            console.log('🛑 RecordingPlayback: Stop button clicked')
            handleStop()
          }}
          className="control-button"
          disabled={!isLoaded}
        >
          Stop
        </button>
        
        <button 
          onClick={() => {
            console.log('💾 RecordingPlayback: Save button clicked')
            handleSaveClick()
          }}
          className="control-button save-button"
        >
          Save
        </button>
        
        {onRetryRecording && (
          <button 
            onClick={() => {
              console.log('🔄 RecordingPlayback: Record Again button clicked')
              handleRetryRecording()
            }}
            className="control-button retry-button"
          >
            Record Again
          </button>
        )}
      </div>
      
      <TitleModal
        isOpen={showTitleModal}
        onClose={() => {
          console.log('📝 RecordingPlayback: Title modal close requested')
          setShowTitleModal(false)
          console.log('✅ RecordingPlayback: Title modal closed')
        }}
        onSave={(title) => {
          console.log('💾 RecordingPlayback: Title modal save requested:', title)
          saveRecording(title)
        }}
        defaultTitle={title}
      />
    </div>
  )
}

export default RecordingPlayback 