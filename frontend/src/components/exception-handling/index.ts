/**
 * 🚨 EXCEPTION HANDLING COMPONENTS
 * 
 * PURPOSE: Centralized error and notification management system
 * 
 * COMPONENTS:
 * - ErrorMessage: Inline error display with multiple severity levels
 * - ErrorBoundary: Catches JavaScript errors and displays fallback UI
 * - NotificationToast: Temporary notifications with auto-dismiss
 * 
 * USAGE:
 * import { ErrorMessage, ErrorBoundary, NotificationToast } from '@/components/exception-handling'
 */

import { ErrorMessage } from './ErrorMessage'
import type { ErrorMessageProps } from './ErrorMessage'
import { ErrorBoundary } from './ErrorBoundary'
import { NotificationToast } from './NotificationToast'
import type { NotificationToastProps } from './NotificationToast'

// Error handling components
export { ErrorMessage, ErrorBoundary, NotificationToast }
export type { ErrorMessageProps, NotificationToastProps }

// Re-export for convenience
export {
  ErrorMessage as InlineError,
  NotificationToast as Toast,
  ErrorBoundary as CatchErrors
} 