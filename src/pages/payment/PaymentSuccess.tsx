import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { CheckCircle2, Home, ShoppingBag, Gamepad2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [, setOrderInfo] = useState({
    orderId: '',
    amount: '',
    transactionId: ''
  })

  useEffect(() => {
    // Lấy thông tin từ URL params (nếu có)
    const orderId = searchParams.get('orderId') || searchParams.get('orderCode') || 'N/A'
    const amount = searchParams.get('amount') || searchParams.get('totalAmount') || '0'
    const transactionId = searchParams.get('transactionId') || searchParams.get('id') || 'N/A'

    setOrderInfo({
      orderId,
      amount,
      transactionId
    })
  }, [searchParams])

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4'>
      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob'></div>
        <div className='absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000'></div>
        <div className='absolute -bottom-8 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000'></div>
      </div>

      <Card className='max-w-2xl w-full shadow-2xl border-0 relative z-10 bg-white/95 backdrop-blur-sm'>
        <CardHeader className='text-center space-y-4 pb-8'>
          {/* Success Icon */}
          <div className='flex justify-center'>
            <div className='relative'>
              <div className='absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-40 animate-pulse'></div>
              <div className='relative bg-gradient-to-br from-emerald-400 to-green-500 rounded-full p-6 shadow-xl'>
                <CheckCircle2 className='w-20 h-20 text-white animate-bounce-slow' strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className='space-y-2'>
            <CardTitle className='text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent'>
              Thanh toán thành công! 🎉
            </CardTitle>
            <CardDescription className='text-lg text-gray-600'>
              Cảm ơn bạn đã mua hàng tại Lexi-Mon Shop
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Order Information */}
          {/* <div className='bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border-2 border-emerald-200 shadow-inner'>
            <div className='flex items-center gap-3 mb-4'>
              <Package className='w-6 h-6 text-emerald-600' />
              <h3 className='text-xl font-bold text-emerald-900'>Thông tin đơn hàng</h3>
            </div>

            <div className='space-y-3'>
              <div className='flex justify-between items-center py-2 border-b border-emerald-200/50'>
                <span className='text-gray-600 font-medium'>Mã đơn hàng:</span>
                <span className='font-bold text-emerald-700'>{orderInfo.orderId}</span>
              </div>

              {orderInfo.transactionId !== 'N/A' && (
                <div className='flex justify-between items-center py-2 border-b border-emerald-200/50'>
                  <span className='text-gray-600 font-medium'>Mã giao dịch:</span>
                  <span className='font-bold text-emerald-700'>{orderInfo.transactionId}</span>
                </div>
              )}

              <div className='flex justify-between items-center py-2'>
                <span className='text-gray-600 font-medium'>Số tiền:</span>
                <span className='text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent'>
                  {parseInt(orderInfo.amount).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          </div> */}

          {/* Success Message */}
          <div className='bg-white rounded-xl p-6 border-2 border-gray-100 shadow-sm'>
            <div className='text-center space-y-3'>
              <div className='text-6xl mb-2'>✨</div>
              <p className='text-gray-700 leading-relaxed'>
                Đơn hàng của bạn đã được xử lý thành công!
                <br />
                Sản phẩm sẽ được kích hoạt ngay lập tức trong tài khoản của bạn.
              </p>
              <p className='text-sm text-gray-500'>Bạn có thể kiểm tra lại trong phần quản lý tài khoản.</p>
              <p className='text-sm text-gray-500'>Nếu bạn chưa thấy cập nhật có thể thử logout và đăng nhập lại.</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className='flex flex-col sm:flex-row gap-3 pt-6'>
          <Button
            onClick={() => navigate('/shop')}
            className='flex-1 h-12 font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
          >
            <ShoppingBag className='w-5 h-5 mr-2' />
            Tiếp tục mua sắm
          </Button>

          {/* Button to open the Unity game in a new tab */}
          <a
            href='https://play.unity.com/en/games/7888a2c6-8294-4d33-a2cb-31326ca7eb8a/leximon'
            target='_blank'
            rel='noopener noreferrer'
            className='flex-1'
          >
            <Button
              type='button'
              className='w-full h-12 font-bold text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300'
            >
              <Gamepad2 className='w-5 h-5 mr-2' />
              Quay về trò chơi
            </Button>
          </a>

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

      {/* Animated checkmarks floating */}
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
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default PaymentSuccess
