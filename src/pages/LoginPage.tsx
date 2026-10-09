import './LoginPage.css'
import { API_URL } from '../config/api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Shield, Truck, Users, Package, Leaf } from 'lucide-react'
import { Footer } from '../components/Footer'

export const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      })

      let data
      try {
        data = await response.json()
      } catch (e) {
        data = null
      }

      if (!response.ok) {
        if (data && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.msg).join(', ')
          throw new Error(errorMessages || 'Validation failed')
        }
        
        const message = data && data.message ? data.message : 'Login failed'
        throw new Error(message)
      }

      if (!data) {
        throw new Error('Invalid JSON response')
      }

      login(data.user, data.userData)
      localStorage.setItem('token', data.token)
      navigate(`/${data.user.role}`)
    } catch (err) {
      console.error('Login error:', err)
      setLoginError(err instanceof Error ? err.message : 'Invalid credentials')
    }
  }

  const features = [
    { icon: Truck, title: 'Track Collections in Real-Time', desc: 'Monitor milk deliveries from farm to center instantly' },
    { icon: Package, title: 'Manage Payments and Reports', desc: 'Automated payments, invoices, and detailed analytics' },
    { icon: Users, title: 'Connect with Farmers & Buyers', desc: 'Seamless communication across the dairy supply chain' },
    { icon: Leaf, title: 'Build a Sustainable Dairy Future', desc: 'Eco-friendly practices for lasting agricultural impact' }
  ]

  return (
    <div className="login-page">
      <div className="login-content">
        {/* Left Side - MCC Dairy Experience */}
        <div className="login-left">
        <div className="left-content">
          

          <div className="welcome-section">
            <h2>Welcome Back!</h2>
            <p>Log in to continue managing your milk collection activities.</p>
          </div>

          <div className="features-section">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">
                  <feature.icon size={24} strokeWidth={2} />
                </div>
                <div className="feature-text">
                  <h4>{feature.title}</h4>
                  <p>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>


        </div>
      </div>

      {/* Right Side - Login Card */}
      <div className="login-right">
        <div className="right-content">
          <div className="create-account-link">
            <span>Don't have an account?</span>
            <Link to="/register">Create an account</Link>
          </div>

          <div className="login-header">
            <div className="lock-icon">
              <Lock size={32} strokeWidth={2} />
            </div>
            <h2>Login to Your Account</h2>
            <p>Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {loginError && <div className="error-message">{loginError}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} strokeWidth={2} />
                <input
                  type="email"
                  id="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={20} strokeWidth={2} />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  id="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button type="submit" className="btn-login" disabled={!loginData.email || !loginData.password}>
              <span>Login</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="social-btn google" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
            <button type="button" className="social-btn microsoft" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#F25022" d="M16.53 11.67H8.91V22.5H0V11.67H0V0h8.91v11.67z"/>
                <path fill="#7FBA00" d="M24 11.67H16.38V22.5H7.47V11.67H0V0h7.47v11.67h8.91v11.67z"/>
                <path fill="#00A4EF" d="M24 0h-8.91v11.67h8.91V0zm-8.91 22.5h8.91V11.67H15.09V22.5z"/>
                <path fill="#FFB900" d="M7.47 0H0v22.5h7.47V11.67H15.09V0H7.47z"/>
              </svg>
              <span>Microsoft</span>
            </button>
          </div>

          <div className="security-message">
            <div className="security-icon">
              <Shield size={20} strokeWidth={2} />
            </div>
            <div className="security-text">
              <strong>Your data is safe and secure</strong>
              <p>We use industry-standard security measures.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
  )
}