import './LoginPage.css'
import { API_URL } from '../config/api'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, CreditCard, Eye, EyeOff, Leaf, Lock, Mail, ShieldCheck, Truck, Users } from 'lucide-react'
import { Footer } from '../components/Footer'

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
            <li><Truck size={15} /> Track collections in realtime</li>
            <li><CreditCard size={15} /> manage payments and report</li>
            <li><Users size={15} /> connect with formers and buyers</li>
            <li><Leaf size={15} /> build a sustainnable daily future</li>
          </ul>

          {/* <div className="leaf-decoration" aria-hidden="true" />
          <div className="brand-wave" aria-hidden="true" /> */}
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

          <div className="leaf-decoration" aria-hidden="true" />
          <div className="brand-wave" aria-hidden="true" />
        </section>
      </div>
    </main>
    <Footer />
    </>
  )
}
