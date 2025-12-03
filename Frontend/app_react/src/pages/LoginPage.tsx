import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 text-white rounded-2xl p-8 w-full max-w-md">
        
        <h2 className="text-3xl font-bold text-center mb-2">login</h2>
        {/* <p className="text-gray-400 text-center mb-8">
          please enter your login and password
        </p> */}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              email address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="enter your email"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="enter your password"
            />
          </div>

          <div className="text-sm">
            <a href="#!" className="text-gray-400 hover:text-white">
              forgot password?
            </a>
          </div>

          <button className="w-full bg-transparent border-2 border-white text-white py-3 rounded-lg hover:bg-white hover:text-gray-900 transition-colors font-medium">
            log me in!
          </button>
        </div>

        <div className="flex justify-center gap-4 my-6">
          <a href="#!" className="text-white hover:text-blue-400 transition-colors">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="#!" className="text-white hover:text-blue-400 transition-colors">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
          <a href="#!" className="text-white hover:text-red-400 transition-colors">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
            </svg>
          </a>
        </div>

        <div className="text-center">
          <p className="text-gray-400">
            don't have an account?{' '}
            <a href="#!" className="text-white font-bold hover:underline">
             sign up
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;