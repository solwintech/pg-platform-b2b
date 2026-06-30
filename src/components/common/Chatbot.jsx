import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, MapPin, Search, User, Phone, Mail, Building2, Home, BedDouble, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Autocomplete } from '@react-google-maps/api';
import { useGoogleMaps } from '../../context/GoogleMapsContext';
import './Chatbot.css';
import api from '../../services/api';

const STAYS = [
  { id: 'All Stays', label: 'All Stays', icon: <span style={{fontSize: '1.2rem', marginBottom: '4px'}}>✨</span> },
  { id: 'PG', label: 'PG', icon: <Building2 size={24} strokeWidth={1.5} /> },
  { id: 'Hostel', label: 'Hostel', icon: <BedDouble size={24} strokeWidth={1.5} /> },
  { id: 'Home Stay', label: 'Home Stay', icon: <Home size={24} strokeWidth={1.5} /> },
  { id: 'Service Apartment', label: 'Service Apartment', icon: <Building2 size={24} strokeWidth={1.5} /> }
];

const Chatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const { isLoaded } = useGoogleMaps();
  const cityAutocompleteRef = useRef(null);
  const localityAutocompleteRef = useRef(null);
  const [cityBounds, setCityBounds] = useState(null);
  
  const [formData, setFormData] = useState({
    type: 'All Stays',
    city: '',
    locality: '',
    name: '',
    mobile: '',
    email: ''
  });

  // Do not render on B2B and Admin pages
  if (location.pathname.startsWith('/b2b') || location.pathname.startsWith('/admin')) {
    return null;
  }

  // Pre-fill user data if logged in
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsedData = JSON.parse(userStr);
        // Safely extract user object in case it's nested
        const user = parsedData.user || parsedData.data || parsedData;
        setFormData(prev => ({
          ...prev,
          name: user.name || user.firstName || prev.name,
          mobile: user.phone || user.mobile || user.phoneNumber || prev.mobile,
          email: user.email || prev.email
        }));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Update bounds when city changes
  useEffect(() => {
    if (isLoaded && formData.city && formData.city !== 'All India' && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: `${formData.city}, India` }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setCityBounds(results[0].geometry.viewport);
        }
      });
    } else {
      setCityBounds(null);
    }
  }, [isLoaded, formData.city]);

  const onCityPlaceChanged = () => {
    if (cityAutocompleteRef.current !== null) {
      const place = cityAutocompleteRef.current.getPlace();
      if (place && place.name) {
        setFormData({ ...formData, city: place.name });
      }
    }
  };

  const onLocalityPlaceChanged = () => {
    if (localityAutocompleteRef.current !== null) {
      const place = localityAutocompleteRef.current.getPlace();
      if (place && place.name) {
        setFormData({ ...formData, locality: place.name });
      }
    }
  };

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => setStep(1), 300); // Reset after close animation
  };

  const handleSelectType = (type) => {
    setFormData({ ...formData, type });
    setStep(2);
  };

  const goBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/support/chatbot', formData);
      setStep(3);
      setTimeout(() => {
        handleClose();
      }, 5000);
    } catch (error) {
      console.error('Error submitting chatbot inquiry:', error);
      alert("There was an error submitting your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cb-container">
      {/* FAB Launcher */}
      {!isOpen && (
        <div className="cb-fab-wrapper">
          <div className="cb-fab-label">May I Help You ⤴</div>
          <button className="cb-fab" onClick={handleOpen}>
            <MessageCircle size={32} color="white" fill="white" />
          </button>
        </div>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <>
          <div className="cb-overlay" onClick={handleClose}></div>
          <div className={`cb-modal ${step === 2 || step === 3 ? 'cb-modal-expanded' : ''}`}>
            
            <div className="cb-modal-header-actions">
              {step === 2 && (
                <button className="cb-icon-btn-header" onClick={goBack} title="Back">
                  <ArrowLeft size={20} />
                </button>
              )}

              <div style={{ flex: 1 }}></div>
              <button className="cb-icon-btn-header" onClick={handleClose} title="Close">
                <X size={20} />
              </button>
            </div>

            {step === 1 && (
              <div className="cb-step-content fade-in">
                <div className="cb-mini-header">
                  <div className="cb-avatar">
                    <img src="/logo192.png" alt="bot" onError={(e) => e.target.style.display='none'} />
                    <div className="cb-avatar-fallback">🎧</div>
                  </div>
                  <div className="cb-header-text">
                    <h3>May I help you?</h3>
                    <p>Choose the type of stay you are looking for</p>
                  </div>
                </div>

                <div className="cb-stay-grid">
                  {STAYS.map(stay => (
                    <div 
                      key={stay.id} 
                      className={`cb-stay-card ${formData.type === stay.id ? 'active' : ''}`}
                      onClick={() => handleSelectType(stay.id)}
                    >
                      <div className="cb-stay-icon">{stay.icon}</div>
                      <span>{stay.label}</span>
                    </div>
                  ))}
                </div>

                <div className="cb-trust-banner">
                  <ShieldCheck size={24} className="cb-trust-icon" />
                  <div>
                    <strong>Verified stays. Flexible stays. All across India.</strong>
                    <p>We're here to help you find the perfect stay.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="cb-step-content fade-in cb-form-wrapper">
                <div className="cb-form-header">
                  <h2>May I Help You?</h2>
                  <p>Tell us what you're looking for and we'll get back to you with the best options.</p>
                </div>

                <form onSubmit={handleSubmit} className="cb-form">
                  
                  {/* Selected Stay Type (Summary/Editable) */}
                  <div className="cb-form-section cb-form-section-compact">
                    <div className="cb-section-header">
                      <h3 className="cb-section-title">1. Stay Type</h3>
                      <button type="button" className="cb-edit-link" onClick={goBack}>Edit</button>
                    </div>
                    <div className="cb-selected-type">
                      <div className="cb-stay-card active cb-stay-card-small">
                        <div className="cb-stay-icon">{STAYS.find(s => s.id === formData.type)?.icon}</div>
                        <span>{formData.type}</span>
                        <div className="cb-check-badge">✓</div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Location */}
                  <div className="cb-form-section cb-form-section-compact">
                    <h3 className="cb-section-title">2. Location</h3>
                    
                    <label className="cb-input-label">City</label>
                    <div className="cb-input-group">
                      <MapPin size={18} className="cb-input-icon" style={{ zIndex: 1 }} />
                      {isLoaded ? (
                        <div style={{ flex: 1, width: '100%' }}>
                          <Autocomplete
                            onLoad={ref => cityAutocompleteRef.current = ref}
                            onPlaceChanged={onCityPlaceChanged}
                            options={{ types: ['(cities)'], componentRestrictions: { country: 'in' } }}
                          >
                            <input 
                              type="text" 
                              placeholder="Search city..." 
                              required
                              value={formData.city}
                              onChange={e => setFormData({...formData, city: e.target.value})}
                              className="cb-input"
                              style={{ width: '100%' }}
                            />
                          </Autocomplete>
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="Search city..." 
                          required
                          value={formData.city}
                          onChange={e => setFormData({...formData, city: e.target.value})}
                          className="cb-input"
                        />
                      )}
                    </div>

                    <label className="cb-input-label">Search Locality / Area <span>(Optional)</span></label>
                    <div className="cb-input-group">
                      <Search size={18} className="cb-input-icon" style={{ zIndex: 1 }} />
                      {isLoaded ? (
                        <div style={{ flex: 1, width: '100%' }}>
                          <Autocomplete
                            onLoad={ref => localityAutocompleteRef.current = ref}
                            onPlaceChanged={onLocalityPlaceChanged}
                            options={{
                              bounds: cityBounds,
                              strictBounds: !!cityBounds,
                              componentRestrictions: { country: 'in' }
                            }}
                          >
                            <input 
                              type="text" 
                              placeholder="e.g., Koramangala..." 
                              value={formData.locality}
                              onChange={e => setFormData({...formData, locality: e.target.value})}
                              className="cb-input"
                              style={{ width: '100%' }}
                            />
                          </Autocomplete>
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="e.g., Koramangala..." 
                          value={formData.locality}
                          onChange={e => setFormData({...formData, locality: e.target.value})}
                          className="cb-input"
                        />
                      )}
                    </div>
                  </div>

                  {/* 3. Your Details */}
                  <div className="cb-form-section cb-form-section-compact">
                    <h3 className="cb-section-title">3. Your Details</h3>
                    
                    <div className="cb-input-wrapper">
                      <label className="cb-input-label">Full Name</label>
                      <div className="cb-input-group">
                        <User size={18} className="cb-input-icon" />
                        <input 
                          type="text" 
                          placeholder="Enter your full name" 
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="cb-input"
                        />
                      </div>
                    </div>
                    
                    <div className="cb-input-wrapper">
                      <label className="cb-input-label">Mobile Number</label>
                      <div className="cb-input-group">
                        <Phone size={18} className="cb-input-icon" />
                        <input 
                          type="tel" 
                          placeholder="Enter mobile number" 
                          required
                          value={formData.mobile}
                          onChange={e => setFormData({...formData, mobile: e.target.value})}
                          className="cb-input"
                        />
                      </div>
                    </div>

                    <div className="cb-input-wrapper">
                      <label className="cb-input-label">Email Address</label>
                      <div className="cb-input-group">
                        <Mail size={18} className="cb-input-icon" />
                        <input 
                          type="email" 
                          placeholder="Enter email address" 
                          required
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="cb-input"
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="cb-submit-btn" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Inquiry →'}
                  </button>
                  
                  <p className="cb-secure-text">
                    🔒 Your information is safe with us.
                  </p>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="cb-step-content fade-in cb-form-wrapper" style={{ textAlign: 'center', paddingBottom: '32px' }}>
                <div style={{ margin: '0 auto 20px auto', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981' }}>
                  <ShieldCheck size={36} />
                </div>
                <h2 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 12px 0' }}>Request Submitted!</h2>
                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.5', margin: '0 0 32px 0' }}>
                  Thank you for reaching out. One of our executives will contact you shortly with the best options.
                </p>
                <button className="cb-submit-btn" onClick={handleClose} style={{ marginTop: 0 }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
