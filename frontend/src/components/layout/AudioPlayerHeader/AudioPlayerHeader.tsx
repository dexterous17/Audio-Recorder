import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { deleteRecording } from '../../../store/slices/recordingsListSlice'
import { setCurrentUrl } from '../../../store/slices/audioSlice'
import { setActiveRecordingId } from '../../../store/slices/recordingSlice'
import './AudioPlayerHeader.css'

interface AudioPlayerHeaderProps {
  title: string
  recordedDate?: string
  recordingId?: number
  onDelete?: () => void
  deleteDisabled?: boolean
  showDeleteButton?: boolean
  className?: string
}

/**
 * 🎵 AUDIO PLAYER HEADER COMPONENT
 * 
 * PURPOSE: Reusable header for audio player with title, date, and delete functionality
 * 
 * FEATURES:
 * - Displays recording title and date
 * - Delete button with configurable states
 * - Integrates with Redux for delete operations
 * - Responsive design
 * - Consistent styling across audio components
 * 
 * USAGE CONTEXTS:
 * - AudioPlayer component
 * - RecordingPlayback component  
 * - Any audio playback interface
 */
function AudioPlayerHeader({ 
  title, 
  recordedDate, 
  recordingId,
  onDelete, 
  deleteDisabled = false,
  showDeleteButton = true,
  className = ''
}: AudioPlayerHeaderProps) {

  const dispatch = useAppDispatch()
  const { deleting, deleteError } = useAppSelector(state => state.recordingsList)

  const handleDeleteClick = async () => {
    if (deleteDisabled || deleting) return

    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
    )

    if (!confirmDelete) {
      console.log('🗑️ AudioPlayerHeader: Delete cancelled by user')
      return
    }

    try {
      console.log('🗑️ AudioPlayerHeader: Starting delete process for recording:', {
        id: recordingId,
        title
      })

      if (recordingId) {
        // Dispatch Redux delete action
        const result = await dispatch(deleteRecording(recordingId))
        
        if (deleteRecording.fulfilled.match(result)) {
          console.log('✅ AudioPlayerHeader: Recording deleted successfully')
          
          // Clear current audio if this recording was playing
          dispatch(setCurrentUrl(''))
          dispatch(setActiveRecordingId(null))
          
          // Call custom onDelete callback if provided
          if (onDelete) {
            onDelete()
          }
        } else {
          console.error('❌ AudioPlayerHeader: Delete failed:', result.payload)
        }
      } else {
        console.warn('⚠️ AudioPlayerHeader: No recordingId provided for delete operation')
        
        // Still call custom onDelete callback if provided
        if (onDelete) {
          onDelete()
        }
      }
    } catch (error) {
      console.error('❌ AudioPlayerHeader: Delete error:', error)
    }
  }

  return (
    <div className={`audio-player-header ${className}`.trim()} style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div className="header-info">
        <h3 className="header-title">{title}</h3>
        {recordedDate && (
          <span className="recorded-date">{recordedDate}</span>
        )}
        {deleteError && (
          <div className="delete-error">
            <span className="delete-error-text">Delete failed: {deleteError}</span>
          </div>
        )}
      </div>
      
      {showDeleteButton && (
        <button 
          className="delete-button"
          disabled={deleteDisabled || deleting}
          onClick={handleDeleteClick}
          title={
            deleting 
              ? "Deleting..." 
              : deleteDisabled 
                ? "Delete functionality coming soon" 
                : "Delete this recording"
          }
          type="button"
          aria-label="Delete recording"
        >
          {deleting ? (
            <>⏳ <span className="delete-button-text">Deleting...</span></>
          ) : (
            <>🗑️ <span className="delete-button-text">Delete</span></>
          )}
        </button>
      )}
    </div>
  )
}

export default AudioPlayerHeader
export type { AudioPlayerHeaderProps } 