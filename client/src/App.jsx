import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/signin' || location.pathname === '/signup' || location.pathname === '/' || location.pathname === '/admin'

  return (
    <div className="app">
      {!hideNavbar && (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          {/* <div className="container-fluid">
            <Link className="navbar-brand" to="/">Trainee Project</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item"><Link className="nav-link" to="/signup">Sign Up</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/signin">Sign In</Link></li>
              </ul>
            </div>
          </div> */}
        </nav>
      )}
      <div style={location.pathname === '/admin' ? { flex: 1 } : { minHeight: '100vh' }}>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/home" element={<Home />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<SignIn />} />
        </Routes>
      </div>
    </div>
  )
}
