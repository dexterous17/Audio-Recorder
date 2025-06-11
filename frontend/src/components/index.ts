// 🏗️ Component Exports - Organized by Parent-Child Relationships
// This index file maintains easy imports while reflecting the new folder structure

// LAYOUT COMPONENTS (Independent)
export { default as Menu } from './layout/Menu'
export { default as AudioPlayerHeader } from './layout/AudioPlayerHeader'

// RECORDING COMPONENTS (Direct children of App)
export { default as AudioRecorder } from './recording/AudioRecorder'

// PLAYBACK COMPONENTS (Direct children of App + their children)
export { default as RecordingPlayback } from './playback/RecordingPlayback/RecordingPlayback'
export { default as TitleModal } from './playback/RecordingPlayback/TitleModal'
export { default as AudioPlayer } from './playback/AudioPlayer'

// RECORDINGS COMPONENTS (Direct children of App + their children)
export { default as RecordingsList } from './recordings/RecordingsList/RecordingsList'
export { default as RecordingCard } from './recordings/RecordingsList/RecordingCard'

// Re-export all components for backward compatibility
export * from './layout/Menu'
export * from './layout/AudioPlayerHeader'
export * from './recording/AudioRecorder'
export * from './playback/RecordingPlayback/RecordingPlayback'
export * from './playback/RecordingPlayback/TitleModal'
export * from './playback/AudioPlayer'
export * from './recordings/RecordingsList/RecordingsList'
export * from './recordings/RecordingsList/RecordingCard' 