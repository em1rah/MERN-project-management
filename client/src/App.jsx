import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'
import Landing from './pages/Landing'

export default function App() {
  const location = useLocation()

  return (
    <ThemeProvider defaultTheme="system" storageKey="trainee-ui-theme">
      <div className="min-h-screen bg-background">
        <div style={location.pathname === '/admin' ? { flex: 1 } : { minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/home" element={<Home />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  )
}
