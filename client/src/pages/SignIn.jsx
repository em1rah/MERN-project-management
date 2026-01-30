import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/signin', { email, password });
      localStorage.setItem('token', res.data.token);

      const me = await API.get('/auth/me');
      if (me.data.roleType === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="card-body p-4 p-md-5">
                <h2 className="text-center fw-bold mb-4 text-primary">Welcome Back</h2>
                <p className="text-center text-muted mb-5">Sign in to continue</p>

                <form onSubmit={submit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email address
                    </label>
                    <input
                      id="email"
                      required
                      type="email"
                      className="form-control form-control-lg rounded-3"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password
                    </label>
                    <input
                      id="password"
                      required
                      type="password"
                      className="form-control form-control-lg rounded-3"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 rounded-3 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    Don't have an account?{' '}
                    <a href="/signup" className="text-primary fw-semibold text-decoration-none">
                      Sign up
                    </a>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}