import { useRef, useEffect, useState } from 'react'
import { AudioPlayerHeader } from '../../components'
import WaveSurfer from 'wavesurfer.js'

interface AudioPlayerProps {
  url: string
  title?: string
  recordedDate?: string
  recordingId?: number
}

function AudioPlayer({ url, title = 'Playing Audio', recordedDate, recordingId }: AudioPlayerProps) {
  console.log('🚀 AudioPlayer: Component initializing', { url, title, recordedDate })
  
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Log state changes
  useEffect(() => {
    console.log('📊 AudioPlayer: State updated:', {
      url,
      title,
      recordedDate,
      isPlaying,
      isLoaded,
      error: error ? `ERROR: ${error}` : 'NULL',
      currentTime,
      duration,
      wavesurferExists: !!wavesurferRef.current
    })
  }, [url, title, recordedDate, isPlaying, isLoaded, error, currentTime, duration])

  useEffect(() => {
    console.log('🔧 AudioPlayer: useEffect - URL changed', { 
      url, 
      containerExists: !!containerRef.current 
    })
    
    if (url && containerRef.current) {
      // Check if container has valid dimensions before loading
      const containerRect = containerRef.current.getBoundingClientRect()
      console.log('📐 AudioPlayer: Container dimensions:', {
        width: containerRect.width,
        height: containerRect.height,
        visible: containerRect.width > 0 && containerRect.height > 0
      })
      
      if (containerRect.width > 0) {
        console.log('📡 AudioPlayer: Loading audio from URL...')
        loadAudio(url)
      } else {
        console.log('⚠️ AudioPlayer: Container not visible yet, waiting...')
        // Retry after a short delay when container becomes visible
        const retryTimeout = setTimeout(() => {
          if (containerRef.current) {
            const newRect = containerRef.current.getBoundingClientRect()
            if (newRect.width > 0) {
              console.log('📡 AudioPlayer: Container now visible, loading audio...')
              loadAudio(url)
            }
          }
        }, 100)
        
        return () => clearTimeout(retryTimeout)
      }
    } else {
      console.log('⚠️ AudioPlayer: Missing URL or container, skipping audio load')
    }

    return () => {
      console.log('🧹 AudioPlayer: Cleanup function called')
      try {
        if (wavesurferRef.current) {
          try {
            wavesurferRef.current.destroy()
            console.log('✅ AudioPlayer: WaveSurfer instance destroyed in cleanup')
          } catch (cleanupErr) {
            console.debug('⚠️ AudioPlayer: Cleanup warning (ignored):', cleanupErr)
          }
        }
      } catch (err) {
        console.debug('⚠️ AudioPlayer: Cleanup warning (ignored):', err)
      }
    }
  }, [url])

  const loadAudio = async (audioUrl: string) => {
    console.log('🎵 AudioPlayer: loadAudio called', { audioUrl })

    try {
      if (!containerRef.current) {
        console.error('❌ AudioPlayer: Container ref is null')
        setError('Failed to initialize audio player container')
        return
      }

      // Validate container dimensions
      const containerRect = containerRef.current.getBoundingClientRect()
      if (containerRect.width <= 0) {
        console.error('❌ AudioPlayer: Container has invalid width:', containerRect.width)
        setError('Audio player container not ready')
        return
      }

      console.log('📦 AudioPlayer: Container validation passed:', {
        width: containerRect.width,
        height: containerRect.height
      })

      // Destroy previous instance
      if (wavesurferRef.current) {
        console.log('🗑️ AudioPlayer: Destroying previous WaveSurfer instance')
        try {
          wavesurferRef.current.destroy()
          console.log('✅ AudioPlayer: Previous instance destroyed')
        } catch (cleanupErr) {
          console.debug('⚠️ AudioPlayer: Cleanup warning (ignored):', cleanupErr)
        }
      }

      console.log('🔧 AudioPlayer: Creating new WaveSurfer instance...')
      
      // Create WaveSurfer instance with safer configuration
      wavesurferRef.current = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#8B8FA3',      // Light purple-gray for inactive waveform
        progressColor: '#4F4A85',   // Brand purple for played portion
        cursorColor: '#383351',     // Darker purple for cursor
        height: 100,               // Fixed height for consistency
        barWidth: 3,               // Slightly wider bars
        barGap: 1,                 // Small gap between bars
        barRadius: 3,              // Rounded bar edges
        normalize: true,           // Normalize waveform
        // responsive: true,          // Responsive to container (not available in this version)
        hideScrollbar: true,       // Clean appearance
        interact: true,         // Allow clicking to seek
        dragToSeek: true,         // Drag to seek functionality
        // Add safety configurations
        fillParent: true,          // Ensure proper container filling
        minPxPerSec: 50,          // Minimum pixels per second (prevents too dense waveforms)
        // pixelRatio: Math.min(window.devicePixelRatio || 1, 2), // Limit pixel ratio to prevent memory issues (not available in this version)
      })

      console.log('✅ AudioPlayer: WaveSurfer instance created with safety config')
      console.log('🔧 AudioPlayer: Setting up event listeners...')

      // Handle playback events
      wavesurferRef.current.on('play', () => {
        console.log('▶️ AudioPlayer: Playback started')
        setIsPlaying(true)
      })
      
      wavesurferRef.current.on('pause', () => {
        console.log('⏸️ AudioPlayer: Playback paused')
        setIsPlaying(false)
      })
      
      wavesurferRef.current.on('finish', () => {
        console.log('🏁 AudioPlayer: Playback finished')
        setIsPlaying(false)
      })
      
      wavesurferRef.current.on('ready', () => {
        console.log('✅ AudioPlayer: WaveSurfer ready')
        const audioDuration = wavesurferRef.current?.getDuration() || 0
        console.log('⏱️ AudioPlayer: Audio duration:', audioDuration)
        setDuration(audioDuration)
        setIsLoaded(true)
        setError(null)
      })

      // Handle time updates
      wavesurferRef.current.on('timeupdate', (time: number) => {
        setCurrentTime(time)
      })

      // Enhanced error handling for WaveSurfer
      wavesurferRef.current.on('error', (error: Error) => {
        if (error.name === 'AbortError') {
          console.debug('⚠️ AudioPlayer: WaveSurfer abort warning (ignored):', error)
          return
        }
        
        console.error('❌ AudioPlayer: WaveSurfer error:', error)
        
        // Handle specific error types
        if (error.message.includes('Invalid array length') || error.message.includes('RangeError')) {
          setError('Audio file format not supported or corrupted')
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          setError('Failed to load audio file - network error')
        } else {
          setError(`Audio loading error: ${error.message}`)
        }
        
        setIsLoaded(false)
      })

      console.log('✅ AudioPlayer: Event listeners set up')
      console.log('📡 AudioPlayer: Loading audio from URL:', audioUrl)

      // Reset states before loading
      setIsLoaded(false)
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
      setError(null)
      console.log('🔄 AudioPlayer: States reset before loading')

      // Validate audio URL before loading
      if (!audioUrl || audioUrl.trim() === '') {
        throw new Error('Invalid or empty audio URL')
      }

      // Load the audio file with additional error handling
      try {
        await wavesurferRef.current.load(audioUrl)
        console.log('✅ AudioPlayer: Audio load initiated successfully')
      } catch (loadError) {
        console.error('❌ AudioPlayer: Audio load failed:', loadError)
        throw new Error(`Failed to load audio: ${loadError instanceof Error ? loadError.message : 'Unknown error'}`)
      }
      
    } catch (err) {
      console.error('❌ AudioPlayer: Error in loadAudio:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown audio loading error'
      setError(`Failed to load audio: ${errorMessage}`)
      setIsLoaded(false)
      
      // Clean up on error
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy()
          wavesurferRef.current = null
        } catch (cleanupErr) {
          console.debug('⚠️ AudioPlayer: Error cleanup warning (ignored):', cleanupErr)
        }
      }
    }
  }

  const handlePlayPause = () => {
    console.log('▶️⏸️ AudioPlayer: handlePlayPause called', { isLoaded, isPlaying })
    
    try {
      if (wavesurferRef.current && isLoaded) {
        console.log('🔄 AudioPlayer: Toggling playback...')
        wavesurferRef.current.playPause()
        console.log('✅ AudioPlayer: Playback toggled')
      } else {
        console.warn('⚠️ AudioPlayer: Cannot play/pause - not loaded or no wavesurfer')
        if (!isLoaded) {
          setError('Audio is still loading, please wait...')
        }
      }
    } catch (err) {
      console.error('❌ AudioPlayer: Playback error:', err)
      setError('Failed to play/pause audio')
    }
  }

  const handleStop = () => {
    console.log('🛑 AudioPlayer: handleStop called')
    
    try {
      if (wavesurferRef.current) {
        console.log('🛑 AudioPlayer: Stopping playback...')
        wavesurferRef.current.stop()
        setIsPlaying(false)
        setCurrentTime(0)
        console.log('✅ AudioPlayer: Playback stopped and time reset')
      } else {
        console.warn('⚠️ AudioPlayer: Cannot stop - no wavesurfer instance')
      }
    } catch (err) {
      console.error('❌ AudioPlayer: Stop playback error:', err)
      setError('Failed to stop playback')
    }
  }

  const handleSeek = (seekTime: number) => {
    console.log('⏭️ AudioPlayer: handleSeek called', { seekTime, duration })
    
    try {
      if (wavesurferRef.current && isLoaded && duration > 0) {
        console.log('🔄 AudioPlayer: Seeking to time...')
        wavesurferRef.current.seekTo(seekTime / duration)
        console.log('✅ AudioPlayer: Seek completed')
      } else {
        console.warn('⚠️ AudioPlayer: Cannot seek - not loaded or no duration')
      }
    } catch (err) {
      console.error('❌ AudioPlayer: Seek error:', err)
      setError('Failed to seek audio')
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Log render decisions
  useEffect(() => {
    console.log('🎨 AudioPlayer: Render decisions:', {
      hasUrl: !!url,
      isLoaded,
      isPlaying,
      hasError: !!error,
      formattedCurrentTime: formatTime(currentTime),
      formattedDuration: formatTime(duration)
    })
  })

  if (!url) {
    console.log('⚠️ AudioPlayer: No URL provided, showing stopped player')
    
    return (
      <div className="audio-player-container">
        <AudioPlayerHeader 
          title={title}
          recordedDate={recordedDate}
          recordingId={recordingId}
          deleteDisabled={false}
          onDelete={() => {
            console.log('🗑️ AudioPlayer: Delete clicked (stopped state)')
          }}
        />
        
        <div className="audio-player-waveform">
          <div className="waveform-display">
            <div className="stopped-waveform-message">
              Audio stopped. Click a recording to play or use controls below.
            </div>
          </div>
        </div>
        
        <div className="audio-player-info">
          <span className="time-display">0:00 / 0:00</span>
          <span className="loading-status">Select a recording to play</span>
        </div>
        
        <div className="audio-player-controls">
          <div className="main-controls-row">
            <button className="control-button" disabled>
              Play
            </button>
          </div>
          
          <div className="seek-controls">
            <button className="control-button" disabled>
              -10s
            </button>
            
            <button className="control-button" disabled>
              +10s
            </button>
          </div>
        </div>
      </div>
    )
  }

  console.log('🎨 AudioPlayer: Rendering component')

  return (
    <div className="audio-player-container">
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => {
            console.log('❌ AudioPlayer: Error close button clicked')
            setError(null)
            console.log('✅ AudioPlayer: Error cleared by user')
          }} className="error-close">×</button>
        </div>
      )}
      
      <AudioPlayerHeader
        title={title}
        recordedDate={recordedDate}
        recordingId={recordingId}
        deleteDisabled={isPlaying}
        onDelete={() => {
          console.log('🗑️ AudioPlayer: Delete clicked')
        }}
      />
      
      <div className="audio-player-waveform">
        <div ref={containerRef} className="waveform-display" />
      </div>
      
      <div className="audio-player-info">
        <span className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        {!isLoaded && !error && (
          <span className="loading-status">Loading audio...</span>
        )}
      </div>
      
      <div className="audio-player-controls">
        <div className="main-controls-row">
          <button 
            onClick={() => {
              console.log('▶️⏸️ AudioPlayer: Play/Pause button clicked')
              handlePlayPause()
            }}
            className="control-button"
            disabled={!isLoaded}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          {isPlaying && (
            <button 
              onClick={() => {
                console.log('🛑 AudioPlayer: Stop button clicked')
                handleStop()
              }}
              className="control-button"
              disabled={!isLoaded}
            >
              Stop
            </button>
          )}
        </div>
        
        <div className="seek-controls">
          <button 
            onClick={() => {
              console.log('⏪ AudioPlayer: Rewind 10s button clicked')
              const newTime = Math.max(0, currentTime - 10)
              handleSeek(newTime)
            }}
            className="control-button"
            disabled={!isLoaded}
          >
            -10s
          </button>
          
          <button 
            onClick={() => {
              console.log('⏩ AudioPlayer: Forward 10s button clicked')
              const newTime = Math.min(duration, currentTime + 10)
              handleSeek(newTime)
            }}
            className="control-button"
            disabled={!isLoaded}
          >
            +10s
          </button>
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer 