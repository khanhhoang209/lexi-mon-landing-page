import { jwtDecode } from 'jwt-decode'
import type { JWTPayload, User } from '~/types/auth'

/**
 * Decode JWT token and extract user information
 * Supports both .NET Identity claims and standard JWT claims
 */
export const decodeToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token)

    // Extract user info from .NET Identity claims or standard claims
    const id = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.id
    const email = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email
    const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role

    // Validate required fields
    if (!id || !email || !role) {
      console.error('JWT token missing required fields:', {
        id,
        email,
        role,
        decoded
      })
      return null
    }

    return {
      id,
      email,
      role
    }
  } catch (error) {
    console.error('Error decoding JWT token:', error)
    return null
  }
}

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token)

    if (!decoded.exp) {
      return false // No expiration time, assume valid
    }

    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true // Assume expired if can't decode
  }
}

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token)

    if (!decoded.exp) {
      return null
    }

    return new Date(decoded.exp * 1000)
  } catch (error) {
    console.error('Error getting token expiration:', error)
    return null
  }
}

/**
 * Validate JWT token format and structure
 * Supports both .NET Identity claims and standard JWT claims
 */
export const isValidJWT = (token: string): boolean => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return false
    }

    const decoded = jwtDecode<JWTPayload>(token)

    // Check for .NET Identity claims or standard claims
    const hasId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.id
    const hasEmail = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email
    const hasRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role

    return !!(hasId && hasEmail && hasRole)
  } catch {
    return false
  }
}
