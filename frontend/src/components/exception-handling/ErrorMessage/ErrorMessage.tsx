import { useState, useEffect } from 'react'
import './ErrorMessage.css'

export interface ErrorMessageProps {
  /** The error message to display */
  message: string | null
  /** Optional title for the error */
  title?: string
  /** Callback when error is dismissed */
  onDismiss?: () => void
  /** Auto-dismiss after specified milliseconds (0 = no auto-dismiss) */
  autoDismissAfter?: number
  /** Error severity level affects styling */
  severity?: 'error' | 'warning' | 'info'
  /** Show/hide the dismiss button */
  showDismissButton?: boolean
  /** Additional CSS class names */
  className?: string
  /** Position of the error message */
  position?: 'inline' | 'fixed-top' | 'fixed-bottom'
}

/**
 * 🚨 ERROR MESSAGE COMPONENT
 * 
 * PURPOSE: Reusable error display component with flexible styling and behavior
 * 
 * FEATURES:
 * - Multiple severity levels (error, warning, info)
 * - Auto-dismiss functionality
 * - Customizable positioning (inline, fixed-top, fixed-bottom)
 * - Dismissible with close button
 * - Accessible with proper ARIA attributes
 * - Smooth animations for show/hide
 * 
 * USAGE EXAMPLES:
 * - <ErrorMessage message="Something went wrong" onDismiss={clearError} />
 * - <ErrorMessage message="Upload failed" severity="error" autoDismissAfter={5000} />
 * - <ErrorMessage message="Warning: Large file" severity="warning" position="fixed-top" />
 */
function ErrorMessage({
  message,
  title,
  onDismiss,
  autoDismissAfter = 0,
  severity = 'error',
  showDismissButton = true,
  className = '',
  position = 'inline'
}: ErrorMessageProps) {
  console.log('🚨 ErrorMessage: Component rendering', {
    hasMessage: !!message,
    message: message ? `"${message}"` : 'NULL',
    title,
    severity,
    position,
    autoDismissAfter,
    showDismissButton
  })

  const [isVisible, setIsVisible] = useState(!!message)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  // Handle visibility changes when message prop changes
  useEffect(() => {
    console.log('🔄 ErrorMessage: Message changed', { 
      newMessage: message,
      wasVisible: isVisible,
      willShow: !!message 
    })
    
    setIsVisible(!!message)
    
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
      console.log('🧹 ErrorMessage: Cleared existing auto-dismiss timeout')
    }
  }, [message])

  // Handle auto-dismiss
  useEffect(() => {
    if (message && autoDismissAfter > 0) {
      console.log('⏰ ErrorMessage: Setting up auto-dismiss', { 
        after: autoDismissAfter,
        message 
      })
      
      const timeout = setTimeout(() => {
        console.log('⏰ ErrorMessage: Auto-dismissing after timeout')
        handleDismiss()
      }, autoDismissAfter)
      
      setTimeoutId(timeout)
      
      return () => {
        clearTimeout(timeout)
        console.log('🧹 ErrorMessage: Auto-dismiss timeout cleaned up')
      }
    }
  }, [message, autoDismissAfter])

  const handleDismiss = () => {
    console.log('❌ ErrorMessage: handleDismiss called')
    
    try {
      setIsVisible(false)
      console.log('✅ ErrorMessage: Visibility set to false')
      
      // Clear timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
        console.log('🧹 ErrorMessage: Auto-dismiss timeout cleared on manual dismiss')
      }
      
      // Call parent callback if provided
      if (onDismiss) {
        console.log('📤 ErrorMessage: Calling onDismiss callback')
        onDismiss()
        console.log('✅ ErrorMessage: onDismiss callback completed')
      }
    } catch (error) {
      console.error('❌ ErrorMessage: Error in handleDismiss:', error)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      console.log('⌨️ ErrorMessage: Escape key pressed')
      handleDismiss()
    }
  }

  // Don't render if no message or not visible
  if (!message || !isVisible) {
    console.log('👁️ ErrorMessage: Not rendering (no message or not visible)')
    return null
  }

  const cssClasses = [
    'error-message',
    `error-message--${severity}`,
    `error-message--${position}`,
    className
  ].filter(Boolean).join(' ')

  console.log('🎨 ErrorMessage: Rendering error message', {
    cssClasses,
    hasTitle: !!title,
    hasMessage: !!message,
    showDismissButton
  })

  return (
    <div
      className={cssClasses}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="error-message__content">
        {title && (
          <div className="error-message__title">
            <span className="error-message__icon" aria-hidden="true">
              {severity === 'error' && '❌'}
              {severity === 'warning' && '⚠️'}
              {severity === 'info' && 'ℹ️'}
            </span>
            <strong>{title}</strong>
          </div>
        )}
        
        <div className="error-message__text">
          {!title && (
            <span className="error-message__icon" aria-hidden="true">
              {severity === 'error' && '❌'}
              {severity === 'warning' && '⚠️'}
              {severity === 'info' && 'ℹ️'}
            </span>
          )}
          <span>{message}</span>
        </div>
        
        {showDismissButton && (
          <button
            onClick={handleDismiss}
            className="error-message__dismiss"
            type="button"
            aria-label="Dismiss error message"
            title="Close error message"
          >
            ×
          </button>
        )}
      </div>
      
      {autoDismissAfter > 0 && (
        <div 
          className="error-message__progress"
          style={{
            animationDuration: `${autoDismissAfter}ms`
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default ErrorMessage 