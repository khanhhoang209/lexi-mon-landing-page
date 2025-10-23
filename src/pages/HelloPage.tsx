import React from 'react'

const HelloPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'>
      {/* Navigation Bar */}
      <nav className='sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center'>
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-lg'>L</span>
            </div>
            <h1 className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
              LexiMon
            </h1>
          </div>

          <div className='flex items-center space-x-4'>
            <a
              href='mailto:leximon@service.com'
              className='px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-colors'
            >
              Contact Us
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32'>
        <div className='grid md:grid-cols-2 gap-12 items-center'>
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div className='inline-block'>
                <span className='px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full'>
                  Welcome to LexiMon
                </span>
              </div>
              <h2 className='text-4xl sm:text-5xl font-bold text-gray-900 leading-tight'>
                Manage Your Lexicon with{' '}
                <span className='bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                  Intelligence
                </span>
              </h2>
              <p className='text-lg text-gray-600 leading-relaxed'>
                LexiMon is a powerful platform designed to help you organize, manage, and discover vocabulary with
                advanced AI-driven insights.
              </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-4 pt-4'>
              <a
                href='mailto:leximon@service.com'
                className='px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg text-center'
              >
                Get Started
              </a>
              <button
                onClick={() => {
                  const element = document.getElementById('features')
                  element?.scrollIntoView({ behavior: 'smooth' })
                }}
                className='px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-purple-600 hover:text-purple-600 transition-colors'
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className='relative h-96 hidden md:flex items-center justify-center'>
            <div className='absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl opacity-20 blur-3xl'></div>
            <div className='relative'>
              <div className='w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300 flex items-center justify-center'>
                <div className='text-white text-center'>
                  <div className='text-6xl font-bold mb-2'>📚</div>
                  <p className='font-semibold'>Smart Vocabulary</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='bg-white py-20 sm:py-32'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h3 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>Powerful Features</h3>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Everything you need to master and manage your vocabulary efficiently
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {[
              {
                icon: '🎯',
                title: 'Smart Organization',
                description: 'Organize your vocabulary by categories, difficulty levels, and learning progress.'
              },
              {
                icon: '🧠',
                title: 'AI-Powered Learning',
                description: 'Get personalized recommendations and insights based on your learning patterns.'
              },
              {
                icon: '📊',
                title: 'Progress Tracking',
                description: 'Monitor your learning journey with detailed analytics and performance metrics.'
              },
              {
                icon: '🔍',
                title: 'Advanced Search',
                description: 'Find exactly what you need with powerful search and filtering capabilities.'
              },
              {
                icon: '🌐',
                title: 'Multi-language Support',
                description: 'Learn and practice vocabulary across different languages.'
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Experience smooth performance with our optimized infrastructure.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className='p-6 rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 group'
              >
                <div className='text-4xl mb-4 transform group-hover:scale-110 transition-transform'>{feature.icon}</div>
                <h4 className='text-lg font-semibold text-gray-900 mb-2'>{feature.title}</h4>
                <p className='text-gray-600'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32'>
        <div className='bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 sm:p-16 text-white text-center'>
          <h3 className='text-3xl sm:text-4xl font-bold mb-4'>Ready to Transform Your Vocabulary?</h3>
          <p className='text-lg opacity-90 max-w-2xl mx-auto mb-8'>
            Join thousands of learners who are already mastering their vocabulary with LexiMon.
          </p>
          <a
            href='mailto:leximon@service.com'
            className='inline-block px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-colors transform hover:scale-105'
          >
            Start Learning Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-gray-400 py-12 mt-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid md:grid-cols-4 gap-8 mb-8'>
            <div>
              <h4 className='text-white font-bold mb-4'>LexiMon</h4>
              <p className='text-sm'>Master your vocabulary with intelligent learning tools.</p>
            </div>
            <div>
              <h4 className='text-white font-bold mb-4'>Product</h4>
              <ul className='space-y-2 text-sm'>
                <li>
                  <a href='#' className='hover:text-white transition'>
                    Features
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition'>
                    Pricing
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition'>
                    Updates
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='text-white font-bold mb-4'>Support</h4>
              <ul className='space-y-2 text-sm'>
                <li>
                  <a href='#' className='hover:text-white transition'>
                    Documentation
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition'>
                    Help Center
                  </a>
                </li>
                <li>
                  <a href='mailto:leximon@service.com' className='hover:text-white transition'>
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='text-white font-bold mb-4'>Legal</h4>
              <ul className='space-y-2 text-sm'>
                <li>
                  <a href='#' className='hover:text-white transition'>
                    Privacy
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition'>
                    Terms
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition'>
                    License
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-800 pt-8 text-center text-sm'>
            <p>&copy; 2025 LexiMon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HelloPage
