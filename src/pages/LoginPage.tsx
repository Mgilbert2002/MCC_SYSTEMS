import './LoginPage.css'
import { API_URL } from '../config/api'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, CreditCard, Eye, EyeOff, Leaf, Lock, Mail, ShieldCheck, Truck, Users } from 'lucide-react'
import { Footer } from '../components/Footer'

const featureList = [
  { icon: Truck, text: 'Track Collections', detail: 'In Real-Time' },
  { icon: CreditCard, text: 'Manage Payments', detail: 'and Reports' },
  { icon: Users, text: 'Connect with Farmers', detail: '& Buyers' },
  { icon: Leaf, text: 'Build a Sustainable', detail: 'Dairy Future' }
]

export const LoginPage = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [status, setStatus] = useState<{ type: 'idle' | 'error' | 'success' | 'info'; message: string }>({
    type: 'idle',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem('mcc_remember_me') === 'true'
    setRememberMe(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('mcc_remember_me', String(rememberMe))
  }, [rememberMe])

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setStatus({ type: 'error', message: 'Please enter both your email and password.' })
      return
    }

    setIsSubmitting(true)
    setStatus({ type: 'info', message: 'Checking your credentials…' })

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email.trim(),
          password: loginData.password
        })
      })

      let data: any = null
      try {
        data = await response.json()
      } catch {
        data = null
      }

      if (!response.ok) {
        if (data && Array.isArray(data.errors)) {
          throw new Error(data.errors.map((error: any) => error.msg).join(', '))
        }
        throw new Error((data && data.message) || 'Login failed. Please check your credentials.')
      }

      if (!data || !data.user) {
        throw new Error('Authentication response was invalid.')
      }

      login(data.user, data.userData)
      localStorage.setItem('token', data.token)
      if (rememberMe) {
        localStorage.setItem('mcc_remember_me', 'true')
      } else {
        localStorage.removeItem('mcc_remember_me')
      }

      setStatus({ type: 'success', message: 'Login successful. Redirecting…' })
      const route = `/${data.user.role}`
      window.setTimeout(() => navigate(route), 700)
    } catch (error) {
      console.error('Login error:', error)
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Invalid credentials. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
    <main className="login-page">
      <div className="login-shell">
        <aside className="login-brand" aria-label="MCC dairy branding">
          <div className="brand-header">
            <div className="brand-mark" aria-hidden="true">
              <span>M</span>
            </div>
            <div className="brand-copy">
              <h1>MCC</h1>
              <p>Milk Collection Center</p>
            </div>
          </div>

          <div className="brand-tagline">Fresh Milk • Healthy Tomorrow</div>

          <div className="login-hero">
            <h2>Welcome Back!</h2>
            <p>Log in to continue managing your milk collection activities.</p>
          </div>

          <ul className="feature-list" aria-label="MCC benefits">
            {featureList.map(({ icon: Icon, text, detail }) => (
              <li key={text} className="feature-item">
                <span className="feature-icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={2.2} />
                </span>
                <span className="feature-copy">
                  <strong>{text}</strong>
                  <small>{detail}</small>
                </span>
              </li>
            ))}
          </ul>

          <div className="leaf-decoration" aria-hidden="true" />
          <div className="brand-wave" aria-hidden="true" />
        </aside>

        <section className="login-form-panel">
          <div className="register-link-row">
            <span>Don't have an account?</span>
            <Link to="/register">Register now <span aria-hidden="true">→</span></Link>
          </div>

          <div className="auth-card">
            <div className="lock-badge" aria-hidden="true">
              <Lock size={32} strokeWidth={2.2} />
            </div>

            <h2>Login to Your Account</h2>
            <p className="auth-subtitle">Enter your credentials to access your dashboard.</p>

            <form className="login-form" onSubmit={handleLogin} noValidate>
              {status.type !== 'idle' && (
                <div className={`status-message ${status.type}`} role="alert">
                  {status.message}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-shell">
                  <Mail size={18} strokeWidth={2} className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(event) => setLoginData((current) => ({ ...current, email: event.target.value }))}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-shell password-shell">
                  <Lock size={18} strokeWidth={2} className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(event) => setLoginData((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>

              <button type="submit" className="primary-btn" disabled={isSubmitting || !loginData.email.trim() || !loginData.password.trim()}>
                <span>{isSubmitting ? 'Logging in...' : 'Login'}</span>
                <ArrowRight size={18} strokeWidth={2.2} />
              </button>
            </form>

            <div className="divider"><span>Or continue with</span></div>

            <div className="social-buttons">
              <button type="button" className="social-btn" disabled title="Google sign-in is not configured yet">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M21.6 12.23c0-.67-.06-1.31-.19-1.92H12v3.63h5.39a4.6 4.6 0 0 1-1.99 3.02v2.52h3.22c1.89-1.74 2.98-4.3 2.98-7.25Z" />
                  <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.22-2.52c-.9.6-2.05.96-3.39.96-2.6 0-4.81-1.75-5.6-4.11H.8v2.65A10 10 0 0 0 12 22Z" />
                  <path fill="#FBBC05" d="M6.4 19.86A6.12 6.12 0 0 1 6 17.2V14.5H2.66A9.97 9.97 0 0 0 2 12c0-1.63.39-3.17 1.08-4.5H6.4v2.7A5.13 5.13 0 0 1 12 8.7c1.31 0 2.49.46 3.42 1.35l2.57-2.57A8.77 8.77 0 0 0 12 3.5a10 10 0 0 0-9.2 5.5l3.6 2.8A6.1 6.1 0 0 1 12 8.7c1.53 0 2.94.54 4.03 1.6l2.57-2.57A8.8 8.8 0 0 0 12 3.5C7.46 3.5 3.4 5.96 1.5 9.75L.7 12.18A10 10 0 0 0 12 22c2.7 0 4.96-.9 6.61-2.44l-3.22-2.52c-.9.6-2.05.96-3.39.96-2.6 0-4.81-1.75-5.6-4.11H.8v2.65A10 10 0 0 0 12 22Z" />
                  <path fill="#EA4335" d="M12 8.7c1.53 0 2.94.54 4.03 1.6l2.57-2.57A8.77 8.77 0 0 0 12 3.5C8.82 3.5 6.12 5.3 4.9 7.9l2.99 2.33A5.08 5.08 0 0 1 12 8.7Z" />
                </svg>
                <span>Google</span>
              </button>

              <button type="button" className="social-btn" disabled title="Microsoft sign-in is not configured yet">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#F25022" d="M2 2h9.5v9.5H2z"/>
                  <path fill="#00A4EF" d="M12.5 2H22v9.5h-9.5z"/>
                  <path fill="#7FBA00" d="M2 12.5h9.5V22H2z"/>
                  <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z"/>
                </svg>
                <span>Microsoft</span>
              </button>
            </div>

            <div className="security-box">
              <div className="security-icon" aria-hidden="true">
                <ShieldCheck size={20} strokeWidth={2.2} />
              </div>
              <div className="security-copy">
                <strong>Your data is safe and secure</strong>
                <p>We use industry-standard security measures.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    <Footer />
    </>
  )
}
