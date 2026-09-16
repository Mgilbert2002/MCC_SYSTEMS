import { API_URL } from '../config/api'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Announcement } from '../types'
import {
  LayoutDashboard,
  Droplet,
  Thermometer,
  ShoppingCart,
  MessageSquare,
  Megaphone,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  FlaskRound,
  FileText,
  User
} from 'lucide-react'
import './../pages/OperatorDashboard.css'

type Props = {
  children: React.ReactNode
  pageTitle?: string
  showSubtitle?: boolean
}

export const OperatorLayout = ({ children, pageTitle, showSubtitle = false }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>([])
  const [stats, setStats] = useState({ tankCapacity: 0, tankCapacityLiters: 15000 })
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '', phone: '' })
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [profileImageKey, setProfileImageKey] = useState(0)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const { logout, user, setUser, setUserData } = useAuth()
  

  useEffect(() => {
    const fetchNotifData = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const [statsRes, announcementsRes] = await Promise.all([
          fetch(`${API_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/announcements`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

if (announcementsRes.ok) {
           const announcementsData = await announcementsRes.json()
           setAnnouncementsList(announcementsData.slice(0, 3).map((a: any) => ({
             ...a,
             date: a.created_at || a.date
           })))
         }
       } catch (err) {
         console.error('Failed to fetch notification data:', err)
       }
     }
     fetchNotifData()
   }, [])

const getProfileImageUrl = (imagePath: string | undefined) => {
     if (!imagePath) return "/system_image.png"
     if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath
     if (imagePath.startsWith('/')) return `${imagePath}?t=${profileImageKey}`
     return `/uploads/${imagePath}?t=${profileImageKey}`
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

 const handleLogout = () => {
  logout()
  window.location.href = '/'
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
         { name: 'Price Update', path: '/operator/products/price' },
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
     { name: 'My Profile', icon: User, path: '#', onClick: () => {
       setProfileForm({
         full_name: user?.full_name || '',
         email: user?.email || '',
         phone: user?.phone || ''
       })
       setProfileImagePreview(user?.profile_image ? getProfileImageUrl(user.profile_image) : "/system_image.png")
       setProfileOpen(true)
       setProfileError('')
       setProfileSuccess('')
     }},
     { name: 'Announcements', icon: Megaphone, path: '/operator/announcements' },
     { name: 'Logout', icon: LogOut, path: '#', onClick: handleLogout }
   ]

  return (
    <div className="operator-dashboard">
      {sidebarOpen && (
        <div className="operator-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`operator-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="operator-sidebar-content">
          <div className="operator-logo-section">
            <div className="operator-logo">
              <img src="/system_image.png" alt="System Logo" className="operator-logo-img" />
            </div>
          </div>
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

      <main className="operator-main">
        <header className="operator-header">
<div className="operator-header-left">
             <button className="operator-menu-btn" onClick={() => setSidebarOpen(true)}>
               <Menu size={24} />
             </button>
             <div>
               <h2>{pageTitle || `Welcome back, ${user?.full_name || 'Operator'} 👋`}</h2>
               {showSubtitle && <p>Here's what's happening today</p>}
             </div>
           </div>
          <div className="operator-header-right">
<div className="operator-notification-wrapper">
               <button className="operator-notification" onClick={() => setNotifOpen(!notifOpen)}>
                 <Bell size={22} />
                 <span className="operator-badge">{announcementsList.length}</span>
               </button>
               {notifOpen && (
                 <div className="operator-notif-dropdown">
                   <div className="operator-notif-header">
                     <h4>Notifications</h4>
                     <span className="operator-notif-badge">{announcementsList.length} new</span>
                   </div>
                   <div className="operator-notif-list">
                     {announcementsList.length > 0 ? announcementsList.map((announcement) => (
                       <div key={announcement.announcement_id} className="operator-notif-item unread">
                         <div className="operator-notif-dot"></div>
                         <div className="operator-notif-content">
                           <h5>{announcement.title}</h5>
                           <p>{announcement.message}</p>
                           <span className="operator-notif-time">{(announcement as any).created_at ? new Date((announcement as any).created_at).toLocaleDateString() : 'Recent'}</span>
                         </div>
                       </div>
                     )) : (
                       <div className="operator-notif-item">
                         <div className="operator-notif-content">
                           <p>No new notifications</p>
                         </div>
                       </div>
                     )}
                     {stats.tankCapacityLiters > 0 && (
                       <div className="operator-notif-item unread">
                         <div className="operator-notif-dot"></div>
                         <div className="operator-notif-content">
                           <h5>Tank Level Alert</h5>
                           <p>Milk tank is at {Math.round((stats.tankCapacity / stats.tankCapacityLiters) * 100)}% capacity</p>
                           <span className="operator-notif-time">Now</span>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               )}
             </div>
<div className="operator-user-menu" onClick={() => {
    setProfileForm({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    })
    setProfileImagePreview(user?.profile_image ? getProfileImageUrl(user.profile_image) : "/system_image.png")
    setProfileOpen(true)
    setProfileError('')
    setProfileSuccess('')
  }} role="button" tabIndex={0}>
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

        <div className="operator-page-content">
          {children}
        </div>
      </main>
    </div>
  )
}
