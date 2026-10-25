import axios from 'axios'

// Усі запити йдуть на /api/* — Vite проксує їх на Spring Boot (localhost:8080)
const http = axios.create({
  baseURL: '/api',
  headers: {
    // бекенд не надсилатиме WWW-Authenticate -> браузер не покаже своє вікно логіну
    'X-Requested-With': 'XMLHttpRequest',
  },
})

let authToken = null
let unauthorizedHandler = null

export function setAuthToken(token) {
  authToken = token
}

export function onUnauthorized(handler) {
  unauthorizedHandler = handler
}

export function basicToken(username, password) {
  // btoa не підтримує кирилицю -> спочатку кодуємо в UTF-8
  const bytes = new TextEncoder().encode(`${username}:${password}`)
  return btoa(String.fromCharCode(...bytes))
}

http.interceptors.request.use((config) => {
  if (authToken && !config.headers.Authorization) {
    config.headers.Authorization = `Basic ${authToken}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCheck = error.config?.headers?.['X-Login-Check']
    if (error.response?.status === 401 && !isLoginCheck && unauthorizedHandler) {
      unauthorizedHandler()
    }
    return Promise.reject(error)
  },
)

/** Текст помилки з відповіді бекенду (ProblemDetail.detail або стандартна помилка Spring). */
export function errorMessage(error) {
  const data = error.response?.data
  if (data?.detail) return data.detail
  if (data?.message) return data.message
  if (error.response?.status === 403) return 'Недостатньо прав для цієї дії'
  if (error.response?.status === 404) return 'Запис не знайдено'
  if (!error.response) return 'Сервер недоступний. Перевірте, чи запущено бекенд.'
  return data?.error || error.message
}

export const api = {
  me: (token) => http.get('/me', { headers: { Authorization: `Basic ${token}`, 'X-Login-Check': '1' } }),
  register: (body) => http.post('/register', body),

  clients: () => http.get('/clients'),
  createClient: (body) => http.post('/clients', body),
  updateClient: (id, body) => http.put(`/clients/${id}`, body),
  deleteClient: (id) => http.delete(`/clients/${id}`),

  accounts: () => http.get('/accounts'),
  createAccount: (body) => http.post('/accounts', body),
  updateAccount: (id, body) => http.put(`/accounts/${id}`, body),
  deleteAccount: (id) => http.delete(`/accounts/${id}`),

  operations: () => http.get('/operations'),
  createOperation: (body) => http.post('/operations', body),
  updateOperation: (id, body) => http.put(`/operations/${id}`, body),
  deleteOperation: (id) => http.delete(`/operations/${id}`),

  recipients: () => http.get('/recipients'),
  adminUsers: () => http.get('/admin/users'),
}
