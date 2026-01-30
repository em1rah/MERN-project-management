import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend)

export default function AdminDashboard(){
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const navigate = useNavigate()
  function logout(){
    localStorage.removeItem('token')
    navigate('/signin')
  }

  useEffect(()=>{
    API.get('/admin/stats').then(r=>setStats(r.data)).catch(e=>console.error(e))
    API.get('/admin/users').then(r=>setUsers(r.data)).catch(e=>console.error(e))
  },[])

  if(!stats) return (
    <div className="container py-5 text-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Loading dashboard...</p>
    </div>
  )

  const pieData = {
    labels: ['Interested','Not Interested'],
    datasets: [{ data: [stats.cert.yes, stats.cert.no], backgroundColor:['#36A2EB','#FF6384'] }]
  }

  return (
    <div className="container-fluid py-5">
      <div className="row mb-4 align-items-center">
        <div className="col-md-8">
          <h2 className="text-dark">Admin Dashboard</h2>
        </div>
        <div className="col-md-4 text-md-end">
          <button onClick={logout} className="btn btn-danger">Logout</button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 bg-light">
            <div className="card-body text-center">
              <h5 className="card-title text-muted">Total Users</h5>
              <h3 className="text-primary">{stats.totalUsers}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-9">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title text-primary mb-4">Certification Interest</h5>
              <div style={{width:'300px', margin:'0 auto'}}>
                <Pie data={pieData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title text-primary mb-4">Courses Breakdown</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Course</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.courses.map(c=> <tr key={c._id}><td>{c._id}</td><td><span className="badge bg-primary">{c.count}</span></td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title text-primary mb-4">Users</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Certification</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u=> (
                      <tr key={u._id}>
                        <td>{u.fullName}</td>
                        <td>{u.email}</td>
                        <td><span className="badge bg-secondary">{u.role}</span></td>
                        <td><span className={`badge ${u.interestedInCertification ? 'bg-success' : 'bg-danger'}`}>{u.interestedInCertification? 'Yes':'No'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
