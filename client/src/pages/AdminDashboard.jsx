import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import UserManagement from './UserManagement'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/signin')
  }

  useEffect(() => {
    API.get('/admin/stats').then(r => setStats(r.data)).catch(e => console.error(e))
  }, [])

  if (!stats && activeTab === 'dashboard') return (
    <div className="text-center py-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Loading dashboard...</p>
    </div>
  )

  const certData = {
    labels: ['Interested', 'Not Interested'],
    datasets: [{
      data: [stats?.cert.yes || 0, stats?.cert.no || 0],
      backgroundColor: ['#5856D6', '#FF3B30'],
      borderColor: ['#5856D6', '#FF3B30'],
      borderWidth: 2
    }]
  }

  const courseData = {
    labels: stats?.courses.map(c => c._id) || [],
    datasets: [{
      label: 'Students Enrolled',
      data: stats?.courses.map(c => c.count) || [],
      backgroundColor: '#5856D6',
      borderColor: '#5856D6',
      borderRadius: 5
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: { font: { size: 12, weight: 500 }, padding: 15 }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { drawBorder: false, color: '#f0f0f0' } }
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 1000
      }}>
        {/* Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{
            backgroundColor: '#5856D6',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '20px',
            marginBottom: '12px'
          }}>
            D
          </div>
          <h5 style={{ margin: 0, color: '#333', fontWeight: 600 }}>Trainee Admin</h5>
          <small style={{ color: '#999' }}>Project Management</small>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              width: '100%',
              padding: '16px 20px',
              border: 'none',
              backgroundColor: activeTab === 'dashboard' ? '#E8E8FF' : 'transparent',
              color: activeTab === 'dashboard' ? '#5856D6' : '#666',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: activeTab === 'dashboard' ? 600 : 500,
              fontSize: '14px',
              transition: 'all 0.3s ease',
              borderLeft: activeTab === 'dashboard' ? '4px solid #5856D6' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'dashboard') e.target.style.backgroundColor = '#f9f9f9'
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'dashboard') e.target.style.backgroundColor = 'transparent'
            }}
          >
            <i className="bi bi-graph-up" style={{ marginRight: '12px' }}></i>Dashboard
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              width: '100%',
              padding: '16px 20px',
              border: 'none',
              backgroundColor: activeTab === 'users' ? '#E8E8FF' : 'transparent',
              color: activeTab === 'users' ? '#5856D6' : '#666',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: activeTab === 'users' ? 600 : 500,
              fontSize: '14px',
              transition: 'all 0.3s ease',
              borderLeft: activeTab === 'users' ? '4px solid #5856D6' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'users') e.target.style.backgroundColor = '#f9f9f9'
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'users') e.target.style.backgroundColor = 'transparent'
            }}
          >
            <i className="bi bi-people" style={{ marginRight: '12px' }}></i>User Management
          </button>
        </nav>

        {/* Logout */}
        <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px 20px' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '10px 16px',
              backgroundColor: '#FF3B30',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#E63228'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#FF3B30'}
          >
            <i className="bi bi-box-arrow-right" style={{ marginRight: '8px' }}></i>Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '20px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ margin: 0, color: '#333', fontWeight: 600 }}>
            {activeTab === 'dashboard' ? 'Dashboard' : 'User Management'}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input
              type="text"
              placeholder="Search here..."
              style={{
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                width: '200px'
              }}
            />
            <div style={{ color: '#666', fontSize: '14px' }}>
              <i className="bi bi-person-circle" style={{ marginRight: '8px' }}></i>Admin
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' ? (
            <>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{
                  backgroundColor: '#fff',
                  padding: '24px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <small style={{ color: '#999', fontWeight: 500 }}>TOTAL USERS</small>
                      <h3 style={{ margin: '8px 0 0 0', color: '#333', fontWeight: 700 }}>{stats?.totalUsers || 0}</h3>
                    </div>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#E8E8FF',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#5856D6',
                      fontSize: '20px'
                    }}>
                      👥
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#fff',
                  padding: '24px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <small style={{ color: '#999', fontWeight: 500 }}>INTERESTED</small>
                      <h3 style={{ margin: '8px 0 0 0', color: '#333', fontWeight: 700 }}>{stats?.cert.yes || 0}</h3>
                    </div>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#D4E8FF',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0066FF',
                      fontSize: '20px'
                    }}>
                      ✓
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#fff',
                  padding: '24px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <small style={{ color: '#999', fontWeight: 500 }}>NOT INTERESTED</small>
                      <h3 style={{ margin: '8px 0 0 0', color: '#333', fontWeight: 700 }}>{stats?.cert.no || 0}</h3>
                    </div>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#FFE8E8',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FF3B30',
                      fontSize: '20px'
                    }}>
                      ✕
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {/* Pie Chart */}
                <div style={{
                  backgroundColor: '#fff',
                  padding: '24px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: 'none'
                }}>
                  <h5 style={{ margin: '0 0 20px 0', color: '#333', fontWeight: 600 }}>Certification Interest</h5>
                  <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pie data={certData} options={chartOptions} />
                  </div>
                </div>

                {/* Bar Chart */}
                <div style={{
                  backgroundColor: '#fff',
                  padding: '24px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: 'none'
                }}>
                  <h5 style={{ margin: '0 0 20px 0', color: '#333', fontWeight: 600 }}>Courses Distribution</h5>
                  <div style={{ height: '250px' }}>
                    <Bar data={courseData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Courses Table */}
              <div style={{
                backgroundColor: '#fff',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: 'none'
              }}>
                <h5 style={{ margin: '0 0 20px 0', color: '#333', fontWeight: 600 }}>Course Enrollment</h5>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f0f0f0', backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Course Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#666' }}>Students</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#666' }}>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.courses.map(c => (
                        <tr key={c._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '12px 16px', color: '#333' }}>{c._id}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: '#333' }}>
                            <span style={{ backgroundColor: '#E8E8FF', color: '#5856D6', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                              {c.count}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: '#666' }}>
                            {((c.count / (stats?.totalUsers || 1)) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <UserManagement />
          )}
        </div>
      </div>
    </div>
  )
}
