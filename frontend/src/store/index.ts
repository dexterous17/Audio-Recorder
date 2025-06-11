import { configureStore } from '@reduxjs/toolkit'
import audioReducer from './slices/audioSlice'
import recordingReducer from './slices/recordingSlice'
import uiReducer from './slices/uiSlice'
import recordingsListReducer from './slices/recordingsListSlice'

export const store = configureStore({
  reducer: {
    audio: audioReducer,
    recording: recordingReducer,
    ui: uiReducer,
    recordingsList: recordingsListReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['audio/setRecordedBlob'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.blob'],
        // Ignore these paths in the state
        ignoredPaths: ['audio.recordedBlob'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 