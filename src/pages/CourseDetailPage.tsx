import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import axios from '~/config/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import Footer from '~/components/Footer'
import {
  BookOpen,
  ArrowLeft,
  ShoppingCart,
  Loader2,
  CheckCircle2,
  BarChart3,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '~/contexts/AuthContext'

interface Lesson {
  lessonId: string
  title: string
  description: string
  orderIndex: number
  questionCount?: number
}

interface CourseDetail {
  courseId: string
  title: string
  description: string
  price: number
  imageUrl: string
  courseLenguageName: string
  courseLenguageId: string
  isActive: boolean
  lessons?: Lesson[]
  totalLessons?: number
  totalQuestions?: number
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!id) {
      navigate('/shop')
      return
    }
    fetchCourseDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchCourseDetail = async () => {
    setLoading(true)
    try {
      // Gọi API lấy chi tiết course
      const { data: courseData } = await axios.get(`/courses/${id}`)
      
      if (!courseData || !courseData.succeeded || !courseData.data) {
        toast.error('Không tìm thấy khóa học')
        navigate('/shop')
        return
      }

      const courseInfo = courseData.data

      // Gọi API lấy danh sách lessons của course
      try {
        const { data: lessonsData } = await axios.get(`/courses/${id}/lessons`)
        
        if (lessonsData && lessonsData.succeeded) {
          // Kiểm tra cấu trúc dữ liệu
          let lessonsList = []
          
          // Trường hợp 1: Paginated response
          if (lessonsData.data && Array.isArray(lessonsData.data.data)) {
            lessonsList = lessonsData.data.data
          }
          // Trường hợp 2: Direct array
          else if (Array.isArray(lessonsData.data)) {
            lessonsList = lessonsData.data
          }

          // Cập nhật course với lessons
          // Không tính totalQuestions vì cần gọi API cho từng lesson
          setCourse({
            ...courseInfo,
            lessons: lessonsList,
            totalLessons: lessonsList.length,
            totalQuestions: undefined // Để undefined, sẽ hiển thị "Đang cập nhật"
          })
        } else {
          // Nếu không lấy được lessons, vẫn hiển thị course info
          setCourse({
            ...courseInfo,
            lessons: [],
            totalLessons: 0,
            totalQuestions: undefined
          })
        }
      } catch (lessonError) {
        console.error('Error fetching lessons:', lessonError)
        // Vẫn hiển thị course nhưng không có lessons
        setCourse({
          ...courseInfo,
          lessons: [],
          totalLessons: 0,
          totalQuestions: undefined
        })
      }
    } catch (error) {
      console.error('Error fetching course detail:', error)
      toast.error('Không thể tải thông tin khóa học')
      navigate('/shop')
    } finally {
      setLoading(false)
    }
  }

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons)
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId)
    } else {
      newExpanded.add(lessonId)
    }
    setExpandedLessons(newExpanded)
  }

  const handleBuyCourse = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua khóa học!', {
        action: {
          label: 'Đăng nhập',
          onClick: () => navigate('/login')
        }
      })
      return
    }

    if (!course) return

    setPurchasing(true)
    try {
      toast.info('Đang tạo đơn hàng...')

      const { data: orderResponse } = await axios.post('/orders', {
        courseId: course.courseId
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
      
      let errorMessage = 'Không thể mua khóa học'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      // Check for expired order error
      if (errorMessage.toLowerCase().includes('đã có đơn hàng') || errorMessage.toLowerCase().includes('pending')) {
        toast.error('Bạn đã có đơn hàng cho khóa học này', {
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
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
        <div className='text-center'>
          <Loader2 className='w-16 h-16 animate-spin mx-auto mb-4 text-cyan-600' />
          <p className='text-gray-600 text-lg'>Đang tải thông tin khóa học...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return null
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50'>
      {/* Header with Back Button */}
      <div className='bg-white shadow-sm border-b sticky top-0 z-40'>
        <div className='container mx-auto px-4 py-4'>
          <Button
            variant='ghost'
            onClick={() => navigate('/shop')}
            className='gap-2 hover:bg-gray-100'
          >
            <ArrowLeft className='w-4 h-4' />
            Quay lại cửa hàng
          </Button>
        </div>
      </div>

      {/* Course Header */}
      <div className='bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white py-16'>
        <div className='container mx-auto px-4'>
          <div className='grid md:grid-cols-2 gap-8 items-center'>
            {/* Course Image */}
            <div className='relative'>
              <div className='absolute inset-0 bg-white/10 rounded-2xl blur-2xl'></div>
              <img
                src={course.imageUrl}
                alt={course.title}
                className='relative w-full rounded-2xl shadow-2xl border-4 border-white/20'
              />
            </div>

            {/* Course Info */}
            <div className='space-y-6'>
              <div>
                <Badge className='mb-4 bg-white/20 text-white border-white/30 text-sm px-4 py-1'>
                  <BookOpen className='w-4 h-4 mr-2' />
                  {course.courseLenguageName}
                </Badge>
                <h1 className='text-4xl md:text-5xl font-black mb-4 leading-tight'>
                  {course.title}
                </h1>
                <p className='text-xl text-white/90 leading-relaxed'>
                  {course.description}
                </p>
              </div>

              {/* Course Stats */}
              <div className='grid grid-cols-3 gap-4'>
                <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
                  <div className='flex items-center gap-2 mb-2'>
                    <BookOpen className='w-5 h-5 text-white/80' />
                    <p className='text-white/80 text-sm'>Bài học</p>
                  </div>
                  <p className='text-2xl font-bold'>{course.totalLessons || course.lessons?.length || 0}</p>
                </div>

                <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
                  <div className='flex items-center gap-2 mb-2'>
                    <BarChart3 className='w-5 h-5 text-white/80' />
                    <p className='text-white/80 text-sm'>Câu hỏi</p>
                  </div>
                  {course.totalQuestions !== undefined ? (
                    <p className='text-2xl font-bold'>{course.totalQuestions}</p>
                  ) : (
                    <p className='text-sm font-medium text-white/70 italic'>Đang cập nhật</p>
                  )}
                </div>

                <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Award className='w-5 h-5 text-white/80' />
                    <p className='text-white/80 text-sm'>Cấp độ</p>
                  </div>
                  <p className='text-lg font-bold truncate'>{course.courseLenguageName}</p>
                </div>
              </div>

              {/* Price & Buy Button */}
              <div className='bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20'>
                <div className='flex items-end justify-between mb-4'>
                  <div>
                    <p className='text-white/80 text-sm mb-1'>Giá khóa học</p>
                    <div className='flex items-baseline gap-2'>
                      <span className='text-5xl font-black'>
                        {course.price.toLocaleString('vi-VN')}
                      </span>
                      <span className='text-2xl font-bold'>đ</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBuyCourse}
                  disabled={!course.isActive || purchasing}
                  className='w-full h-14 text-lg font-bold bg-white text-cyan-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50'
                >
                  {purchasing ? (
                    <>
                      <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                      Đang xử lý...
                    </>
                  ) : course.isActive ? (
                    <>
                      <ShoppingCart className='w-5 h-5 mr-2' />
                      Mua khóa học ngay
                    </>
                  ) : (
                    'Khóa học tạm hết'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      {course.lessons && course.lessons.length > 0 && (
        <div className='container mx-auto px-4 py-16'>
          <div className='max-w-4xl mx-auto'>
            <div className='mb-8'>
              <h2 className='text-3xl font-black mb-2 flex items-center gap-3'>
                <BookOpen className='w-8 h-8 text-cyan-600' />
                Nội dung khóa học
              </h2>
              <p className='text-gray-600'>
                {course.lessons.length} bài học giúp bạn nắm vững kiến thức
              </p>
            </div>

            <div className='space-y-3'>
              {course.lessons
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((lesson, index) => (
                <Card
                  key={lesson.lessonId}
                  className='hover:shadow-lg transition-all duration-300 border-2 hover:border-cyan-200'
                >
                  <CardHeader
                    className='cursor-pointer'
                    onClick={() => toggleLesson(lesson.lessonId)}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start gap-4 flex-1'>
                        <div className='bg-cyan-100 text-cyan-700 font-bold rounded-full w-10 h-10 flex items-center justify-center text-lg flex-shrink-0'>
                          {index + 1}
                        </div>
                        <div className='flex-1'>
                          <CardTitle className='text-xl mb-2 flex items-center gap-2'>
                            {lesson.title}
                            {lesson.questionCount && (
                              <Badge variant='secondary' className='text-xs'>
                                {lesson.questionCount} câu hỏi
                              </Badge>
                            )}
                          </CardTitle>
                          {expandedLessons.has(lesson.lessonId) && (
                            <CardDescription className='text-base leading-relaxed'>
                              {lesson.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <Button variant='ghost' size='sm' className='flex-shrink-0'>
                        {expandedLessons.has(lesson.lessonId) ? (
                          <ChevronUp className='w-5 h-5' />
                        ) : (
                          <ChevronDown className='w-5 h-5' />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* What you'll learn */}
            <Card className='mt-12 border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50'>
              <CardHeader>
                <CardTitle className='text-2xl flex items-center gap-3'>
                  <CheckCircle2 className='w-7 h-7 text-cyan-600' />
                  Bạn sẽ học được gì?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='grid md:grid-cols-3 gap-6'>
                  <li className='flex items-start gap-3'>
                    <CheckCircle2 className='w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0' />
                    <span>Nắm vững kiến thức {course.courseLenguageName}</span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <CheckCircle2 className='w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0' />
                    <span>Thực hành qua nhiều câu hỏi đa dạng</span>
                  </li>
                  <li className='flex items-start gap-3'>
                    <CheckCircle2 className='w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0' />
                    <span>Học theo lộ trình từ cơ bản đến nâng cao</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default CourseDetailPage
