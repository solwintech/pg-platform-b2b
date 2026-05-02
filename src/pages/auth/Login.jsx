import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Phone,
  Building2,
  Shield,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Key,
  UserPlus,
  HelpCircle,
  Users
} from 'lucide-react';
import authService from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    otp: '',
    password: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSendOTP = async () => {
    if (formData.phone && formData.phone.length === 10) {
      setIsSendingOtp(true);
      setError('');
      try {
        await authService.generateOtp(formData.phone);
        setOtpSent(true);
        setIsSendingOtp(false);
        setOtpTimer(60);
        const interval = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        setIsSendingOtp(false);
        setError(err.response?.data?.message || 'Failed to send OTP');
      }
    } else {
      setError('Please enter a valid 10-digit phone number');
    }
  };

  // Check if user is a manager
  const checkAndLoginManager = (username, password) => {
    const managers = JSON.parse(window.dummyDataStorage.getItem('managers') || '[]');
    const manager = managers.find(
      m => (m.username === username || m.email === username) && m.password === password && m.status === 'active'
    );

    if (manager) {
      window.dummyDataStorage.setItem('isLoggedIn', 'true');
      window.dummyDataStorage.setItem('userRole', 'manager');
      window.dummyDataStorage.setItem('loggedManager', JSON.stringify(manager));
      window.dummyDataStorage.setItem('rememberMe', rememberMe);
      navigate('/manager/dashboard');
      return true;
    }
    return false;
  };

  // Check manager by phone
  const checkManagerByPhone = (phone, otp) => {
    // For demo, if OTP is sent and phone matches any manager
    const managers = JSON.parse(window.dummyDataStorage.getItem('managers') || '[]');
    const manager = managers.find(m => m.phone === phone && m.status === 'active');

    if (manager && otpSent) {
      window.dummyDataStorage.setItem('isLoggedIn', 'true');
      window.dummyDataStorage.setItem('userRole', 'manager');
      window.dummyDataStorage.setItem('loggedManager', JSON.stringify(manager));
      window.dummyDataStorage.setItem('rememberMe', rememberMe);
      navigate('/manager/dashboard');
      return true;
    }
    return false;
  };

  const handleLogin = (e, role) => {
    if (e) e.preventDefault();
    setError('');

    // For email login - Check manager first
    if (loginMethod === 'email') {
      if (!formData.email || !formData.password) {
        setError('Please enter email/username and password');
        return;
      }

      // Check if manager exists (dummy data fallback)
      const isManager = checkAndLoginManager(formData.email, formData.password);
      if (isManager) return;
    }

    // For phone login - Check manager
    if (loginMethod === 'phone') {
      if (!formData.phone) {
        setError('Please enter phone number');
        return;
      }

      if (!otpSent) {
        setError('Please verify OTP first');
        return;
      }

      const isManager = checkManagerByPhone(formData.phone, formData.otp);
      if (isManager) return;
    }

    // If not manager, proceed with B2B login
    if (role === 'b2b') {
      loginB2B();
    }
  };

  const loginB2B = async () => {
    try {
      if (loginMethod === 'phone') {
        setIsVerifying(true);
        const verifyRes = await authService.verifyOtp(formData.phone, formData.otp);
        if (verifyRes.success) {
          if (verifyRes.token) {
            // User was automatically logged in
            navigate('/b2b/dashboard');
          } else {
            // This shouldn't happen for login, but for safety:
            setError('Account not found. Please register first.');
          }
          return;
        }
      }

      const identifier = loginMethod === 'email' ? formData.email : formData.phone;
      const response = await authService.login(identifier, formData.password);
      if (response.success) {
        navigate('/b2b/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.needsVerification) {
        setLoginMethod('phone');
        setFormData({ ...formData, phone: err.response.data.mobile });
        setError('Please verify your mobile number to continue');
        handleSendOTP();
      } else {
        setError(err.response?.data?.message || 'Invalid credentials');
      }
      setIsVerifying(false);
    }
  };


  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          {/* Left Side - Brand Section */}
          <div className="login-brand">
            <div className="brand-content">
              <div className="brand-logo">
                <Building2 size={40} />
              </div>
              <h2 className="brand-title">PG Platform</h2>
              <p className="brand-subtitle">India's largest PG & Hostel discovery platform</p>
              <div className="brand-features">
                <div className="feature-item">
                  <CheckCircle size={14} />
                  <span>1000+ Verified Properties</span>
                </div>
                <div className="feature-item">
                  <CheckCircle size={14} />
                  <span>50,000+ Happy Customers</span>
                </div>
                <div className="feature-item">
                  <CheckCircle size={14} />
                  <span>24/7 Customer Support</span>
                </div>
              </div>

              {/* Action Buttons in Left Panel */}
              <div className="brand-actions">


                <button className="action-btn help" onClick={() => alert('📞 For support, call +91 98765 43210 or email support@pgplatform.com')}>
                  <HelpCircle size={14} />
                  Need Help?
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="login-form">
            <div className="form-content">
              <div className="text-center mb-4">
                <h4 className="mb-1">Welcome Back! 👋</h4>
                <p className="text-muted small">Sign in to access your dashboard</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '12px', borderRadius: '8px' }}>
                  {error}
                </div>
              )}

              {/* Login Method Toggle */}
              <div className="method-toggle mb-4">
                <button
                  className={`method-btn ${loginMethod === 'email' ? 'active' : ''}`}
                  onClick={() => setLoginMethod('email')}
                >
                  <Mail size={14} className="me-2" />
                  Email
                </button>
                <button
                  className={`method-btn ${loginMethod === 'phone' ? 'active' : ''}`}
                  onClick={() => setLoginMethod('phone')}
                >
                  <Smartphone size={14} className="me-2" />
                  WhatsApp
                </button>
              </div>

              <form onSubmit={(e) => handleLogin(e, 'b2b')}>
                {/* Email Login Form */}
                {loginMethod === 'email' ? (
                  <>
                    <div className="form-group mb-3">
  
                      <div className="input-icon">
                        <Mail size={16} className="icon" />
                        <input
                          type="text"
                          className="form-control-modern"
                          name="email"
                          placeholder="enter@email.com or username"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="form-group mb-3">
  
                      <div className="input-icon">
                        <Lock size={16} className="icon" />
                        <input
                          type="password"
                          className="form-control-modern"
                          name="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="remember"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor="remember">
                          Remember me
                        </label>
                      </div>
                      <a href="#" className="small text-primary text-decoration-none">Forgot Password?</a>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group mb-3">
  
                      <div className="input-group-custom">
                        <span className="country-code">+91</span>
                        <input
                          type="tel"
                          className="form-control-modern"
                          name="phone"
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={handleChange}
                          maxLength="10"
                        />
                        <button
                          type="button"
                          className="otp-btn"
                          onClick={handleSendOTP}
                          disabled={isSendingOtp || (otpSent && otpTimer > 0)}
                        >
                          {isSendingOtp ? 'Sending...' : otpSent && otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Send OTP'}
                        </button>
                      </div>
                    </div>
                    {otpSent && (
                      <div className="form-group mb-4">
  
                        <div className="input-icon">
                          <Key size={16} className="icon" />
                          <input
                            type="text"
                            className="form-control-modern"
                            name="otp"
                            placeholder="Enter 6-digit OTP"
                            value={formData.otp}
                            onChange={handleChange}
                            maxLength="6"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
  
                {/* Login Buttons */}
                <div className="d-grid gap-2 mb-3">
                  <button
                    type="submit"
                    className="btn-login-primary"
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Verifying...' : 'Login as PG Owner'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>

              {/* Sign Up Link */}
              <div className="text-center mt-4">
                <p className="small text-muted mb-0">
                  Don't have an account? <a href="#" onClick={() => navigate('/register')} className="text-primary text-decoration-none fw-semibold">Register as PG Owner</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;