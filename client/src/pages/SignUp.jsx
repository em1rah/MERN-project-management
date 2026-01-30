import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

const roles = ['Business Analyst','Implementation Consultant','System Developer','Quality Assurance','Other']
const courses = ['AWS Gen. AI','AWS Cloud Practitioner','AWS Certified Solution Architect']

export default function SignUp(){
  const [form, setForm] = useState({ fullName:'', school:'', role:roles[0], roleOther:'', coursesInterested:[], coursesOther:[], interestedInCertification:true, email:'', password:'' })
  const [otherCourseInput, setOtherCourseInput] = useState('')
  const navigate = useNavigate()

  function toggleCourse(c){
    setForm(s=>{
      const arr = s.coursesInterested.includes(c)? s.coursesInterested.filter(x=>x!==c) : [...s.coursesInterested,c]
      return {...s, coursesInterested:arr}
    })
  }

  async function submit(e){
    e.preventDefault()
    try{
      const res = await API.post('/auth/signup', form)
      if(res.data?.token){
        localStorage.setItem('token', res.data.token)
        const me = await API.get('/auth/me')
        if(me.data.roleType==='admin') navigate('/admin')
        else navigate('/home')
      } else {
        navigate('/home')
      }
    }catch(err){
      alert(err.response?.data?.msg || 'Signup failed')
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-4 text-dark">Sign Up</h2>
              <form onSubmit={submit}>
                <div className="mb-3">
                  <input required className="form-control form-control-lg" placeholder="Full name" value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} />
                </div>
                <div className="mb-3">
                  <input required className="form-control form-control-lg" placeholder="School attended" value={form.school} onChange={e=>setForm({...form, school:e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Role</label>
                  <select className="form-select form-select-lg" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
                    {roles.map(r=> <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {form.role==='Other' && <div className="mb-3"><input className="form-control form-control-lg" placeholder="Please specify role" value={form.roleOther} onChange={e=>setForm({...form, roleOther:e.target.value})} /></div>}

                <div className="mb-3">
                  <label className="form-label fw-bold">Courses Interested</label>
                  {courses.map(c=> (
                    <div key={c} className="form-check">
                      <input type="checkbox" className="form-check-input" id={`course-${c}`} checked={form.coursesInterested.includes(c)} onChange={()=>toggleCourse(c)} />
                      <label className="form-check-label" htmlFor={`course-${c}`}>{c}</label>
                    </div>
                  ))}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Add Other Course</label>
                  <div className="input-group input-group-lg">
                    <input className="form-control" placeholder="Add other course" value={otherCourseInput} onChange={e=>setOtherCourseInput(e.target.value)} />
                    <button className="btn btn-outline-secondary" type="button" onClick={()=>{ if(otherCourseInput.trim()){ setForm(s=>({...s, coursesOther:[...s.coursesOther, otherCourseInput.trim()]})); setOtherCourseInput('') } }}>Add</button>
                  </div>
                  <div className="mt-2">
                    {form.coursesOther.map((c,i)=><span key={i} className="badge bg-info text-dark me-2 mb-2">{c}</span>)}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Interested in Certification?</label>
                  <div className="form-check">
                    <input type="radio" className="form-check-input" name="cert" id="cert-yes" checked={form.interestedInCertification===true} onChange={()=>setForm({...form, interestedInCertification:true})} />
                    <label className="form-check-label" htmlFor="cert-yes">Yes</label>
                  </div>
                  <div className="form-check">
                    <input type="radio" className="form-check-input" name="cert" id="cert-no" checked={form.interestedInCertification===false} onChange={()=>setForm({...form, interestedInCertification:false})} />
                    <label className="form-check-label" htmlFor="cert-no">No</label>
                  </div>
                </div>

                <div className="mb-3">
                  <input required type="email" className="form-control form-control-lg" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
                </div>
                <div className="mb-4">
                  <input required type="password" className="form-control form-control-lg" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100">Sign Up</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
