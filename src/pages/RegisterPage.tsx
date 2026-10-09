import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  ImageUp,
  Lock,
  Mail,
  Phone,
  User,
  UserRoundPlus
} from 'lucide-react'
import { API_URL } from '../config/api'
import { Footer } from '../components/Footer'
import './RegisterPage.css'

const initialForm = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: ''
}

export const RegisterPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFieldChange = (field: keyof typeof initialForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.value
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleProfileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setProfileFile(null)
      setProfilePreview(null)
      return
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Profile image must be a valid PNG, JPG, JPEG, or GIF file.')
      return
    }

    if (file.size > 500 * 1024) {
      setError('Profile image must be 500 KB or smaller.')
      return
    }

    setError('')
    setProfileFile(file)
    setProfilePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const trimmedName = form.full_name.trim()
    const trimmedEmail = form.email.trim()

    if (!trimmedName || !trimmedEmail || !form.password || !form.confirmPassword || !form.role) {
      setError('Please complete all required fields.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = new FormData()
      payload.append('full_name', trimmedName)
      payload.append('email', trimmedEmail)
      payload.append('password', form.password)
      payload.append('role', form.role)
      payload.append('phone', form.phone.trim())

      if (profileFile) {
        payload.append('profile_image', profileFile)
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        body: payload
      })

      let data: { message?: string; errors?: Array<{ msg?: string; message?: string; param?: string }> } | null = null
      try {
        data = await response.json()
      } catch {
        data = null
      }

      if (!response.ok) {
        const backendMessage = data?.errors?.map((err) => err.msg || err.message).join(', ') || data?.message || 'Registration failed.'
        throw new Error(backendMessage)
      }

      setSuccess('Registration successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1200)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="register-page">
      <header className="register-header">
        <div className="register-header-inner container">
          <div className="brand-block">
            <img src="/system_image.png" alt="MCC System logo" className="brand-logo" />
            <div className="brand-copy">
              <h1>MCC System</h1>
              <p>Milk Collection Center Management System</p>
            </div>
          </div>

          <div className="header-login">
            <span>Already have an account?</span>
            <Link to="/login" className="login-button">Login</Link>
          </div>
        </div>
      </header>

      <main className="register-shell container single-panel-layout">
        <section className="register-card-panel">
          <div className="register-card">
            <div className="register-card-header">
              <div className="title-icon">
                <UserRoundPlus size={28} strokeWidth={2.2} />
              </div>
              <div className="title-copy">
                <h3>Create Account</h3>
                <p>Fill in the information below to register.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              {error && <div className="form-alert form-alert-error">{error}</div>}
              {success && <div className="form-alert form-alert-success">{success}</div>}

              <div className="form-group">
                <label htmlFor="full_name">Full Name <span className="required-mark">*</span></label>
                <div className="input-wrapper">
                  <User size={18} strokeWidth={2} />
                  <input
                    id="full_name"
                    type="text"
                    value={form.full_name}
                    onChange={handleFieldChange('full_name')}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address <span className="required-mark">*</span></label>
                <div className="input-wrapper">
                  <Mail size={18} strokeWidth={2} />
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleFieldChange('email')}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number <span className="optional-tag">(Optional)</span></label>
                <div className="input-wrapper">
                  <Phone size={18} strokeWidth={2} />
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleFieldChange('phone')}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password <span className="required-mark">*</span></label>
                <div className="input-wrapper with-toggle">
                  <Lock size={18} strokeWidth={2} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleFieldChange('password')}
                    placeholder="Enter your password"
                    required
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password <span className="required-mark">*</span></label>
                <div className="input-wrapper with-toggle">
                  <Lock size={18} strokeWidth={2} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleFieldChange('confirmPassword')}
                    placeholder="Confirm your password"
                    required
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">Role <span className="required-mark">*</span></label>
                <div className="input-wrapper">
                  <User size={18} strokeWidth={2} />
                  <select id="role" value={form.role} onChange={handleFieldChange('role')} required>
                    <option value="">Select your role</option>
                    <option value="manager">Manager</option>
                    <option value="operator">Operator</option>
                    <option value="farmer">Farmer</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="profile_image">Profile Image <span className="optional-tag">(Optional)</span></label>
                <div className="file-picker-wrap">
                  <div className="file-picker-label">
                    <ImageUp size={18} strokeWidth={2} />
                    <span>{profileFile ? profileFile.name : 'Choose File'}</span>
                  </div>
                  <input id="profile_image" type="file" accept="image/png,image/jpeg,image/jpg,image/gif" onChange={handleProfileChange} />
                </div>
                {profilePreview && <img src={profilePreview} alt="Profile preview" className="profile-preview" />}
                <small>Allowed formats: JPG, PNG, GIF. Max size: 500KB.</small>
              </div>

              <button type="submit" className="register-submit" disabled={isSubmitting}>
                <UserRoundPlus size={18} strokeWidth={2} />
                <span>{isSubmitting ? 'Registering...' : 'Register'}</span>
                <ArrowRight size={18} strokeWidth={2} />
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
