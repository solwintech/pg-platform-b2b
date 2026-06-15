import React, { useState, useEffect } from 'react';
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
  EyeOff,
  AlertCircle
} from 'lucide-react';
import authService from '../../services/authService';
import { TermsOfServiceModal, PrivacyPolicyModal, OtpVerificationModal } from '../../components/auth/AuthModals';
import logo from '../../assets/logo.png';

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
  const [showOtpModal, setShowOtpModal] = useState(false);

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
        await authService.generateOtp(formData.phone, 'b2b');
        setOtpSent(true);
        setShowOtpModal(true);
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
        let errorMsg = err.response?.data?.message || 'Failed to send OTP';
        if (typeof errorMsg === 'object') {
          errorMsg = errorMsg.message || JSON.stringify(errorMsg);
        }
        setErrors({ ...errors, phone: errorMsg });
      }
    } else {
      setErrors({ ...errors, phone: 'Please enter a valid 10-digit phone number' });
    }
  };


  const handleLogin = (e, role) => {
    if (e) e.preventDefault();
    setErrors({});
    const newErrors = {};

    // For email login
    if (loginMethod === 'email') {
      if (!formData.email) newErrors.email = 'Email/Username is required';
      if (!formData.password) newErrors.password = 'Password is required';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    // For phone login
    if (loginMethod === 'phone') {
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!otpSent) newErrors.phone = 'Please request and verify OTP';
      if (otpSent && !formData.otp) newErrors.otp = 'OTP is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    // Proceed with B2B login
    if (role === 'b2b') {
      loginB2B();
    }
  };

  useEffect(() => {
    if (loginMethod === 'phone' && formData.otp.length === 6 && otpSent && !isVerifying) {
      handleLogin(null, 'b2b');
    }
  }, [formData.otp, loginMethod, otpSent, isVerifying]);

  const loginB2B = async () => {
    try {
      if (loginMethod === 'phone') {
        setIsVerifying(true);
        const verifyRes = await authService.verifyOtp(formData.phone, formData.otp, 'b2b');
        if (verifyRes.success) {
          // Explicit check to block regular users if backend somehow returns them
          if (verifyRes.user && verifyRes.user.role === 'user') {
            authService.logout(); // Clear any erroneously set token
            setErrors({ general: 'Access Denied. Only B2B Owners can log in here.' });
            setIsVerifying(false);
            return;
          }
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
        let errorMsg = err.response?.data?.message || 'Invalid credentials';
        if (typeof errorMsg === 'object') {
          errorMsg = errorMsg.message || JSON.stringify(errorMsg);
        }
        setErrors({ general: errorMsg });
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
              <div className="mb-4">
                <img src={logo} alt="Logo" height="60" style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              </div>
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
                          onClick={() => {
                            if (otpSent) {
                              setShowOtpModal(true);
                            } else {
                              handleSendOTP();
                            }
                          }}
                          disabled={isSendingOtp}
                        >
                          {isSendingOtp ? 'Sending...' : otpSent ? 'Enter OTP' : 'Send OTP'}
                        </button>
                      </div>
                      {errors.phone && <div className="text-danger mt-1" style={{ fontSize: '10px' }}>{errors.phone}</div>}
                    </div>
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
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        phone={formData.phone}
        otp={formData.otp}
        setOtp={(val) => handleChange({ target: { name: 'otp', value: val } })}
        onVerify={(e) => handleLogin(e, 'b2b')}
        isVerifying={isVerifying}
        error={errors.otp || errors.general}
        otpTimer={otpTimer}
        onResend={handleSendOTP}
      />
    </div>
  );
};

export default Login;