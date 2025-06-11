# 🚨 Exception Handling System

A comprehensive error and notification management system for the Audio Recording application.

## 📁 Folder Structure
```
exception-handling/
├── ErrorMessage/              # Inline error display component
│   ├── ErrorMessage.tsx
│   ├── ErrorMessage.css
│   └── index.ts
├── ErrorBoundary/             # JavaScript error boundary
│   ├── ErrorBoundary.tsx
│   ├── ErrorBoundary.css
│   └── index.ts
├── NotificationToast/         # Temporary notifications
│   ├── NotificationToast.tsx
│   ├── NotificationToast.css
│   └── index.ts
├── index.ts                   # Main exports
└── README.md                  # This file
```

## 🧩 Components

### 1. ErrorMessage - Inline Error Display
**Purpose:** Display error messages with different severity levels

**Features:**
- Multiple severity levels: `error`, `warning`, `info`
- Auto-dismiss functionality
- Multiple positions: `inline`, `fixed-top`, `fixed-bottom`
- Dismissible with close button
- Accessible with ARIA attributes

**Usage:**
```tsx
import { ErrorMessage } from '@/components/exception-handling'

// Basic error
<ErrorMessage 
  message="Something went wrong" 
  onDismiss={() => setError(null)} 
/>

// Warning with auto-dismiss
<ErrorMessage 
  message="Large file detected" 
  severity="warning" 
  autoDismissAfter={5000} 
/>

// Fixed position info
<ErrorMessage 
  message="Processing your request..." 
  severity="info" 
  position="fixed-top" 
/>
```

### 2. ErrorBoundary - JavaScript Error Catcher
**Purpose:** Catch JavaScript errors in component tree and show fallback UI

**Features:**
- Catches errors during rendering, lifecycle, and constructors
- Customizable fallback UI
- Error logging and reporting
- Reset functionality
- Development vs production modes

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/exception-handling'

// Wrap your app
<ErrorBoundary>
  <App />
</ErrorBoundary>

// With custom error handling
<ErrorBoundary 
  onError={(error, errorInfo) => logToService(error)} 
  showDetails={isDevelopment}
>
  <Component />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary fallback={<CustomErrorPage />}>
  <Widget />
</ErrorBoundary>
```

### 3. NotificationToast - Temporary Notifications
**Purpose:** Show temporary success/error notifications

**Features:**
- Multiple types: `success`, `error`, `warning`, `info`
- Auto-dismiss with progress bar
- Multiple positions: `top-right`, `top-left`, `bottom-right`, etc.
- Smooth animations
- Click to dismiss

**Usage:**
```tsx
import { NotificationToast } from '@/components/exception-handling'

// Success notification
<NotificationToast 
  message="Recording saved successfully!" 
  type="success" 
  duration={3000} 
  onDismiss={clearNotification}
/>

// Error notification
<NotificationToast 
  message="Upload failed. Please try again." 
  type="error" 
  position="top-center"
/>

// Info with custom position
<NotificationToast 
  message="Processing upload..." 
  type="info" 
  position="bottom-left" 
  showDismissButton={false}
/>
```

## 🎨 Styling

### Severity Levels
- **Error (Red):** `#e53e3e` - Critical issues
- **Warning (Orange):** `#f6ad55` - Important notices
- **Info (Blue):** `#4299e1` - General information
- **Success (Green):** `#48bb78` - Positive feedback

### Responsive Design
All components are fully responsive:
- **Desktop:** Full features and spacing
- **Tablet:** Adjusted padding and sizing
- **Mobile:** Compact layout, full-width toasts

## 🔧 Integration Examples

### Replace existing error handling in App.tsx:
```tsx
// Before
{error && (
  <div className="app-error-message">
    <span>{error}</span>
    <button onClick={clearError}>×</button>
  </div>
)}

// After
<ErrorMessage 
  message={error} 
  severity="error" 
  onDismiss={clearError} 
/>
```

### Add success notifications:
```tsx
// After recording save
<NotificationToast 
  message="Recording saved successfully!" 
  type="success" 
  duration={4000} 
  onDismiss={() => setSuccessMessage(null)}
/>

// After delete
<NotificationToast 
  message="Recording deleted" 
  type="success" 
  duration={3000} 
/>
```

### Wrap components with ErrorBoundary:
```tsx
// In main.tsx or App.tsx
<ErrorBoundary 
  onError={(error) => console.error('App Error:', error)}
  showDetails={process.env.NODE_ENV === 'development'}
>
  <App />
</ErrorBoundary>
```

## 🚀 Benefits

1. **Consistent UI:** All errors/notifications look and behave the same
2. **Accessibility:** Proper ARIA attributes and keyboard support
3. **Developer Experience:** Clear naming and comprehensive props
4. **Maintainability:** Centralized error handling logic
5. **User Experience:** Smooth animations and intuitive interactions

## 📱 Responsive Behavior

- **Desktop:** Full-featured with hover effects
- **Tablet:** Adjusted spacing and button sizes
- **Mobile:** Compact layout, full-width positioning
- **Toast Stacking:** Multiple notifications stack properly

## 🔍 Quick Reference

| Component | Purpose | Best For |
|-----------|---------|----------|
| `ErrorMessage` | Inline errors | Form validation, API errors |
| `ErrorBoundary` | JS error catching | App-level error protection |
| `NotificationToast` | Temporary feedback | Success messages, quick alerts |

Import all at once:
```tsx
import { 
  ErrorMessage, 
  ErrorBoundary, 
  NotificationToast,
  // Aliases
  InlineError,
  CatchErrors,
  Toast
} from '@/components/exception-handling'
``` 