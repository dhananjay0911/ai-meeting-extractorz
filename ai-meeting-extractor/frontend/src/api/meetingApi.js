import axios from 'axios'

const API_BASE = 'https://ai-meeting-backend-hyi0.onrender.com/api'

export const extractTasks = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axios.post(`${API_BASE}/extract`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}