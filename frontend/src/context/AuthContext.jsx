import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('aq_token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const me = await authService.getMe()
        setUser(me)
      } catch (err) {
        localStorage.removeItem('aq_token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (email, password) => {
    const { token, user: u } = await authService.login(email, password)
    localStorage.setItem('aq_token', token)
    setUser(u)
    return u
  }

  const signup = async (payload) => {
    const { token, user: u } = await authService.signup(payload)
    localStorage.setItem('aq_token', token)
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('aq_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
