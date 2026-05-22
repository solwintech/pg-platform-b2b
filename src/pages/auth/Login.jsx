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
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import authService from '../../services/authService';
import { TermsOfServiceModal, PrivacyPolicyModal } from '../../components/auth/AuthModals';

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
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    if (errors.general) {
      setErrors({ ...errors, general: '' });
    }
  };

  const handleSendOTP = async () => {
    if (formData.phone && formData.phone.length === 10) {
      setIsSendingOtp(true);
      setErrors({});
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
        setErrors({ ...errors, phone: err.response?.data?.message || 'Failed to send OTP' });
      }
    } else {
      setErrors({ ...errors, phone: 'Please enter a valid 10-digit phone number' });
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
    setErrors({});
    const newErrors = {};

    // For email login - Check manager first
    if (loginMethod === 'email') {
      if (!formData.email) newErrors.email = 'Email/Username is required';
      if (!formData.password) newErrors.password = 'Password is required';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Check if manager exists (dummy data fallback)
      const isManager = checkAndLoginManager(formData.email, formData.password);
      if (isManager) return;
    }

    // For phone login - Check manager
    if (loginMethod === 'phone') {
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!otpSent) newErrors.phone = 'Please request and verify OTP';
      if (otpSent && !formData.otp) newErrors.otp = 'OTP is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
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
            navigate('/b2b');
          } else {
            // This shouldn't happen for login, but for safety:
            setErrors({ general: 'Account not found. Please register first.' });
          }
          return;
        }
      }

      const identifier = loginMethod === 'email' ? formData.email : formData.phone;
      const response = await authService.login(identifier, formData.password);
      if (response.success) {
        navigate('/b2b');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.needsVerification) {
        setLoginMethod('phone');
        setFormData({ ...formData, phone: err.response.data.mobile });
        setErrors({ general: 'Please verify your mobile number to continue' });
        handleSendOTP();
      } else {
        setErrors({ general: err.response?.data?.message || 'Invalid credentials' });
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
              <h2 className="brand-title">Sortify Stays</h2>
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


                <button className="action-btn help" onClick={() => alert('📞 For support, call +91 98765 43210 or email support@sortifystays.com')}>
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

              {/* General Error Message */}
              {errors.general && (
                <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center" style={{ fontSize: '12px', borderRadius: '8px' }}>
                  <AlertCircle size={14} className="me-2 flex-shrink-0" />
                  <span>{errors.general}</span>
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
                          className={`form-control-modern ${errors.email ? 'is-invalid' : ''}`}
                          name="email"
                          placeholder="enter@email.com or username"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.email && <div className="text-danger mt-1" style={{ fontSize: '10px' }}>{errors.email}</div>}
                    </div>
                    <div className="form-group mb-3">
                      <div className="input-icon">
                        <Lock size={16} className="icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control-modern ${errors.password ? 'is-invalid' : ''}`}
                          name="password"
                          placeholder="Enter your password"
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
                      {errors.password && <div className="text-danger mt-1" style={{ fontSize: '10px' }}>{errors.password}</div>}
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
                          className={`form-control-modern ${errors.phone ? 'is-invalid' : ''}`}
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
                      {errors.phone && <div className="text-danger mt-1" style={{ fontSize: '10px' }}>{errors.phone}</div>}
                    </div>
                    {otpSent && (
                      <div className="form-group mb-4">
                        <div className="input-icon">
                          <Key size={16} className="icon" />
                          <input
                            type="text"
                            className={`form-control-modern ${errors.otp ? 'is-invalid' : ''}`}
                            name="otp"
                            placeholder="Enter 6-digit OTP"
                            value={formData.otp}
                            onChange={handleChange}
                            maxLength="6"
                          />
                        </div>
                        {errors.otp && <div className="text-danger mt-1" style={{ fontSize: '10px' }}>{errors.otp}</div>}
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
                <p className="mt-2" style={{ fontSize: '10px', color: '#94a3b8' }}>
                  By logging in, you agree to our <a href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="text-decoration-none text-muted fw-bold">Terms of Service</a> & <a href="#" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }} className="text-decoration-none text-muted fw-bold">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TermsOfServiceModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />
      <PrivacyPolicyModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />
    </div>
  );
};

export default Login;