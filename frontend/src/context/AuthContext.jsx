import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!localStorage.getItem('token'))

  // Restore the session from a saved token on page load
  useEffect(() => {
    if (!localStorage.getItem('token')) return
    authService
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const handleAuth = (data) => {
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  const login = async (creds) => handleAuth(await authService.login(creds))
  const register = async (info) => handleAuth(await authService.register(info))
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}
