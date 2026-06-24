import React from 'react';
import { Modal } from 'react-bootstrap';
import { X, Smartphone, Settings } from 'lucide-react';
import logo from '../../assets/logo.png';
import './AppComingSoonModal.css';

const AppComingSoonModal = ({ show, onHide }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="app-coming-soon-modal"
    >
      <div className="modal-content-wrapper">
        <button className="modal-close-btn" onClick={onHide}>
          <X size={24} color="#64748b" />
        </button>

        <div className="modal-header-logo">
          <img src={logo} alt="Sortify Stays" className="modal-logo-img" />
          <div className="modal-tagline">
            <span className="line"></span>
            Search, Select, Move In.
            <span className="line"></span>
          </div>
        </div>

        <div className="modal-body-content">
          <div className="coming-soon-icon-container">
            <div className="icon-circle-bg">
              <Smartphone size={40} color="#1e293b" strokeWidth={1.5} />
              <div className="gear-icon-overlay">
                <Settings size={22} color="#f97316" fill="#f97316" />
              </div>
            </div>
            {/* Sparkles */}
            <div className="sparkle sparkle-1">✦</div>
            <div className="sparkle sparkle-2">✦</div>
            <div className="sparkle sparkle-3">●</div>
          </div>

          <h3 className="coming-soon-title">
            We're working on our<br />mobile app!
          </h3>
          <div className="title-underline"></div>
          
          <p className="coming-soon-subtitle">
            It will be live soon.<br />
            Stay tuned! <span className="heart">❤️</span>
          </p>
        </div>
        
        <div className="modal-wave-bg"></div>
      </div>
    </Modal>
  );
};

export default AppComingSoonModal;
