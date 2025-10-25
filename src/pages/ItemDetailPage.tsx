import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import axios from '~/config/axios'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import Footer from '~/components/Footer'
import { ArrowLeft, ShoppingCart, Loader2, Star, Package, Shield, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '~/contexts/AuthContext'

interface ItemDetail {
  itemId: string
  itemName: string
  description: string
  price: number
  imageUrl: string
  categoryName: string
  categoryId: string
  isPremium: boolean
  isActive: boolean
}

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [item, setItem] = useState<ItemDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate('/shop')
      return
    }
    fetchItemDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchItemDetail = async () => {
    setLoading(true)
    try {
      // Gọi API lấy chi tiết item (giả sử endpoint là /items/{id})
      const { data } = await axios.get(`/items/${id}`)

      if (data && data.succeeded && data.data) {
        setItem(data.data)
      } else {
        toast.error('Không tìm thấy sản phẩm')
        navigate('/shop')
      }
    } catch (error) {
      console.error('Error fetching item detail:', error)
      toast.error('Không thể tải thông tin sản phẩm')
      navigate('/shop')
    } finally {
      setLoading(false)
    }
  }

  const handleBuyItem = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng!', {
        action: {
          label: 'Đăng nhập',
          onClick: () => navigate('/login')
        }
      })
      return
    }

    if (!item) return

    if (item.isPremium && user?.role === 'Free') {
      toast.warning('Sản phẩm Premium - Chỉ dành cho thành viên Premium!', {
        description: 'Vui lòng nâng cấp tài khoản để mua sản phẩm này.',
        duration: 5000
      })
      return
    }

    setPurchasing(true)
    try {
      toast.info('Đang tạo đơn hàng...')

      const { data: orderResponse } = await axios.post('/orders', {
        itemId: item.itemId
      })

      if (!orderResponse.succeeded) {
        throw new Error(orderResponse.message || 'Không thể tạo đơn hàng')
      }

      const orderId = orderResponse.data

      toast.info('Đang tạo phiên thanh toán...')

      const { data: paymentResponse } = await axios.post(`/payments/${orderId}`)

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
      console.error('Purchase error:', error)

      let errorMessage = 'Không thể mua sản phẩm'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      // Check for existing order error
      if (errorMessage.toLowerCase().includes('đã có đơn hàng') || errorMessage.toLowerCase().includes('pending')) {
        toast.error('Bạn đã có đơn hàng cho sản phẩm này', {
          description: 'Vui lòng kiểm tra lịch sử đơn hàng để thanh toán.',
          action: {
            label: 'Xem đơn hàng',
            onClick: () => navigate('/orders')
          }
        })
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50'>
        <div className='text-center'>
          <Loader2 className='w-16 h-16 animate-spin mx-auto mb-4 text-cyan-600' />
          <p className='text-gray-600 text-lg'>Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (!item) {
    return null
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50'>
      {/* Header with Back Button */}
      <div className='bg-white shadow-sm border-b sticky top-0 z-40'>
        <div className='container mx-auto px-4 py-4'>
          <Button variant='ghost' onClick={() => navigate('/shop')} className='gap-2 hover:bg-gray-100'>
            <ArrowLeft className='w-4 h-4' />
            Quay lại cửa hàng
          </Button>
        </div>
      </div>

      {/* Item Detail */}
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-start'>
            {/* Item Image */}
            <div className='sticky top-24'>
              <div className='relative'>
                <div className='absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-3xl blur-3xl opacity-20 animate-pulse'></div>
                <Card className='relative overflow-hidden border-4 border-white shadow-2xl'>
                  <div className='aspect-square bg-gradient-to-br from-cyan-100 via-teal-100 to-blue-100 p-8 relative'>
                    <img
                      src={item.imageUrl}
                      alt={item.itemName}
                      className='w-full h-full object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-700'
                    />
                    {item.isPremium && (
                      <div className='absolute top-6 right-6'>
                        <Badge className='bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 font-bold text-lg px-4 py-2 shadow-xl border-2 border-white flex items-center gap-2'>
                          <Star className='w-5 h-5 fill-amber-950' />
                          Premium
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Category Badge */}
                <div className='mt-6 flex justify-center'>
                  <Badge className='bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-lg px-6 py-2 flex items-center gap-2'>
                    <Package className='w-5 h-5' />
                    {item.categoryName}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Item Info */}
            <div className='space-y-8'>
              <div>
                <h1 className='text-5xl font-black mb-4 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent'>
                  {item.itemName}
                </h1>

                {/* Price */}
                <div className='mb-6'>
                  <p className='text-gray-600 text-sm mb-2'>Giá sản phẩm</p>
                  <div className='flex items-baseline gap-3'>
                    <span className='text-6xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent'>
                      {item.price.toLocaleString('vi-VN')}
                    </span>
                    <span className='text-3xl font-bold text-gray-500'>đ</span>
                  </div>
                </div>

                {/* Buy Button */}
                <Button
                  onClick={handleBuyItem}
                  disabled={!item.isActive || purchasing}
                  className='w-full h-16 text-xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 relative overflow-hidden group'
                >
                  <span className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000'></span>
                  {purchasing ? (
                    <>
                      <Loader2 className='w-6 h-6 mr-3 animate-spin relative z-10' />
                      <span className='relative z-10'>Đang xử lý...</span>
                    </>
                  ) : item.isActive ? (
                    <>
                      <ShoppingCart className='w-6 h-6 mr-3 relative z-10' />
                      <span className='relative z-10'>Mua ngay</span>
                    </>
                  ) : (
                    <span className='relative z-10'>Tạm hết hàng</span>
                  )}
                </Button>
              </div>

              {/* Description */}
              <Card className='border-2 border-cyan-200 bg-white/80 backdrop-blur-sm shadow-lg'>
                <CardHeader>
                  <CardTitle className='text-2xl flex items-center gap-3'>
                    <Shield className='w-6 h-6 text-cyan-600' />
                    Mô tả sản phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-700 text-lg leading-relaxed whitespace-pre-line'>
                    {item.description || 'Sản phẩm độc đáo dành cho bạn!'}
                  </p>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className='border-2 border-teal-200 bg-gradient-to-br from-cyan-50 to-teal-50 shadow-lg'>
                <CardHeader>
                  <CardTitle className='text-2xl flex items-center gap-3'>
                    <Zap className='w-6 h-6 text-teal-600' />
                    Đặc điểm nổi bật
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-3'>
                    <li className='flex items-start gap-3'>
                      <div className='bg-teal-500 text-white rounded-full p-1.5 mt-0.5'>
                        <Star className='w-4 h-4 fill-white' />
                      </div>
                      <span className='text-gray-700 text-lg'>Chất lượng cao, thiết kế độc đáo</span>
                    </li>
                    <li className='flex items-start gap-3'>
                      <div className='bg-cyan-500 text-white rounded-full p-1.5 mt-0.5'>
                        <Star className='w-4 h-4 fill-white' />
                      </div>
                      <span className='text-gray-700 text-lg'>Kích hoạt ngay lập tức sau khi mua</span>
                    </li>
                    <li className='flex items-start gap-3'>
                      <div className='bg-blue-500 text-white rounded-full p-1.5 mt-0.5'>
                        <Star className='w-4 h-4 fill-white' />
                      </div>
                      <span className='text-gray-700 text-lg'>Sử dụng vĩnh viễn trong tài khoản</span>
                    </li>
                    {item.isPremium && (
                      <li className='flex items-start gap-3'>
                        <div className='bg-amber-500 text-white rounded-full p-1.5 mt-0.5'>
                          <Star className='w-4 h-4 fill-white' />
                        </div>
                        <span className='text-gray-700 text-lg font-bold'>
                          Đặc quyền Premium - Giới hạn cho thành viên cao cấp
                        </span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Note */}
              <div className='bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded-r-lg'>
                <p className='text-cyan-800 text-sm'>
                  <strong>Lưu ý:</strong> Sản phẩm sẽ được kích hoạt ngay sau khi thanh toán thành công. Vui lòng kiểm
                  tra trong kho đồ của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ItemDetailPage
