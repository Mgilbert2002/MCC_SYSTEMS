import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_URL } from '../config/api'

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Reset failed'); return }
      setMessage('Password reset successful. Redirecting...')
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <h1>Set new password</h1>
        <form onSubmit={handleSubmit}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" required />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm New Password" required style={{ marginTop: '0.5rem' }} />
          <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '1rem' }}>Reset password</button>
        </form>
        {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </div>
    </div>
  )
}