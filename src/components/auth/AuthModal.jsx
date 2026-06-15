import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useAuthModal } from '../../context/AuthModalContext';
import authService from '../../services/authService';
import logo from '../../assets/logo.png';
import '../../pages/User/AuthPage.css';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, onSuccessCallback, initialMode } = useAuthModal();
  
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState('phone'); // phone, otp
  const [formData, setFormData] = useState({
    identifier: '',
    otp: '',
    name: '',
    email: '',
    userType: 'customer'
  });
  const [otpMethod, setOtpMethod] = useState('sms');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'info' });

  useEffect(() => {
    if (isAuthModalOpen) {
      setIsLogin(initialMode !== 'signup');
      setStep('phone');
      setFormData({
        identifier: '',
        otp: '',
        name: '',
        email: '',
        userType: 'customer'
      });
      setErrors({});
      setAlert({ show: false, message: '', variant: 'info' });
    }
  }, [isAuthModalOpen, initialMode]);

  const showAlert = (message, variant = 'danger') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'info' }), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateIdentifier = () => {
    if (!formData.identifier) {
      setErrors({ identifier: 'Mobile number is required' });
      return false;
    }
    const isPhone = /^\d{10}$/.test(formData.identifier);
    if (!isPhone) {
      setErrors({ identifier: 'Please enter a valid 10-digit mobile number' });
      return false;
    }
    return true;
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!validateIdentifier()) return;
    
    setOtpMethod('sms');
    setIsLoading(true);
    try {
      await authService.generateOtp(formData.identifier);
      setStep('otp');
      showAlert('OTP sent successfully via SMS.', 'success');
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }
    if (!/^\d{6}$/.test(formData.otp)) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await authService.verifyOtp(formData.identifier, formData.otp);
      
      if (res.success) {
        // Validation: Only user role can login from here
        if (res.user && res.user.role !== 'user') {
          authService.logout();
          throw new Error('Access Denied. B2B Owners and Admins cannot log in from this page.');
        }

        if (!isLogin) {
          // Complete registration by calling authService.register
          const regResponse = await authService.register({
            name: formData.name || 'User',
            email: formData.email || `${formData.identifier}@staynest.com`,
            phone: formData.identifier,
            password: 'password123', // Dummy password for passwordless OTP auth
            isMobileVerified: true,
            role: 'user'
          });
          
          if (!regResponse.success) {
            throw new Error(regResponse.message || 'Registration failed');
          }
        }
        
        showAlert(`${isLogin ? 'Login' : 'Registration'} successful!`, 'success');
        
        // Emit auth-change event so header can update
        window.dispatchEvent(new Event('auth-change'));

        setTimeout(() => {
          closeAuthModal();
          if (onSuccessCallback) {
            onSuccessCallback(res);
          }
        }, 1000);
      }
    } catch (error) {
      showAlert(error.response?.data?.message || error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async (method = 'sms') => {
    setOtpMethod(method);
    setIsLoading(true);
    try {
      await authService.generateOtp(formData.identifier);
      showAlert('OTP resent successfully!', 'success');
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setStep('phone');
    setFormData({
      identifier: '',
      otp: '',
      name: '',
      email: '',
      userType: 'customer'
    });
    setOtpMethod('sms');
    setErrors({});
  };

  return (
    <Modal show={isAuthModalOpen} onHide={closeAuthModal} size="xl" centered contentClassName="border-0 shadow-lg" className="auth-modal">
      <Modal.Body className="p-0 overflow-hidden rounded">
        <button 
          onClick={closeAuthModal} 
          className="btn-close position-absolute" 
          style={{ top: '15px', right: '15px', zIndex: 10, background: 'rgba(255,255,255,0.8)' }}
        ></button>
        <Row className="g-0 min-vh-50">
          {/* Left Side - Brand Section */}
          <Col lg={5} className="auth-brand-section p-5 text-white d-none d-lg-block">
            <div className="h-100 d-flex flex-column justify-content-center">
              <div className="mb-4">
                <img src={logo} alt="Logo" height="50" style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              </div>
              <p className="lead mb-4 fw-semibold" style={{ fontSize: '1.5rem' }}>Find your perfect home away from home</p>
              <div className="feature-list mt-3">
                {[
                  'Verified properties',
                  'Zero brokerage',
                  '24/7 customer support',
                  '5000+ happy tenants'
                ].map((feature, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-3 mb-3">
                    <div className="feature-check">
                      <i className="fas fa-check"></i>
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Col>
          
          {/* Right Side - Form Section */}
          <Col lg={7} xs={12} className="bg-white p-4 p-lg-5">
            <div className="form-wrapper mx-auto" style={{ maxWidth: '450px' }}>
              <div className="d-lg-none text-center mb-4">
                <img src={logo} alt="Logo" height="40" style={{ objectFit: 'contain' }} />
              </div>
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-2">
                  {step === 'phone' ? (isLogin ? 'Welcome Back!' : 'Create Account') : 'Verify OTP'}
                </h2>
                <p className="text-muted">
                  {step === 'phone' 
                    ? (isLogin ? 'Login to access your account' : 'Join us to find your perfect PG')
                    : `We've sent a 6-digit code to ${formData.identifier}`}
                </p>
              </div>

              {alert.show && (
                <Alert variant={alert.variant} className="mb-3 py-2 small">
                  {alert.message}
                </Alert>
              )}

              <div className="toggle-wrapper mb-4">
                <div className="toggle-buttons d-flex">
                  <button 
                    className={`toggle-btn ${isLogin ? 'active' : ''}`}
                    onClick={toggleMode}
                    disabled={step !== 'phone'}
                  >
                    Login
                  </button>
                  <button 
                    className={`toggle-btn ${!isLogin ? 'active' : ''}`}
                    onClick={toggleMode}
                    disabled={step !== 'phone'}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {step === 'phone' ? (
                <Form onSubmit={handleSendOTP}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold small">
                      <i className="fas fa-user-circle auth-primary-text me-2"></i>Mobile Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleChange}
                      placeholder="Enter 10-digit mobile number"
                      isInvalid={!!errors.identifier}
                      disabled={isLoading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.identifier}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted small">
                      We'll send you a 6-digit OTP for verification
                    </Form.Text>
                  </Form.Group>

                  {!isLogin && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small">
                          <i className="fas fa-user auth-primary-text me-2"></i>Full Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          disabled={isLoading}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small">
                          <i className="fas fa-envelope auth-primary-text me-2"></i>Email (Optional)
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          disabled={isLoading}
                        />
                      </Form.Group>


                    </>
                  )}

                  <Button 
                    type="submit" 
                    className="submit-btn w-100 py-2 fw-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><i className="fas fa-spinner fa-spin me-2"></i>Sending OTP...</>
                    ) : (
                      <><i className="fas fa-paper-plane me-2"></i>Send OTP</>
                    )}
                  </Button>
                </Form>
              ) : (
                <Form onSubmit={handleVerifyOTP}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold small">
                      <i className="fas fa-key auth-primary-text me-2"></i>Enter OTP
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter 6-digit OTP"
                      isInvalid={!!errors.otp}
                      className="text-center fs-5 tracking-widest"
                      maxLength="6"
                      disabled={isLoading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.otp}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button 
                    type="submit" 
                    className="submit-btn w-100 py-2 fw-bold mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><i className="fas fa-spinner fa-spin me-2"></i>Verifying...</>
                    ) : (
                      <><i className="fas fa-check-circle me-2"></i>Verify & {isLogin ? 'Login' : 'Register'}</>
                    )}
                  </Button>

                  

                  <div className="text-center mt-4">
                    <Button 
                      type="button"
                      variant="link"
                      className="back-link text-decoration-none small"
                      onClick={() => setStep('phone')}
                    >
                      ← Back to login
                    </Button>
                  </div>
                </Form>
              )}
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
