import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import './FarmerDashboard.css'
import type { MilkDelivery, Payment, Announcement } from '../types'
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  BarChart3,
  MessageSquare,
  Megaphone,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  Milk,
  Banknote,
  Package,
  Calendar,
  Tag,
  Eye,
  Send,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  MoreHorizontal,
  User
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

export const FarmerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState('2024')
  const { logout, userData, user } = useAuth()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/farmer', active: true },
    { name: 'Delivery Reports', icon: FileText, path: '/farmer/deliveries' },
    { name: 'Payment Records', icon: CreditCard, path: '/farmer/payments' },
    { name: 'Charts & Analytics', icon: BarChart3, path: '/farmer/charts' },
    { name: 'Messages', icon: MessageSquare, path: '/farmer/communication' },
    { name: 'Announcements', icon: Megaphone, path: '/farmer/announcements' },
    { name: 'My Profile', icon: User, path: '#' },
    { name: 'Logout', icon: LogOut, path: '#', onClick: handleLogout }
  ]

  // Data states
  const [milkData, setMilkData] = useState<Array<{month: string; quantity: number}>>([])
  const [earningsData, setEarningsData] = useState<Array<{month: string; earnings: number}>>([])
  const [announcements, setAnnouncements] = useState<Array<{id: number; title: string; message: string; date: string; type: string}>>([])
  const [recentDeliveries, setRecentDeliveries] = useState<Array<{id: number; date: string; quantity: number; status: string; quality: string; payment: string; operator: string}>>([])
   
  // Stats states
  const [totalMilkDelivered, setTotalMilkDelivered] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [unpaidBalance, setUnpaidBalance] = useState(0)
  const [deliveriesThisMonth, setDeliveriesThisMonth] = useState(0)
  const [milkPricePerKg, setMilkPricePerKg] = useState(0)
  const [lastDeliveryStatus, setLastDeliveryStatus] = useState({status: '', date: ''})
   
  // Loading states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

// Fetch farmer dashboard data
   useEffect(() => {
     const fetchFarmerData = async () => {
       if (!userData || user?.role !== 'farmer') return
       
       setLoading(true)
       setError(null)
      
try {
         // Fetch deliveries for this farmer
         const deliveriesResponse = await api.deliveries.getAll()
         const allDeliveries = deliveriesResponse as MilkDelivery[] || []
         const farmerDeliveries = allDeliveries.filter(d => d.farmer_id === (userData as any)?.farmer_id)
         
         // Fetch payments for this farmer
         const paymentsResponse = await api.payments.getAll()
         const allPayments = paymentsResponse as Payment[] || []
         const farmerPayments = allPayments.filter(p => p.farmer_id === (userData as any)?.farmer_id)
        
        // Fetch announcements
        const announcementsResponse = await api.announcements.getAll()
        const allAnnouncements = announcementsResponse as Announcement[] || []
        
        // Process deliveries data for charts and stats
        const processedMilkData = processMonthlyDeliveries(farmerDeliveries)
        const processedEarningsData = processMonthlyEarnings(farmerDeliveries)
        
        // Calculate stats (for current year only)
        const currentYearDeliveries = farmerDeliveries.filter(d => 
          new Date(d.delivery_date).getFullYear().toString() === selectedYear
        )
        const currentYearPayments = farmerPayments.filter(p => 
          new Date(p.payment_date).getFullYear().toString() === selectedYear
        )
        
        // Calculate stats
        const totalMilk = currentYearDeliveries.reduce((sum, d) => sum + d.quantity_kg, 0)
        const totalEarnings = currentYearDeliveries.reduce((sum, d) => sum + d.total_cost, 0)
        
        // Calculate unpaid balance from payments (current year)
        let totalUnpaid = 0
        currentYearPayments.forEach(payment => {
          totalUnpaid += payment.unpaid_balance
        })
        
        // Get current month deliveries (current year)
        const currentMonth = new Date().toLocaleString('default', { month: 'short' })
        const currentYear = new Date().getFullYear().toString()
        const currentMonthDeliveries = currentYearDeliveries.filter(d => {
          const deliveryDate = new Date(d.delivery_date)
          return deliveryDate.toLocaleString('default', { month: 'short' }) === currentMonth && 
                 deliveryDate.getFullYear().toString() === currentYear
        })
        const deliveriesThisMonthCount = currentMonthDeliveries.length
        
        // Get average milk price (from unit_price in deliveries for current year)
        const prices = currentYearDeliveries.map(d => d.unit_price)
        const avgPrice = prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0
        
        // Get last delivery status (overall, not limited to year)
        const sortedDeliveries = [...farmerDeliveries].sort((a, b) => 
          new Date(b.delivery_date).getTime() - new Date(a.delivery_date).getTime()
        )
        const lastDelivery = sortedDeliveries[0]
        const lastDeliveryStatusObj = lastDelivery ? {
          status: lastDelivery.status === 'accepted' ? 'Accepted' : 'Rejected',
          date: new Date(lastDelivery.delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        } : {status: '', date: ''}
        
        // Process recent deliveries (last 5, from current year)
        const recent = [...currentYearDeliveries].sort((a, b) => 
          new Date(b.delivery_date).getTime() - new Date(a.delivery_date).getTime()
        ).slice(0, 5).map(d => ({
          id: d.delivery_id,
          date: new Date(d.delivery_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
          quantity: d.quantity_kg,
          status: d.status === 'accepted' ? 'Accepted' : 'Rejected',
          quality: 'Pass', // TODO: Get from quality test data
          payment: d.payment_status === 'paid' ? 'Paid' : d.payment_status === 'unpaid' ? 'Unpaid' : 'Pending',
          operator: d.delivery_person || 'Unknown Operator'
        }))
        
        // Process announcements
        const processedAnnouncements = allAnnouncements
          .filter(a => !a.target_role || a.target_role === 'farmer' || a.target_role === 'all')
          .map(a => ({
            id: a.announcement_id,
            title: a.title,
            message: a.message,
            date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            type: 'info' // TODO: Determine type from announcement content or add type field
          }))
          .slice(0, 3) // Show only latest 3
        
        // Update state
        setMilkData(processedMilkData)
        setEarningsData(processedEarningsData)
        setAnnouncements(processedAnnouncements)
        setRecentDeliveries(recent)
        setTotalMilkDelivered(totalMilk)
        setTotalEarnings(totalEarnings)
        setUnpaidBalance(totalUnpaid)
        setDeliveriesThisMonth(deliveriesThisMonthCount)
        setMilkPricePerKg(Math.round(avgPrice))
        setLastDeliveryStatus(lastDeliveryStatusObj)
        
      } catch (err) {
        console.error('Error fetching farmer dashboard data:', err)
        setError('Failed to load dashboard data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchFarmerData()
  }, [userData, selectedYear])

  // Helper function to process monthly deliveries for chart
  const processMonthlyDeliveries = (deliveries: MilkDelivery[]): Array<{month: string; quantity: number}> => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyData: Record<string, number> = {}
    
    deliveries.forEach(delivery => {
      const date = new Date(delivery.delivery_date)
      // Filter by selected year
      if (date.getFullYear().toString() === selectedYear) {
        const monthIndex = date.getMonth() // 0-11
        const monthName = months[monthIndex]
        
        if (!monthlyData[monthName]) {
          monthlyData[monthName] = 0
        }
        monthlyData[monthName] += delivery.quantity_kg
      }
    })
    
    // Convert to array and sort by month order - always return all 12 months
    return months
      .map(month => ({
        month,
        quantity: monthlyData[month] || 0
      }))
  }

  // Helper function to process monthly earnings for chart
  const processMonthlyEarnings = (deliveries: MilkDelivery[]): Array<{month: string; earnings: number}> => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyData: Record<string, number> = {}
    
    deliveries.forEach(delivery => {
      const date = new Date(delivery.delivery_date)
      // Filter by selected year
      if (date.getFullYear().toString() === selectedYear) {
        const monthIndex = date.getMonth() // 0-11
        const monthName = months[monthIndex]
        
        if (!monthlyData[monthName]) {
          monthlyData[monthName] = 0
        }
        monthlyData[monthName] += delivery.total_cost
      }
    })
    
    // Convert to array and sort by month order - always return all 12 months
    return months
      .map(month => ({
        month,
        earnings: monthlyData[month] || 0
      }))
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-green-900 to-green-800 text-white 
        transform transition-transform duration-300 ease-in-out z-30
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:z-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-green-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <Milk className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MCC System</h1>
                <p className="text-xs text-green-200 -mt-1">Milk Collection Center System</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={item.onClick}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${item.active 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

{/* Farmer Profile Card */}
           <div className="p-4 mx-4 mb-6 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
             <div className="flex items-center gap-3 mb-3">
<img 
                  src={user?.profile_image ? `/uploads/${user.profile_image}` : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"} 
                  alt="Farmer" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <h3 className="font-semibold text-white">{user?.full_name || 'Farmer'}</h3>
                  <p className="text-xs text-green-200">{(userData as any)?.farmer_code || ''}</p>
                </div>
             </div>
             <div className="flex items-center gap-2 text-xs text-green-200">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>{(userData as any)?.location || ''}</span>
             </div>
           </div>
        </div>
      </aside>

       {/* Main Content */}
       <div className="dashboard-wrapper flex-1 lg:ml-0">
         {/* Top Header */}
         <header className="dashboard-header sticky top-0 z-10 bg-white shadow-sm border-b border-gray-100">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Welcome back, {user?.full_name || 'Farmer'} 👋</h2>
                <p className="text-sm text-gray-500">Here is what's happening with your deliveries and payments.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">{announcements.length}</span>
                </button>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
<img 
                    src={user?.profile_image ? `/uploads/${user.profile_image}` : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-800">{user?.full_name || 'Farmer'}</p>
                  <p className="text-xs text-gray-500">Farmer</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
         </header>

          {/* Dashboard Content */}
          <main className="dashboard-content p-4 lg:p-6">
            {/* Loading State */}
            {loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 loading-skeleton">
                  <div className="h-4 mb-2"></div>
                  <div className="h-2 mb-4"></div>
                  <div className="h-1 mb-6"></div>
                </div>
                <div className="bg-white rounded-xl p-5 loading-skeleton">
                  <div className="h-4 mb-2"></div>
                  <div className="h-2 mb-4"></div>
                  <div className="h-1 mb-6"></div>
                </div>
                <div className="bg-white rounded-xl p-5 loading-skeleton">
                  <div className="h-4 mb-2"></div>
                  <div className="h-2 mb-4"></div>
                  <div className="h-1 mb-6"></div>
                </div>
                <div className="bg-white rounded-xl p-5 loading-skeleton">
                  <div className="h-4 mb-2"></div>
                  <div className="h-2 mb-4"></div>
                  <div className="h-1 mb-6"></div>
                </div>
                <div className="bg-white rounded-xl p-5 loading-skeleton">
                  <div className="h-4 mb-2"></div>
                  <div className="h-2 mb-4"></div>
                  <div className="h-1 mb-6"></div>
                </div>
                <div className="bg-white rounded-xl p-5 loading-skeleton">
                  <div className="h-4 mb-2"></div>
                  <div className="h-2 mb-4"></div>
                  <div className="h-1 mb-6"></div>
                </div>
              </div>
            )}
            
            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-500 font-bold">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                    <p className="text-sm text-red-700">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              {totalMilkDelivered === 0 && totalEarnings === 0 && unpaidBalance === 0 && deliveriesThisMonth === 0 && milkPricePerKg === 0 && !loading ? (
                <div className="col-span-6">
                  <div className="bg-white rounded-xl p-8 text-center">
                    <div className="mb-4">
                      <Milk className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Data Available</h3>
                    <p className="text-sm text-gray-500">
                      No delivery data found for the selected year. Please check your deliveries or select a different year.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-xl p-5 stat-card-enhanced hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Milk className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {totalMilkDelivered > 0 ? '+12%' : '0%'}
                      </span>
                    </div>
                    <h3 className="text-sm text-gray-500 mb-1">Total Milk Delivered</h3>
                    <p className="text-2xl font-bold text-gray-800">{totalMilkDelivered.toLocaleString()} KG</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 stat-card-enhanced hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Banknote className="w-6 h-6 text-green-600" />
                      </div>
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {totalEarnings > 0 ? '+8%' : '0%'}
                      </span>
                    </div>
                    <h3 className="text-sm text-gray-500 mb-1">Total Earnings</h3>
                    <p className="text-2xl font-bold text-gray-800">RWF {totalEarnings.toLocaleString()}</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 stat-card-enhanced hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-orange-600" />
                      </div>
                      <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                        <TrendingDown className="w-3 h-3" />
                        {unpaidBalance > 0 ? '-5%' : '0%'}
                      </span>
                    </div>
                    <h3 className="text-sm text-gray-500 mb-1">Unpaid Balance</h3>
                    <p className="text-2xl font-bold text-gray-800">RWF {unpaidBalance.toLocaleString()}</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 stat-card-enhanced hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-sm text-gray-500 mb-1">Deliveries This Month</h3>
                    <p className="text-2xl font-bold text-gray-800">{deliveriesThisMonth}</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 stat-card-enhanced hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Tag className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                    <h3 className="text-sm text-gray-500 mb-1">Milk Price / KG</h3>
                    <p className="text-2xl font-bold text-gray-800">RWF {milkPricePerKg}</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 stat-card-enhanced hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-indigo-600" />
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        {lastDeliveryStatus.status}
                      </span>
                    </div>
                    <h3 className="text-sm text-gray-500 mb-1">Last Delivery Status</h3>
                    <p className="text-sm font-medium text-gray-800">{lastDeliveryStatus.date}</p>
                  </div>
                </>
              )}
            </div>

          {/* Charts & Announcements Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
             {/* Milk Delivered Chart */}
             <div className="lg:col-span-2 bg-white rounded-xl p-5 chart-container">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-semibold text-gray-800">Milk Delivered Per Month</h3>
                 <select 
                   value={selectedYear}
                   onChange={(e) => setSelectedYear(e.target.value)}
                   className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                 >
                   <option value="2024">2024</option>
                   <option value="2023">2023</option>
                   <option value="2022">2022</option>
                 </select>
               </div>
               {milkData.some(item => item.quantity > 0) ? (
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={milkData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                       <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                       <YAxis stroke="#6b7280" fontSize={12} />
                       <Tooltip 
                         contentStyle={{ 
                           backgroundColor: 'white', 
                           border: '1px solid #e5e7eb',
                           borderRadius: '8px',
                           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                         }}
                       />
                       <Bar dataKey="quantity" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               ) : (
                 <div className="flex h-64 items-center justify-center">
                   <div className="text-center">
                     <div className="mb-4">
                       <BarChart3 className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                     </div>
                     <h4 className="text-lg font-medium text-gray-800 mb-2">No Data Available</h4>
                     <p className="text-sm text-gray-500">
                       No milk delivery data found for the selected year.
                     </p>
                   </div>
                 </div>
               )}
             </div>

            {/* Announcements Panel */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Latest Announcements</h3>
                <Link to="/farmer/announcements" className="text-sm text-green-600 font-medium hover:text-green-700">
                  View All
                </Link>
              </div>
              
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                      ${announcement.type === 'info' ? 'bg-blue-100' : 
                        announcement.type === 'meeting' ? 'bg-purple-100' : 'bg-green-100'}
                    `}>
                      <Megaphone className={`
                        w-5 h-5
                        ${announcement.type === 'info' ? 'text-blue-600' : 
                          announcement.type === 'meeting' ? 'text-purple-600' : 'text-green-600'}
                      `} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800">{announcement.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{announcement.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{announcement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 py-2 text-sm font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                View All Announcements
              </button>
            </div>
          </div>

           {/* Earnings Chart */}
           <div className="bg-white rounded-xl p-5 chart-container mb-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-gray-800">Earnings Per Month</h3>
               <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                 <option>2024</option>
                 <option>2023</option>
                 <option>2022</option>
               </select>
             </div>
             {earningsData.some(item => item.earnings > 0) ? (
               <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={earningsData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                     <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                     <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${value / 1000}k`} />
                     <Tooltip 
                       contentStyle={{ 
                         backgroundColor: 'white', 
                         border: '1px solid #e5e7eb',
                         borderRadius: '8px',
                         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                       }}
                       formatter={(value) => [`${value?.toLocaleString()} RWF`, 'Earnings']}
                     />
                     <Line 
                       type="monotone" 
                       dataKey="earnings" 
                       stroke="#2e7d32" 
                       strokeWidth={2}
                       dot={{ fill: '#2e7d32', strokeWidth: 2, r: 4 }}
                       activeDot={{ r: 6, stroke: '#2e7d32', strokeWidth: 2 }}
                     />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             ) : (
               <div className="flex h-64 items-center justify-center">
                 <div className="text-center">
                   <div className="mb-4">
                     <BarChart3 className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                   </div>
                   <h4 className="text-lg font-medium text-gray-800 mb-2">No Data Available</h4>
                   <p className="text-sm text-gray-500">
                     No earnings data found for the selected year.
                   </p>
                 </div>
               </div>
             )}
           </div>

          {/* Recent Deliveries Table */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Recent Deliveries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (KG)</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality Result</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-800">{delivery.date}</td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-800">{delivery.quantity}</td>
                      <td className="px-5 py-4">
                        <span className={`
                          inline-flex px-2.5 py-1 text-xs font-medium rounded-full
                          ${delivery.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                        `}>
                          {delivery.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`
                          inline-flex px-2.5 py-1 text-xs font-medium rounded-full
                          ${delivery.quality === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                        `}>
                          {delivery.quality}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`
                          inline-flex px-2.5 py-1 text-xs font-medium rounded-full
                          ${delivery.payment === 'Paid' ? 'bg-green-100 text-green-700' : 
                            delivery.payment === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                        `}>
                          {delivery.payment}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{delivery.operator}</td>
                      <td className="px-5 py-4">
                        <button className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
             <div className="p-5 border-t border-gray-100 flex items-center justify-between">
               <p className="text-sm text-gray-500">Showing 1 to {recentDeliveries.length} of {deliveriesThisMonth} deliveries</p>
               <div className="flex items-center gap-2">
                 <button className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Previous</button>
                 <button className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">1</button>
                 <button className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">2</button>
                 <button className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">3</button>
                 <button className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
               </div>
             </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/farmer/deliveries" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 block">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">View Deliveries</h3>
              <p className="text-xs text-gray-500">Check your delivery history and status</p>
            </Link>

            <Link to="/farmer/payments" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 block">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">View Payments</h3>
              <p className="text-xs text-gray-500">Track your payment records and balances</p>
            </Link>

            <Link to="/farmer/communication" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 block">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Send className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Send Message</h3>
              <p className="text-xs text-gray-500">Communicate with MCC operators</p>
            </Link>

            <Link to="/farmer/charts" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 block">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">View Analytics</h3>
              <p className="text-xs text-gray-500">Analyze your milk production trends</p>
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}