import axios from 'axios'

// In development, Vite proxies /api to localhost:5000.
// In production, VITE_API_URL points to the deployed backend.
const BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: BASE })

export const createEvent  = (data)         => api.post('/events/', data)
export const getEvent     = (id)           => api.get(`/events/${id}`)
export const joinEvent    = (id, name)     => api.post(`/events/${id}/join`, { name })
export const getResult    = (id)           => api.get(`/events/${id}/result`)
export const submitBulk   = (token, responses) => api.post('/responses/bulk', { token, responses })
