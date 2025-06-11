import { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorMessage } from '../ErrorMessage'
import './ErrorBoundary.css'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Custom fallback component to render on error */
  fallback?: ReactNode
  /** Callback when an error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Whether to show detailed error information (useful for development) */
  showDetails?: boolean
  /** Custom error message to display */
  errorMessage?: string
  /** Whether to show a reset button */
  showResetButton?: boolean
  /** Custom reset button text */
  resetButtonText?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * 🛡️ ERROR BOUNDARY COMPONENT
 * 
 * PURPOSE: Catches JavaScript errors in component tree and displays fallback UI
 * 
 * FEATURES:
 * - Catches errors during rendering, lifecycle methods, and constructors
 * - Customizable fallback UI
 * - Error logging and reporting
 * - Reset functionality to attempt recovery
 * - Development mode with detailed error information
 * - Production mode with user-friendly messages
 * 
 * USAGE EXAMPLES:
 * - <ErrorBoundary><App /></ErrorBoundary>
 * - <ErrorBoundary onError={logError} showDetails={isDev}><Component /></ErrorBoundary>
 * - <ErrorBoundary fallback={<CustomErrorUI />}><Widget /></ErrorBoundary>
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
    
    console.log('🛡️ ErrorBoundary: Component initialized')
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    console.error('🛡️ ErrorBoundary: Error caught by getDerivedStateFromError:', error)
    
    // Update state to trigger fallback UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🛡️ ErrorBoundary: Error caught by componentDidCatch:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name
    })
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    })
    
    // Call custom error handler if provided
    if (this.props.onError) {
      console.log('📤 ErrorBoundary: Calling custom onError handler')
      try {
        this.props.onError(error, errorInfo)
        console.log('✅ ErrorBoundary: Custom onError handler completed')
      } catch (handlerError) {
        console.error('❌ ErrorBoundary: Error in custom onError handler:', handlerError)
      }
    }
    
    // Log error for monitoring/analytics
    this.logError(error, errorInfo)
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    console.group('🛡️ ErrorBoundary: Error Report')
    console.error('Error:', error)
    console.error('Error Message:', error.message)
    console.error('Error Stack:', error.stack)
    console.error('Component Stack:', errorInfo.componentStack)
    console.error('Error Boundary:', this.constructor.name)
    console.error('Props:', this.props)
    console.error('State:', this.state)
    console.groupEnd()
    
    // Here you could send error to monitoring service
    // Example: sendToErrorReporting(error, errorInfo)
  }

  private handleReset = () => {
    console.log('🔄 ErrorBoundary: Reset button clicked')
    
    try {
      console.log('🔄 ErrorBoundary: Resetting error boundary state')
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      })
      console.log('✅ ErrorBoundary: Error boundary state reset successfully')
    } catch (resetError) {
      console.error('❌ ErrorBoundary: Error during reset:', resetError)
    }
  }

  render() {
    if (this.state.hasError) {
      console.log('🛡️ ErrorBoundary: Rendering error fallback UI', {
        hasCustomFallback: !!this.props.fallback,
        showDetails: this.props.showDetails,
        showResetButton: this.props.showResetButton
      })
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        console.log('🎨 ErrorBoundary: Using custom fallback component')
        return this.props.fallback
      }
      
      // Default error UI
      const isDevelopment = process.env.NODE_ENV === 'development'
      const showDetails = this.props.showDetails ?? isDevelopment
      
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__header">
              <div className="error-boundary__icon">💥</div>
              <h2 className="error-boundary__title">Something went wrong</h2>
            </div>
            
            <ErrorMessage
              message={
                this.props.errorMessage || 
                "An unexpected error occurred. Please try refreshing the page."
              }
              severity="error"
              showDismissButton={false}
              position="inline"
            />
            
            {showDetails && this.state.error && (
              <details className="error-boundary__details">
                <summary>Technical Details (Development Mode)</summary>
                <div className="error-boundary__technical">
                  <div className="error-boundary__section">
                    <h4>Error Message:</h4>
                    <code>{this.state.error.message}</code>
                  </div>
                  
                  {this.state.error.stack && (
                    <div className="error-boundary__section">
                      <h4>Stack Trace:</h4>
                      <pre className="error-boundary__stack">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div className="error-boundary__section">
                      <h4>Component Stack:</h4>
                      <pre className="error-boundary__stack">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="error-boundary__actions">
              {this.props.showResetButton !== false && (
                <button
                  onClick={this.handleReset}
                  className="error-boundary__reset-button"
                  type="button"
                >
                  {this.props.resetButtonText || 'Try Again'}
                </button>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="error-boundary__refresh-button"
                type="button"
              >
                Refresh Page
              </button>
            </div>
            
            <div className="error-boundary__help">
              <p>If this problem persists, please:</p>
              <ul>
                <li>Try refreshing the page</li>
                <li>Clear your browser cache</li>
                <li>Check your internet connection</li>
                <li>Contact support if the issue continues</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
    
    // No error, render children normally
    console.log('🛡️ ErrorBoundary: No error, rendering children normally')
    return this.props.children
  }
}

export default ErrorBoundary 