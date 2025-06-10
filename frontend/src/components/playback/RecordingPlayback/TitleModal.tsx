import { useState, useEffect, useRef } from 'react'
import './TitleModal.css'

interface TitleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string) => void
  defaultTitle?: string
}

/**
 * 📝 TITLE MODAL COMPONENT
 * 
 * PURPOSE: Modal dialog for entering and validating recording titles
 * 
 * LIFECYCLE WORKFLOW:
 * 1. Opens when isOpen=true → Auto-focus input → Select existing text
 * 2. User input → Real-time validation → Character counting
 * 3. Submit → Validate → Call onSave callback → Close modal
 * 4. Cancel/Escape → Reset form → Call onClose callback
 * 
 * PARENT COMMUNICATION:
 * - Receives: isOpen (boolean), onClose (callback), onSave (callback), defaultTitle (string)
 * - Sends: Validated title string via onSave callback
 * 
 * VALIDATION RULES:
 * - Not empty after trimming
 * - 2-100 characters length
 * - No invalid file characters: < > : " / \ | ? *
 * 
 * USER EXPERIENCE FEATURES:
 * - Auto-focus and text selection on open
 * - Keyboard shortcuts (Escape to cancel, Ctrl/Cmd+Enter to save)
 * - Real-time character counter
 * - Form validation with error messages
 * - Backdrop click to close
 * - Loading state during submission
 * 
 * STATE MANAGEMENT:
 * - title: String - current input value
 * - error: String - validation error messages
 * - isSubmitting: Boolean - prevent double submission
 */
function TitleModal({ isOpen, onClose, onSave, defaultTitle = '' }: TitleModalProps) {
  console.log('🚀 TitleModal: Component initializing', {
    isOpen,
    defaultTitle,
    hasOnClose: !!onClose,
    hasOnSave: !!onSave
  })

  // STATE: Component internal state management
  const [title, setTitle] = useState(defaultTitle)             // Current input value
  const [error, setError] = useState<string | null>(null)      // Validation errors
  const [isSubmitting, setIsSubmitting] = useState(false)      // Submission state
  
  // REFS: Direct access to DOM elements
  const inputRef = useRef<HTMLInputElement>(null)              // Input field reference

  // Log state changes
  useEffect(() => {
    console.log('📊 TitleModal: State updated:', {
      isOpen,
      title: title ? `"${title}"` : 'EMPTY',
      titleLength: title.length,
      error: error ? `ERROR: ${error}` : 'NULL',
      isSubmitting,
      inputRefExists: !!inputRef.current
    })
  }, [isOpen, title, error, isSubmitting])

  // Update title when defaultTitle changes
  useEffect(() => {
    console.log('🔄 TitleModal: defaultTitle changed', { 
      oldTitle: title, 
      newDefaultTitle: defaultTitle 
    })
    setTitle(defaultTitle)
    console.log('✅ TitleModal: title updated to defaultTitle')
  }, [defaultTitle])

  // Focus input when modal opens
  useEffect(() => {
    console.log('🔧 TitleModal: isOpen changed', { isOpen })
    
    if (isOpen) {
      console.log('👁️ TitleModal: Modal opened, attempting to focus input...')
      
      // Clear any previous errors
      setError(null)
      console.log('✅ TitleModal: Error cleared on modal open')
      
      // Reset submitting state
      setIsSubmitting(false)
      console.log('✅ TitleModal: isSubmitting reset to false')
      
      // Focus input field after a short delay to ensure DOM is ready
      setTimeout(() => {
        if (inputRef.current) {
          console.log('🎯 TitleModal: Focusing input field...')
          inputRef.current.focus()
          inputRef.current.select() // Select all text for easy editing
          console.log('✅ TitleModal: Input field focused and text selected')
        } else {
          console.warn('⚠️ TitleModal: Input ref not available for focusing')
        }
      }, 100)
    } else {
      console.log('👁️ TitleModal: Modal closed')
    }
  }, [isOpen])

  const validateTitle = (titleText: string) => {
    console.log('🔍 TitleModal: validateTitle called', { 
      titleText: titleText ? `"${titleText}"` : 'EMPTY',
      length: titleText.length 
    })
    
    const trimmedTitle = titleText.trim()
    console.log('✂️ TitleModal: Title trimmed', { 
      original: titleText, 
      trimmed: trimmedTitle,
      trimmedLength: trimmedTitle.length 
    })
    
    if (!trimmedTitle) {
      console.log('❌ TitleModal: Validation failed - empty title')
      return 'Title cannot be empty'
    }
    
    if (trimmedTitle.length < 2) {
      console.log('❌ TitleModal: Validation failed - title too short')
      return 'Title must be at least 2 characters long'
    }
    
    if (trimmedTitle.length > 100) {
      console.log('❌ TitleModal: Validation failed - title too long')
      return 'Title must be less than 100 characters'
    }
    
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(trimmedTitle)) {
      console.log('❌ TitleModal: Validation failed - invalid characters')
      return 'Title contains invalid characters'
    }
    
    console.log('✅ TitleModal: Title validation passed')
    return null
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    console.log('📝 TitleModal: handleTitleChange called', { 
      oldTitle: title, 
      newTitle: newTitle ? `"${newTitle}"` : 'EMPTY',
      length: newTitle.length 
    })
    
    setTitle(newTitle)
    console.log('✅ TitleModal: title state updated')
    
    // Clear error when user starts typing
    if (error) {
      console.log('🧹 TitleModal: Clearing error as user types')
      setError(null)
      console.log('✅ TitleModal: Error cleared')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('💾 TitleModal: handleSubmit called', { 
      title: title ? `"${title}"` : 'EMPTY',
      isSubmitting 
    })
    
    if (isSubmitting) {
      console.log('⚠️ TitleModal: Submit blocked - already submitting')
      return
    }
    
    try {
      console.log('🔍 TitleModal: Validating title before submit...')
      const validationError = validateTitle(title)
      
      if (validationError) {
        console.log('❌ TitleModal: Submit validation failed:', validationError)
        setError(validationError)
        return
      }
      
      console.log('✅ TitleModal: Validation passed, proceeding with submit')
      setIsSubmitting(true)
      console.log('🔄 TitleModal: isSubmitting set to true')
      
      setError(null)
      console.log('✅ TitleModal: Error cleared before submit')
      
      const trimmedTitle = title.trim()
      console.log('📤 TitleModal: Calling onSave callback with title:', `"${trimmedTitle}"`)
      
      onSave(trimmedTitle)
      console.log('✅ TitleModal: onSave callback completed')
      
      console.log('🔄 TitleModal: Calling onClose callback')
      onClose()
      console.log('✅ TitleModal: onClose callback completed')
      
    } catch (err) {
      console.error('❌ TitleModal: Submit error:', err)
      setError('Failed to save title. Please try again.')
      setIsSubmitting(false)
      console.log('🔄 TitleModal: isSubmitting reset to false due to error')
    }
  }

  const handleCancel = () => {
    console.log('❌ TitleModal: handleCancel called')
    
    try {
      // Reset form state
      console.log('🔄 TitleModal: Resetting form state...')
      setTitle(defaultTitle)
      console.log('✅ TitleModal: title reset to defaultTitle')
      
      setError(null)
      console.log('✅ TitleModal: error cleared')
      
      setIsSubmitting(false)
      console.log('✅ TitleModal: isSubmitting reset to false')
      
      console.log('📤 TitleModal: Calling onClose callback')
      onClose()
      console.log('✅ TitleModal: onClose callback completed')
      
    } catch (err) {
      console.error('❌ TitleModal: Cancel error:', err)
      // Still try to close the modal
      onClose()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    console.log('🖱️ TitleModal: handleBackdropClick called')
    
    // Only close if clicking the backdrop itself, not child elements
    if (e.target === e.currentTarget) {
      console.log('🎯 TitleModal: Backdrop clicked, closing modal')
      handleCancel()
    } else {
      console.log('🎯 TitleModal: Child element clicked, not closing modal')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('⌨️ TitleModal: handleKeyDown called', { key: e.key })
    
    if (e.key === 'Escape') {
      console.log('⌨️ TitleModal: Escape key pressed, canceling')
      e.preventDefault()
      handleCancel()
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      console.log('⌨️ TitleModal: Ctrl/Cmd+Enter pressed, submitting')
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  // Log render decisions
  useEffect(() => {
    console.log('🎨 TitleModal: Render decisions:', {
      willRender: isOpen,
      showError: !!error,
      submitButtonDisabled: !title.trim() || isSubmitting,
      submitButtonText: isSubmitting ? 'Saving...' : 'Save',
      inputValue: title ? `"${title}"` : 'EMPTY'
    })
  })

  if (!isOpen) {
    console.log('👁️ TitleModal: Modal not open, not rendering')
    return null
  }

  console.log('🎨 TitleModal: Rendering modal')

  return (
    <div 
      className="modal-backdrop" 
      onClick={(e) => {
        console.log('🖱️ TitleModal: Backdrop clicked')
        handleBackdropClick(e)
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h3>Enter Recording Title</h3>
          <button 
            onClick={() => {
              console.log('❌ TitleModal: Close button (X) clicked')
              handleCancel()
            }}
            className="modal-close"
            type="button"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={(e) => {
          console.log('📝 TitleModal: Form submitted')
          handleSubmit(e)
        }}>
          <div className="modal-body">
            {error && (
              <div className="modal-error">
                <span>{error}</span>
              </div>
            )}
            
            <div className="form-field">
              <label htmlFor="recording-title">Title:</label>
              <input
                ref={inputRef}
                id="recording-title"
                type="text"
                value={title}
                onChange={(e) => {
                  console.log('📝 TitleModal: Input changed')
                  handleTitleChange(e)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter a title for your recording..."
                maxLength={100}
                disabled={isSubmitting}
                autoComplete="off"
              />
              <small className="field-hint">
                {title.length}/100 characters
              </small>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              onClick={() => {
                console.log('❌ TitleModal: Cancel button clicked')
                handleCancel()
              }}
              className="modal-button cancel-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              className="modal-button save-button"
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TitleModal 