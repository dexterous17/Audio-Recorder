import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface Recording {
  id: number
  title: string
  source: string
  created_at: string
}

export interface RecordingState {
  activeRecordingId: number | null
  selectedRecording: Recording | null
  refreshTrigger: number
}

const initialState: RecordingState = {
  activeRecordingId: null,
  selectedRecording: null,
  refreshTrigger: 0,
}

const recordingSlice = createSlice({
  name: 'recording',
  initialState,
  reducers: {
    setActiveRecordingId: (state, action: PayloadAction<number | null>) => {
      state.activeRecordingId = action.payload
    },
    setSelectedRecording: (state, action: PayloadAction<Recording | null>) => {
      state.selectedRecording = action.payload
    },
    triggerRefresh: (state) => {
      state.refreshTrigger += 1
    },
    clearRecordingState: (state) => {
      state.activeRecordingId = null
      state.selectedRecording = null
    },
    selectRecording: (state, action: PayloadAction<Recording>) => {
      state.selectedRecording = action.payload
      state.activeRecordingId = action.payload.id
    },
  },
})

export const {
  setActiveRecordingId,
  setSelectedRecording,
  triggerRefresh,
  clearRecordingState,
  selectRecording,
} = recordingSlice.actions

export default recordingSlice.reducer 