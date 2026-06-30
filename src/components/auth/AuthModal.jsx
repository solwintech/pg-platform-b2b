import React, { useState, useEffect, useRef } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { useAuthModal } from '../../context/AuthModalContext';
import authService from '../../services/authService';
import logo from '../../assets/logo.png';
import './AuthModalFlow.css';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, onSuccessCallback } = useAuthModal();
  
  const [step, setStep] = useState('phone'); // phone, register, otp, success
  const [formData, setFormData] = useState({
    mobile: '',
    name: '',
    email: '',
    otp: ['', '', '', '', '', '']
  });
  
  const [isRegistered, setIsRegistered] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Reset state when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('phone');
      setFormData({
        mobile: '',
        name: '',
        email: '',
        otp: ['', '', '', '', '', '']
      });
      setIsRegistered(null);
      setError('');
      setTimer(0);
    }
  }, [isAuthModalOpen]);

  // Handle countdown timer for OTP resend
  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [timer]);

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, mobile: val }));
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData(prev => ({ ...prev, otp: newOtp }));
    setError('');

    // Move to next input
    if (value !== '' && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  // Step 1: Check mobile number
  const handleCheckMobile = async () => {
    if (formData.mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const res = await authService.checkMobile(formData.mobile);
      if (res.isRegistered) {
        // User exists, send OTP directly
        await authService.generateOtp(formData.mobile, 'user');
        setIsRegistered(true);
        setStep('otp');
        setTimer(25);
      } else {
        // New user, go to register step
        setIsRegistered(false);
        setStep('register');
      }
    } catch (err) {
      setError('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Send OTP after getting name and email (Registration flow)
  const handleSendOtpForNew = async () => {
    if (!formData.name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Valid email address is required');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.generateOtp(formData.mobile, 'user');
      setStep('otp');
      setTimer(25);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    setError('');
    try {
      await authService.generateOtp(formData.mobile, 'user');
      setTimer(25);
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Verify OTP & Login/Register
  const handleVerifyOtp = async () => {
    const otpValue = formData.otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // Pass userData only if it's a new registration
      const userData = isRegistered ? {} : { name: formData.name, email: formData.email };
      const res = await authService.verifyOtp(formData.mobile, otpValue, 'user', userData);
      
      if (res.success) {
        setStep('success');
        if (onSuccessCallback) {
          onSuccessCallback(res.user);
        }
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(res.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    closeAuthModal();
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal show={isAuthModalOpen} onHide={handleClose} centered contentClassName="auth-modal-flow-content">
      <div className="auth-modal-flow-header d-flex justify-content-between align-items-center">
        <img src={logo} alt="SortifyStays" className="auth-modal-logo" />
        <button className="auth-modal-close-btn" onClick={handleClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="auth-modal-body">
        
        {/* Step 1: Phone */}
        {step === 'phone' && (
          <>
            <div className="amf-icon-circle">
              <i className="fas fa-mobile-alt"></i>
            </div>
            <h2 className="amf-title">Welcome!</h2>
            <p className="amf-subtitle">Login or Sign up to continue</p>

            <div className="amf-input-group">
              <label className="amf-label">Mobile Number</label>
              <div className="amf-input-wrapper">
                <span className="amf-input-prefix">+91 <i className="fas fa-chevron-down ms-1" style={{fontSize:'10px'}}></i></span>
                <input 
                  type="text" 
                  className="amf-input"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleMobileChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckMobile()}
                />
              </div>
              {error && <div className="text-danger mt-2" style={{fontSize: '0.85rem'}}>{error}</div>}
            </div>

            <button className="amf-btn" onClick={handleCheckMobile} disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Continue'}
            </button>
            
            <div className="amf-footer">
              <i className="fas fa-shield-alt"></i> We'll send you a 6-digit OTP for verification
            </div>
          </>
        )}

        {/* Step 2: Register */}
        {step === 'register' && (
          <>
            <div className="amf-icon-circle">
              <i className="far fa-user"></i>
            </div>
            <h2 className="amf-title">Create Your Account</h2>
            <p className="amf-subtitle">Let's get you started!</p>

            <div className="amf-input-group mb-3">
              <label className="amf-label">Full Name</label>
              <div className="amf-input-wrapper">
                <input 
                  type="text" 
                  name="name"
                  className="amf-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="amf-input-group mb-3">
              <label className="amf-label">Email Address</label>
              <div className="amf-input-wrapper">
                <input 
                  type="email" 
                  name="email"
                  className="amf-input"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="amf-input-group">
              <label className="amf-label">Mobile Number</label>
              <div className="amf-input-wrapper disabled" style={{background: '#fff7ed'}}>
                <span className="amf-input-prefix" style={{background: 'transparent', borderRight: 'none', paddingRight: '0'}}>
                  <i className="fas fa-phone-alt text-warning"></i>
                </span>
                <input 
                  type="text" 
                  className="amf-input fw-bold"
                  value={`+91 ${formData.mobile} (Not registered)`}
                  disabled
                  style={{color: '#ea580c'}}
                />
              </div>
              {error && <div className="text-danger mt-2" style={{fontSize: '0.85rem'}}>{error}</div>}
            </div>

            <button className="amf-btn" onClick={handleSendOtpForNew} disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Send OTP'}
            </button>
            
            <div className="amf-footer">
              <i className="fas fa-shield-alt"></i> We'll send you a 6-digit OTP for verification
            </div>
          </>
        )}

        {/* Step 3: Verify OTP */}
        {step === 'otp' && (
          <>
            <div className="amf-icon-circle">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="amf-title">Verify OTP</h2>
            <p className="amf-subtitle">Enter the 6-digit OTP sent to<br/><b>+91 {formData.mobile}</b></p>

            <div className="amf-otp-container">
              {formData.otp.map((digit, index) => (
                <input
                  key={index}
                  ref={otpRefs[index]}
                  type="text"
                  maxLength="1"
                  className="amf-otp-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                />
              ))}
            </div>
            
            {error && <div className="text-danger mb-3" style={{fontSize: '0.85rem'}}>{error}</div>}

            <div className="mb-4" style={{fontSize: '0.9rem', color: '#6b7280'}}>
              Resend OTP in <span className="amf-timer">{formatTime(timer)}</span>
              {timer === 0 && (
                <span 
                  className="ms-2 fw-bold text-decoration-underline" 
                  style={{color: '#ea580c', cursor: 'pointer'}}
                  onClick={handleResendOtp}
                >
                  Resend Now
                </span>
              )}
            </div>

            <button className="amf-btn" onClick={handleVerifyOtp} disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Verify & Login'}
            </button>
            
            <div className="amf-footer">
              <i className="fas fa-shield-alt"></i> Your data is safe and secure
            </div>
          </>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <>
            <div className="amf-icon-circle success mt-4">
              <i className="fas fa-check"></i>
            </div>
            <h2 className="amf-title">Login Successful!</h2>
            <p className="amf-subtitle">Welcome back to SortifyStays</p>

            <button className="amf-btn amf-btn-light mt-4" onClick={handleClose}>
              Go to Home
            </button>
          </>
        )}

      </div>
    </Modal>
  );
};

export default AuthModal;
