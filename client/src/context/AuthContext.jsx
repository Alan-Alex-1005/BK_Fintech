import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [wallet, setWallet]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate session on mount
  useEffect(() => {
    const token = localStorage.getItem('sfx_token')
    const saved = localStorage.getItem('sfx_user')
    if (token && saved) {
      setUser(JSON.parse(saved))
      fetchWallet()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchWallet = async () => {
    try {
      const { data } = await api.get('/wallet')
      setWallet(data.wallet)
    } catch (_) {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('sfx_token', data.token)
    localStorage.setItem('sfx_user', JSON.stringify(data.user))
    setUser(data.user)
    setWallet(data.wallet)
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('sfx_token', data.token)
    localStorage.setItem('sfx_user', JSON.stringify(data.user))
    setUser(data.user)
    setWallet(data.wallet)
    return data
  }

  const logout = () => {
    localStorage.removeItem('sfx_token')
    localStorage.removeItem('sfx_user')
    setUser(null)
    setWallet(null)
  }

  const refreshWallet = () => fetchWallet()

  return (
    <AuthContext.Provider value={{ user, wallet, loading, login, register, logout, refreshWallet }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
