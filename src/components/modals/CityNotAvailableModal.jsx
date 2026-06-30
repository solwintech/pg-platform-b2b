import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { MapPin, Bell, Mail, X } from 'lucide-react';
import logo from '../../assets/logo.png';
import './CityNotAvailableModal.css';
import leadService from '../../services/leadService';

const CityNotAvailableModal = ({ show, onHide, city }) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      // You can add an API call here to save the lead/email.
      // For now, using leadService if applicable or just mock success
      // await leadService.submitCityRequest({ city, email });
      setTimeout(() => {
        setSubmitted(true);
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to submit email:', error);
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setEmail('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="city-not-available-modal" backdrop="static">
      <div className="modal-close-btn" onClick={handleClose}>
        <X size={20} />
      </div>
      
      <Modal.Body className="text-center p-3 p-md-4">
        <div className="modal-logo-wrapper mb-3">
          <img src={logo} alt="Sortify Stays" className="modal-logo" />
        </div>

        <div className="illustration-wrapper mb-3">
          {/* Custom SVG Illustration for "Coming Soon" */}
          <svg width="180" height="120" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background Buildings */}
            <path d="M20 140V70H40V140H20Z" fill="#FFF0E5"/>
            <path d="M45 140V90H65V140H45Z" fill="#FFF0E5"/>
            <path d="M140 140V60H160V140H140Z" fill="#FFF0E5"/>
            <path d="M165 140V80H185V140H165Z" fill="#FFF0E5"/>
            
            {/* Dashed Line */}
            <path d="M40 110C40 110 60 130 100 120C140 110 160 110 160 110" stroke="#FF8C42" strokeWidth="1.5" strokeDasharray="4 4"/>
            
            {/* Map Pin Big */}
            <path d="M100 135C100 135 125 100 125 70C125 56.1929 113.807 45 100 45C86.1929 45 75 56.1929 75 70C75 100 100 135 100 135Z" fill="#F15A29"/>
            <circle cx="100" cy="70" r="12" fill="white"/>

            {/* Coming Soon Sign */}
            <rect x="135" y="65" width="60" height="35" rx="4" fill="white" stroke="#333" strokeWidth="1.5"/>
            <rect x="162" y="100" width="6" height="40" fill="#333"/>
            <text x="165" y="80" fontFamily="sans-serif" fontSize="8" fontWeight="bold" fill="#333" textAnchor="middle">COMING</text>
            <text x="165" y="92" fontFamily="sans-serif" fontSize="8" fontWeight="bold" fill="#F15A29" textAnchor="middle">SOON</text>

            {/* Leaves/Plants */}
            <path d="M30 140C30 140 20 125 15 125C15 125 25 130 30 140Z" fill="#FFB085"/>
            <path d="M35 140C35 140 40 120 45 120C45 120 40 130 35 140Z" fill="#FF8C42"/>
            <path d="M175 140C175 140 185 125 190 125C190 125 180 130 175 140Z" fill="#FFB085"/>
            <path d="M170 140C170 140 165 120 160 120C160 120 165 130 170 140Z" fill="#FF8C42"/>
          </svg>
        </div>

        <h3 className="fw-bold mb-2 modal-title-text">
          Sorry, we're not in <br /> your city yet. <MapPin size={22} color="#F15A29" className="d-inline mb-1" />
        </h3>

        <div className="quote-box">
          <div className="quote-icon left">“</div>
          <h5 className="quote-heading">The best stay is worth the wait.</h5>
          <p className="quote-text mb-0">
            We're working hard to bring trusted accommodations to your city soon.
          </p>
          <div className="quote-icon right">”</div>
        </div>

        {!submitted ? (
          <div className="notify-section mt-3 d-flex align-items-center justify-content-between p-2 rounded">
            <div className="d-flex align-items-center text-start me-2 flex-grow-1">
              <div className="bell-icon-wrapper me-2">
                <Bell size={20} color="#F15A29" />
              </div>
              <p className="mb-0 notify-text">
                We'll notify you when we launch in your city!
              </p>
            </div>
            <Button 
              className="notify-btn flex-shrink-0 w-auto px-3" 
              style={{ whiteSpace: 'nowrap' }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              <Mail size={18} className="me-2" />
              {submitting ? 'Submitting...' : 'Notify Me'}
            </Button>
          </div>
        ) : (
          <div className="notify-success mt-4 p-3 rounded">
            <p className="mb-0 text-success fw-bold">
              <i className="fas fa-check-circle me-2"></i> We'll keep you posted!
            </p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CityNotAvailableModal;
