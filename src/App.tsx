import React, { useEffect } from 'react'
import { Toaster } from 'sonner'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router'
import { AuthProvider } from '~/contexts/AuthContext'
import { setNavigate } from '~/config/axios'
import LoginPage from '~/pages/auth/LoginPage'
import ProtectedRoute from '~/components/auth/ProtectedRoute'
import NotFound from '~/pages/error/NotFound'
// import HelloPage from '~/pages/HelloPage'
import ShopPage from '~/pages/ShopPage'
import PaymentSuccess from '~/pages/payment/PaymentSuccess'
import PaymentFailed from '~/pages/payment/PaymentFailed'
import OrderHistoryPage from '~/pages/OrderHistoryPage'
import CourseDetailPage from '~/pages/CourseDetailPage'
import ItemDetailPage from '~/pages/ItemDetailPage'

const AppRoutes: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  return (
    <Routes>
      {/* Public routes */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/shop' element={<ShopPage />} />
      <Route path='/shop/courses/:id' element={<CourseDetailPage />} />
      <Route path='/shop/items/:id' element={<ItemDetailPage />} />

      {/* Payment callback routes*/}
      <Route path='/payments/return' element={<PaymentSuccess />} />
      <Route path='/payments/cancel' element={<PaymentFailed />} />

      {/* Protected routes */}
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <ShopPage />
          </ProtectedRoute>
        }
      />

      <Route
        path='/orders'
        element={
          <ProtectedRoute>
            <OrderHistoryPage />
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
