import axios from 'axios'
import { curriculum } from './curriculum'
import { createInitialProgress, defaultProfile, loadProgress, saveProgress } from './progressTracker'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 2000,
})

export const api = {
  async getProfile() {
    try {
      const response = await apiClient.get('/user/profile')
      return response.data
    } catch {
      return defaultProfile
    }
  },
  async getProgress() {
    try {
      const response = await apiClient.get('/progress')
      return response.data
    } catch {
      return loadProgress()
    }
  },
  async updateProgress(progress = createInitialProgress()) {
    try {
      const response = await apiClient.post('/progress', progress)
      return response.data
    } catch {
      saveProgress(progress)
      return progress
    }
  },
  async getLessons() {
    try {
      const response = await apiClient.get('/lessons')
      return response.data
    } catch {
      return curriculum
    }
  },
  async getAchievements() {
    try {
      const response = await apiClient.get('/achievements')
      return response.data
    } catch {
      return []
    }
  },
  async recordXp(amount: number) {
    try {
      const response = await apiClient.post('/xp', { amount })
      return response.data
    } catch {
      return { amount }
    }
  },
}
