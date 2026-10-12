import { Link } from 'react-router-dom'

export const ForgotPasswordPage = () => {
  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <h1>Reset your password</h1>
        <p>
          This project does not yet expose a dedicated password-reset API endpoint. Add your backend
          reset route and connect it here when the email service is configured.
        </p>
        <Link to="/login" className="primary-btn" style={{ width: '100%' }}>
          Back to login
        </Link>
      </div>
    </div>
  )
}
