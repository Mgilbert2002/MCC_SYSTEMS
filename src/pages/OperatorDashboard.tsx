import { API_URL } from '../config/api'
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Truck,
  FlaskRound,
  FileText,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  Megaphone,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  Droplet,
  CheckCircle,
  XCircle,
  Banknote,
  Thermometer,
  Users
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import type { Sale } from '../types'
import './OperatorDashboard.css';

type Delivery = {
  delivery_id: number
  delivery_time: string
  delivery_date: string
  farmer: { farmer_code?: string; user?: { full_name: string } } | null
  quantity_kg: number
  total_cost: number
  status: string
  payment_status: string
  expected_payment_date?: string | null
  expected_payment_time?: string | null
}

type PendingPayment = {
  payment_id: number | null
  farmer: { farmer_code?: string; user?: { full_name: string } } | null
  delivery: Delivery
  amount_paid: number
  unpaid_balance: number
  payment_method: string | null
  payment_date: string | null
  processed_by: number | null
}

type PendingClient = {
  client_id: string
  client_type?: 'farmer' | 'sale'
  farmer_id?: number
  farmer?: { farmer_code?: string; user?: { full_name: string } } | null
  client_name?: string
  deliveries: Delivery[]
  sales: {
    sale_id: number
    client_name?: string
    total_cost: number
    sale_date: string
    payment_status: string
  }[]
  amount_paid: number
  unpaid_balance: number
  expected_payment_date?: string | null
  expected_payment_time?: string | null
}

type Announcement = {
  announcement_id: number
  title: string
  message: string
  date: string
  type: string
}

type Notification = {
  title: string
  message: string
  time: string
  unread: boolean
}

type Stats = {
  totalFarmers: number
  milkCollectedToday: number
  salesToday: number
  paymentsPending: number
  clientsNotPaying: number
  tankCapacity: number
  tankLastUpdated: string | null
  tankCapacityLiters: number
}

const TANK_GAUGE_CIRCUMFERENCE = 251

const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const OperatorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '', phone: '' })
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [profileImageKey, setProfileImageKey] = useState(0)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [stats, setStats] = useState<Stats>({
    totalFarmers: 0,
    milkCollectedToday: 0,
    salesToday: 0,
    paymentsPending: 0,
    clientsNotPaying: 0,
    tankCapacity: 0,
    tankLastUpdated: null,
    tankCapacityLiters: 15000
  })
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [deliveriesTodayCount, setDeliveriesTodayCount] = useState(0)
  const [deliveriesTotalCount, setDeliveriesTotalCount] = useState(0)
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>([])
  const [salesData, setSalesData] = useState<{ day: string; sales: number }[]>([])
  const [milkData, setMilkData] = useState<{ day: string; quantity: number }[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [pendingPaymentsOpen, setPendingPaymentsOpen] = useState(false)
  const [pendingPaymentsLoading, setPendingPaymentsLoading] = useState(false)
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([])
  const [pendingClientsOpen, setPendingClientsOpen] = useState(false)
  const [pendingClientsLoading, setPendingClientsLoading] = useState(false)
  const [selectedPendingPayment, setSelectedPendingPayment] = useState<PendingPayment | null>(null)
  const [selectedPendingClient, setSelectedPendingClient] = useState<PendingClient | null>(null)
  const [scheduleForm, setScheduleForm] = useState({ expected_payment_date: '', expected_payment_time: '' })
  const [scheduleError, setScheduleError] = useState('')
  const [scheduleSuccess, setScheduleSuccess] = useState('')
  const unreadCount = notifications.filter(n => n.unread).length
  const { logout, user, userData, setUser, setUserData } = useAuth()
  const navigate = useNavigate()
  const tankPercentage = (stats.tankCapacityLiters || 15000) > 0 ? Math.min(100, Math.round((stats.tankCapacity / (stats.tankCapacityLiters || 15000)) * 100)) : 0
  const tankStatus = tankPercentage >= 90 ? 'critical' : tankPercentage >= 75 ? 'high' : tankPercentage >= 25 ? 'normal' : 'low'
  const tankStrokeColor = tankStatus === 'critical' ? '#ef4444' : tankStatus === 'high' ? '#f97316' : tankStatus === 'low' ? '#3b82f6' : '#2d9e6b'
  const formatCurrency = (value: number) => Number(value || 0).toLocaleString()

  const fetchPendingPayments = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setPendingPaymentsLoading(true)
    try {
      const response = await fetch(`${API_URL}/payments/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data: PendingPayment[] = await response.json()
        setPendingPayments(data)
      }
    } catch (err) {
      console.error('Failed to fetch pending payments:', err)
    } finally {
      setPendingPaymentsLoading(false)
    }
  }

  const fetchPendingClients = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setPendingClientsLoading(true)
    try {
      const response = await fetch(`${API_URL}/payments/pending/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data: PendingClient[] = await response.json()
        setPendingClients(data)
      }
    } catch (err) {
      console.error('Failed to fetch pending clients:', err)
    } finally {
      setPendingClientsLoading(false)
    }
  }

  const openPaymentSchedule = (payment: PendingPayment) => {
    setSelectedPendingPayment(payment)
    setScheduleForm({
      expected_payment_date: payment.delivery.expected_payment_date || new Date().toISOString().split('T')[0],
      expected_payment_time: payment.delivery.expected_payment_time || ''
    })
    setScheduleError('')
    setScheduleSuccess('')
  }

  const savePaymentSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPendingPayment) return

    const token = localStorage.getItem('token')
    if (!token) return

    setScheduleError('')
    setScheduleSuccess('')

    try {
      const response = await fetch(`${API_URL}/payments/pending/${selectedPendingPayment.delivery.delivery_id}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(scheduleForm)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm payment time')
      }

      setPendingPayments(prev => prev.map(payment => (
        payment.delivery.delivery_id === data.delivery_id
          ? { ...payment, delivery: data }
          : payment
      )))
      setSelectedPendingPayment(prev => prev ? { ...prev, delivery: data } : null)
      setScheduleSuccess('Payment time confirmed successfully')
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : 'Failed to confirm payment time')
    }
  }

  const openClientPaymentSchedule = (client: PendingClient) => {
    setSelectedPendingClient(client)
    setScheduleForm({
      expected_payment_date: client.expected_payment_date || new Date().toISOString().split('T')[0],
      expected_payment_time: client.expected_payment_time || ''
    })
    setScheduleError('')
    setScheduleSuccess('')
  }

  const saveClientPaymentSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPendingClient || !selectedPendingClient.farmer_id) return

    const token = localStorage.getItem('token')
    if (!token) return

    setScheduleError('')
    setScheduleSuccess('')

    try {
      const response = await fetch(`${API_URL}/payments/pending/clients/${selectedPendingClient.farmer_id}/schedule`,  {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(scheduleForm)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm client payment time')
      }

      setPendingClients(prev => prev.map(client => (
        client.farmer_id === data.farmer_id
          ? { ...client, expected_payment_date: scheduleForm.expected_payment_date, expected_payment_time: scheduleForm.expected_payment_time, deliveries: data.deliveries }
          : client
      )))
      setSelectedPendingClient(prev => prev ? { ...prev, expected_payment_date: scheduleForm.expected_payment_date, expected_payment_time: scheduleForm.expected_payment_time } : null)
      setScheduleSuccess('Client payment time confirmed successfully')
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : 'Failed to confirm client payment time')
    }
  }

  const markClientPaymentStatus = async (client: PendingClient, paymentStatus: 'paid' | 'unpaid') => {
    const token = localStorage.getItem('token')
    if (!token) return

    setScheduleError('')
    setScheduleSuccess('')

    try {
      const response = await fetch(`${API_URL}/payments/pending/clients/${client.client_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_status: paymentStatus,
          client_type: client.client_type || 'farmer',
          sale_ids: client.sales.map(sale => sale.sale_id)
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update client payment status')
      }

      setPendingClients(prev => prev.filter(item => item.client_id !== client.client_id || paymentStatus === 'unpaid'))
      setPendingPayments(prev => {
        const paidDeliveryIds = new Set(data.deliveries.map((delivery: Delivery) => delivery.delivery_id))
        return paymentStatus === 'paid'
          ? prev.filter(payment => !paidDeliveryIds.has(payment.delivery.delivery_id))
          : prev.map(payment => paidDeliveryIds.has(payment.delivery.delivery_id) ? { ...payment, delivery: { ...payment.delivery, payment_status: 'unpaid' } } : payment)
      })
      setSelectedPendingClient(null)
      window.dispatchEvent(new CustomEvent('payment-status-changed', {
        detail: { client_id: client.client_id, payment_status: paymentStatus }
      }))
      setScheduleSuccess(paymentStatus === 'paid' ? 'Client marked as paid' : 'Client marked as unpaid')
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : 'Failed to update client payment status')
    }
  }

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const headers = { Authorization: `Bearer ${token}` }

try {
       const [statsRes, deliveriesRes, announcementsRes, salesRes, paymentsRes, clientsRes] = await Promise.all([
         fetch(`${API_URL}/stats`, { headers }),
fetch(`${API_URL}/deliveries`, { headers }),
fetch(`${API_URL}/announcements`, { headers }),
fetch(`${API_URL}/sales`, { headers }),
fetch(`${API_URL}/payments/pending`, { headers }),
fetch(`${API_URL}/payments/pending/clients`, { headers })
       ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (deliveriesRes.ok) {
        const deliveriesData: Delivery[] = await deliveriesRes.json()
        const todayStr = new Date().toISOString().split('T')[0]
        const todayCount = deliveriesData.filter(d => d.delivery_date === todayStr).length
        setDeliveries(deliveriesData.slice(0, 5))
        setDeliveriesTotalCount(deliveriesData.length)
        setDeliveriesTodayCount(todayCount)

        const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const milkByDay: { day: string; quantity: number }[] = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          milkByDay.push({
            day: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            quantity: 0
          })
        }
        deliveriesData.forEach(d => {
          if (d.delivery_date && d.delivery_date >= sevenDaysAgo) {
            const dateObj = new Date(d.delivery_date + 'T00:00:00')
            const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            const existing = milkByDay.find(item => item.day === label)
            if (existing) {
              existing.quantity += Number(d.quantity_kg)
            }
          }
        })
        setMilkData(milkByDay.map(item => ({ day: item.day, quantity: Math.round(item.quantity * 100) / 100 })))
      }

if (announcementsRes.ok) {
         const announcementsData = await announcementsRes.json()
         setAnnouncementsList(announcementsData.slice(0, 3).map((a: any) => ({
           ...a,
           date: a.created_at || a.date
         })))
       }

      if (salesRes.ok) {
        const salesList: Sale[] = await salesRes.json()
        const salesByDay: { day: string; dateKey: string; sales: number }[] = []
        const salesMap: Record<string, number> = {}

        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          const dateKey = getLocalDateKey(date)
          salesMap[dateKey] = 0
          salesByDay.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            dateKey,
            sales: 0
          })
        }

        salesList.forEach(sale => {
          const saleDate = new Date(`${sale.sale_date}T00:00:00`)
          const dateKey = getLocalDateKey(saleDate)
          if (salesMap[dateKey] !== undefined) {
            salesMap[dateKey] += Number(sale.total_cost || 0)
          }
        })

        setSalesData(salesByDay.map(item => ({
          day: item.day,
          sales: Math.round(salesMap[item.dateKey] * 100) / 100
        })))
      }

      if (paymentsRes.ok) {
        setPendingPayments(await paymentsRes.json())
      }

      if (clientsRes.ok) {
        setPendingClients(await clientsRes.json())
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (announcementsList.length > 0 || stats.tankCapacity > 0) {
      const tankPercent = stats.tankCapacityLiters > 0 ? Math.min(100, Math.round((stats.tankCapacity / stats.tankCapacityLiters) * 100)) : 0
      const tankNotif: Notification = {
        title: 'Tank Level Alert',
        message: `Current tank level: ${tankPercent}%`,
        time: 'Live',
        unread: tankPercent <= 75
      }
      setNotifications([tankNotif, ...announcementsList.map(a => ({
        title: a.title,
        message: a.message,
        time: (a as any).created_at ? new Date((a as any).created_at).toLocaleDateString() : a.date ? new Date(a.date).toLocaleDateString() : 'Recent',
        unread: true
      }))])
    }
  }, [announcementsList, stats.tankCapacity, stats.tankCapacityLiters])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getProfileImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "/system_image.png"
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath
    if (imagePath.startsWith('/')) return `${imagePath}?t=${profileImageKey}`
    return `/uploads/${imagePath}?t=${profileImageKey}`
  }

  const openProfile = () => {
    setProfileForm({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    })
    setProfileImagePreview(getProfileImageUrl(user?.profile_image) || "/system_image.png")
    setProfileOpen(true)
    setProfileError('')
    setProfileSuccess('')
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500 * 1024) {
        setProfileError('Image must be less than 500KB')
        return
      }
      setProfileImageFile(file)
      setProfileImagePreview(URL.createObjectURL(file))
      setProfileError('')
    }
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const formData = new FormData()
      formData.append('user_id', String(user?.user_id))
      formData.append('full_name', profileForm.full_name)
      formData.append('email', profileForm.email)
      formData.append('phone', profileForm.phone || '')
      if (profileImageFile) {
        formData.append('profile_image', profileImageFile)
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }

      setUser(data.user)
      if (data.userData) {
        setUserData(data.userData)
        localStorage.setItem('userData', JSON.stringify(data.userData))
      }
      localStorage.setItem('user', JSON.stringify(data.user))
      setProfileImageKey(Date.now())
      setProfileSuccess('Profile updated successfully')
      setProfileImageFile(null)
      setTimeout(() => {
        setProfileOpen(false)
        setProfileSuccess('')
      }, 1500)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile')
    }
  }

  const toggleMenu = (name: string) => {
    setExpandedMenu(expandedMenu === name ? null : name)
  }

  const menuItems = [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/operator' },
      {
        name: 'Raw Milk Reception',
        icon: Droplet,
        subItems: [
          { name: 'New Delivery', path: '/operator/delivery/new' },
          { name: 'History', path: '/operator/deliveries' }
        ]
      },
      { name: 'Milk Tank Monitoring', icon: Thermometer, path: '/operator/tank' },
      { name: 'Quality Testing', icon: FlaskRound, path: '/operator/quality' },
      { name: 'Reception Report', icon: FileText, path: '/operator/deliveries' },
      {
        name: 'Product Sale',
        icon: ShoppingCart,
        subItems: [
          { name: 'New Sales', path: '/operator/sale/new' },
          { name: 'History', path: '/operator/sales' }
        ]
      },
      {
        name: 'Communication',
        icon: MessageSquare,
        subItems: [
          { name: 'Chart', path: '/operator/charts' },
          { name: 'Analytics', path: '/operator/charts' }
        ]
      },
      { name: 'Announcements', icon: Megaphone, path: '/operator/announcements' },
      { name: 'Logout', icon: LogOut, path: '#', onClick: handleLogout }
    ]

   return (
     <div className="operator-dashboard">
       {/* Mobile Overlay */}
       {sidebarOpen && (
         <div
           className="operator-overlay"
           onClick={() => setSidebarOpen(false)}
         />
       )}

       {/* Left Sidebar */}
       <aside className={`operator-sidebar ${sidebarOpen ? 'open' : ''}`}>
         <div className="operator-sidebar-content">
            {/* Logo Section */}
            <div className="operator-logo-section">
              <div className="operator-logo">
                <img src="/system_image.png" alt="System Logo" className="operator-logo-img" />
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="operator-nav">
              {menuItems.map((item, index) => (
                item.subItems ? (
                  <div key={index} className="operator-nav-group">
                    <button
                      className={`operator-nav-item ${expandedMenu === item.name ? 'expanded' : ''}`}
                      onClick={() => toggleMenu(item.name)}
                    >
                      <item.icon className="operator-nav-icon" />
                      <span>{item.name}</span>
                      <ChevronDown className={`operator-chevron ${expandedMenu === item.name ? 'rotated' : ''}`} size={16} />
                    </button>
                    <div className={`operator-submenu ${expandedMenu === item.name ? 'open' : ''}`}>
                      {item.subItems.map((sub, subIndex) => (
                        <Link
                          key={subIndex}
                          to={sub.path}
                          onClick={() => setSidebarOpen(false)}
                          className="operator-nav-item operator-sub-item"
                        >
                          <span>{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={item.onClick || (() => setSidebarOpen(false))}
                    className={`operator-nav-item ${item.name === 'Dashboard' ? 'active' : ''}`}
                  >
                    <item.icon className="operator-nav-icon" />
                    <span>{item.name}</span>
                  </Link>
                )
              ))}
            </nav>
         </div>
        </aside>

        {/* Main Content */}
        <main className="operator-main">
          <header className="operator-header">
            <div className="operator-header-left">
              <button className="operator-menu-btn" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <div>
                <h2>Welcome back, {userData?.full_name || 'Operator'} 👋</h2>
                <p>Here's what's happening today</p>
              </div>
            </div>
<div className="operator-header-right">
               <div className="operator-notification-wrapper">
                 <button className="operator-notification" onClick={() => setNotifOpen(!notifOpen)}>
                   <Bell size={22} />
                   <span className="operator-badge">{notifications.length}</span>
                 </button>
                 {notifOpen && (
                   <div className="operator-notif-dropdown">
                     <div className="operator-notif-header">
                       <h4>Notifications</h4>
                       <span className="operator-notif-badge">{unreadCount} new</span>
                     </div>
                     <div className="operator-notif-list">
                       {notifications.length > 0 ? notifications.slice(0, 5).map((n, idx) => (
                         <div key={idx} className={`operator-notif-item ${n.unread ? 'unread' : ''}`}>
                           <div className="operator-notif-dot"></div>
                           <div className="operator-notif-content">
                             <h5>{n.title}</h5>
                             <p>{n.message}</p>
                             <span className="operator-notif-time">{n.time}</span>
                           </div>
                         </div>
                       )) : (
                         <div className="operator-notif-item">
                           <div className="operator-notif-content">
                             <p>No notifications yet</p>
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                 )}
               </div>
<div className="operator-user-menu" onClick={openProfile} role="button" tabIndex={0}>
               <div className="operator-avatar-section">
                 <img
                   key={profileImageKey}
                   src={getProfileImageUrl(user?.profile_image)}
                   alt="Operator"
                   className="operator-avatar"
                   onError={(e) => { (e.target as HTMLImageElement).src = '/system_image.png' }}
                 />
                 <div>
                   <span className="operator-user-name">{user?.full_name || 'Operator'}</span>
                   <span className="operator-user-role">Operator</span>
                 </div>
               </div>
             </div>
            </div>
          </header>

          {profileOpen && (
            <div className="operator-modal-overlay" onClick={() => setProfileOpen(false)}>
              <div className="operator-profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="operator-modal-header">
                  <h3>Update Profile</h3>
                  <button className="operator-modal-close" onClick={() => setProfileOpen(false)}>×</button>
                </div>
                {profileError && <div className="operator-modal-error">{profileError}</div>}
                {profileSuccess && <div className="operator-modal-success">{profileSuccess}</div>}
                <form onSubmit={saveProfile} className="operator-profile-form">
                  <div className="operator-form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="operator-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="operator-form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="operator-form-group">
                    <label>Profile Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="form-file-input"
                    />
                    {profileImagePreview && (
                      <div className="image-preview">
                        <img src={profileImagePreview} alt="Preview" />
                      </div>
                    )}
                  </div>
                  <button type="submit" className="operator-save-btn">Save Changes</button>
                </form>
              </div>
            </div>
          )}

          {(pendingPaymentsOpen || pendingClientsOpen) && (
            <div className="operator-modal-overlay" onClick={() => { setPendingPaymentsOpen(false); setPendingClientsOpen(false); setSelectedPendingPayment(null); setSelectedPendingClient(null) }}>
              <div className="operator-pending-modal" onClick={(e) => e.stopPropagation()}>
                <div className="operator-modal-header">
                  <h3>{pendingClientsOpen ? 'Clients Not Paying' : 'Pending Payments'}</h3>
                  <button className="operator-modal-close" onClick={() => { setPendingPaymentsOpen(false); setPendingClientsOpen(false); setSelectedPendingPayment(null); setSelectedPendingClient(null) }}>
                    <XCircle size={24} />
                  </button>
                </div>

                {pendingClientsOpen ? (
                  pendingClientsLoading ? (
                    <div className="operator-modal-empty">Loading unpaid clients...</div>
                  ) : pendingClients.length > 0 ? (
                    <div className="operator-table-host">
                      <table className="operator-table">
                        <thead>
                          <tr>
                            <th>Client</th>
                            <th>Farmer Code</th>
                            <th>Unpaid Items</th>
                            <th>Total Unpaid</th>
                            <th>Confirmed Pay Time</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingClients.map((client) => {
                            const clientName = client.client_name || client.farmer?.user?.full_name || client.farmer?.farmer_code || 'Unknown Client'
                            const confirmedTime = client.expected_payment_date || client.expected_payment_time
                              ? `${client.expected_payment_date || 'Date not set'} ${client.expected_payment_time || 'Time not set'}`
                              : 'Not confirmed'
                            return (
                              <tr key={client.client_id}>
                                <td>{clientName}</td>
                                <td>{client.farmer?.farmer_code || client.client_type === 'sale' ? 'Sale client' : 'N/A'}</td>
                                <td>{client.deliveries.length + client.sales.length}</td>
                                <td className="operator-unpaid-amount">{formatCurrency(client.unpaid_balance)} RWF</td>
                                <td>{confirmedTime}</td>
                                <td><span className="operator-badge-sm warning">Unpaid</span></td>
                                <td>
                                  <div className="operator-client-actions">
                                    <button type="button" className="operator-action-btn operator-confirm-btn" onClick={() => markClientPaymentStatus(client, 'paid')}>
                                      Mark Paid
                                    </button>
                                    <button type="button" className="operator-action-btn operator-confirm-btn" onClick={() => markClientPaymentStatus(client, 'unpaid')}>
                                      Mark Unpaid
                                    </button>
                                    {client.deliveries.length > 0 && (
                                      <button type="button" className="operator-action-btn operator-confirm-btn" onClick={() => openClientPaymentSchedule(client)}>
                                        Confirm Pay Time
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="operator-modal-empty">No unpaid clients found.</div>
                  )
                ) : pendingPaymentsLoading ? (
                  <div className="operator-modal-empty">Loading pending payments...</div>
                ) : pendingPayments.length > 0 ? (
                  <div className="operator-table-host">
                    <table className="operator-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Farmer</th>
                          <th>Delivery ID</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th>Unpaid</th>
                          <th>Payment Method</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingPayments.map((payment) => {
                          const farmerName = payment.farmer?.user?.full_name || payment.farmer?.farmer_code || 'Unknown Farmer'
                          const delivery = payment.delivery
                          return (
                            <tr key={payment.payment_id || delivery.delivery_id}>
                              <td>{delivery.delivery_date ? new Date(delivery.delivery_date).toLocaleDateString() : 'N/A'}</td>
                              <td>{farmerName}</td>
                              <td>#{delivery.delivery_id}</td>
                              <td>{Number(delivery.quantity_kg || 0).toLocaleString()} KG</td>
                              <td>{formatCurrency(delivery.total_cost)} RWF</td>
                              <td className="operator-unpaid-amount">{formatCurrency(payment.unpaid_balance)} RWF</td>
                              <td>{payment.payment_method || 'Not recorded'}</td>
                              <td><span className="operator-badge-sm warning">Pending</span></td>
                              <td>
                                <button type="button" className="operator-action-btn operator-confirm-btn" onClick={() => openPaymentSchedule(payment)}>
                                  Confirm Pay Time
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="operator-modal-empty">No pending payments found.</div>
                )}

                {selectedPendingPayment && !pendingClientsOpen && (
                  <form onSubmit={savePaymentSchedule} className="operator-confirm-payment-form">
                    <div className="operator-confirm-payment-header">
                      <div>
                        <h4>Confirm pay time</h4>
                        <p>{selectedPendingPayment.farmer?.user?.full_name || selectedPendingPayment.farmer?.farmer_code || 'Unknown Farmer'} - Delivery #{selectedPendingPayment.delivery.delivery_id}</p>
                      </div>
                      <button type="button" className="operator-confirm-cancel" onClick={() => setSelectedPendingPayment(null)}>Cancel</button>
                    </div>
                    {scheduleError && <div className="operator-modal-error">{scheduleError}</div>}
                    {scheduleSuccess && <div className="operator-modal-success">{scheduleSuccess}</div>}
                    <div className="operator-confirm-grid">
                      <div className="operator-form-group">
                        <label>Expected Payment Date</label>
                        <input
                          type="date"
                          value={scheduleForm.expected_payment_date}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, expected_payment_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="operator-form-group">
                        <label>Expected Payment Time</label>
                        <input
                          type="time"
                          value={scheduleForm.expected_payment_time}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, expected_payment_time: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="operator-save-btn">Confirm Payment Time</button>
                  </form>
                )}

                {selectedPendingClient && pendingClientsOpen && (
                  <form onSubmit={saveClientPaymentSchedule} className="operator-confirm-payment-form">
                    <div className="operator-confirm-payment-header">
                      <div>
                        <h4>Confirm pay time for client</h4>
                        <p>{selectedPendingClient.client_name || selectedPendingClient.farmer?.user?.full_name || selectedPendingClient.farmer?.farmer_code || 'Unknown Client'} - {selectedPendingClient.deliveries.length + selectedPendingClient.sales.length} unpaid item/items</p>
                      </div>
                      <button type="button" className="operator-confirm-cancel" onClick={() => setSelectedPendingClient(null)}>Cancel</button>
                    </div>
                    {scheduleError && <div className="operator-modal-error">{scheduleError}</div>}
                    {scheduleSuccess && <div className="operator-modal-success">{scheduleSuccess}</div>}
                    <div className="operator-confirm-grid">
                      <div className="operator-form-group">
                        <label>Expected Payment Date</label>
                        <input
                          type="date"
                          value={scheduleForm.expected_payment_date}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, expected_payment_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="operator-form-group">
                        <label>Expected Payment Time</label>
                        <input
                          type="time"
                          value={scheduleForm.expected_payment_time}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, expected_payment_time: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="operator-save-btn">Confirm Client Payment Time</button>
                  </form>
                )}
              </div>
            </div>
          )}

           {/* Stats Cards */}
          <div className="operator-stats">
            <div className="operator-stat-card operator-stat-green">
              <div className="operator-stat-icon">
                <Droplet />
              </div>
              <div className="operator-stat-content">
                <h3>Milk Received Today</h3>
                <p className="operator-stat-value">{stats.milkCollectedToday.toLocaleString()} KG</p>
                <span className="operator-stat-change positive"></span>
              </div>
            </div>

            <div className="operator-stat-card operator-stat-blue">
              <div className="operator-stat-icon">
                <CheckCircle />
              </div>
              <div className="operator-stat-content">
                <h3>Total Farmers</h3>
                <p className="operator-stat-value">{stats.totalFarmers.toLocaleString()}</p>
                <span className="operator-stat-change positive">Registered farmers</span>
              </div>
            </div>

            <div className="operator-stat-card operator-stat-red" role="button" tabIndex={0} onClick={() => { setPendingPaymentsOpen(true); fetchPendingPayments() }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPendingPaymentsOpen(true); fetchPendingPayments() } }}>
              <div className="operator-stat-icon">
                <XCircle />
              </div>
              <div className="operator-stat-content">
                <h3>Pending Payments</h3>
                <p className="operator-stat-value">{stats.paymentsPending.toLocaleString()}</p>
                <span className="operator-stat-change negative">Awaiting payment</span>
              </div>
            </div>

            <div className="operator-stat-card operator-stat-orange" role="button" tabIndex={0} onClick={() => { setPendingClientsOpen(true); fetchPendingClients() }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPendingClientsOpen(true); fetchPendingClients() } }}>
              <div className="operator-stat-icon">
                <Users />
              </div>
              <div className="operator-stat-content">
                <h3>Clients Not Paying</h3>
                <p className="operator-stat-value">{stats.clientsNotPaying.toLocaleString()}</p>
                <span className="operator-stat-change negative">Payment commitment needed</span>
              </div>
            </div>

            <div className="operator-stat-card operator-stat-purple">
              <div className="operator-stat-icon">
                <Banknote />
              </div>
              <div className="operator-stat-content">
                <h3>Sales Today</h3>
                <p className="operator-stat-value">{stats.salesToday.toLocaleString()} RWF</p>
                <span className="operator-stat-change positive">Today's revenue</span>
              </div>
            </div>

            <div className="operator-stat-card operator-stat-teal">
              <div className="operator-stat-icon">
                <Droplet />
              </div>
              <div className="operator-stat-content">
                <h3>Milk in Tank</h3>
                <p className="operator-stat-value">{stats.tankCapacity.toLocaleString()} KG</p>
                <span>Live tank level</span>
              </div>
            </div>

            <div className="operator-stat-card operator-stat-dark">
              <div className="operator-stat-icon">
                <Truck />
              </div>
               <div className="operator-stat-content">
                <h3>Deliveries Today</h3>
                <p className="operator-stat-value">{deliveriesTodayCount}</p>
                <span></span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="operator-charts">
            {/* Milk Received Chart */}
            <div className="operator-chart-card">
              <div className="operator-chart-header">
                <h3>Milk Received (KG/L)</h3>
                <select className="operator-chart-select">
                  <option>This Week</option>
                </select>
              </div>
              <div className="operator-chart-content">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={milkData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} KG`, 'Milk']} />
                    <Bar dataKey="quantity" fill="#2d9e6b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="operator-chart-card">
              <div className="operator-chart-header">
                <h3>Sales (RWF)</h3>
                <select className="operator-chart-select">
                  <option>This Week</option>
                </select>
              </div>
              <div className="operator-chart-content">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={salesData.length > 0 ? salesData : [{ day: 'No data', sales: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={11} interval={0} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip formatter={(v) => [`${v?.toLocaleString()} RWF`, 'Sales']} />
                    <Line type="monotone" dataKey="sales" stroke="#2d9e6b" strokeWidth={2} fill="#2d9e6b" fillOpacity={0.2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Milk Tank Status */}
            <div className="operator-tank-card">
              <div className="operator-tank-header">
                <h3>Milk Tank Status</h3>
              </div>
              <div className="operator-tank-content">
                <div className="operator-tank-gauge">
                  <svg viewBox="0 0 100 100" className="operator-gauge-svg">
                    <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="40" stroke={tankStrokeColor} strokeWidth="8" fill="none" strokeDasharray={TANK_GAUGE_CIRCUMFERENCE} strokeDashoffset={TANK_GAUGE_CIRCUMFERENCE - (TANK_GAUGE_CIRCUMFERENCE * tankPercentage) / 100} transform="rotate(-90 50 50)" />
                    <text x="50" y="45" fontSize="14" fontWeight="bold" textAnchor="middle">{tankPercentage}%</text>
                    <text x="50" y="60" fontSize="10" textAnchor="middle" fill="#6b7280">{stats.tankCapacity.toLocaleString()} KG</text>
                  </svg>
                </div>
<div className="operator-tank-details">
                   <div className="operator-tank-row"><span>Tank Capacity</span><span>{stats.tankCapacityLiters > 0 ? stats.tankCapacityLiters.toLocaleString() : '15,000'} KG</span></div>
                   <div className="operator-tank-row"><span>Current Quantity</span><span>{stats.tankCapacity.toLocaleString()} KG</span></div>
                   <div className="operator-tank-row"><span>Available Space</span><span>{Math.max(0, (stats.tankCapacityLiters || 15000) - stats.tankCapacity).toLocaleString()} KG</span></div>
                   <div className="operator-tank-row"><span>Last Updated</span><span>{stats.tankLastUpdated ? new Date(stats.tankLastUpdated).toLocaleTimeString() : 'Just now'}</span></div>
                 </div>
              </div>
              <div className="operator-tank-status">
                <span className="operator-tank-badge">Tank level is {tankStatus}.</span>
              </div>
            </div>
          </div>

         {/* Bottom Row */}
         <div className="operator-bottom-full">
            {/* Recent Deliveries */}
            <div className="operator-deliveries">
              <div className="operator-section-header">
                <h3>Recent Deliveries</h3>
                <Link to="/operator/deliveries" className="operator-view-all">View All Deliveries</Link>
              </div>
              <div className="operator-table-host">
                <table className="operator-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Farmer</th>
                      <th>Quantity (KG/L)</th>
                      <th>Status</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                   <tbody>
                     {deliveries.map((d) => (
                       <tr key={d.delivery_id}>
                         <td>{d.delivery_date ? new Date(d.delivery_date).toLocaleDateString() : 'N/A'}</td>
                         <td>{d.farmer?.user?.full_name || d.farmer?.farmer_code || 'Unknown'}</td>
                         <td>{Number(d.quantity_kg).toLocaleString()}</td>
                         <td><span className={`operator-badge-sm ${d.status === 'accepted' ? 'success' : 'danger'}`}>{d.status}</span></td>
                         <td><span className={`operator-badge-sm ${d.payment_status === 'paid' ? 'success' : d.payment_status === 'pending' ? 'warning' : 'danger'}`}>{d.payment_status}</span></td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>
              <div className="operator-pagination">
                <span>Showing {deliveries.length > 0 ? '1–' + deliveries.length : '0'} of {deliveriesTotalCount} deliveries</span>
               <div className="operator-pages">
                 <button>1</button>
                 <button>2</button>
                 <button>3</button>
                 <span>…</span>
                 <button>8</button>
               </div>
             </div>
            </div>
         </div>

         <div className="operator-bottom-grid">
            {/* Quick Actions */}
            <div className="operator-quick-actions">
              <h3>⚡Quick Actions</h3>
              <div className="operator-quick-grid">
                <Link to="/operator/delivery/new" className="operator-quick-btn">
                  <Truck className="operator-quick-icon" />
                  <span>New Delivery</span>
                </Link>
                <Link to="/operator/quality" className="operator-quick-btn">
                  <FlaskRound className="operator-quick-icon" />
                  <span>Quality Testing</span>
                </Link>
                <Link to="/operator/sale/new" className="operator-quick-btn">
                  <ShoppingCart className="operator-quick-icon" />
                  <span>New Sale</span>
                </Link>
                <Link to="/operator/tank" className="operator-quick-btn">
                  <Droplet className="operator-quick-icon" />
                  <span>Milk Tank</span>
                </Link>
                <Link to="/operator/deliveries" className="operator-quick-btn">
                  <FileText className="operator-quick-icon" />
                  <span>Reception Report</span>
                </Link>
                <Link to="/operator/sales" className="operator-quick-btn">
                  <BarChart3 className="operator-quick-icon" />
                  <span>Sale Report</span>
                </Link>
              </div>
            </div>

            {/* Announcements */}
            <div className="operator-announcements">
              <div className="operator-section-header">
                <h3>Latest Announcements</h3>
                <Link to="/operator/announcements" className="operator-view-all">View All</Link>
              </div>
               <div className="operator-announcements-list">
                 {announcementsList.length > 0 ? announcementsList.map((a) => (
                   <div key={a.announcement_id} className="operator-announcement">
                     <span className={`operator-announcement-dot ${a.type}`}></span>
                     <div className="operator-announcement-content">
                       <h4>{a.title}</h4>
                       <p>{a.message}</p>
                       <span className="operator-announcement-date">{a.date ? new Date(a.date).toLocaleDateString() : 'N/A'}</span>
                     </div>
                   </div>
                 )) : (
                   <div className="operator-announcement">
                     <div className="operator-announcement-content">
                       <p>No announcements yet</p>
                     </div>
                   </div>
                 )}
               </div>
              <Link to="/operator/announcements" className="operator-view-all-bottom">View All Announcements</Link>
            </div>
          </div>
       </main>
     </div>
   )
}