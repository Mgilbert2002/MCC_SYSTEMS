import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { UnauthorizedPage, ManagerDashboard } from './pages/DashboardPages'
import { FarmerDashboard } from './pages/FarmerDashboard'
import { OperatorDashboard } from './pages/OperatorDashboard'
import { OperatorLayout } from './components/OperatorLayout'
import { NewDeliveryPage } from './pages/NewDeliveryPage'
import { MilkQualityTestingPage } from './pages/MilkQualityTestingPage'
import { QualityResultsPage } from './pages/QualityResultsPage'
import { AcceptDeliveryPage } from './pages/AcceptDeliveryPage'
import { NewSalePage } from './pages/NewSalePage'
import { DeliveryReportsPage, SaleReportsPage, PaymentActivitiesPage, PaymentRecordsPage } from './pages/ReportsPages'
import { MilkTankPage } from './pages/MilkTankPage'
import { CommunicationPage, AnnouncementsPage } from './pages/CommunicationPages'
import { ChartsPage } from './pages/ChartsPage'
import { ProductRegistrationPage, PriceManagementPage, FarmerManagementPage, OperatorManagementPage, SystemSettingsPage } from './pages/ProductPages'
import { NavigationHeader } from './components/NavigationHeader'
import './App.css'

function AppContent() {
  const location = useLocation();
  const isFarmerRoute = location.pathname.startsWith('/farmer');
  const isOperatorRoute = location.pathname.startsWith('/operator');

  return (
    <>
      {!isFarmerRoute && !isOperatorRoute && <NavigationHeader />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="/manager" element={
          <ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>
        } />
        <Route path="/manager/deliveries" element={
          <ProtectedRoute allowedRoles={['manager']}><DeliveryReportsPage /></ProtectedRoute>
        } />
        <Route path="/manager/sales" element={
          <ProtectedRoute allowedRoles={['manager']}><SaleReportsPage /></ProtectedRoute>
        } />
        <Route path="/manager/payments" element={
          <ProtectedRoute allowedRoles={['manager']}><PaymentActivitiesPage /></ProtectedRoute>
        } />
        <Route path="/manager/communication" element={
          <ProtectedRoute allowedRoles={['manager']}><CommunicationPage /></ProtectedRoute>
        } />
        <Route path="/manager/products" element={
          <ProtectedRoute allowedRoles={['manager']}><ProductRegistrationPage /></ProtectedRoute>
        } />
        <Route path="/manager/prices" element={
          <ProtectedRoute allowedRoles={['manager']}><PriceManagementPage /></ProtectedRoute>
        } />
        <Route path="/manager/farmers" element={
          <ProtectedRoute allowedRoles={['manager']}><FarmerManagementPage /></ProtectedRoute>
        } />
        <Route path="/manager/operators" element={
          <ProtectedRoute allowedRoles={['manager']}><OperatorManagementPage /></ProtectedRoute>
        } />
        <Route path="/manager/settings" element={
          <ProtectedRoute allowedRoles={['manager']}><SystemSettingsPage /></ProtectedRoute>
        } />
        <Route path="/manager/tank" element={
          <ProtectedRoute allowedRoles={['manager']}><MilkTankPage /></ProtectedRoute>
        } />

<Route path="/operator" element={
           <ProtectedRoute allowedRoles={['operator']}><OperatorDashboard /></ProtectedRoute>
         } />
        <Route path="/operator/delivery/new" element={
          <ProtectedRoute allowedRoles={['operator']}><OperatorLayout><NewDeliveryPage /></OperatorLayout></ProtectedRoute>
        } />
        <Route path="/operator/quality/results" element={
          <ProtectedRoute allowedRoles={['operator']}><OperatorLayout><QualityResultsPage /></OperatorLayout></ProtectedRoute>
        } />
        <Route path="/operator/quality" element={
          <ProtectedRoute allowedRoles={['operator']}><OperatorLayout><MilkQualityTestingPage /></OperatorLayout></ProtectedRoute>
        } />
        <Route path="/operator/quality/accept/:deliveryId" element={
          <ProtectedRoute allowedRoles={['operator']}><OperatorLayout><AcceptDeliveryPage /></OperatorLayout></ProtectedRoute>
        } />
        <Route path="/operator/deliveries" element={
          <ProtectedRoute allowedRoles={['operator']}><OperatorLayout><DeliveryReportsPage /></OperatorLayout></ProtectedRoute>
        } />
        <Route path="/operator/sales" element={
          <ProtectedRoute allowedRoles={['operator']}><OperatorLayout><SaleReportsPage /></OperatorLayout></ProtectedRoute>
        } />
        <Route path="/operator/products/price" element={
          <ProtectedRoute allowedRoles={['operator']}><OperatorLayout><PriceManagementPage /></OperatorLayout></ProtectedRoute>
        } />
        <Route path="/operator/sale/new" element={
          <ProtectedRoute allowedRoles={['operator']}><OperatorLayout><NewSalePage /></OperatorLayout></ProtectedRoute>
        } />
        <Route path="/operator/tank" element={
          <ProtectedRoute allowedRoles={['operator']}><OperatorLayout><MilkTankPage /></OperatorLayout></ProtectedRoute>
        } />
        <Route path="/operator/communication" element={
          <ProtectedRoute allowedRoles={['operator']}><OperatorLayout><CommunicationPage /></OperatorLayout></ProtectedRoute>
        } />
        <Route path="/operator/announcements" element={
          <ProtectedRoute allowedRoles={['operator']}><OperatorLayout><AnnouncementsPage /></OperatorLayout></ProtectedRoute>
        } />
        <Route path="/operator/charts" element={
          <ProtectedRoute allowedRoles={['operator']}><OperatorLayout><ChartsPage /></OperatorLayout></ProtectedRoute>
        } />

        <Route path="/farmer" element={
          <ProtectedRoute allowedRoles={['farmer']}><FarmerDashboard /></ProtectedRoute>
        } />
        <Route path="/farmer/deliveries" element={
          <ProtectedRoute allowedRoles={['farmer']}><DeliveryReportsPage /></ProtectedRoute>
        } />
        <Route path="/farmer/payments" element={
          <ProtectedRoute allowedRoles={['farmer']}><PaymentRecordsPage /></ProtectedRoute>
        } />
        <Route path="/farmer/communication" element={
          <ProtectedRoute allowedRoles={['farmer']}><CommunicationPage /></ProtectedRoute>
        } />
        <Route path="/farmer/announcements" element={
          <ProtectedRoute allowedRoles={['farmer']}><AnnouncementsPage /></ProtectedRoute>
        } />

        <Route path="/farmer/charts" element={
          <ProtectedRoute allowedRoles={['farmer']}><ChartsPage /></ProtectedRoute>
        } />
        <Route path="/operator/charts" element={
          <ProtectedRoute allowedRoles={['operator']}><ChartsPage /></ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <AppContent />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App
