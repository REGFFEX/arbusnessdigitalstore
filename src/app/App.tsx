import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import Store from '../pages/Store'
import ProductPage from '../pages/Product'
import Categories from '../pages/Categories'
import Premium from '../pages/Premium'
import Services from '../pages/Services'
import About from '../pages/About'
import Search from '../pages/Search'
import ProjectRoadmap from '../pages/ProjectRoadmap'
import ComingSoon from '../pages/ComingSoon'
import AdminDashboard from '../pages/Admin/Dashboard'
import AdminLogin from '../pages/Admin/Login'
import ProtectedRoute from '../components/ProtectedRoute'
import AddProduct from '../pages/Admin/AddProduct'
import ManageProducts from '../pages/Admin/ManageProducts'
import ManageAds from '../pages/Admin/ManageAds'
import ManageServices from '../pages/Admin/ManageServices'
import ManageAdmins from '../pages/Admin/ManageAdmins'
import AdminSettings from '../pages/Admin/Settings'
import AddService from '../pages/Admin/AddService'
import ArdesLab from '../pages/Admin/ArdesLab'
import DataStats from '../pages/Admin/DataStats'
import ManageCommunity from '../pages/Admin/ManageCommunity'
import AdminOverview from '../pages/Admin/AdminOverview'
import ManageProjects from '../pages/Admin/ManageProjects'
import ManageCategories from '../pages/Admin/ManageCategories'
import VisualManagement from '../pages/Admin/VisualManagement'
import ManagePremium from '../pages/Admin/ManagePremium'
import AdminArchives from '../pages/Admin/AdminArchives'
import ManageCenter from '../pages/Admin/ManageCenter'
import Community from '../pages/Community'
import Guide from '../pages/Guide'
import ServiceDetail from '../pages/ServiceDetail'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MobileRibbon from '../components/MobileRibbon'
import ScrollToTop from '../components/ScrollToTop'
import AdVideoOverlay from '../components/AdVideoOverlay'
import AnnouncementRibbon from '../components/AnnouncementRibbon'
import BrandingInfoBlock from '../components/BrandingInfoBlock'
import SecureDownload from '../pages/SecureDownload'
import ARCenter from '../pages/ARCenter'
import { useLocation } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import Maintenance from '../pages/Maintenance'
import { ARDES_CONFIG } from '../config/ardes_config'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes

function AdminFallbackRedirect() {
  const { pathname } = useLocation()
  const ADMIN_BASE = ARDES_CONFIG.ADMIN_PATH
  const subPath = pathname.replace('/admin', '')
  return <Navigate to={`/${ADMIN_BASE}${subPath}`} replace />
}

export default function App() {
  const { settings, loading } = useSettings()
  const { signOut, user } = useAuth()
  const location = useLocation()
  const ADMIN_BASE = ARDES_CONFIG.ADMIN_PATH

  const isAdminPath = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith(`/${ADMIN_BASE}`) ||
    location.pathname.includes('login')

  // Inactivity Logout Logic
  useEffect(() => {
    if (!user || !isAdminPath) return

    let timeout: any
    const resetTimer = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        signOut()
        window.location.href = `/${ADMIN_BASE}/login?reason=timeout`
      }, INACTIVITY_TIMEOUT)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => document.addEventListener(e, resetTimer))
    resetTimer()

    return () => {
      clearTimeout(timeout)
      events.forEach(e => document.removeEventListener(e, resetTimer))
    }
  }, [user, isAdminPath, signOut, ADMIN_BASE])

  if (loading) return null

  const showMaintenance = settings?.maintenance_mode && !isAdminPath

  if (showMaintenance) {
    return <Maintenance />
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <ScrollToTop />
      {settings?.section_visibility?.global_ads !== false && <AdVideoOverlay />}
      <AnnouncementRibbon />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<Search />} />
          <Route path="/roadmap" element={<ProjectRoadmap />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/community" element={<Community />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/secure-download" element={<SecureDownload />} />
          <Route path="/ar-center" element={<ARCenter />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path={`/${ADMIN_BASE}/login`} element={<AdminLogin />} />

          {/* Routes Protégées Admin */}
          <Route element={<ProtectedRoute />}>
            <Route path={`/${ADMIN_BASE}`} element={<AdminDashboard />}>
              <Route index element={<AdminOverview />} />
              <Route path="add" element={<AddProduct />} />
              <Route path="add-service" element={<AddService />} />
              <Route path="manage" element={<ManageProducts />} />
              <Route path="projects" element={<ManageProjects />} />
              <Route path="users" element={<ManageAdmins />} />
              <Route path="ads" element={<ManageAds />} />
              <Route path="services" element={<ManageServices />} />
              <Route path="ardes" element={<ArdesLab />} />
              <Route path="stats" element={<DataStats />} />
              <Route path="archives" element={<AdminArchives />} />
              <Route path="center" element={<ManageCenter />} />
              <Route path="manage-community" element={<ManageCommunity />} />
              <Route path="categories" element={<ManageCategories />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="visual" element={<VisualManagement />} />
              <Route path="premium" element={<ManagePremium />} />
            </Route>
          </Route>

          {/* Fallback for legacy /admin links redirecting to obfuscated path */}
          <Route path="/admin/*" element={<AdminFallbackRedirect />} />
        </Routes>
      </main>
      <Footer />
      <MobileRibbon />
      <BrandingInfoBlock />
    </div>
  )
}

