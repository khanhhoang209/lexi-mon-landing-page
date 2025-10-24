import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { XCircle, RotateCcw, Home, MessageCircle, ChevronRight } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import axios from '~/config/axios'

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [errorInfo, setErrorInfo] = useState({
    orderId: '',
    errorMessage: '',
    errorCode: '',
    status: '',
    isCancelled: false
  })

  useEffect(() => {
    // Lấy thông tin từ URL params
    const orderId = searchParams.get('orderId') || searchParams.get('orderCode') || 'N/A'
    const status = searchParams.get('status') || ''
    const cancel = searchParams.get('cancel') || ''
    const code = searchParams.get('code') || searchParams.get('errorCode') || 'UNKNOWN'

    // Xác định xem có phải là cancelled không
    const isCancelled = status === 'CANCELLED' || cancel === 'true'

    // Tạo message phù hợp
    let errorMessage = searchParams.get('message') || searchParams.get('error') || ''
    if (!errorMessage) {
      errorMessage = isCancelled ? 'Bạn đã hủy giao dịch thanh toán' : 'Giao dịch không thành công'
    }

    setErrorInfo({
      orderId,
      errorMessage,
      errorCode: code,
      status,
      isCancelled
    })

    // Gọi API /payments/cancel để backend xử lý
    if (orderId && orderId !== 'N/A') {
      const notifyBackend = async () => {
        try {
          // Tạo query string từ tất cả params hiện tại
          const params = new URLSearchParams()
          searchParams.forEach((value, key) => {
            params.append(key, value)
          })

          await axios.get(`/payments/cancel?${params.toString()}`)
          console.log('Payment cancel API called successfully')
        } catch (error) {
          console.error('Error calling payment cancel API:', error)
          // Không hiển thị lỗi cho user vì trang failed vẫn hiển thị bình thường
        }
      }

      notifyBackend()
    }
  }, [searchParams])

  const handleRetry = () => {
    // Quay lại shop để thử lại
    navigate('/shop')
  }

  const handleSupport = () => {
    // Redirect đến trang hỗ trợ hoặc mở chat
    window.open('https://www.facebook.com/profile.php?id=61581655463902', '_blank') // Thay bằng link hỗ trợ thực tế
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${errorInfo.isCancelled ? 'from-gray-50 via-slate-50 to-gray-100' : 'from-red-50 via-orange-50 to-pink-50'} flex items-center justify-center p-4`}
    >
      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div
          className={`absolute top-20 left-10 w-72 h-72 ${errorInfo.isCancelled ? 'bg-gray-200' : 'bg-red-200'} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob`}
        ></div>
        <div
          className={`absolute top-40 right-10 w-72 h-72 ${errorInfo.isCancelled ? 'bg-slate-200' : 'bg-orange-200'} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000`}
        ></div>
        <div
          className={`absolute -bottom-8 left-20 w-72 h-72 ${errorInfo.isCancelled ? 'bg-gray-300' : 'bg-pink-200'} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000`}
        ></div>
      </div>

      <Card className='max-w-2xl w-full shadow-2xl border-0 relative z-10 bg-white/95 backdrop-blur-sm'>
        <CardHeader className='text-center space-y-4 pb-8'>
          {/* Error Icon */}
          <div className='flex justify-center'>
            <div className='relative'>
              <div
                className={`absolute inset-0 ${errorInfo.isCancelled ? 'bg-gray-400' : 'bg-red-400'} rounded-full blur-2xl opacity-30 animate-pulse`}
              ></div>
              <div
                className={`relative bg-gradient-to-br ${errorInfo.isCancelled ? 'from-gray-400 to-slate-500' : 'from-red-400 to-orange-500'} rounded-full p-6 shadow-xl`}
              >
                <XCircle className='w-20 h-20 text-white' strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className='space-y-2'>
            <CardTitle
              className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${errorInfo.isCancelled ? 'from-gray-600 via-slate-600 to-gray-700' : 'from-red-600 via-orange-600 to-pink-600'} bg-clip-text text-transparent`}
            >
              {errorInfo.isCancelled ? 'Đã hủy thanh toán' : 'Thanh toán thất bại'}
            </CardTitle>
            <CardDescription className='text-lg text-gray-600'>
              {errorInfo.isCancelled
                ? 'Bạn đã hủy giao dịch. Bạn có thể thử lại bất cứ lúc nào.'
                : 'Rất tiếc, đã có lỗi xảy ra trong quá trình thanh toán'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Error Information */}
          {/* <div
            className={`bg-gradient-to-br ${errorInfo.isCancelled ? 'from-gray-50 to-slate-50 border-gray-200' : 'from-red-50 to-orange-50 border-red-200'} rounded-xl p-6 border-2 shadow-inner`}
          >
            <div className='flex items-center gap-3 mb-4'>
              <AlertTriangle className={`w-6 h-6 ${errorInfo.isCancelled ? 'text-gray-600' : 'text-red-600'}`} />
              <h3 className={`text-xl font-bold ${errorInfo.isCancelled ? 'text-gray-900' : 'text-red-900'}`}>
                {errorInfo.isCancelled ? 'Thông tin giao dịch' : 'Thông tin lỗi'}
              </h3>
            </div>

            <div className='space-y-3'>
              {errorInfo.orderId !== 'N/A' && (
                <div
                  className={`flex justify-between items-center py-2 border-b ${errorInfo.isCancelled ? 'border-gray-200/50' : 'border-red-200/50'}`}
                >
                  <span className='text-gray-600 font-medium'>Mã đơn hàng:</span>
                  <span className={`font-bold ${errorInfo.isCancelled ? 'text-gray-700' : 'text-red-700'}`}>
                    {errorInfo.orderId}
                  </span>
                </div>
              )}

              {errorInfo.status && (
                <div
                  className={`flex justify-between items-center py-2 border-b ${errorInfo.isCancelled ? 'border-gray-200/50' : 'border-red-200/50'}`}
                >
                  <span className='text-gray-600 font-medium'>Trạng thái:</span>
                  <span className={`font-bold ${errorInfo.isCancelled ? 'text-gray-700' : 'text-red-700'}`}>
                    {errorInfo.status}
                  </span>
                </div>
              )}

              <div
                className={`flex justify-between items-center py-2 border-b ${errorInfo.isCancelled ? 'border-gray-200/50' : 'border-red-200/50'}`}
              ></div>

              <div className='py-2'>
                <span className='text-gray-600 font-medium block mb-2'>Lý do:</span>
                <p
                  className={`${errorInfo.isCancelled ? 'text-gray-700' : 'text-red-700'} font-semibold bg-white/70 rounded-lg p-3`}
                >
                  {errorInfo.errorMessage}
                </p>
              </div>
            </div>
          </div> */}

          {/* Help Box - Only show for failed payments, not cancelled */}
          {!errorInfo.isCancelled && (
            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200'>
              <h4 className='font-bold text-blue-900 mb-3 flex items-center gap-2'>
                <MessageCircle className='w-5 h-5' />
                Các nguyên nhân thường gặp:
              </h4>
              <ul className='space-y-2 text-sm text-gray-700'>
                <li className='flex items-start gap-2'>
                  <ChevronRight className='w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0' />
                  <span>Số dư tài khoản không đủ</span>
                </li>
                <li className='flex items-start gap-2'>
                  <ChevronRight className='w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0' />
                  <span>Thông tin thẻ không chính xác</span>
                </li>
                <li className='flex items-start gap-2'>
                  <ChevronRight className='w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0' />
                  <span>Thẻ chưa được kích hoạt thanh toán online</span>
                </li>
                <li className='flex items-start gap-2'>
                  <ChevronRight className='w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0' />
                  <span>Hết thời gian thanh toán</span>
                </li>
                <li className='flex items-start gap-2'>
                  <ChevronRight className='w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0' />
                  <span>Lỗi kết nối với ngân hàng</span>
                </li>
              </ul>
            </div>
          )}

          {/* Suggestion */}
          <div
            className={`text-center rounded-xl p-5 border ${errorInfo.isCancelled ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'}`}
          >
            <p className={`${errorInfo.isCancelled ? 'text-blue-900' : 'text-amber-900'} font-medium`}>
              {errorInfo.isCancelled ? (
                <>
                  💬 <strong>Lưu ý:</strong> Bạn có thể quay lại shop để thực hiện thanh toán lại bất cứ lúc nào.
                </>
              ) : (
                <>
                  💡 <strong>Gợi ý:</strong> Vui lòng kiểm tra lại thông tin thanh toán và thử lại sau ít phút.
                </>
              )}
            </p>
          </div>
        </CardContent>

        <CardFooter className='flex flex-col sm:flex-row gap-3 pt-6'>
          <Button
            onClick={handleRetry}
            className='flex-1 h-12 font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
          >
            <RotateCcw className='w-5 h-5 mr-2' />
            Thử lại
          </Button>

          <Button
            onClick={handleSupport}
            variant='outline'
            className='flex-1 h-12 font-bold text-base border-2 border-orange-300 hover:bg-orange-50 text-orange-700 hover:text-orange-800'
          >
            <MessageCircle className='w-5 h-5 mr-2' />
            Liên hệ hỗ trợ
          </Button>

          <Button
            onClick={() => navigate('/')}
            variant='outline'
            className='flex-1 h-12 font-bold text-base border-2 hover:bg-gray-50'
          >
            <Home className='w-5 h-5 mr-2' />
            Về trang chủ
          </Button>
        </CardFooter>
      </Card>

      {/* Animated blobs */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default PaymentFailed
