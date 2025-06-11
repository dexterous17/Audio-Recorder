import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface UIState {
  error: string | null
}

const initialState: UIState = {
  error: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setError,
  clearError,
} = uiSlice.actions

export default uiSlice.reducer 