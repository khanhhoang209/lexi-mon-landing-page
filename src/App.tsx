import React, { useEffect } from 'react'
import { Toaster } from 'sonner'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router'
import { AuthProvider } from '~/contexts/AuthContext'
import { setNavigate } from '~/config/axios'
import LoginPage from '~/pages/auth/LoginPage'
import ProtectedRoute from '~/components/auth/ProtectedRoute'
import NotFound from '~/pages/error/NotFound'
import HelloPage from '~/pages/HelloPage'
const AppRoutes: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  return (
    <Routes>
      {/* Public routes */}
      <Route path='/login' element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <HelloPage />
          </ProtectedRoute>
        }
      />

      {/* 404 page */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
        <Toaster position='top-right' richColors closeButton duration={4000} />
      </BrowserRouter>
    </>
  )
}

export default App
