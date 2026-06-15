import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building2,
  ArrowRight,
  CheckCircle,
  Shield,
  Smartphone,
  Send,
  Clock,
  LogIn,
  Lock,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import authService from '../../services/authService';
import { TermsOfServiceModal, PrivacyPolicyModal, OtpVerificationModal } from '../../components/auth/AuthModals';
import logo from '../../assets/logo.png';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
    alternatePhone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // If phone number is changed after verification, reset verification status
    if (name === 'phone' && (isVerified || otpSent)) {
      setIsVerified(false);
      setOtpSent(false);
      setOtp('');
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSendOTP = async () => {
    if (formData.phone && formData.phone.length === 10) {
      setIsSendingOtp(true);
      try {
        await authService.generateOtp(formData.phone);
        setOtpSent(true);
        setShowOtpModal(true);
        setIsSendingOtp(false);
        setOtpTimer(60);
        // Start timer
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

  const handleVerifyOTP = async () => {
    if (otp.length === 6) {
      setIsVerifyingOtp(true);
      try {
        await authService.verifyOtp(formData.phone, otp);
        setIsVerified(true);
        setIsVerifyingOtp(false);
        setShowOtpModal(false);
      } catch (err) {
        setIsVerifyingOtp(false);
        setErrors({ ...errors, otp: err.response?.data?.message || 'Invalid OTP' });
      }
    } else {
      setErrors({ ...errors, otp: 'Please enter 6-digit OTP' });
    }
  };

  useEffect(() => {
    if (otp.length === 6 && !isVerifyingOtp && !isVerified) {
      handleVerifyOTP();
    }
  }, [otp]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner / contact person name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!isVerified) newErrors.otp = 'Please verify your phone number with OTP';
    if (!agreeTerms) newErrors.terms = 'You must agree to the terms and conditions';

    if (Object.keys(newErrors).length > 0) {
      newErrors.general = 'Please fill all required fields and verify your phone number to continue.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await authService.register({
          name: formData.ownerName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          alternatePhone: formData.alternatePhone,
          role: 'b2b',
          isMobileVerified: true
        });
        setIsSubmitting(false);
        alert('Registration successful! Please login to your dashboard.');
        navigate('/login');
      } catch (err) {
        console.error('Registration error:', err);
        setIsSubmitting(false);
        setErrors({ ...errors, general: err.response?.data?.message || 'Registration failed' });
      }
    }
  };


  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-card">
          {/* Left Side - Brand Section */}
          <div className="register-brand">
            <div className="brand-content">
              <div className="mb-4">
                <img src={logo} alt="Logo" height="60" style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              </div>
              <p className="brand-subtitle">Join India's largest PG & Hostel platform</p>
              <div className="brand-features">
                <div className="feature-item">
                  <CheckCircle size={14} />
                  <span>Free registration</span>
                </div>
                <div className="feature-item">
                  <CheckCircle size={14} />
                  <span>Admin will contact you</span>
                </div>
                <div className="feature-item">
                  <CheckCircle size={14} />
                  <span>Get login credentials</span>
                </div>
                <div className="feature-item">
                  <CheckCircle size={14} />
                  <span>Start listing properties</span>
                </div>
              </div>


            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="register-form">
            <div className="form-content">
              <div className="text-center mb-4">
                <h4 className="mb-1">Create Your Account</h4>
                <p className="text-muted small">Enter your details to register as a PG owner and start listing.</p>
              </div>

              {errors.general && (
                <div className="alert alert-danger py-2 px-3 mb-3 small" style={{ borderRadius: '8px' }}>
                  <AlertCircle size={14} className="me-2" />
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="row g-1">
                  <div className="col-12">
                    <div className="form-group">

                      <div className="input-icon">
                        <User size={16} className="icon" />
                        <input
                          type="text"
                          className={`form-control-modern ${errors.ownerName ? 'is-invalid' : ''}`}
                          name="ownerName"
                          placeholder="Full name of owner / contact person"
                          value={formData.ownerName}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.ownerName && <small className="error-text">{errors.ownerName}</small>}
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-group">

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
                          className={`otp-btn ${isVerified ? 'verified' : ''}`}
                          onClick={() => {
                            if (otpSent && !isVerified) {
                              setShowOtpModal(true);
                            } else {
                              handleSendOTP();
                            }
                          }}
                          disabled={isVerified || isSendingOtp}
                        >
                          {isVerified ? '✓ Verified' : isSendingOtp ? 'Sending...' : otpSent && !isVerified ? 'Enter OTP' : 'Send OTP'}
                        </button>
                      </div>
                      {errors.phone && <small className="error-text">{errors.phone}</small>}
                    </div>
                  </div>



                  <div className="col-md-12">
                    <div className="form-group">

                      <div className="input-icon">
                        <Mail size={16} className="icon" />
                        <input
                          type="email"
                          className={`form-control-modern ${errors.email ? 'is-invalid' : ''}`}
                          name="email"
                          placeholder="contact@yourbusiness.com"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.email && <small className="error-text">{errors.email}</small>}
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-group">
                      <div className="input-icon">
                        <Lock size={16} className="icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control-modern ${errors.password ? 'is-invalid' : ''}`}
                          name="password"
                          placeholder="Create a strong password (min 6 chars)"
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
                      {errors.password && <small className="error-text">{errors.password}</small>}
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-group">
                      <div className="input-icon">
                        <Lock size={16} className="icon" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`form-control-modern ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          name="confirmPassword"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          style={{ paddingRight: '40px' }}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <small className="error-text">{errors.confirmPassword}</small>}
                    </div>
                  </div>
                </div>

                <div className="form-group mt-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        if (errors.terms) setErrors({ ...errors, terms: '' });
                      }}
                    />
                    <label className="form-check-label small" htmlFor="terms">
                      I agree to the <a href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="text-primary text-decoration-none">Terms of Service</a> and <a href="#" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }} className="text-primary text-decoration-none">Privacy Policy</a>
                    </label>
                  </div>
                  {errors.terms && <small className="error-text">{errors.terms}</small>}
                </div>

                <div className="d-grid mt-4">
                  <button type="submit" className="btn-register" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Processing... <Clock size={16} /></>
                    ) : (
                      <>Register & Request Approval <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
                <div className="text-center mt-3">
                  <p className="small text-muted mb-0">
                    Already registered? <a href="#" onClick={() => navigate('/login')} className="text-primary text-decoration-none fw-semibold">Login here</a>
                  </p>
                </div>
              </form>


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
        otp={otp}
        setOtp={setOtp}
        onVerify={handleVerifyOTP}
        isVerifying={isVerifyingOtp}
        error={errors.otp}
        otpTimer={otpTimer}
        onResend={handleSendOTP}
      />
    </div>
  );
};

export default Register;