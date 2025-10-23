import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'

import { toast } from 'sonner'
import { apiService } from '~/config/axios'
import { useAuth } from '~/contexts/AuthContext'
import type { LoginRequest, LoginResponse } from '~/types/auth'

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleInputChange = (field: keyof LoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiService.post<LoginResponse>('/auths/login', {
        email: formData.email.trim(),
        password: formData.password
      })

      if (response.succeeded && response.data?.token) {
        const token = response.data?.token
        login(token) // Decode JWT and set user info
        toast.success(response.message || 'Welcome back!')
        navigate(from, { replace: true })
        return
      }
      toast.error('Invalid email or password!')
    } catch (error) {
      console.error('Login error:', error)
      let errorMsg = 'Login failed. Please try again.'
      if (error instanceof Error) {
        errorMsg = error.message
      }
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen w-full bg-white relative'>
      {/* Pastel Wave */}
      <div
        className='absolute inset-0 z-0'
        style={{
          background: 'linear-gradient(120deg, #d5c5ff 0%, #a7f3d0 50%, #f0f0f0 100%)'
        }}
      />
      {/* Your Content/Components */}
      <div className='min-h-screen flex relative items-center justify-center py-12 px-4 sm:px-6 lg:px-8 z-10'>
        <div className='max-w-sm w-full'>
          <div className='bg-sky-300 rounded-xl p-8 shadow-xl'>
            {/* Logo/Brand */}
            <div className='text-center mb-8'>
              <h1 className='text-2xl font-bold text-purple-700 mb-4'>LexiMon</h1>
              <p className='text-white text-sm font-medium'>Welcome back!</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className='w-full px-4 py-3 bg-white/90 border-0 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all'
                  placeholder='example@email.com'
                  disabled={loading}
                />
              </div>

              <div className='relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  required
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className='w-full px-4 py-3 bg-white/90 border-0 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all pr-20'
                  placeholder='Password'
                  disabled={loading}
                />
                <button
                  type='button'
                  onClick={togglePasswordVisibility}
                  className='absolute inset-y-0 right-0 px-4 flex items-center justify-center hover:bg-black/5 rounded-r-lg transition-colors text-gray-600 hover:text-gray-800 min-w-[60px]'
                  disabled={loading}
                >
                  <span className='text-sm font-medium select-none'>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]'
              >
                {loading ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'LOG IN'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
