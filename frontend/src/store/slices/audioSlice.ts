import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AudioState {
  currentUrl: string | null
  recordedBlob: Blob | null
  showRecorder: boolean
  showAudioPlayer: boolean
}

const initialState: AudioState = {
  currentUrl: null,
  recordedBlob: null,
  showRecorder: true,
  showAudioPlayer: false,
}

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setCurrentUrl: (state, action: PayloadAction<string | null>) => {
      state.currentUrl = action.payload
    },
    setRecordedBlob: (state, action: PayloadAction<Blob | null>) => {
      state.recordedBlob = action.payload
    },
    setShowRecorder: (state, action: PayloadAction<boolean>) => {
      state.showRecorder = action.payload
    },
    setShowAudioPlayer: (state, action: PayloadAction<boolean>) => {
      state.showAudioPlayer = action.payload
    },
    clearRecordedBlob: (state) => {
      state.recordedBlob = null
    },
    clearCurrentUrl: (state) => {
      state.currentUrl = null
    },
    switchToRecording: (state) => {
      state.currentUrl = null
      state.recordedBlob = null
      state.showRecorder = true
      state.showAudioPlayer = false
    },
    switchToPlayback: (state) => {
      state.showRecorder = false
      state.showAudioPlayer = true
    },
  },
})

export const {
  setCurrentUrl,
  setRecordedBlob,
  setShowRecorder,
  setShowAudioPlayer,
  clearRecordedBlob,
  clearCurrentUrl,
  switchToRecording,
  switchToPlayback,
} = audioSlice.actions

export default audioSlice.reducer 