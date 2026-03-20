import axios from 'axios'

const API_BASE = '/api'

export const extractTasks = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axios.post(`${API_BASE}/extract`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

export const getSupportedFormats = async () => {
  const response = await axios.get(`${API_BASE}/supported-formats`)
  return response.data
}
