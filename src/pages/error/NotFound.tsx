import React from 'react'
import { useNavigate } from 'react-router'

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleGoLogin = () => {
    navigate('/login')
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
      <div className='min-h-screen flex relative items-center justify-center'>
        <div className='max-w-md w-full text-center px-6 py-8'>
          <div className='mb-8'>
            {/* 404 Icon */}
            <div className='mx-auto mb-6 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg'>
              <span className='text-6xl font-bold text-white'>404</span>
            </div>

            {/* Title */}
            <h1 className='text-3xl font-bold text-gray-900 mb-4'>Page Not Found</h1>

            {/* Description */}
            <p className='text-gray-600 mb-8 leading-relaxed'>
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the
              wrong URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='space-y-4'>
            <button
              onClick={handleGoLogin}
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg'
            >
              Go to Login Page
            </button>

            <button
              onClick={handleGoBack}
              className='w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200'
            >
              Go Back
            </button>
          </div>

          {/* Additional Help */}
          <div className='mt-8 pt-6 border-t border-gray-200'>
            <p className='text-sm text-gray-500'>
              Need help? Contact our{' '}
              <a href='mailto:leximon@service.com' className='text-blue-600 hover:text-blue-800 underline'>
                support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
