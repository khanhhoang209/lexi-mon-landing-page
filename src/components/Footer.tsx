import React from 'react'
import { Gamepad2, Facebook, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className='text-white mt-20' style={{ background: 'linear-gradient(to right, #80A1BA, #91C4C3, #B4DEBD)' }}>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8'>
          {/* Brand Section */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <div className='bg-white/20 backdrop-blur-sm p-2 rounded-lg shadow-lg'>
                <Gamepad2 className='w-6 h-6 text-gray-700' />
              </div>
              <h3 className='text-2xl font-bold text-gray-800 drop-shadow-sm'>Leximon</h3>
            </div>
            <p className='text-gray-700 text-sm leading-relaxed'>
              Nền tảng học từ vựng thông minh, kết hợp game để mang đến trải nghiệm học tập hiệu quả và thú vị nhất.
            </p>
            <div className='flex gap-3 pt-2'>
              <a
                href='https://www.facebook.com/profile.php?id=61581655463902'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-white/30 backdrop-blur-sm hover:bg-white/40 p-2.5 rounded-full transition-all duration-300 hover:scale-110 shadow-lg'
                aria-label='Facebook'
              >
                <Facebook className='w-5 h-5 text-gray-700' />
              </a>
              <a
                href='https://www.tiktok.com/@_leximon'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-white/30 backdrop-blur-sm hover:bg-white/40 p-2.5 rounded-full transition-all duration-300 hover:scale-110 shadow-lg'
                aria-label='TikTok'
              >
                <svg className='w-5 h-5 text-gray-700' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' />
                </svg>
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className='text-lg font-bold mb-4 flex items-center gap-2 text-gray-800'>
              <div className='h-1 w-8 bg-gray-700/40 rounded-full'></div>
              Hỗ trợ
            </h4>
            <ul className='space-y-2.5'>
              <li>
                <a
                  href='https://www.facebook.com/profile.php?id=61581655463902'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-700 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2 group'
                >
                  <Facebook className='w-4 h-4 text-gray-700 group-hover:scale-110 transition-transform' />
                  <span>Liên hệ qua Facebook</span>
                  <ExternalLink className='w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity' />
                </a>
              </li>
              <li>
                <a
                  href='mailto:support@leximon.com'
                  className='text-gray-700 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2 group'
                >
                  <Mail className='w-4 h-4 text-gray-700 group-hover:scale-110 transition-transform' />
                  <span>support@leximon.com</span>
                </a>
              </li>
              <li>
                <a
                  href='tel:+84123456789'
                  className='text-gray-700 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2 group'
                >
                  <Phone className='w-4 h-4 text-gray-700 group-hover:scale-110 transition-transform' />
                  <span>+84 123 456 789</span>
                </a>
              </li>
              <li className='flex items-start gap-2 text-gray-700'>
                <MapPin className='w-4 h-4 text-gray-700 mt-0.5 flex-shrink-0' />
                <span className='text-sm'>
                  Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, Ho Chi Minh City, Vietnam
                </span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className='text-lg font-bold mb-4 flex items-center gap-2 text-gray-800'>
              <div className='h-1 w-8 bg-gray-700/40 rounded-full'></div>
              Kênh truyền thông
            </h4>
            <ul className='space-y-2.5'>
              <li>
                <a
                  href='https://www.facebook.com/profile.php?id=61581655463902'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-700 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2 group'
                >
                  <Facebook className='w-4 h-4 text-gray-700 group-hover:scale-110 transition-transform' />
                  <span>Facebook Official</span>
                  <ExternalLink className='w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity' />
                </a>
              </li>
              <li>
                <a
                  href='https://www.tiktok.com/@_leximon'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-700 hover:text-gray-900 transition-colors duration-200 flex items-center gap-2 group'
                >
                  <svg
                    className='w-4 h-4 text-gray-700 group-hover:scale-110 transition-transform'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' />
                  </svg>
                  <span>TikTok Leximon</span>
                  <ExternalLink className='w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity' />
                </a>
              </li>
            </ul>
            <div className='mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 shadow-lg'>
              <p className='text-sm text-gray-800 mb-2'>
                <span className='font-semibold'>Theo dõi chúng tôi</span> để nhận thông tin mới nhất!
              </p>
              <div className='flex gap-2'>
                <div className='h-2 flex-1 bg-gray-700/30 rounded-full overflow-hidden'>
                  <div className='h-full bg-gray-700/60 rounded-full animate-pulse w-3/4'></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-gray-600/30 pt-8 mt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-gray-700 text-sm text-center md:text-left'>
              &copy; 2025 <span className='font-semibold text-gray-800'>Leximon</span>. All rights reserved.
            </p>
            <div className='flex gap-6 text-sm'>
              <a href='#' className='text-gray-700 hover:text-gray-900 transition-colors duration-200'>
                Điều khoản sử dụng
              </a>
              <a href='#' className='text-gray-700 hover:text-gray-900 transition-colors duration-200'>
                Chính sách bảo mật
              </a>
              <a href='#' className='text-gray-700 hover:text-gray-900 transition-colors duration-200'>
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
