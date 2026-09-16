import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Farmer, Operator, Manager } from '../types'

interface AuthContextType {
  user: User | null
  userData: Farmer | Operator | Manager | null
  login: (user: User, userData: Farmer | Operator | Manager) => void
  logout: () => void
  setUser: (user: User | null) => void
  setUserData: (userData: Farmer | Operator | Manager | null) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) as User : null
  })
  const [userData, setUserData] = useState<Farmer | Operator | Manager | null>(() => {
    const stored = localStorage.getItem('userData')
    return stored ? JSON.parse(stored) as Farmer | Operator | Manager : null
  })

  const login = (user: User, userData: Farmer | Operator | Manager) => {
    setUser(user)
    setUserData(userData)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('userData', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setUserData(null)
    localStorage.removeItem('user')
    localStorage.removeItem('userData')
  }

  return (
    <AuthContext.Provider value={{ user, userData, login, logout, setUser, setUserData, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}