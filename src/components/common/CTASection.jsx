import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import AppComingSoonModal from '../modals/AppComingSoonModal';
import './CTASection.css';

const CTASection = () => {
  const [showAppModal, setShowAppModal] = useState(false);

  return (
    <div className="cta-section-wrapper h-100">
      <div className="footer-cta-bar premium-cta shadow-sm h-100 d-flex flex-column justify-content-between text-center">
        <div>
          <div className="app-icon-premium-small mx-auto mb-3">
            <i className="fas fa-mobile-alt"></i>
          </div>
          <h4 className="mb-2 fw-bold text-white">Get the App</h4>
          <p className="mb-4 text-white-50" style={{fontSize: '0.85rem'}}>Find your next home directly from your phone.</p>
          
          <div className="d-flex flex-column gap-2 mb-4">
            <button className="store-badge-premium-small border-0 w-100 justify-content-center py-2" onClick={() => setShowAppModal(true)}>
              <i className="fab fa-apple fs-4"></i>
              <div className="text-start ms-2">
                <small style={{fontSize: '0.6rem', display: 'block', lineHeight: 1, opacity: 0.8}}>Download on the</small>
                <strong style={{fontSize: '0.9rem', lineHeight: 1, fontWeight: 700}}>App Store</strong>
              </div>
            </button>
            <button className="store-badge-premium-small border-0 w-100 justify-content-center py-2" onClick={() => setShowAppModal(true)}>
              <i className="fab fa-google-play fs-4"></i>
              <div className="text-start ms-2">
                <small style={{fontSize: '0.6rem', display: 'block', lineHeight: 1, opacity: 0.8}}>GET IT ON</small>
                <strong style={{fontSize: '0.9rem', lineHeight: 1, fontWeight: 700}}>Google Play</strong>
              </div>
            </button>
          </div>
        </div>
        
        {/* Decorative shapes */}
        <div className="cta-shape cta-shape-1"></div>
        <div className="cta-shape cta-shape-2"></div>
      </div>
      
      <AppComingSoonModal show={showAppModal} onHide={() => setShowAppModal(false)} />
    </div>
  );
};

export default CTASection;
