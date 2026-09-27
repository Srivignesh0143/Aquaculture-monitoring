import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LiveMonitoring from './pages/LiveMonitoring.jsx'
import Analytics from './pages/Analytics.jsx'
import FeedingSchedule from './pages/FeedingSchedule.jsx'
import DeviceControl from './pages/DeviceControl.jsx'
import Alerts from './pages/Alerts.jsx'
import HistoricalData from './pages/HistoricalData.jsx'
import Settings from './pages/Settings.jsx'
import Profile from './pages/Profile.jsx'
import DataSync from './pages/DataSync.jsx'

import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Poppins, sans-serif',
            borderRadius: '10px',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/live-monitoring" element={<LiveMonitoring />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/feeding-schedule" element={<FeedingSchedule />} />
          <Route path="/device-control" element={<DeviceControl />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/historical-data" element={<HistoricalData />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/data-sync" element={<DataSync />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
