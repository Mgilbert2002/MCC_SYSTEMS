import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../config/api'

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      setMessage(data.message || 'If an account exists, a reset link has been sent.')
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <h1>Reset your password</h1>
        <p>Enter your registered email address.</p>
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '1rem' }}>Send reset link</button>
        </form>
        {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        <Link to="/login" style={{ display: 'block', marginTop: '1rem' }}>Back to login</Link>
      </div>
    </div>
  )
}