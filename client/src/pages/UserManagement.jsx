import React, { useEffect, useState } from 'react'
import API from '../api'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    API.get('/admin/users')
      .then(r => {
        setUsers(r.data)
        setLoading(false)
      })
      .catch(e => {
        console.error(e)
        setLoading(false)
      })
  }, [])

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Loading users...</p>
    </div>
  )

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0" style={{ color: '#333', fontWeight: 600 }}>
          <i className="bi bi-people me-2" style={{ color: '#5856D6' }}></i>User Management
        </h3>
        <span className="badge bg-secondary p-2 fs-6">{filteredUsers.length} Users</span>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="input-group">
          <span className="input-group-text" style={{ backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: '1px solid #e0e0e0' }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: 'none' }}>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
              <tr>
                <th style={{ fontWeight: 600, color: '#666', paddingTop: '15px', paddingBottom: '15px' }}>Full Name</th>
                <th style={{ fontWeight: 600, color: '#666', paddingTop: '15px', paddingBottom: '15px' }}>Email</th>
                <th style={{ fontWeight: 600, color: '#666', paddingTop: '15px', paddingBottom: '15px' }}>Role</th>
                <th style={{ fontWeight: 600, color: '#666', paddingTop: '15px', paddingBottom: '15px' }}>School</th>
                <th style={{ fontWeight: 600, color: '#666', paddingTop: '15px', paddingBottom: '15px', textAlign: 'center' }}>Certification Interest</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ paddingTop: '12px', paddingBottom: '12px', color: '#333', fontWeight: 500 }}>{u.fullName}</td>
                    <td style={{ paddingTop: '12px', paddingBottom: '12px', color: '#666' }}>{u.email}</td>
                    <td style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                      <span className="badge" style={{ backgroundColor: '#E8E8FF', color: '#5856D6' }}>{u.role}</span>
                    </td>
                    <td style={{ paddingTop: '12px', paddingBottom: '12px', color: '#999' }}>{u.school || 'N/A'}</td>
                    <td style={{ paddingTop: '12px', paddingBottom: '12px', textAlign: 'center' }}>
                      <span className={`badge ${u.interestedInCertification ? 'bg-success' : 'bg-danger'}`}>
                        {u.interestedInCertification ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5" style={{ color: '#999' }}>
                    <i className="bi bi-inbox" style={{ fontSize: '2rem', color: '#ddd' }}></i>
                    <p className="mt-3">No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
