import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api, basicToken, errorMessage, setAuthToken } from '../api/http'

const STORAGE_KEY = 'payments.auth'

function loadSaved() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
    if (saved?.token && saved?.user) {
      setAuthToken(saved.token)
      return saved
    }
  } catch {
    // sessionStorage недоступний або пошкоджений — просто стартуємо без входу
  }
  return { token: null, user: null }
}

function save(state) {
  try {
    if (state.token) sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token: state.token, user: state.user }))
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ігноруємо: вхід просто не переживе перезавантаження сторінки
  }
}

export const login = createAsyncThunk('auth/login', async ({ username, password }, { rejectWithValue }) => {
  const token = basicToken(username, password)
  try {
    const { data } = await api.me(token)
    return { token, user: data }
  } catch (error) {
    if (error.response?.status === 401) return rejectWithValue('Невірний логін або пароль')
    return rejectWithValue(errorMessage(error))
  }
})

const saved = loadSaved()

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: saved.token, user: saved.user, status: 'idle', error: null },
  reducers: {
    logout(state) {
      state.token = null
      state.user = null
      state.error = null
      setAuthToken(null)
      save(state)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle'
        state.token = action.payload.token
        state.user = action.payload.user
        setAuthToken(state.token)
        save(state)
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'idle'
        state.error = action.payload
      })
  },
})

export const { logout } = authSlice.actions

export const selectUser = (state) => state.auth.user
export const selectIsAdmin = (state) => Boolean(state.auth.user?.roles?.includes('Admin'))

export default authSlice.reducer
