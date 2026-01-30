import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function SignIn(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  async function submit(e){
    e.preventDefault()
    try{
      const res = await API.post('/auth/signin', { email, password })
      localStorage.setItem('token', res.data.token)
      // fetch user to decide redirect
      const me = await API.get('/auth/me')
      if(me.data.roleType==='admin') navigate('/admin')
      else navigate('/home')
    }catch(err){
      alert(err.response?.data?.msg || 'Signin failed')
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-4 text-dark">Sign In</h2>
              <form onSubmit={submit}>
                <div className="mb-3">
                  <input required type="email" className="form-control form-control-lg" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                </div>
                <div className="mb-4">
                  <input required type="password" className="form-control form-control-lg" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100">Sign In</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
