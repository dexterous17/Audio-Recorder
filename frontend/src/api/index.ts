/**
 * 🌐 API MANAGEMENT SYSTEM
 * 
 * PURPOSE: Centralized API client for frontend-backend communication
 * 
 * FEATURES:
 * - Type-safe API calls
 * - Centralized base URL configuration
 * - Error handling and response parsing
 * - Request/response logging
 * - Standardized response format
 * 
 * USAGE:
 * import { api } from '@/api'
 * const recordings = await api.recordings.list()
 * const recording = await api.recordings.delete(id)
 */

// Base configuration
const API_BASE_URL = 'http://localhost:3000/api'

// Types for API responses
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface Recording {
  id: number
  title: string
  source: string
  created_at: string
}

interface RecordingsListResponse {
  items: Recording[]
  total: number
}

interface UploadRecordingResponse {
  file: Recording
  message: string
}

// API Error class
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Base API client
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    console.log('🌐 API: Making request', {
      method: options.method || 'GET',
      url,
      hasBody: !!options.body
    })

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      console.log('📡 API: Response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      let data: ApiResponse<T>
      
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('❌ API: Failed to parse response JSON:', parseError)
        throw new ApiError(
          'Invalid JSON response from server',
          response.status,
          response
        )
      }

      if (!response.ok) {
        console.error('❌ API: Request failed', {
          status: response.status,
          error: data.error || data.message || response.statusText
        })
        
        throw new ApiError(
          data.error || data.message || `Request failed with status ${response.status}`,
          response.status,
          data
        )
      }

      console.log('✅ API: Request successful', { endpoint, success: data.success })
      return data

    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      console.error('❌ API: Network or unexpected error:', error)
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        undefined,
        error
      )
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: FormData | Record<string, unknown>,
    isFormData = false
  ): Promise<ApiResponse<T>> {
    const options: RequestInit = {
      method: 'POST',
    }

    if (data) {
      if (isFormData) {
        options.body = data as FormData
        // Don't set Content-Type for FormData, let browser set it with boundary
      } else {
        options.body = JSON.stringify(data)
        options.headers = {
          'Content-Type': 'application/json',
        }
      }
    }

    return this.request<T>(endpoint, options)
  }

  // PUT request
  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL)

// API endpoints organized by feature
export const api = {
  // Recordings management
  recordings: {
    /**
     * Get all recordings
     */
    async list(): Promise<Recording[]> {
      console.log('📋 API: Fetching recordings list')
      try {
        const response = await apiClient.get<RecordingsListResponse>('/recordings')
        
        if (!response.success || !response.data) {
          throw new ApiError('Invalid response format for recordings list')
        }
        
        console.log('✅ API: Recordings list fetched', { 
          count: response.data.items?.length || 0 
        })
        
        return response.data.items || []
      } catch (error) {
        console.error('❌ API: Failed to fetch recordings list:', error)
        throw error
      }
    },

    /**
     * Get a single recording by ID
     */
    async get(id: number): Promise<Recording> {
      console.log('📄 API: Fetching recording', { id })
      try {
        const response = await apiClient.get<Recording>(`/recordings/${id}`)
        
        if (!response.success || !response.data) {
          throw new ApiError(`Recording ${id} not found`)
        }
        
        console.log('✅ API: Recording fetched', { id, title: response.data.title })
        return response.data
      } catch (error) {
        console.error('❌ API: Failed to fetch recording:', error)
        throw error
      }
    },

    /**
     * Delete a recording by ID
     */
    async delete(id: number): Promise<void> {
      console.log('🗑️ API: Deleting recording', { id })
      try {
        const response = await apiClient.delete(`/recordings/${id}`)
        
        if (!response.success) {
          throw new ApiError(`Failed to delete recording ${id}`)
        }
        
        console.log('✅ API: Recording deleted successfully', { id })
      } catch (error) {
        console.error('❌ API: Failed to delete recording:', error)
        throw error
      }
    },

    /**
     * Upload a new recording
     */
    async upload(
      audioFile: File,
      title: string,
      customFilename?: string
    ): Promise<Recording> {
      console.log('📤 API: Uploading recording', {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        title,
        customFilename
      })
      
      try {
        const formData = new FormData()
        formData.append('audio', audioFile)
        formData.append('title', title)
        
        if (customFilename) {
          formData.append('customFilename', customFilename)
        }
        
        const response = await apiClient.post<UploadRecordingResponse>(
          '/upload',
          formData,
          true // isFormData = true
        )
        
        if (!response.success || !response.data?.file) {
          throw new ApiError('Upload failed - no file data received')
        }
        
        console.log('✅ API: Recording uploaded successfully', {
          id: response.data.file.id,
          title: response.data.file.title
        })
        
        return response.data.file
      } catch (error) {
        console.error('❌ API: Failed to upload recording:', error)
        throw error
      }
    },

    /**
     * Get download URL for a recording
     */
    getDownloadUrl(source: string): string {
      const url = `http://localhost:3000/uploads/${source}`
      console.log('🔗 API: Generated download URL', { source, url })
      return url
    },

    /**
     * Get playback URL for a recording  
     */
    getPlaybackUrl(source: string): string {
      return this.getDownloadUrl(source) // Same as download URL
    }
  },

  // Health check and status
  health: {
    /**
     * Check API server health
     */
    async check(): Promise<{ status: string; timestamp: string }> {
      console.log('🏥 API: Checking server health')
      try {
        const response = await apiClient.get<{ status: string; timestamp: string }>('/health')
        
        console.log('✅ API: Health check passed', response.data)
        return response.data || { status: 'unknown', timestamp: new Date().toISOString() }
      } catch (error) {
        console.error('❌ API: Health check failed:', error)
        throw error
      }
    }
  }
}

// Default export
export default api 