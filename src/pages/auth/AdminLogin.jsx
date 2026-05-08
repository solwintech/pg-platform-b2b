import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Shield,
  ArrowRight,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';
import authService from '../../services/authService';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please enter username and password');
      return;
    }

    try {
      const response = await authService.login(formData.username, formData.password);
      if (response.success && response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Unauthorized access. Only admins can login here.');
        authService.logout();
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper" style={{ maxWidth: '450px' }}>
        <div className="login-card w-100" style={{ flexDirection: 'column' }}>
          {/* Admin Login Form */}
          <div className="login-form" style={{ width: '100%', padding: '2rem' }}>
            <div className="form-content">
              <div className="text-center mb-4">
                <div className="brand-logo mb-3" style={{ color: '#ff6b00', display: 'flex', justifyContent: 'center' }}>
                  <Shield size={48} />
                </div>
                <h4 className="mb-1">Admin Portal</h4>
                <p className="text-muted small">Sign in to access the control panel</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '12px', borderRadius: '8px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="form-group mb-3">
                  <label className="form-label small text-muted mb-1">Username / Email</label>
                  <div className="input-icon">
                    <Mail size={16} className="icon" />
                    <input
                      type="text"
                      className="form-control-modern"
                      name="username"
                      placeholder="admin@sortifystays.com"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label small text-muted mb-1">Password</label>
                  <div className="input-icon">
                    <Lock size={16} className="icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control-modern"
                      name="password"
                      placeholder="Enter admin password"
                      value={formData.password}
                      onChange={handleChange}
                      style={{ paddingRight: '40px' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberAdmin"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label small" htmlFor="rememberAdmin">
                      Remember me
                    </label>
                  </div>
                </div>

                <div className="d-grid mb-3">
                  <button type="submit" className="btn-login-secondary text-white" style={{ background: '#0f172a' }}>
                    <Shield size={16} className="me-2" />
                    Login as Admin
                    <ArrowRight size={16} className="ms-2" />
                  </button>
                </div>

                {/* Demo Credentials Note */}
                <div className="demo-note text-center mt-3">
                  <p className="small mb-0">✨ Demo Access: Use any credentials to login</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
