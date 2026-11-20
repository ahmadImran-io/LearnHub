import axios from 'axios'

// Axios instance used by every service. Attaches the JWT to each request.
const api = axios.create({ baseURL: (import.meta.env.VITE_API_URL || '') + '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Turns any failure into a readable message
export const errMsg = (err) =>
  err.response?.data?.message || (err.request ? 'Cannot reach the server. Is the backend running?' : err.message)

export default api
