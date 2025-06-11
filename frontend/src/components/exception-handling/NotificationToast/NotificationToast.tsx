import { useState, useEffect } from 'react'
import './NotificationToast.css'

export interface NotificationToastProps {
  /** The notification message to display */
  message: string | null
  /** Notification type affects styling and icon */
  type?: 'success' | 'error' | 'warning' | 'info'
  /** Auto-dismiss after specified milliseconds (0 = no auto-dismiss) */
  duration?: number
  /** Callback when notification is dismissed */
  onDismiss?: () => void
  /** Position of the toast */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  /** Show/hide the dismiss button */
  showDismissButton?: boolean
  /** Additional CSS class names */
  className?: string
}

/**
 * 🔔 NOTIFICATION TOAST COMPONENT
 * 
 * PURPOSE: Temporary notification messages with auto-dismiss functionality
 * 
 * FEATURES:
 * - Multiple notification types (success, error, warning, info)
 * - Auto-dismiss with customizable duration
 * - Multiple positioning options
 * - Smooth slide-in/slide-out animations
 * - Click to dismiss
 * - Stacking support for multiple toasts
 * - Accessible with proper ARIA attributes
 * 
 * USAGE EXAMPLES:
 * - <NotificationToast message="Recording saved!" type="success" duration={3000} />
 * - <NotificationToast message="Upload failed" type="error" onDismiss={clearNotification} />
 * - <NotificationToast message="Processing..." type="info" position="top-center" />
 */
function NotificationToast({
  message,
  type = 'info',
  duration = 4000,
  onDismiss,
  position = 'top-right',
  showDismissButton = true,
  className = ''
}: NotificationToastProps) {
  console.log('🔔 NotificationToast: Component rendering', {
    hasMessage: !!message,
    message: message ? `"${message}"` : 'NULL',
    type,
    position,
    duration,
    showDismissButton
  })

  const [isVisible, setIsVisible] = useState(!!message)
  const [isAnimating, setIsAnimating] = useState(false)

  // Handle visibility changes when message prop changes
  useEffect(() => {
    console.log('🔄 NotificationToast: Message changed', { 
      newMessage: message,
      wasVisible: isVisible,
      willShow: !!message 
    })
    
    if (message) {
      setIsVisible(true)
      setIsAnimating(true)
      
      // Trigger slide-in animation
      setTimeout(() => setIsAnimating(false), 50)
    } else {
      setIsVisible(false)
    }
  }, [message])

  // Handle auto-dismiss
  useEffect(() => {
    if (message && duration > 0) {
      console.log('⏰ NotificationToast: Setting up auto-dismiss', { 
        after: duration,
        message 
      })
      
      const timeout = setTimeout(() => {
        console.log('⏰ NotificationToast: Auto-dismissing after timeout')
        handleDismiss()
      }, duration)
      
      return () => {
        clearTimeout(timeout)
        console.log('🧹 NotificationToast: Auto-dismiss timeout cleaned up')
      }
    }
  }, [message, duration])

  const handleDismiss = () => {
    console.log('❌ NotificationToast: handleDismiss called')
    
    try {
      // Trigger slide-out animation
      setIsAnimating(true)
      
      setTimeout(() => {
        setIsVisible(false)
        setIsAnimating(false)
        
        // Call parent callback if provided
        if (onDismiss) {
          console.log('📤 NotificationToast: Calling onDismiss callback')
          onDismiss()
          console.log('✅ NotificationToast: onDismiss callback completed')
        }
      }, 300) // Match animation duration
      
    } catch (error) {
      console.error('❌ NotificationToast: Error in handleDismiss:', error)
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  // Don't render if no message or not visible
  if (!message || !isVisible) {
    console.log('👁️ NotificationToast: Not rendering (no message or not visible)')
    return null
  }

  const cssClasses = [
    'notification-toast',
    `notification-toast--${type}`,
    `notification-toast--${position}`,
    isAnimating ? 'notification-toast--animating' : '',
    className
  ].filter(Boolean).join(' ')

  console.log('🎨 NotificationToast: Rendering notification toast', {
    cssClasses,
    icon: getIcon(),
    hasMessage: !!message,
    showDismissButton
  })

  return (
    <div
      className={cssClasses}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      onClick={handleDismiss}
    >
      <div className="notification-toast__content">
        <span className="notification-toast__icon" aria-hidden="true">
          {getIcon()}
        </span>
        
        <span className="notification-toast__message">
          {message}
        </span>
        
        {showDismissButton && (
          <button
            onClick={(e) => {
              e.stopPropagation() // Prevent double dismiss from container click
              handleDismiss()
            }}
            className="notification-toast__dismiss"
            type="button"
            aria-label="Dismiss notification"
            title="Close notification"
          >
            ×
          </button>
        )}
      </div>
      
      {duration > 0 && (
        <div 
          className="notification-toast__progress"
          style={{
            animationDuration: `${duration}ms`
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default NotificationToast 