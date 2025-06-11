import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api'
import type { Recording } from './recordingSlice'

export type SortField = 'id' | 'title' | 'created_at'
export type SortOrder = 'asc' | 'desc'

export interface RecordingsListState {
  recordings: Recording[]
  loading: boolean
  error: string | null
  sortField: SortField
  sortOrder: SortOrder
  deleting: boolean
  deleteError: string | null
}

const initialState: RecordingsListState = {
  recordings: [],
  loading: true,
  error: null,
  sortField: 'created_at',
  sortOrder: 'desc',
  deleting: false,
  deleteError: null,
}

// Async thunk for fetching recordings - updated to use API management
export const fetchRecordings = createAsyncThunk(
  'recordingsList/fetchRecordings',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📋 Redux: Fetching recordings using API management')
      const recordings = await api.recordings.list()
      console.log('✅ Redux: Recordings fetched successfully', { count: recordings.length })
      return recordings
    } catch (error) {
      console.error('❌ Redux: Failed to fetch recordings:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred')
    }
  }
)

// Async thunk for deleting recordings - updated to use API management
export const deleteRecording = createAsyncThunk(
  'recordingsList/deleteRecording',
  async (recordingId: number, { rejectWithValue }) => {
    try {
      console.log('🗑️ Redux: Starting delete recording process using API management for ID:', recordingId)
      
      await api.recordings.delete(recordingId)
      console.log('✅ Redux: Recording deleted successfully via API management')
      
      return recordingId
    } catch (error) {
      console.error('❌ Redux: Delete recording failed:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error occurred')
    }
  }
)

const recordingsListSlice = createSlice({
  name: 'recordingsList',
  initialState,
  reducers: {
    setSortField: (state, action: PayloadAction<SortField>) => {
      state.sortField = action.payload
    },
    setSortOrder: (state, action: PayloadAction<SortOrder>) => {
      state.sortOrder = action.payload
    },
    toggleSortOrder: (state) => {
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc'
    },
    clearError: (state) => {
      state.error = null
    },
    clearDeleteError: (state) => {
      state.deleteError = null
    },
    // Optimistic delete for immediate UI feedback
    removeRecordingOptimistic: (state, action: PayloadAction<number>) => {
      state.recordings = state.recordings.filter(recording => recording.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecordings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRecordings.fulfilled, (state, action) => {
        state.loading = false
        state.recordings = action.payload
        state.error = null
      })
      .addCase(fetchRecordings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete recording reducers
      .addCase(deleteRecording.pending, (state) => {
        state.deleting = true
        state.deleteError = null
      })
      .addCase(deleteRecording.fulfilled, (state, action) => {
        state.deleting = false
        state.deleteError = null
        // Remove the deleted recording from the list
        state.recordings = state.recordings.filter(recording => recording.id !== action.payload)
        console.log('✅ Redux: Recording removed from state, new count:', state.recordings.length)
      })
      .addCase(deleteRecording.rejected, (state, action) => {
        state.deleting = false
        state.deleteError = action.payload as string
        console.error('❌ Redux: Delete recording failed in state:', state.deleteError)
      })
  },
})

export const {
  setSortField,
  setSortOrder,
  toggleSortOrder,
  clearError,
  clearDeleteError,
  removeRecordingOptimistic,
} = recordingsListSlice.actions

export default recordingsListSlice.reducer 