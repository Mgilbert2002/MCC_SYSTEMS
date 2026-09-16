import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const UnauthorizedPage = () => (
  <div className="unauthorized">
    <h2>Unauthorized Access</h2>
    <p>You do not have permission to access this page.</p>
    <Link to="/">Go to Dashboard</Link>
  </div>
)

export const ManagerDashboard = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const modules = [
    { name: 'Delivery Reports', path: '/manager/deliveries' },
    { name: 'Sales Reports', path: '/manager/sales' },
    { name: 'Payment Activities', path: '/manager/payments' },
    { name: 'Communication', path: '/manager/communication' },
    { name: 'Product Registration', path: '/manager/products' },
    { name: 'Price Management', path: '/manager/prices' },
    { name: 'Farmer Management', path: '/manager/farmers' },
    { name: 'Operator Management', path: '/manager/operators' },
    { name: 'System Settings', path: '/manager/settings' },
    { name: 'Milk Tank Monitoring', path: '/manager/tank' }
  ]

  return (
    <div className="dashboard">
      <header>
        <h2>Manager Dashboard</h2>
        <span>Welcome, {user?.full_name}</span>
        <button onClick={() => { logout(); navigate('/') }}>Logout</button>
      </header>
      <div className="modules-grid">
        {modules.map((module) => (
          <Link key={module.path} to={module.path} className="module-card">
            {module.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

export const OperatorDashboard = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const modules = [
    { name: 'New Delivery', path: '/operator/delivery/new' },
    { name: 'Milk Quality Testing', path: '/operator/quality' },
    { name: 'Milk Reception Reports', path: '/operator/deliveries' },
    { name: 'New Sale', path: '/operator/sale/new' },
    { name: 'Sale Reports', path: '/operator/sales' },
    { name: 'Milk Tank Monitoring', path: '/operator/tank' },
    { name: 'Communication', path: '/operator/communication' },
    { name: 'Charts and Announcements', path: '/operator/charts' }
  ]

  return (
    <div className="dashboard">
      <header>
        <h2>Operator Dashboard</h2>
        <span>Welcome, {user?.full_name}</span>
        <button onClick={() => { logout(); navigate('/') }}>Logout</button>
      </header>
      <div className="modules-grid">
        {modules.map((module) => (
          <Link key={module.path} to={module.path} className="module-card">
            {module.name}
          </Link>
        ))}
      </div>
    </div>
  )
}