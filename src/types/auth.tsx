export interface User {
  id: string
  email: string
  role: string
}

// JWT Payload interface for .NET backend
export interface JWTPayload {
  // .NET Identity Claims (long format)
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string

  // Standard JWT claims
  id?: string
  email?: string
  role?: string
  iat?: number // issued at
  exp?: number // expiration time
  iss?: string // issuer
  aud?: string // audience

  [key: string]: unknown
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string) => void // Updated: only need token, will decode to get user
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

export interface AuthProviderProps {
  children: React.ReactNode
}

// Auth API interfaces
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  expiredIn: number
}
