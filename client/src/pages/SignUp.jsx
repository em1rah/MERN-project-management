import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const roles = [
  'Business Analyst',
  'Implementation Consultant',
  'System Developer',
  'Quality Assurance',
  'Other',
];

const courses = ['AWS Gen. AI', 'AWS Cloud Practitioner', 'AWS Certified Solution Architect'];

export default function SignUp() {
  const [form, setForm] = useState({
    fullName: '',
    school: '',
    role: roles[0],
    roleOther: '',
    coursesInterested: [],
    coursesOther: [],
    interestedInCertification: true,
    email: '',
    password: '',
  });

  const [otherCourseInput, setOtherCourseInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function toggleCourse(c) {
    setForm((s) => {
      const arr = s.coursesInterested.includes(c)
        ? s.coursesInterested.filter((x) => x !== c)
        : [...s.coursesInterested, c];
      return { ...s, coursesInterested: arr };
    });
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    // You might want to clean / validate "Other" fields here
    if (form.role !== 'Other') {
      form.roleOther = '';
    }

    try {
      const payload = { ...form };
      const res = await API.post('/auth/signup', payload);

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        const me = await API.get('/auth/me');
        if (me.data.roleType === 'admin') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      } else {
        navigate('/home');
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-7">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="card-body p-4 p-md-5">
                <h2 className="text-center fw-bold mb-4 text-primary">Create Account</h2>
                <p className="text-center text-muted mb-5">Join our AWS learning community</p>

                <form onSubmit={submit}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Full Name</label>
                      <input
                        required
                        className="form-control form-control-lg rounded-3"
                        placeholder="John Doe"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">School / Institution</label>
                      <input
                        required
                        className="form-control form-control-lg rounded-3"
                        placeholder="Your school or university"
                        value={form.school}
                        onChange={(e) => setForm({ ...form, school: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Role</label>
                      <select
                        className="form-select form-select-lg rounded-3"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    {form.role === 'Other' && (
                      <div className="col-12">
                        <input
                          className="form-control form-control-lg rounded-3"
                          placeholder="Please specify your role"
                          value={form.roleOther}
                          onChange={(e) => setForm({ ...form, roleOther: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="col-12">
                      <label className="form-label fw-bold">Courses You're Interested In</label>
                      <div className="row g-3">
                        {courses.map((c) => (
                          <div className="col-12 col-sm-6" key={c}>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`course-${c.replace(/\s+/g, '-')}`}
                                checked={form.coursesInterested.includes(c)}
                                onChange={() => toggleCourse(c)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`course-${c.replace(/\s+/g, '-')}`}
                              >
                                {c}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Other Course (optional)</label>
                      <div className="input-group input-group-lg">
                        <input
                          className="form-control rounded-3 rounded-end-0"
                          placeholder="e.g. Azure Fundamentals"
                          value={otherCourseInput}
                          onChange={(e) => setOtherCourseInput(e.target.value)}
                        />
                        <button
                          className="btn btn-outline-secondary rounded-3 rounded-start-0"
                          type="button"
                          onClick={() => {
                            if (otherCourseInput.trim()) {
                              setForm((s) => ({
                                ...s,
                                coursesOther: [...s.coursesOther, otherCourseInput.trim()],
                              }));
                              setOtherCourseInput('');
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                      {form.coursesOther.length > 0 && (
                        <div className="mt-3">
                          {form.coursesOther.map((c, i) => (
                            <span key={i} className="badge bg-info-subtle text-info-emphasis me-2 mb-2 px-3 py-2">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold d-block">
                        Interested in AWS Certification?
                      </label>
                      <div className="d-flex gap-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="cert"
                            id="cert-yes"
                            checked={form.interestedInCertification === true}
                            onChange={() => setForm({ ...form, interestedInCertification: true })}
                          />
                          <label className="form-check-label" htmlFor="cert-yes">
                            Yes
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="cert"
                            id="cert-no"
                            checked={form.interestedInCertification === false}
                            onChange={() => setForm({ ...form, interestedInCertification: false })}
                          />
                          <label className="form-check-label" htmlFor="cert-no">
                            No
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email address</label>
                      <input
                        required
                        type="email"
                        className="form-control form-control-lg rounded-3"
                        placeholder="name@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Password</label>
                      <input
                        required
                        type="password"
                        className="form-control form-control-lg rounded-3"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mt-5 rounded-3 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <small className="text-muted">
                      Already have an account?{' '}
                      <a href="/signin" className="text-primary fw-semibold text-decoration-none">
                        Sign in
                      </a>
                    </small>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}