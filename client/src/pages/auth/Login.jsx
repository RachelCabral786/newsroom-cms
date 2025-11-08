import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/common/ThemeToggle';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData);

    if (result.success) {
      navigate(from, { replace: true });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Theme Toggle in corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Newsroom CMS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white dark:bg-dark-card p-8 rounded-lg shadow-lg transition-colors duration-200" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-bg rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-bg rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:text-blue-700">
                Register here
              </Link>
            </p>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 border-t border-gray-200 dark:border-dark-border pt-6 bg-white dark:bg-dark-card p-6 rounded-lg shadow-lg transition-colors duration-200">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">Demo Credentials:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 dark:bg-dark-bg p-2 rounded border border-gray-200 dark:border-dark-border">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Admin</p>
              <p className="text-gray-600 dark:text-gray-400">admin@newsroom.com</p>
            </div>
            <div className="bg-gray-50 dark:bg-dark-bg p-2 rounded border border-gray-200 dark:border-dark-border">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Editor</p>
              <p className="text-gray-600 dark:text-gray-400">editor@newsroom.com</p>
            </div>
            <div className="bg-gray-50 dark:bg-dark-bg p-2 rounded border border-gray-200 dark:border-dark-border">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Writer</p>
              <p className="text-gray-600 dark:text-gray-400">writer@newsroom.com</p>
            </div>
            <div className="bg-gray-50 dark:bg-dark-bg p-2 rounded border border-gray-200 dark:border-dark-border">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Reader</p>
              <p className="text-gray-600 dark:text-gray-400">reader@newsroom.com</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">Password: demo123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;