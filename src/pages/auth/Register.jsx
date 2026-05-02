import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import authService from '../../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
    alternatePhone: '',
    email: '',
    password: ''
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSendOTP = async () => {
    if (formData.phone && formData.phone.length === 10) {
      setIsSendingOtp(true);
      try {
        await authService.generateOtp(formData.phone);
        setOtpSent(true);
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
      } catch (err) {
        setIsVerifyingOtp(false);
        setErrors({ ...errors, otp: err.response?.data?.message || 'Invalid OTP' });
      }
    } else {
      setErrors({ ...errors, otp: 'Please enter 6-digit OTP' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner / contact person name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!isVerified) newErrors.otp = 'Please verify your phone number with OTP';
    if (!agreeTerms) newErrors.terms = 'You must agree to the terms and conditions';

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
              <div className="brand-logo">
                <Building2 size={40} />
              </div>
              <h2 className="brand-title">Register Your Property</h2>
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
                          className={`form-control-modern ${errors.ownerName ? 'error' : ''}`}
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
                          className={`form-control-modern ${errors.phone ? 'error' : ''}`}
                          name="phone"
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={handleChange}
                          maxLength="10"
                        />
                        <button
                          type="button"
                          className={`otp-btn ${isVerified ? 'verified' : ''}`}
                          onClick={handleSendOTP}
                          disabled={isVerified || isSendingOtp || (otpSent && otpTimer > 0)}
                        >
                          {isVerified ? '✓ Verified' : isSendingOtp ? 'Sending...' : otpSent && otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Send OTP'}
                        </button>
                      </div>
                      {errors.phone && <small className="error-text">{errors.phone}</small>}
                    </div>
                  </div>

                  {otpSent && !isVerified && (
                    <div className="col-md-12">
                      <div className="form-group">
                        <div className="input-group-custom">
                          <span className="input-group-text-modern">
                            <Smartphone size={16} />
                          </span>
                          <input
                            type="text"
                            className={`form-control-modern ${errors.otp ? 'error' : ''}`}
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="6"
                          />
                          <button
                            type="button"
                            className="otp-btn"
                            onClick={handleVerifyOTP}
                            disabled={isVerifyingOtp || otp.length !== 6}
                          >
                            {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                          </button>
                        </div>
                        {errors.otp && <small className="error-text">{errors.otp}</small>}
                      </div>
                    </div>
                  )}

                  <div className="col-md-12">
                    <div className="form-group">

                      <div className="input-icon">
                        <Mail size={16} className="icon" />
                        <input
                          type="email"
                          className={`form-control-modern ${errors.email ? 'error' : ''}`}
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
                          type="password"
                          className={`form-control-modern ${errors.password ? 'error' : ''}`}
                          name="password"
                          placeholder="Create a strong password (min 6 chars)"
                          value={formData.password}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.password && <small className="error-text">{errors.password}</small>}
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
                      I agree to the <a href="#" className="text-primary text-decoration-none">Terms of Service</a> and <a href="#" className="text-primary text-decoration-none">Privacy Policy</a>
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
    </div>
  );
};

export default Register;