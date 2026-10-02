import { API_URL } from '../config/api'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'
import { Package, FlaskConical, ShoppingCart, CreditCard, Thermometer, Mail, BarChart3 } from 'lucide-react'

type Stats = {
  totalFarmers: number
  milkCollectedToday: number
  salesToday: number
  paymentsPending: number
  tankCapacity: number
}

export const HomePage = () => {
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'farmer' as UserRole,
    profile_image: null as File | null
  })
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalFarmers: 0,
    milkCollectedToday: 0,
    salesToday: 0,
    paymentsPending: 0,
    tankCapacity: 0
  })
  const { login } = useAuth()
  const navigate = useNavigate()

  const fetchStats = () => {
    fetch(`${API_URL}/stats`)
      .then(res => {
        if (!res.ok) return
        return res.json()
      })
      .then(data => {
        if (data) setStats(data)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setSuccessMsg('')

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
        // Handle validation errors from server
        if (data && Array.isArray(data.errors)) {
          // Format validation errors for display
          const errorMessages = data.errors.map((err: any) => err.msg).join(', ')
          throw new Error(errorMessages || 'Validation failed')
        }
        
        // Handle other server errors
        const message = data && data.message ? data.message : 'Login failed'
        throw new Error(message)
      }

      // If we get here, response is ok
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

const validateRegister = () => {
  const errors: Record<string, string> = {}
  if (!registerData.fullName.trim()) errors.fullName = 'Full name is required'
  else if (registerData.fullName.trim().length < 3) errors.fullName = 'Full name must be at least 3 characters'
  if (!registerData.phone.trim()) errors.phone = 'Phone number is required'
  else if (!/^\d{10}$/.test(registerData.phone.replace(/\s/g, ''))) errors.phone = 'Phone number must be exactly 10 digits'
  if (!registerData.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) errors.email = 'Enter a valid email address'
  if (!registerData.password) errors.password = 'Password is required'
  else if (registerData.password.length < 6) errors.password = 'Password must be at least 6 characters'
  else if (!/[A-Z]/.test(registerData.password) || !/[a-z]/.test(registerData.password) || !/[0-9]/.test(registerData.password)) errors.password = 'Password must contain uppercase, lowercase, and number'
  if (!registerData.confirmPassword) errors.confirmPassword = 'Please confirm your password'
  else   if (registerData.password !== registerData.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return errors
}

const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')
    setSuccessMsg('')

    const errors = validateRegister()
    setRegisterErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      const formData = new FormData()
      formData.append('email', registerData.email)
      formData.append('password', registerData.password)
      formData.append('full_name', registerData.fullName)
      formData.append('role', registerData.role)
      formData.append('phone', registerData.phone)
      if (registerData.profile_image) {
        formData.append('profile_image', registerData.profile_image)
      }

       const response = await fetch(`${API_URL}/auth/register`, {
         method: 'POST',
         body: formData
       })

      let data
      let responseText = ''
      try {
        responseText = await response.text()
        data = JSON.parse(responseText)
      } catch (e) {
        data = null
      }

      if (!response.ok) {
        if (data && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.msg).join(', ')
          throw new Error(errorMessages || 'Validation failed')
        }
        let message = `HTTP ${response.status}: Registration failed`
        if (data && data.message) {
          message = `HTTP ${response.status}: ${data.message}`
        } else if (data) {
          message = `HTTP ${response.status}: Invalid response: ${JSON.stringify(data)}`
        } else if (responseText) {
          message = `HTTP ${response.status}: Invalid JSON response: ${responseText.substring(0, 100)}`
        }
        throw new Error(message)
      }

      if (!data) {
        throw new Error('Invalid JSON response')
      }

      setSuccessMsg('Registration successful! Please login.')
      setRegisterData({ email: '', password: '', confirmPassword: '', fullName: '', phone: '', role: 'farmer', profile_image: null })
      setImagePreview(null)
    } catch (err) {
      console.error('Registration error:', err)
      setRegisterError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500 * 1024) {
        setRegisterErrors({ ...registerErrors, profile_image: 'Image must be less than 500KB' })
        return
      }
      setRegisterData({ ...registerData, profile_image: file })
      setRegisterErrors({ ...registerErrors, profile_image: '' })
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="homepage">
      <section id="home" className="hero">
        <div className="container hero-container">
          <div className="hero-text">

            <p className="subtitle">Milk Collection Center Management System</p>
            <p className="description">
              Streamline your dairy operations with our comprehensive management platform.
              Track milk collection, quality testing, sales, payments, and more.
            </p>
            <div className="hero-buttons">
              <a href="#auth" className="btn btn-primary">Get Started</a>
              <a href="#features" className="btn btn-secondary">Learn More</a>
            </div>
          </div>
          <div className="hero-image">
            <img src="/milk_image.png" alt="Milk collection" />
          </div>
        </div>
      </section>

      <section id="auth" className="auth-section">
        <div className="container">
          <h2>Access Your Account</h2>
          <div className="auth-container">
            <form onSubmit={handleRegister} className="auth-form">
              <h3>Register</h3>
              {successMsg && <div className="success">{successMsg}</div>}
              {registerError && <div className="error">{registerError}</div>}
              <div className="form-group">
                <label><i className="fas fa-user"></i> Full Name</label>
                <input type="text" value={registerData.fullName} onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })} onBlur={() => setTouched({ ...touched, fullName: true })} required />
                {touched.fullName && registerErrors.fullName && <span className="field-error">{registerErrors.fullName}</span>}
              </div>
              <div className="form-group">
                <label><i className="fas fa-phone"></i> Phone</label>
                <input type="tel" value={registerData.phone} onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })} onBlur={() => setTouched({ ...touched, phone: true })} />
                {touched.phone && registerErrors.phone && <span className="field-error">{registerErrors.phone}</span>}
              </div>
              <div className="form-group">
                <label><i className="fas fa-user-tag"></i> Role</label>
                <select value={registerData.role} onChange={(e) => setRegisterData({ ...registerData, role: e.target.value as UserRole })}>
                  <option value="farmer">Farmer</option>
                  <option value="operator">Operator</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="form-group">
                <label><i className="fas fa-camera"></i> Profile Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} onBlur={() => setTouched({ ...touched, profile_image: true })} className="form-file-input" />
                {touched.profile_image && registerErrors.profile_image && <span className="field-error">{registerErrors.profile_image}</span>}
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email</label>
                <input type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} onBlur={() => setTouched({ ...touched, email: true })} required />
                {touched.email && registerErrors.email && <span className="field-error">{registerErrors.email}</span>}
              </div>
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Password</label>
                <div className="password-field">
                  <input type={showRegisterPassword ? 'text' : 'password'} value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} onBlur={() => setTouched({ ...touched, password: true })} required placeholder="min 6 characters" />
                  <button type="button" className="toggle-password" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                    <i className={showRegisterPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                  </button>
                </div>
                {touched.password && registerErrors.password && <span className="field-error">{registerErrors.password}</span>}
              </div>
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Confirm Password</label>
                <div className="password-field">
                  <input type={showConfirmPassword ? 'text' : 'password'} value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} onBlur={() => setTouched({ ...touched, confirmPassword: true })} required />
                  <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                  </button>
                </div>
                {touched.confirmPassword && registerErrors.confirmPassword && <span className="field-error">{registerErrors.confirmPassword}</span>}
              </div>
              <button type="submit" className="btn btn-primary"><i className="fas fa-user-plus"></i> Register</button>
            </form>

            <form onSubmit={handleLogin} className="auth-form">
              <h3>Login</h3>
              {loginError && <div className="error">{loginError}</div>}
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email</label>
                <input type="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Password</label>
                <div className="password-field">
                  <input type={showLoginPassword ? 'text' : 'password'} value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
                  <button type="button" className="toggle-password" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                    <i className={showLoginPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                  </button>
                </div>
              </div>
              <div className="form-group remember-group">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
              </div>
              <button type="submit" className="btn btn-primary"><i className="fas fa-sign-in-alt"></i> Login</button>
            </form>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="container">
          <h2>System Modules</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Package size={40} strokeWidth={1.5} /></div>
              <h4>Milk Collection</h4>
              <p>Track daily milk deliveries from farmers with quantity and quality metrics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><FlaskConical size={40} strokeWidth={1.5} /></div>
              <h4>Quality Testing</h4>
              <p>Laboratory testing for milk appearance, smell, taste and composition</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><ShoppingCart size={40} strokeWidth={1.5} /></div>
              <h4>Sales Management</h4>
              <p>Record and manage milk product sales with pricing and client tracking</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><CreditCard size={40} strokeWidth={1.5} /></div>
              <h4>Payments</h4>
              <p>Process payments to farmers and track payment history</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Thermometer size={40} strokeWidth={1.5} /></div>
              <h4>Tank Monitoring</h4>
              <p>Real-time monitoring of milk storage tank capacity and levels</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Mail size={40} strokeWidth={1.5} /></div>
              <h4>Communication</h4>
              <p>Internal messaging system for farmers, operators and managers</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><BarChart3 size={40} strokeWidth={1.5} /></div>
              <h4>Reports & Analytics</h4>
              <p>Comprehensive reports on milk production, sales and payments</p>
            </div>
          </div>
        </div>
      </section>

      <section id="stats" className="stats-section">
        <div className="container">
          <h2>System Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalFarmers}</div>
              <div className="stat-label">Total Farmers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{+(stats.milkCollectedToday || 0).toFixed(2)} L</div>
              <div className="stat-label">Milk Collected Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">rwf{stats.salesToday.toLocaleString()}</div>
              <div className="stat-label">Sales Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.paymentsPending}</div>
              <div className="stat-label">Payments Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.tankCapacity > 0 ? Math.round((stats.tankCapacity / 1000) * 100) + '%' : '0%'}</div>
              <div className="stat-label">Tank Capacity</div>
            </div>
          </div>
        </div>
      </section>

      <footer id="footer" className="app-footer">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <h4>MCC System</h4>
            <p className="footer-description">
              Milk Collection Center Management System, A comprehensive solution for managing milk collection,
              quality testing, processing, and distribution operations.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-link-item">
                <i className="fab fa-facebook-f"></i> Facebook
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="social-link-item">
                <i className="fab fa-twitter"></i> Twitter
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link-item">
                <i className="fab fa-instagram"></i> Instagram
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="social-link-item">
                <i className="fab fa-youtube"></i> YouTube
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="/">About Us</a></li>
              <li><a href="/">Quality Standards</a></li>
              <li><a href="/">Sustainability</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Our Services</h4>
            <ul className="footer-links">
              <li><a href="/">Milk Reception</a></li>
              <li><a href="/">Quality Control</a></li>
              <li><a href="/">Processing & Packaging</a></li>
              <li><a href="/">Distribution & Sales</a></li>
              <li><a href="/">Farmer Support</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><a href="/">Help Center</a></li>
              <li><a href="/">Contact Us</a></li>
              <li><a href="/">Report an Issue</a></li>
              <li><a href="/">Feedback</a></li>
            </ul>
          </div>

          <div className="footer-section footer-contact">
            <h4>Contact Us</h4>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>Kigali,Rwanda</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <span>+250798849526</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <span>info@mcc.rw</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-clock"></i>
              <span>Current Time: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">&copy; 2026 MCC System. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="/">Privacy Policy</a>
              <a href="/">Terms of Service</a>
              <a href="/">Cookie Policy</a>
              <a href="/">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}