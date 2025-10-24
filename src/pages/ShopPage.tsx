import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import axios from '~/config/axios'
import type { PaginatedResponse } from '~/types/api'
import type { Item, Course } from '~/types/item'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Input } from '~/components/ui/input'
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
  Gamepad2,
  Package,
  BookOpen,
  Swords,
  Shirt,
  ShoppingCart,
  Star,
  Loader2,
  LogOut,
  History,
  User,
  Crown,
  Search
} from 'lucide-react'
import { retryWithBackoff, analyzeError } from '~/utils/errorHandler'
import { useAuth } from '~/contexts/AuthContext'

const ShopPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [packageItems, setPackageItems] = useState<Item[]>([])
  const [courseItems, setCourseItems] = useState<Item[]>([])
  const [weaponItems, setWeaponItems] = useState<Item[]>([])
  const [skinItems, setSkinItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    item: Item | null
    isProcessing: boolean
  }>({
    open: false,
    item: null,
    isProcessing: false
  })

  // Dialog cho trường hợp đã có đơn hàng
  const [alreadyPurchasedDialog, setAlreadyPurchasedDialog] = useState(false)

  // Search states for each category
  const [courseSearch, setCourseSearch] = useState('')
  const [weaponSearch, setWeaponSearch] = useState('')
  const [skinSearch, setSkinSearch] = useState('')

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchItemsByCategory('Package', setPackageItems),
          fetchCourses(setCourseItems), // Gọi API riêng cho courses
          fetchItemsByCategory('Weapons', setWeaponItems),
          fetchItemsByCategory('skin', setSkinItems)
        ])
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu!')
        console.error('Error fetching items:', error)
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [])

  const fetchItemsByCategory = async (categoryName: string, setItems: React.Dispatch<React.SetStateAction<Item[]>>) => {
    try {
      const { data } = await axios.get<PaginatedResponse<Item>>('/items/shop', {
        params: {
          CategoryName: categoryName,
          Page: 1,
          PageSize: 200
        }
      })

      // data là PaginatedResponse trực tiếp từ server
      if (data && data.data && Array.isArray(data.data)) {
        const filteredItems =
          categoryName.toLowerCase() === 'package' ? data.data : data.data.filter((item) => item.price > 0)

        setItems(filteredItems)
      } else {
        setItems([])
      }
    } catch (error) {
      console.error(`Error fetching ${categoryName}:`, error)
      setItems([])
    }
  }

  const fetchCourses = async (setItems: React.Dispatch<React.SetStateAction<Item[]>>) => {
    try {
      const { data } = await axios.get<PaginatedResponse<Course>>('/courses/shop', {
        params: {
          Page: 1,
          PageSize: 200
        }
      })

      // data là PaginatedResponse trực tiếp từ server
      if (data && data.data && Array.isArray(data.data)) {
        const mappedItems: Item[] = data.data
          .filter((course) => course.price > 0)
          .map((course) => ({
            itemId: course.courseId,
            itemName: course.title,
            isPremium: false,
            categoryId: course.courseLenguageId || '',
            categoryName: course.courseLenguageName || 'Course',
            price: course.price,
            imageUrl: course.imageUrl,
            description: course.description,
            isActive: course.isActive
          }))

        setItems(mappedItems)
      } else {
        setItems([])
      }
    } catch (error) {
      console.error('Error fetching Courses:', error)
      setItems([])
    }
  }

  const handleBuyClick = (item: Item) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng!', {
        action: {
          label: 'Đăng nhập',
          onClick: () => (window.location.href = '/login')
        }
      })
      return
    }

    if (item.isPremium && user?.role === 'Free') {
      toast.warning('Sản phẩm Premium - Chỉ dành cho thành viên Premium!', {
        description: 'Vui lòng nâng cấp tài khoản để mua sản phẩm này.',
        duration: 5000
      })
      return
    }

    setConfirmDialog({
      open: true,
      item,
      isProcessing: false
    })
  } // Helper function: Retry với exponential backoff
  const [retryAttempt, setRetryAttempt] = useState(0)

  const handleConfirmPurchase = async () => {
    const item = confirmDialog.item
    if (!item) return

    setConfirmDialog((prev) => ({ ...prev, isProcessing: true }))

    try {
      // Xác định xem là courseId hay itemId
      const isCourse = item.itemName && courseItems.some((c) => c.itemId === item.itemId)

      // Bước 1: Tạo Order với retry
      const orderPayload = isCourse ? { courseId: item.itemId } : { itemId: item.itemId }

      console.log('Creating order with:', orderPayload)

      toast.info('Đang tạo đơn hàng...')
      setRetryAttempt(0)

      console.log('Sending order request:', {
        url: '/orders',
        payload: orderPayload,
        token: localStorage.getItem('token')?.substring(0, 50) + '...',
        user: user
      })

      const { data: orderResponse } = await retryWithBackoff(() => axios.post('/orders', orderPayload), {
        maxRetries: 3,
        baseDelay: 1000,
        onRetry: (attempt) => {
          setRetryAttempt(attempt)
          toast.info(`Đang thử lại... (lần ${attempt}/3)`, { duration: 2000 })
        }
      })

      console.log('✅ Order response:', orderResponse)

      if (!orderResponse.succeeded) {
        throw new Error(orderResponse.message || 'Không thể tạo đơn hàng')
      }

      const orderId = orderResponse.data

      // Bước 2: Tạo Payment và lấy checkout URL với retry
      console.log('Creating payment for orderId:', orderId)

      toast.info('Đang tạo phiên thanh toán...')
      setRetryAttempt(0)

      const { data: paymentResponse } = await retryWithBackoff(() => axios.post(`/payments/${orderId}`), {
        maxRetries: 3,
        baseDelay: 1000,
        onRetry: (attempt) => {
          setRetryAttempt(attempt)
          toast.info(`Đang thử lại... (lần ${attempt}/3)`, { duration: 2000 })
        }
      })

      console.log('Payment response:', paymentResponse)

      if (!paymentResponse.succeeded) {
        throw new Error(paymentResponse.message || 'Không thể tạo thanh toán')
      }

      const checkoutUrl = paymentResponse.data?.checkoutUrl

      if (!checkoutUrl) {
        throw new Error('Không nhận được link thanh toán')
      }

      // Bước 3: Redirect đến trang thanh toán
      toast.success('Đang chuyển đến trang thanh toán...')

      // Delay nhỏ để user thấy message
      await new Promise((resolve) => setTimeout(resolve, 500))
      window.location.href = checkoutUrl
    } catch (error: unknown) {
      console.error('Purchase error:', error)

      // Sử dụng error handler utility
      const errorInfo = analyzeError(error)

      // Kiểm tra nếu là lỗi "already purchased"
      const errorMessage = errorInfo.message.toLowerCase()
      if (
        errorMessage.includes('already purchased') ||
        errorMessage.includes('đã mua') ||
        errorMessage.includes('pending') ||
        errorMessage.includes('paid')
      ) {
        // Hiển thị dialog giữa màn hình
        setAlreadyPurchasedDialog(true)
      } else {
        // Hiển thị error thông thường
        toast.error(errorInfo.message, {
          duration: 5000,
          description: errorInfo.isRetryable
            ? 'Vui lòng thử lại. Nếu vấn đề vẫn tiếp diễn, liên hệ hỗ trợ.'
            : 'Vui lòng kiểm tra lại thông tin hoặc liên hệ hỗ trợ.',
          action: errorInfo.isRetryable
            ? {
                label: 'Thử lại',
                onClick: () => handleConfirmPurchase()
              }
            : undefined
        })
      }
    } finally {
      setRetryAttempt(0)
      setConfirmDialog({
        open: false,
        item: null,
        isProcessing: false
      })
    }
  }

  const handleCancelPurchase = () => {
    setConfirmDialog({
      open: false,
      item: null,
      isProcessing: false
    })
  }

  // Filter items based on search query
  const filterItems = (items: Item[], searchQuery: string) => {
    if (!searchQuery.trim()) return items
    return items.filter(
      (item) =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const renderItemCard = (item: Item, categoryName?: string) => (
    <Card className='flex flex-col h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20 bg-white/80 backdrop-blur-sm'>
      <CardHeader className='pb-2 p-3'>
        <div className='aspect-square relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 mb-2 shadow-inner'>
          <img
            src={item.imageUrl}
            alt={item.itemName}
            className='object-cover w-full h-full transition-transform duration-700 hover:scale-110'
            loading='lazy'
          />
          {item.isPremium && (
            <div className='absolute top-2 right-2 z-10'>
              <Badge className='bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 font-bold shadow-lg border-0 px-2 py-0.5 text-xs flex items-center gap-1'>
                <Star className='w-3 h-3 fill-amber-950' />
                Premium
              </Badge>
            </div>
          )}
        </div>
        <CardTitle className='text-base font-bold line-clamp-2 min-h-[2.8rem] leading-tight'>{item.itemName}</CardTitle>
      </CardHeader>

      <CardContent className='flex-grow px-3 pb-2'>
        <CardDescription className='line-clamp-2 text-xs leading-relaxed mb-3 text-gray-600'>
          {item.description}
        </CardDescription>
        <div className='flex items-baseline gap-1'>
          <span className='text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
            {item.price != null ? item.price.toLocaleString('vi-VN') : '0'}
          </span>
          <span className='text-base font-semibold text-gray-500'>đ</span>
        </div>
      </CardContent>

      <CardFooter className='pt-0 p-3'>
        {(() => {
          // CHỈ áp dụng logic ẩn nút cho category "Gói Combo" (Package)
          const isPackageCategory = categoryName === 'Package'

          if (!isPackageCategory) {
            // Các category khác (Weapons, Skin, Courses) - dùng style giống Gói Combo
            return (
              <Button
                className='w-full h-12 font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-700 text-white border-2 border-cyan-300 relative overflow-hidden group/btn'
                onClick={() => handleBuyClick(item)}
                disabled={!item.isActive}
              >
                <span className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000'></span>
                {item.isActive ? (
                  <>
                    <ShoppingCart className='w-5 h-5 mr-2 relative z-10' />
                    <span className='relative z-10'>Mua ngay</span>
                  </>
                ) : (
                  <>
                    <span className='mr-2 relative z-10'>❌</span>
                    <span className='relative z-10'>Hết hàng</span>
                  </>
                )}
              </Button>
            )
          }

          // Logic CHỈ cho Package category
          const isPremiumPackage =
            (item.itemName?.toLowerCase().includes('premium') && item.price > 0) || item.isPremium

          const isStarterPackage = item.price === 0 || item.itemName?.toLowerCase().includes('starter')

          const shouldHideButton = isStarterPackage || (user?.role === 'Premium' && isPremiumPackage)

          return shouldHideButton && isAuthenticated ? (
            <div className='w-full h-12 flex items-center justify-center bg-gradient-to-r from-emerald-100 via-green-100 to-emerald-100 rounded-lg border-2 border-emerald-300 shadow-lg'>
              <Badge className='bg-transparent text-emerald-700 font-bold text-base border-0 hover:bg-transparent'>
                <Star className='w-4 h-4 mr-2 fill-emerald-700' />
                Bạn đã sở hữu quyền truy cập
              </Badge>
            </div>
          ) : (
            <Button
              className='w-full h-12 font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-700 text-white border-2 border-cyan-300 relative overflow-hidden group/btn'
              onClick={() => handleBuyClick(item)}
              disabled={!item.isActive}
            >
              <span className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000'></span>
              {item.isActive ? (
                <>
                  <ShoppingCart className='w-5 h-5 mr-2 relative z-10' />
                  <span className='relative z-10'>Mua ngay</span>
                </>
              ) : (
                <>
                  <span className='mr-2 relative z-10'>❌</span>
                  <span className='relative z-10'>Hết hàng</span>
                </>
              )}
            </Button>
          )
        })()}
      </CardFooter>
    </Card>
  )

  const renderCategory = (
    title: string,
    items: Item[],
    icon: React.ReactNode,
    categoryName?: string,
    searchValue?: string,
    onSearchChange?: (value: string) => void
  ) => {
    // Kiểm tra nếu đây là category Gói Combo để render đặc biệt
    const isPackageCategory = categoryName === 'Package'

    // Filter items based on search
    const filteredItems = searchValue ? filterItems(items, searchValue) : items

    return (
      <section className={isPackageCategory ? 'mb-20' : 'mb-16'}>
        <div className={`mb-8 px-4 md:px-0 ${isPackageCategory ? 'text-center' : ''}`}>
          <div className={`flex items-center ${isPackageCategory ? 'justify-center' : 'justify-between'} mb-3`}>
            <h2
              className={`${isPackageCategory ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'} font-bold flex items-center gap-3`}
            >
              {isPackageCategory ? (
                <span className='relative inline-flex items-center gap-3'>
                  <span className='absolute -inset-2 bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 blur-xl opacity-40 animate-pulse'></span>
                  <span className='relative'>{icon}</span>
                  <span className='relative bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent'>
                    {title}
                  </span>
                </span>
              ) : (
                <>
                  {icon}
                  <span>{title}</span>
                </>
              )}
            </h2>
            {items.length > 0 && !isPackageCategory && (
              <span className='text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full'>
                {items.length}
              </span>
            )}
          </div>
          <div
            className={`h-1 ${isPackageCategory ? 'w-32 mx-auto' : 'w-20'} bg-gradient-to-r ${isPackageCategory ? 'from-transparent via-cyan-500 to-transparent' : 'from-primary via-primary to-transparent'} rounded-full ${isPackageCategory ? 'animate-pulse' : ''}`}
          ></div>

          {/* Search Bar */}
          {items.length > 0 && onSearchChange && (
            <div className={`mt-6 ${isPackageCategory ? 'max-w-4xl mx-auto' : 'max-w-3xl'}`}>
              <div className='flex items-center gap-3'>
                <div className='relative group w-64'>
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchValue ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}
                  />
                  <Input
                    type='text'
                    placeholder={`Tìm kiếm ${title.toLowerCase()}...`}
                    value={searchValue || ''}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className='pl-10 pr-4 py-2 h-11 border-2 focus:border-primary transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md'
                  />
                  {searchValue && (
                    <button
                      onClick={() => onSearchChange('')}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                      aria-label='Xóa tìm kiếm'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                  )}
                </div>
                {/* Search results count - positioned to the right of search box */}
                {searchValue && (
                  <div className='flex-shrink-0 min-w-[140px]'>
                    {filteredItems.length === 0 ? (
                      <p className='text-sm text-gray-500 whitespace-nowrap'>Không tìm thấy kết quả</p>
                    ) : (
                      <p className='text-sm text-gray-600 whitespace-nowrap'>
                        Tìm thấy <span className='font-semibold text-primary'>{filteredItems.length}</span> kết quả
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {filteredItems.length === 0 && !searchValue ? (
          <div className='text-center py-20 px-4'>
            <Package className='w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400' />
            <p className='text-lg text-muted-foreground'>Không có sản phẩm nào trong danh mục này</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className='px-4 md:px-0'>
            {/* Horizontal scrollable container */}
            <div
              className={`flex gap-6 ${isPackageCategory ? 'justify-center flex-wrap' : 'overflow-x-auto'} pb-6 scroll-smooth scrollbar-thin`}
              style={
                !isPackageCategory
                  ? {
                      scrollPaddingLeft: '1rem',
                      scrollPaddingRight: '1rem'
                    }
                  : {}
              }
            >
              {filteredItems.map((item) => (
                <div
                  key={item.itemId}
                  className={`${isPackageCategory ? 'w-[280px] md:w-[320px] lg:w-[360px]' : 'flex-none w-[220px] md:w-[240px]'} transition-transform hover:scale-[1.05] ${isPackageCategory ? 'hover:z-10' : ''}`}
                >
                  {isPackageCategory ? (
                    <Card className='flex flex-col h-full transition-all duration-300 border-4 border-transparent bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100 hover:border-cyan-400 shadow-2xl hover:shadow-cyan-500/50 relative overflow-hidden group'>
                      {/* Bling bling background effect */}
                      <div className='absolute inset-0 bg-gradient-to-tr from-teal-200/0 via-cyan-300/20 to-blue-200/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                      <div className='absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 animate-pulse'></div>

                      <CardHeader className='pb-3 p-5 relative z-10'>
                        <div className='aspect-square relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-cyan-50 mb-3 shadow-xl ring-4 ring-cyan-200/50'>
                          <img
                            src={item.imageUrl}
                            alt={item.itemName}
                            className='object-cover w-full h-full transition-transform duration-700 group-hover:scale-110'
                            loading='lazy'
                          />
                          {item.isPremium && (
                            <div className='absolute top-3 right-3 z-10'>
                              <Badge className='bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 text-white font-bold shadow-2xl border-2 border-white px-3 py-1 text-sm flex items-center gap-1.5 animate-bounce'>
                                <Star className='w-4 h-4 fill-white' />
                                Premium
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardTitle className='text-xl md:text-2xl font-black line-clamp-2 min-h-[3.5rem] leading-tight text-center bg-gradient-to-r from-teal-700 via-cyan-600 to-blue-700 bg-clip-text text-transparent'>
                          {item.itemName}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className='flex-grow px-5 pb-3 relative z-10'>
                        <CardDescription className='line-clamp-3 text-sm leading-relaxed mb-4 text-gray-700 text-center font-medium'>
                          {item.description}
                        </CardDescription>
                        <div className='flex items-baseline justify-center gap-1.5 bg-white/70 rounded-lg py-3 shadow-inner'>
                          <span className='text-4xl font-black bg-gradient-to-r from-teal-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-lg'>
                            {item.price.toLocaleString('vi-VN')}
                          </span>
                          <span className='text-xl font-bold text-cyan-600'>đ</span>
                        </div>
                      </CardContent>

                      <CardFooter className='pt-0 p-5 relative z-10'>
                        {(() => {
                          const isPremiumPackage =
                            (item.itemName?.toLowerCase().includes('premium') && item.price > 0) || item.isPremium
                          const isStarterPackage = item.price === 0 || item.itemName?.toLowerCase().includes('starter')
                          const shouldHideButton = isStarterPackage || (user?.role === 'Premium' && isPremiumPackage)

                          return shouldHideButton && isAuthenticated ? (
                            <div className='w-full h-12 flex items-center justify-center bg-gradient-to-r from-emerald-100 via-green-100 to-emerald-100 rounded-lg border-2 border-emerald-300 shadow-lg'>
                              <Badge className='bg-transparent text-emerald-700 font-bold text-base border-0 hover:bg-transparent'>
                                <Star className='w-4 h-4 mr-2 fill-emerald-700' />
                                Bạn đã sở hữu quyền truy cập
                              </Badge>
                            </div>
                          ) : (
                            <Button
                              className='w-full h-12 font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-700 text-white border-2 border-cyan-300 relative overflow-hidden group/btn'
                              onClick={() => handleBuyClick(item)}
                              disabled={!item.isActive}
                            >
                              <span className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000'></span>
                              {item.isActive ? (
                                <>
                                  <ShoppingCart className='w-5 h-5 mr-2 relative z-10' />
                                  <span className='relative z-10'>Mua ngay</span>
                                </>
                              ) : (
                                <>
                                  <span className='mr-2'>❌</span>
                                  Hết hàng
                                </>
                              )}
                            </Button>
                          )
                        })()}
                      </CardFooter>
                    </Card>
                  ) : (
                    renderItemCard(item, categoryName)
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    )
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='relative inline-block mb-8'>
            {/* Outer ring */}
            <div className='absolute inset-0 animate-spin rounded-full h-20 w-20 border-4 border-blue-200'></div>
            {/* Inner ring */}
            <div className='animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-blue-600 border-r-purple-600'></div>
            {/* Center icon */}
            <div className='absolute inset-0 flex items-center justify-center'>
              <Gamepad2 className='w-8 h-8 animate-bounce' />
            </div>
          </div>
          <h2 className='text-xl font-bold text-gray-700 mb-2'>Đang tải sản phẩm...</h2>
          <p className='text-sm text-gray-500'>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header Navigation */}
      {isAuthenticated && (
        <div
          className='sticky top-0 z-50 shadow-lg'
          style={{ background: 'linear-gradient(to right, #80A1BA, #91C4C3, #B4DEBD)' }}
        >
          <div className='container mx-auto px-4 py-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Gamepad2 className='w-6 h-6 text-white' />
                <span className='font-bold text-lg text-white'>Leximon Shop</span>
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

                {/* Orders Button */}
                <Button
                  onClick={() => navigate('/orders')}
                  variant='outline'
                  className='border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold'
                >
                  <History className='w-4 h-4 mr-2' />
                  <span className='hidden sm:inline'>Đơn hàng</span>
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
      )}

      {/* Hero Section */}
      <div
        className='relative text-white overflow-hidden'
        style={{ background: 'linear-gradient(to right, #80A1BA, #91C4C3, #B4DEBD)' }}
      >
        {/* Animated background pattern - symmetrical */}
        <div className='absolute inset-0 opacity-15'>
          <div
            className='absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl'
            style={{ backgroundColor: '#FFF7DD' }}
          ></div>
          <div
            className='absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl'
            style={{ backgroundColor: '#B4DEBD' }}
          ></div>
          <div className='absolute bottom-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-white rounded-full blur-3xl'></div>
        </div>

        <div className='container mx-auto px-4 py-20 md:py-28 relative z-10'>
          <div className='text-center max-w-4xl mx-auto'>
            <div className='inline-flex items-center gap-3 bg-white/30 backdrop-blur-md px-6 py-3 rounded-full mb-8 border-2 border-white/50 shadow-2xl hover:shadow-white/40 transition-all duration-300 hover:scale-105 group'>
              <div className='relative'>
                <Gamepad2 className='w-6 h-6 text-white drop-shadow-lg group-hover:rotate-12 transition-transform duration-300' />
                <div className='absolute inset-0 bg-white/50 blur-md rounded-full animate-pulse'></div>
              </div>
              <span className='text-base md:text-lg font-bold text-white drop-shadow-lg tracking-wide'>
                Cửa hàng vật phẩm học tập
              </span>
              <div className='w-2 h-2 bg-white rounded-full animate-ping'></div>
            </div>

            <h1 className='text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight drop-shadow-md'>
              Leximon Shop
            </h1>

            <p
              className='text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium'
              style={{ color: 'rgba(255, 255, 255, 0.95)' }}
            >
              Khám phá và sở hữu những vật phẩm độc đáo để nâng cao trải nghiệm học tập của bạn!
            </p>
          </div>
        </div>

        {/* Wave separator - symmetrical */}
        <div className='absolute bottom-0 left-0 right-0'>
          <svg viewBox='0 0 1440 120' fill='none' xmlns='http://www.w3.org/2000/svg' className='w-full h-auto'>
            <path d='M0,60 Q360,20 720,60 T1440,60 L1440,120 L0,120 Z' fill='rgb(249, 250, 251)' />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-0 md:px-4 py-12 md:py-20'>
        {renderCategory('Gói Combo', packageItems, <Package className='w-10 h-10' />, 'Package')}
        {renderCategory(
          'Khóa Học',
          courseItems,
          <BookOpen className='w-10 h-10' />,
          'Course',
          courseSearch,
          setCourseSearch
        )}
        {renderCategory(
          'Vũ Khí',
          weaponItems,
          <Swords className='w-10 h-10' />,
          'Weapons',
          weaponSearch,
          setWeaponSearch
        )}
        {renderCategory('Trang Phục', skinItems, <Shirt className='w-10 h-10' />, 'Skin', skinSearch, setSkinSearch)}
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
            <DialogTitle className='text-xl font-bold'>Xác nhận mua hàng</DialogTitle>
            <DialogDescription className='text-base'>
              {confirmDialog.isProcessing
                ? 'Đang xử lý đơn hàng, vui lòng đợi...'
                : 'Bạn có chắc chắn muốn mua sản phẩm này không?'}
            </DialogDescription>
          </DialogHeader>

          {confirmDialog.item && (
            <div className='py-4'>
              <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'>
                <img
                  src={confirmDialog.item.imageUrl}
                  alt={confirmDialog.item.itemName}
                  className='w-20 h-20 object-cover rounded-lg'
                />
                <div className='flex-1'>
                  <h4 className='font-bold text-lg mb-1'>{confirmDialog.item.itemName}</h4>
                  <div className='flex items-baseline gap-1'>
                    <span className='text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
                      {confirmDialog.item.price != null ? confirmDialog.item.price.toLocaleString('vi-VN') : '0'}
                    </span>
                    <span className='text-base font-semibold text-gray-500'>đ</span>
                  </div>
                </div>
              </div>

              {/* Thông báo khi đang xử lý */}
              {confirmDialog.isProcessing && (
                <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                  <p className='text-sm text-blue-800 flex items-center gap-2'>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    <span>
                      {retryAttempt > 0
                        ? `Đang thử lại lần ${retryAttempt}/3...`
                        : 'Đang kết nối với hệ thống thanh toán...'}
                    </span>
                  </p>
                  {retryAttempt > 0 && (
                    <p className='text-xs text-blue-600 mt-2'>
                      Server đang bận, hệ thống đang tự động thử lại để hoàn tất đơn hàng của bạn.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancelPurchase}
              disabled={confirmDialog.isProcessing}
              className='w-full sm:w-auto'
            >
              Hủy
            </Button>
            <Button
              type='button'
              onClick={handleConfirmPurchase}
              disabled={confirmDialog.isProcessing}
              className='w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {confirmDialog.isProcessing ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <ShoppingCart className='w-4 h-4 mr-2' />
                  Xác nhận mua
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog cho trường hợp đã có đơn hàng */}
      <Dialog open={alreadyPurchasedDialog} onOpenChange={setAlreadyPurchasedDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <div className='flex items-center justify-center mb-4'>
              <div className='bg-blue-100 p-4 rounded-full'>
                <History className='w-12 h-12 text-blue-600' />
              </div>
            </div>
            <DialogTitle className='text-xl font-bold text-center'>Đơn hàng đã tồn tại!</DialogTitle>
            <DialogDescription className='text-base text-center'>
              Bạn đã có đơn hàng cho sản phẩm này. Vui lòng kiểm tra lịch sử đơn hàng để thanh toán.
            </DialogDescription>
          </DialogHeader>

          <div className='py-4'>
            <div className='bg-blue-50 border-l-4 border-blue-500 p-4 rounded'>
              <div className='flex items-start gap-3'>
                <div className='flex-shrink-0'>
                  <svg
                    className='w-5 h-5 text-blue-600'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-blue-800 mb-1'>Gợi ý</p>
                  <p className='text-sm text-blue-700'>
                    Hệ thống đã tạo đơn hàng của bạn. Vui lòng hoàn tất thanh toán để sử dụng sản phẩm.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0 flex-col sm:flex-row'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setAlreadyPurchasedDialog(false)}
              className='w-full sm:w-auto order-2 sm:order-1'
            >
              Đóng
            </Button>
            <Button
              type='button'
              onClick={() => {
                setAlreadyPurchasedDialog(false)
                navigate('/orders')
              }}
              className='w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 order-1 sm:order-2'
            >
              <History className='w-4 h-4 mr-2' />
              Xem đơn hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ShopPage
