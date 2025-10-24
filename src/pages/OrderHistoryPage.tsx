import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import axios from '~/config/axios'
import type { PaginatedResponse } from '~/types/api'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import Footer from '~/components/Footer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog'
import { toast } from 'sonner'
import {
  Package,
  ShoppingCart,
  Loader2,
  RefreshCcw,
  CheckCircle2,
  Clock,
  XCircle,
  LogOut,
  User,
  Calendar,
  DollarSign,
  BookOpen,
  Filter,
  History,
  Crown,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '~/contexts/AuthContext'
import { retryWithBackoff } from '~/utils/errorHandler'

interface Order {
  id: string
  courseId?: string
  itemId?: string
  courseTitle?: string
  itemName?: string
  purchaseCost: number
  coinCost: number
  paidAt: string | null
  paymentStatus: number
  createdAt: string
  updatedAt: string
}

const PaymentStatusMap: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
  0: {
    label: 'Chờ thanh toán',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: <Clock className='w-4 h-4' />
  },
  1: {
    label: 'Đã thanh toán',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: <CheckCircle2 className='w-4 h-4' />
  },
  3: {
    label: 'Đã hủy',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: <XCircle className='w-4 h-4' />
  },
  2: {
    label: 'Thất bại',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: <XCircle className='w-4 h-4' />
  }
}

const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filterStatus, setFilterStatus] = useState<number | null>(null)

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    order: Order | null
    isProcessing: boolean
  }>({
    open: false,
    order: null,
    isProcessing: false
  })

  const fetchOrders = React.useCallback(async () => {
    setLoading(true)
    try {
      const params: {
        Page: number
        PageSize: number
        PaymentStatus?: number
      } = {
        Page: page,
        PageSize: pageSize
      }

      if (filterStatus !== null) {
        params.PaymentStatus = filterStatus
      }

      const { data } = await axios.get<PaginatedResponse<Order>>('/orders/users', {
        params
      })

      if (data && data.data && Array.isArray(data.data)) {
        setOrders(data.data)
        setTotalPages(data.totalPages || 1)
        setTotalCount(data.totalCount || 0)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Không thể tải lịch sử đơn hàng')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filterStatus])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [fetchOrders, isAuthenticated, navigate])

  const handleRetryPayment = (order: Order) => {
    setConfirmDialog({
      open: true,
      order,
      isProcessing: false
    })
  }

  const handleConfirmRetry = async () => {
    const order = confirmDialog.order
    if (!order) return

    setConfirmDialog((prev) => ({ ...prev, isProcessing: true }))

    try {
      toast.info('Đang tạo phiên thanh toán mới...')

      const { data: paymentResponse } = await retryWithBackoff(() => axios.post(`/payments/${order.id}`), {
        maxRetries: 3,
        baseDelay: 1000
      })

      if (!paymentResponse.succeeded) {
        throw new Error(paymentResponse.message || 'Không thể tạo thanh toán')
      }

      const checkoutUrl = paymentResponse.data?.checkoutUrl

      if (!checkoutUrl) {
        throw new Error('Không nhận được link thanh toán')
      }

      toast.success('Đang chuyển đến trang thanh toán...')
      await new Promise((resolve) => setTimeout(resolve, 500))
      window.location.href = checkoutUrl
    } catch (error: unknown) {
      console.error('Retry payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo phiên thanh toán mới'
      toast.error(errorMessage)
    } finally {
      setConfirmDialog({
        open: false,
        order: null,
        isProcessing: false
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && page === 1) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 animate-spin mx-auto mb-4 text-blue-600' />
          <p className='text-gray-600'>Đang tải lịch sử đơn hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
      {/* Sticky Header Navigation - Gradient background */}
      <div
        className='sticky top-0 z-50 shadow-lg'
        style={{ background: 'linear-gradient(to right, #80A1BA, #91C4C3, #B4DEBD)' }}
      >
        <div className='container mx-auto px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <History className='w-6 h-6 text-white' />
              <span className='font-bold text-lg text-white'>Đơn hàng của tôi</span>
            </div>

            <div className='flex items-center gap-3'>
              {/* User Info */}
              <div className='hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5'>
                <User className='w-4 h-4 text-gray-600' />
                <div className='text-right'>
                  <p className='text-sm font-medium text-gray-700'>{user?.email}</p>
                  {user?.role === 'Premium' && (
                    <div className='flex items-center gap-1.5 mt-0.5'>
                      <div className='relative'>
                        <Crown className='w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse' />
                        <div className='absolute inset-0 bg-amber-300 blur-sm opacity-50 animate-pulse'></div>
                      </div>
                      <span className='text-xs font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 bg-clip-text text-transparent animate-pulse'>
                        Premium
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Back to Shop Button */}
              <Button
                onClick={() => navigate('/shop')}
                variant='outline'
                className='border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold'
              >
                <ShoppingCart className='w-4 h-4 mr-2' />
                <span className='hidden sm:inline'>Cửa hàng</span>
              </Button>

              {/* Logout Button */}
              <Button
                onClick={() => {
                  logout()
                  toast.success('Đã đăng xuất thành công')
                  navigate('/login')
                }}
                variant='outline'
                className='border-red-600 text-red-600 hover:bg-red-50 font-semibold'
              >
                <LogOut className='w-4 h-4 mr-2' />
                <span className='hidden sm:inline'>Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div
        className='relative text-white overflow-hidden'
        style={{ background: 'linear-gradient(to right, #80A1BA, #91C4C3, #B4DEBD)' }}
      >
        {/* Animated background pattern */}
        <div className='absolute inset-0 opacity-15'>
          <div
            className='absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl'
            style={{ backgroundColor: '#FFF7DD' }}
          ></div>
          <div
            className='absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl'
            style={{ backgroundColor: '#B4DEBD' }}
          ></div>
        </div>

        <div className='container mx-auto px-4 py-9 relative z-10'>
          <div className='flex items-center justify-center mb-6'>
            <div className='flex items-center gap-4'>
              <div className='bg-white/25 backdrop-blur-sm rounded-full p-8 border border-white/40 shadow-lg'>
                <History className='w-8 h-8' />
              </div>
              <div>
                <h1 className='text-3xl md:text-4xl font-black drop-shadow-md'>Đơn hàng của tôi</h1>
                <p className='text-green-800/90 mt-1 font-medium'>Theo dõi trạng thái và lịch sử đơn hàng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className='absolute bottom-0 left-0 right-0'>
          <svg viewBox='0 0 1440 120' fill='none' xmlns='http://www.w3.org/2000/svg' className='w-full h-auto'>
            <path d='M0,60 Q360,20 720,60 T1440,60 L1440,120 L0,120 Z' fill='rgb(249, 250, 251)' />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-8'>
        {/* Filter Tabs */}
        <div className='flex gap-3 flex-wrap mb-6'>
          <Button
            onClick={() => {
              setFilterStatus(null)
              setPage(1)
            }}
            variant={filterStatus === null ? 'default' : 'outline'}
            className={
              filterStatus === null
                ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white hover:opacity-90 font-bold shadow-lg border-0'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold shadow-sm'
            }
          >
            <Filter className='w-4 h-4 mr-2' />
            Tất cả ({totalCount})
          </Button>
          <Button
            onClick={() => {
              setFilterStatus(0)
              setPage(1)
            }}
            variant={filterStatus === 0 ? 'default' : 'outline'}
            className={
              filterStatus === 0
                ? 'bg-yellow-500 text-white hover:bg-yellow-600 font-bold shadow-lg border-0'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold shadow-sm'
            }
          >
            <Clock className='w-4 h-4 mr-2' />
            Chờ thanh toán
          </Button>
          <Button
            onClick={() => {
              setFilterStatus(1)
              setPage(1)
            }}
            variant={filterStatus === 1 ? 'default' : 'outline'}
            className={
              filterStatus === 1
                ? 'bg-green-500 text-white hover:bg-green-600 font-bold shadow-lg border-0'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold shadow-sm'
            }
          >
            <CheckCircle2 className='w-4 h-4 mr-2' />
            Đã thanh toán
          </Button>
          <Button
            onClick={() => {
              setFilterStatus(3)
              setPage(1)
            }}
            variant={filterStatus === 3 ? 'default' : 'outline'}
            className={
              filterStatus === 3
                ? 'bg-gray-500 text-white hover:bg-gray-600 font-bold shadow-lg border-0'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold shadow-sm'
            }
          >
            <XCircle className='w-4 h-4 mr-2' />
            Đã hủy
          </Button>
          <Button
            onClick={() => {
              setFilterStatus(2)
              setPage(1)
            }}
            variant={filterStatus === 2 ? 'default' : 'outline'}
            className={
              filterStatus === 2
                ? 'bg-red-500 text-white hover:bg-red-600 font-bold shadow-lg border-0'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold shadow-sm'
            }
          >
            <AlertCircle className='w-4 h-4 mr-2' />
            Thất bại
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className='text-center py-20'>
            <CardContent>
              <Package className='w-20 h-20 mx-auto mb-4 text-gray-300' />
              <h3 className='text-2xl font-bold text-gray-700 mb-2'>Chưa có đơn hàng nào</h3>
              <p className='text-gray-500 mb-6'>
                {filterStatus !== null
                  ? 'Không tìm thấy đơn hàng với trạng thái này'
                  : 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!'}
              </p>
              <Button onClick={() => navigate('/shop')} className='bg-blue-600 hover:bg-blue-700'>
                <ShoppingCart className='w-5 h-5 mr-2' />
                Đi đến cửa hàng
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            {orders.map((order) => {
              const statusInfo = PaymentStatusMap[order.paymentStatus] || PaymentStatusMap[0]
              const isPending = order.paymentStatus === 0

              return (
                <Card
                  key={order.id}
                  className='hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200'
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <CardTitle className='text-xl font-bold flex items-center gap-2'>
                            {order.courseTitle || order.itemName || 'Sản phẩm'}
                          </CardTitle>
                          <Badge className={`${statusInfo.color} border font-bold px-3 py-1 flex items-center gap-1.5`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <CardDescription className='flex items-center gap-4 text-sm flex-wrap'>
                          <span className='flex items-center gap-1.5'>
                            <Calendar className='w-4 h-4' />
                            {formatDate(order.createdAt)}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className='pb-3'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4'>
                      <div className='flex items-center gap-3'>
                        <div className='bg-blue-100 rounded-full p-2'>
                          <DollarSign className='w-5 h-5 text-blue-600' />
                        </div>
                        <div>
                          <p className='text-sm text-gray-600'>Giá tiền</p>
                          <p className='text-lg font-bold text-gray-900'>
                            {order.purchaseCost.toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </div>

                      {order.coinCost > 0 && (
                        <div className='flex items-center gap-3'>
                          <div className='bg-amber-100 rounded-full p-2'>
                            <BookOpen className='w-5 h-5 text-amber-600' />
                          </div>
                          <div>
                            <p className='text-sm text-gray-600'>Coin</p>
                            <p className='text-lg font-bold text-amber-600'>{order.coinCost.toLocaleString('vi-VN')}</p>
                          </div>
                        </div>
                      )}

                      {order.paidAt && (
                        <div className='flex items-center gap-3'>
                          <div className='bg-green-100 rounded-full p-2'>
                            <CheckCircle2 className='w-5 h-5 text-green-600' />
                          </div>
                          <div>
                            <p className='text-sm text-gray-600'>Thanh toán lúc</p>
                            <p className='text-sm font-semibold text-gray-900'>{formatDate(order.paidAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {isPending && (
                    <CardFooter className='pt-0'>
                      <Button
                        onClick={() => handleRetryPayment(order)}
                        className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold'
                      >
                        <RefreshCcw className='w-5 h-5 mr-2' />
                        Thanh toán lại
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-center gap-2 mt-8'>
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              variant='outline'
            >
              Trước
            </Button>
            <span className='px-4 py-2 font-semibold'>
              Trang {page} / {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              variant='outline'
            >
              Sau
            </Button>
          </div>
        )}
      </div>
      {/* Footer */}
      <Footer />
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => !confirmDialog.isProcessing && setConfirmDialog({ ...confirmDialog, open })}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold'>Xác nhận thanh toán lại</DialogTitle>
            <DialogDescription className='text-base'>
              {confirmDialog.isProcessing
                ? 'Đang tạo phiên thanh toán mới...'
                : 'Bạn có muốn tiếp tục thanh toán cho đơn hàng này không?'}
            </DialogDescription>
          </DialogHeader>

          {confirmDialog.order && (
            <div className='py-4'>
              <div className='bg-gray-50 rounded-lg p-4 space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Mã đơn hàng:</span>
                  <span className='font-mono font-bold'>{confirmDialog.order.id}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Sản phẩm:</span>
                  <span className='font-semibold'>
                    {confirmDialog.order.courseTitle || confirmDialog.order.itemName}
                  </span>
                </div>
                <div className='flex justify-between items-baseline'>
                  <span className='text-gray-600'>Số tiền:</span>
                  <span className='text-2xl font-black text-blue-600'>
                    {confirmDialog.order.purchaseCost.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setConfirmDialog({ open: false, order: null, isProcessing: false })}
              disabled={confirmDialog.isProcessing}
            >
              Hủy
            </Button>
            <Button
              type='button'
              onClick={handleConfirmRetry}
              disabled={confirmDialog.isProcessing}
              className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            >
              {confirmDialog.isProcessing ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <ShoppingCart className='w-4 h-4 mr-2' />
                  Xác nhận
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OrderHistoryPage
