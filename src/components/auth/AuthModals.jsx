import React from 'react';
import { X, Shield, ScrollText, UserCheck, Smartphone } from 'lucide-react';

export const TermsOfServiceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content">
        <div className="auth-modal-header">
          <div className="d-flex align-items-center">
            <div className="auth-icon-wrapper me-3" style={{ background: '#fff7ed' }}>
              <ScrollText size={24} color="#ff6b00" />
            </div>
            <div>
              <h5 className="mb-0">Terms of Service</h5>
              <small className="text-muted">Agreement for Property Owners</small>
            </div>
          </div>
          <button className="auth-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="auth-modal-body">
          <div className="auth-text-container">
            <h6 className="fw-bold mb-3">Terms of Service</h6>
            <p className="mb-3">By creating an account on SORTIFY Stays, you agree that:</p>
            <ul className="list-group list-group-flush mb-4">
              <li className="list-group-item d-flex align-items-start border-0 px-0 py-2 bg-transparent">
                <UserCheck size={16} className="text-success mt-1 me-3 flex-shrink-0" />
                <span className="small">The information provided by you is accurate and genuine.</span>
              </li>
              <li className="list-group-item d-flex align-items-start border-0 px-0 py-2 bg-transparent">
                <UserCheck size={16} className="text-success mt-1 me-3 flex-shrink-0" />
                <span className="small">You are authorized to list and manage the property submitted on the platform.</span>
              </li>
              <li className="list-group-item d-flex align-items-start border-0 px-0 py-2 bg-transparent">
                <UserCheck size={16} className="text-success mt-1 me-3 flex-shrink-0" />
                <span className="small">SORTIFY Stays is only a discovery, listing, and lead generation platform.</span>
              </li>
              <li className="list-group-item d-flex align-items-start border-0 px-0 py-2 bg-transparent">
                <UserCheck size={16} className="text-success mt-1 me-3 flex-shrink-0" />
                <span className="small">SORTIFY Stays is not a party to any rental or stay agreement between owner and tenant.</span>
              </li>
              <li className="list-group-item d-flex align-items-start border-0 px-0 py-2 bg-transparent">
                <UserCheck size={16} className="text-success mt-1 me-3 flex-shrink-0" />
                <span className="small">All property-related responsibilities, services, pricing, availability, and disputes are solely handled by the property owner.</span>
              </li>
              <li className="list-group-item d-flex align-items-start border-0 px-0 py-2 bg-transparent">
                <UserCheck size={16} className="text-success mt-1 me-3 flex-shrink-0" />
                <span className="small">You authorize SORTIFY Stays to publish, promote, and market your property details, images, and contact information on our website, app, and marketing channels.</span>
              </li>
              <li className="list-group-item d-flex align-items-start border-0 px-0 py-2 bg-transparent">
                <UserCheck size={16} className="text-success mt-1 me-3 flex-shrink-0" />
                <span className="small">SORTIFY Stays reserves the right to verify, reject, suspend, or remove listings/accounts if false or misleading information is found.</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="auth-modal-footer">
          <button className="btn btn-primary w-100" style={{ background: '#ff6b00', border: 'none' }} onClick={onClose}>
            I Agree
          </button>
        </div>
      </div>
      {modalStyles}
    </div>
  );
};

export const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content">
        <div className="auth-modal-header">
          <div className="d-flex align-items-center">
            <div className="auth-icon-wrapper me-3" style={{ background: '#f0f9ff' }}>
              <Shield size={24} color="#0284c7" />
            </div>
            <div>
              <h5 className="mb-0">Privacy Policy</h5>
              <small className="text-muted">How we handle your data</small>
            </div>
          </div>
          <button className="auth-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="auth-modal-body">
          <div className="auth-text-container">
            <h6 className="fw-bold mb-3">Privacy Policy</h6>
            <p className="small mb-3">By registering, you consent to the collection and use of your information including:</p>
            <div className="bg-light p-3 rounded mb-4">
              <ul className="small mb-0 ps-3">
                <li>Name</li>
                <li>Phone number</li>
                <li>Email address</li>
                <li>Property details and uploaded content</li>
              </ul>
            </div>

            <h7 className="d-block fw-bold text-dark mb-2 small">Your information may be used for:</h7>
            <ul className="small mb-4 ps-3">
              <li>Account creation and verification</li>
              <li>Listing management</li>
              <li>Customer inquiries and lead sharing</li>
              <li>Marketing and promotional activities related to SORTIFY Stays</li>
            </ul>

            <p className="small mb-3">We do not sell your personal data to third parties. However, your listing details and contact information may be shared with potential tenants through the platform.</p>
            
            <p className="small mb-0">SORTIFY Stays uses reasonable security practices to protect your information, but cannot guarantee absolute security of data transmitted online.</p>
          </div>
        </div>
        
        <div className="auth-modal-footer">
          <button className="btn btn-info w-100 text-white" style={{ background: '#0284c7', border: 'none' }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      {modalStyles}
    </div>
  );
};

export const OtpVerificationModal = ({ 
  isOpen, 
  onClose, 
  phone,
  otp, 
  setOtp, 
  onVerify, 
  isVerifying, 
  error, 
  otpTimer, 
  onResend 
}) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content" style={{ maxWidth: '400px' }}>
        <div className="auth-modal-header">
          <div className="d-flex align-items-center">
            <div className="auth-icon-wrapper me-3" style={{ background: '#f0f9ff' }}>
              <Smartphone size={24} color="#0284c7" />
            </div>
            <div>
              <h5 className="mb-0">Verify OTP</h5>
              <small className="text-muted">Sent to +91 {phone}</small>
            </div>
          </div>
          <button className="auth-close-btn" type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="auth-modal-body">
          <div className="form-group mb-3">
            <label className="fw-semibold small mb-2 d-block text-center">Enter 6-digit OTP</label>
            <input
              type="text"
              className={`form-control-modern ${error ? 'is-invalid' : ''}`}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              style={{ fontSize: '1.25rem', letterSpacing: '0.5rem', textAlign: 'center' }}
            />
            {error && <small className="text-danger mt-1 d-block text-center">{error}</small>}
          </div>
          <div className="text-center mt-3">
            <button 
              type="button" 
              className="btn btn-link text-decoration-none small"
              onClick={onResend}
              disabled={otpTimer > 0}
            >
              {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
        
        <div className="auth-modal-footer">
          <button 
            type="button"
            className="btn btn-primary w-100 py-2 fw-bold text-white" 
            style={{ background: '#0284c7', border: 'none' }} 
            onClick={onVerify}
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </div>
      </div>
      {modalStyles}
    </div>
  );
};

const modalStyles = (
  <style>{`
    .auth-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
      backdrop-filter: blur(8px);
    }
    .auth-modal-content {
      background: white;
      width: 100%;
      max-width: 500px;
      max-height: 80vh;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: authModalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes authModalFadeIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .auth-modal-header {
      padding: 24px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .auth-icon-wrapper {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .auth-close-btn {
      background: #f8fafc;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      transition: all 0.2s;
    }
    .auth-close-btn:hover {
      background: #fee2e2;
      color: #ef4444;
    }
    .auth-modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }
    .auth-text-container p {
      font-size: 0.95rem;
      color: #475569;
      line-height: 1.6;
    }
    .auth-text-container li span {
      line-height: 1.5;
      color: #334155;
    }
    .auth-modal-footer {
      padding: 20px 24px;
      border-top: 1px solid #f1f5f9;
    }
  `}</style>
);
