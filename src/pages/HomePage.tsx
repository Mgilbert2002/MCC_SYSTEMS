import { API_URL } from '../config/api'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, FlaskConical, ShoppingCart, CreditCard, Thermometer, Mail, BarChart3, Lock } from 'lucide-react'
import { Footer } from '../components/Footer'

type Stats = {
  totalFarmers: number
  milkCollectedToday: number
  salesToday: number
  paymentsPending: number
  tankCapacity: number
}

export const HomePage = () => {
  const [stats, setStats] = useState<Stats>({
    totalFarmers: 0,
    milkCollectedToday: 0,
    salesToday: 0,
    paymentsPending: 0,
    tankCapacity: 0
  })

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

  return (
    <div className="homepage">
      <section id="home" className="hero">
        <div className="container hero-container">
          <div className="hero-text">
            <h1>Milk Collection Center Management System</h1>
            <p className="subtitle">Streamline your dairy operations with our comprehensive management platform.</p>
            <p className="description">
              Track milk collection, quality testing, sales, payments, and more.
            </p>
            <div className="hero-buttons">
              <Link to="/about" className="btn btn-secondary">Learn More</Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/milk_image.png" alt="Milk collection" />
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

      <section id="auth" className="auth-section">
        <div className="container auth-container">
          <div className="auth-card">
            <div className="auth-card-icon">
              <Lock size={36} strokeWidth={1.5} />
            </div>
            <h2 className="auth-title">Ready to Get Started?</h2>
            <p className="auth-description">
              Join MCC System today and streamline your milk collection operations.
              Log in to your account or register as a new user.
            </p>
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary">
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-secondary">
                <span>Register</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}