import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User, AuthContextType, AuthProviderProps } from '~/types/auth'
import { decodeToken, isTokenExpired, isValidJWT } from '~/utils/jwt'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')

    if (savedToken) {
      try {
        // Validate JWT format and check if expired
        if (!isValidJWT(savedToken)) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setLoading(false)
          return
        }

        if (isTokenExpired(savedToken)) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setLoading(false)
          return
        }

        // Decode token to get user info
        const decodedUser = decodeToken(savedToken)
        if (decodedUser) {
          setToken(savedToken)
          setUser(decodedUser)
        } else {
          console.error('Failed to decode JWT token')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error processing saved token:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = (newToken: string) => {
    try {
      // Validate and decode the new token
      const isValid = isValidJWT(newToken)
      if (!isValid) {
        throw new Error('Invalid JWT token format')
      }

      const isExpired = isTokenExpired(newToken)
      if (isExpired) {
        throw new Error('JWT token has expired')
      }

      const decodedUser = decodeToken(newToken)
      if (!decodedUser) {
        throw new Error('Failed to decode JWT token')
      }

      // Save token and user data
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(decodedUser))
      setToken(newToken)
      setUser(decodedUser)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
