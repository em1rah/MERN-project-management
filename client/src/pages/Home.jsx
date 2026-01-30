import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function Home(){
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  useEffect(()=>{ API.get('/auth/me').then(r=>setUser(r.data)).catch(()=>setUser(null)) },[])
  function logout(){
    localStorage.removeItem('token')
    navigate('/signin')
  }
  if(!user) return (
    <div className="container py-5">
      <div className="alert alert-warning text-center" role="alert">
        <h4>Please sign in.</h4>
      </div>
    </div>
  )
  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2 className="text-dark">Welcome, {user.fullName}!</h2>
        </div>
        <div className="col-md-4 text-md-end">
          <button onClick={logout} className="btn btn-danger">Logout</button>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="card-title text-primary">School</h5>
              <p className="card-text fs-5">{user.school}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="card-title text-primary">Role</h5>
              <p className="card-text fs-5">{user.role}{user.roleOther? ` (${user.roleOther})` : ''}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title text-primary">Certification Interest</h5>
              <p className="card-text fs-5"><span className={`badge ${user.interestedInCertification ? 'bg-success' : 'bg-secondary'}`}>{user.interestedInCertification? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
