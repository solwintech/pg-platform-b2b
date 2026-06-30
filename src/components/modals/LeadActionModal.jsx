import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import authService from '../../services/authService';
import leadService from '../../services/leadService';
import { useAuthModal } from '../../context/AuthModalContext';
import './LeadActionModal.css';

const LeadActionModal = forwardRef((props, ref) => {
  const { openAuthModal } = useAuthModal();
  const [showModal, setShowModal] = useState(false);
  const [otpStep, setOtpStep] = useState('form');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [actionType, setActionType] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [callbackTime, setCallbackTime] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [stayDuration, setStayDuration] = useState('');
  const [roomType, setRoomType] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [scheduleVisit, setScheduleVisit] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(!!localStorage.getItem('token') || !!localStorage.getItem('user'));

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatTime12hr = (timeStr) => {
    if (!timeStr) return '--:-- --';
    try {
      const [hoursStr, minutesStr] = timeStr.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = minutesStr;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = hours < 10 ? `0${hours}` : hours;
      return `${formattedHours}:${minutes} ${ampm}`;
    } catch (error) {
      return timeStr || '--:-- --';
    }
  };

  const getVisitingHoursText = (property) => {
    if (!property?.visitingHours) return '10:00 AM - 06:00 PM (All Days)';
    
    const { availableDays, startTime, endTime } = property.visitingHours;
    const formattedStart = formatTime12hr(startTime);
    const formattedEnd = formatTime12hr(endTime);
    
    let daysText = 'All Days';
    if (availableDays && Array.isArray(availableDays) && availableDays.length > 0) {
      const daysOfWeekOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const sortedDays = [...availableDays].sort((a, b) => daysOfWeekOrder.indexOf(a) - daysOfWeekOrder.indexOf(b));
      daysText = sortedDays.map(d => d.substring(0, 3)).join(', ');
    }
    
    return `${formattedStart} - ${formattedEnd} (${daysText})`;
  };

  const getBaseImageUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://staysorted.in/api/v1' : 'http://localhost:5000/api/v1');
    return apiUrl.replace('/api/v1', '');
  };

  const resolveImageUrl = (url) => {
    if (!url) return 'https://placehold.co/400x300/FFF3E0/FF8C42?text=Property';
    if (url.startsWith('http')) return url;
    const baseUrl = getBaseImageUrl();
    if (url.startsWith('/uploads/')) return `${baseUrl}${url}`;
    if (url.startsWith('uploads/')) return `${baseUrl}/${url}`;
    return url;
  };

  const getOccupancyOptions = (type) => {
    switch(type) {
      case 'PG':
        return ["Private Room", "Double Sharing", "Triple Share", "Quad Sharing", "Five sharing", "1 RK", "1 BHK", "2 BHK"];
      case 'Hostel':
        return ["Private Room", "Double Sharing", "Triple Share", "Quad Sharing", "Five sharing", "1 RK", "1 BHK"];
      case 'Home Stay':
        return ["Private Room", "Double Sharing", "Triple Share", "Quad Sharing", "Five sharing", "1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "Independent House"];
      case 'Service Apartment':
        return ["1 BHK", "2 BHK", "3 BHK", "4 BHK"];
      default:
        return ["Private Room", "Double Sharing", "Triple Share", "Quad Sharing", "Five sharing", "1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "Independent House"];
    }
  };

  const getDisplayName = (property) => {
    return property?.pgName || property?.title || 'Property';
  };

  const getDisplayGender = (property) => {
    if (property?.genderPreference === 'male') return 'Boys only';
    if (property?.genderPreference === 'female') return 'Girls only';
    if (property?.genderAllowed === 'Boys' || property?.genderAllowed === 'Boys Only') return 'Boys only';
    if (property?.genderAllowed === 'Girls' || property?.genderAllowed === 'Girls Only') return 'Girls only';
    if (property?.genderAllowed === 'Unisex' || property?.genderAllowed === 'Co-ed') return 'Co-ed';
    return 'Co-ed';
  };

  const getDisplayType = (property) => {
    return property?.propertyType || property?.type || 'PG';
  };


  useImperativeHandle(ref, () => ({
    open: async (property, action) => {
      if (!authService.isAuthenticated()) {
        openAuthModal(() => {
          ref.current.open(property, action);
        });
        return;
      }
      
      setUserLoggedIn(true);

      if (authService.isAuthenticated() && action === 'contact') {
        setSelectedProperty(property);
        setActionType('contact');
        setOtpStep('success');
        setShowModal(true);
        
        try {
          const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
          await leadService.createLead({
            propertyId: property._id,
            actionType: 'contact',
            name: savedUser.name || 'User',
            email: savedUser.email || '',
            phone: savedUser.phone || savedUser.whatsapp || ''
          });
        } catch (error) {
          console.error('Failed to create lead:', error);
        }
        return;
      }

      setSelectedProperty(property);
      setActionType(action);
      setOtpStep('form');
      setOtp('');
      setEnquiryMessage('');
      setCallbackTime('');
      setMoveInDate('');
      setStayDuration('');
      setRoomType('');
      setVisitTime('');
      setVisitDate('');
      setScheduleVisit(false);
      
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (authService.isAuthenticated() && Object.keys(savedUser).length > 0) {
        setContactForm({
          name: savedUser.name || '',
          email: savedUser.email || '',
          phone: savedUser.phone || savedUser.whatsapp || ''
        });
      } else {
        setContactForm({
          name: '',
          email: '',
          phone: ''
        });
      }
      
      setShowModal(true);
    }
  }));

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOtp = async () => {
    if (!contactForm.name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!contactForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      alert('Please enter a valid email address');
      return;
    }
    if (!contactForm.phone.trim() || !/^\d{10}$/.test(contactForm.phone)) {
      alert('Please enter a valid 10-digit Phone number');
      return;
    }

    setIsLoading(true);
    
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpTimer(60);
    
    console.log(`OTP for ${contactForm.phone}: ${newOtp}`);
    
    setOtpStep('otp');
    setIsLoading(false);
    
    alert(`Demo OTP: ${newOtp}\n(Check console for OTP)`);
  };

  const handleVerifyOtp = async () => {
    if (!userLoggedIn) {
      if (!otp || otp.length !== 6) {
        alert('Please enter the 6-digit OTP');
        return;
      }

      if (otp !== generatedOtp && otp !== '123456') {
        alert('Invalid OTP. Please try again.');
        return;
      }
    }

    setIsLoading(true);
    
    try {
      let leadData = {
        propertyId: selectedProperty._id,
        actionType: actionType,
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone
      };

      if (actionType === 'enquiry') {
        leadData.message = enquiryMessage || 'General enquiry about property';
        leadData.enquiryFor = roomType;
        leadData.moveInDate = moveInDate;
        leadData.stayDuration = stayDuration;
        if (scheduleVisit) {
          leadData.visitDate = visitDate;
          leadData.visitTime = visitTime;
          leadData.scheduleVisit = true;
        }
      } else if (actionType === 'visit') {
        leadData.visitDate = visitDate;
        leadData.visitTime = visitTime;
      } else if (actionType === 'callback') {
        leadData.preferredCallbackTime = callbackTime || 'ASAP';
      }

      if (!selectedProperty.b2bActivePlan) {
        console.log("B2B plan inactive. Masking phone number in lead data.");
      }

      await leadService.createLead(leadData);
      
      setOtpStep('success');
      setIsLoading(false);
    } catch (e) { console.error(e); alert('Something went wrong'); setIsLoading(false); }
  };

  const handleSubmitLeadDirectly = async () => {
    if (!contactForm.name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!contactForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      alert('Please enter a valid email address');
      return;
    }
    if (!contactForm.phone.trim() || !/^\d{10}$/.test(contactForm.phone)) {
      alert('Please enter a valid 10-digit Phone number');
      return;
    }
    if (scheduleVisit && (!visitDate || !visitTime)) {
      alert('Please select a visit date and time.');
      return;
    }

    setIsLoading(true);
    
    try {
      let leadData = {
        propertyId: selectedProperty._id,
        actionType: actionType,
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone
      };

      if (actionType === 'enquiry') {
        leadData.message = enquiryMessage || 'General enquiry about property';
        leadData.enquiryFor = roomType;
        leadData.moveInDate = moveInDate;
        leadData.stayDuration = stayDuration;
        if (scheduleVisit) {
          leadData.visitDate = visitDate;
          leadData.visitTime = visitTime;
          leadData.scheduleVisit = true;
        }
      } else if (actionType === 'visit') {
        leadData.visitDate = visitDate;
        leadData.visitTime = visitTime;
      } else if (actionType === 'callback') {
        leadData.preferredCallbackTime = callbackTime || 'ASAP';
      }

      await leadService.createLead(leadData);
      
      setOtpStep('success');
      setIsLoading(false);
    } catch (e) { console.error(e); alert('Something went wrong'); setIsLoading(false); }
  };

  const handleResendOtp = () => {
    if (otpTimer > 0) {
      alert(`Please wait ${otpTimer} seconds before requesting a new OTP`);
      return;
    }
    
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpTimer(60);
    console.log(`New OTP: ${newOtp}`);
    alert(`New OTP sent: ${newOtp}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setOtpStep('form');
    setOtp('');
    setSelectedProperty(null);
    setActionType('');
    setEnquiryMessage('');
    setCallbackTime('');
    setGeneratedOtp('');
    setOtpTimer(0);
  };

  const getActionTitle = () => {
    switch(actionType) {
      case 'call': return 'Contact Details';
      case 'visit': return 'Visiting Hours';
      case 'enquiry': return 'Enquire Now';
      case 'callback': return 'Request Callback';
      default: return 'Contact Property';
    }
  };

  const getSuccessMessage = () => {
    switch(actionType) {
      case 'call': 
        const contactNum = selectedProperty?.managerPhone || selectedProperty?.ownerId?.phone || 'Not available';
        const contactName = selectedProperty?.managerPhone ? 'Property Manager' : (selectedProperty?.ownerId?.name || 'Owner');
        return `Please contact ${contactName} at ${contactNum}. They are expecting your call!`;
      case 'visit':
        return `Your visit has been scheduled for ${visitDate} at ${visitTime}. A confirmation email has been sent to ${contactForm.email}.`;
      case 'enquiry':
        const enqContactNum = selectedProperty?.managerPhone || selectedProperty?.ownerId?.phone || 'Not available';
        if (scheduleVisit) {
          return `Your enquiry and visit for ${visitDate} at ${visitTime} have been sent! You can also contact the property at ${enqContactNum}.`;
        }
        return `Your enquiry has been sent successfully! You can contact the property at ${enqContactNum}.`;
      case 'callback': 
        return 'Your callback request has been sent! The owner will call you at your preferred time.';
      default: 
        return 'Request sent successfully!';
    }
  };

  return (
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg" className="premium-modal">
        <div className="premium-modal-header bg-gradient-orange p-3 text-white rounded-top" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, transform: 'scale(2)' }}>
            <i className="fas fa-home fa-5x"></i>
          </div>
          <div className="d-flex justify-content-between align-items-start position-relative z-index-1">
            <div>
              <h5 className="fw-bold mb-1">{getActionTitle()}</h5>
              <p className="mb-0 opacity-75 small" style={{ fontSize: '0.8rem' }}>
                {selectedProperty ? getDisplayName(selectedProperty) : 'Property Enquiry'}
              </p>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal} aria-label="Close"></button>
          </div>
        </div>

        <Modal.Body className="p-3 bg-white rounded-bottom">
          {actionType === 'visit' ? (
            <div className="text-center py-3 px-2">
              <div 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  backgroundColor: '#fff7ed', 
                  color: '#f97316', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.8rem', 
                  margin: '0 auto 15px auto' 
                }}
              >
                <i className="fas fa-clock"></i>
              </div>
              <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>Property Visiting Hours</h5>
              
              {/* Timing Display */}
              <div className="mb-4" style={{ display: 'inline-block', backgroundColor: '#fff7ed', padding: '12px 25px', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                <span className="fw-bold text-orange" style={{ fontSize: '1.4rem', color: '#ea580c' }}>
                  {formatTime12hr(selectedProperty?.visitingHours?.startTime || '09:00')} - {formatTime12hr(selectedProperty?.visitingHours?.endTime || '18:00')}
                </span>
              </div>

              {/* Days Chips Row */}
              <div className="mb-4">
                <small className="text-muted d-block mb-3 fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                  Available Days
                </small>
                <div className="d-flex flex-wrap justify-content-center gap-2 px-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                    const isActive = selectedProperty?.visitingHours?.availableDays?.includes(day);
                    return (
                      <span 
                        key={day}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '25px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor: isActive ? '#fff7ed' : '#f8fafc',
                          color: isActive ? '#ea580c' : '#94a3b8',
                          border: isActive ? '1px solid #ffedd5' : '1px solid #cbd5e1',
                          boxShadow: isActive ? '0 2px 4px rgba(234, 88, 12, 0.04)' : 'none',
                          opacity: isActive ? 1 : 0.6
                        }}
                      >
                        {isActive ? '✓ ' : ''}{day.substring(0, 3)}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="small text-muted mb-4" style={{ lineHeight: 1.5, maxWidth: '380px', margin: '0 auto' }}>
                You are welcome to visit the property directly during these available days and timings. No appointment required!
              </div>

              <button className="btn w-100 py-2 fw-semibold text-white" style={{ backgroundColor: '#f97316', borderRadius: '10px' }} onClick={handleCloseModal}>
                Okay, Got it
              </button>
            </div>
          ) : otpStep === 'form' && (
            <div className="enquiry-form-wrapper">
              <Row className="g-2 mb-3">
                <Col md={4} sm={12}>
                  <div className="input-group-modern py-0">
                    <span className="input-group-icon px-2" style={{ fontSize: '0.9rem' }}><i className="fas fa-user"></i></span>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={contactForm.name}
                      onChange={handleContactFormChange}
                      className="modern-input py-2"
                      style={{ fontSize: '0.85rem' }}
                      readOnly={userLoggedIn}
                    />
                  </div>
                </Col>

                <Col md={4} sm={12}>
                  <div className="input-group-modern py-0">
                    <span className="input-group-icon px-2" style={{ fontSize: '0.9rem' }}><i className="fas fa-envelope"></i></span>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={contactForm.email}
                      onChange={handleContactFormChange}
                      className="modern-input py-2"
                      style={{ fontSize: '0.85rem' }}
                      readOnly={userLoggedIn}
                    />
                  </div>
                </Col>

                <Col md={4} sm={12}>
                  <div className="input-group-modern py-0">
                    <span className="input-group-icon px-2" style={{ fontSize: '0.9rem' }}><i className="fas fa-phone-alt"></i></span>
                    <Form.Control
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={contactForm.phone}
                      onChange={handleContactFormChange}
                      className="modern-input py-2"
                      maxLength="10"
                      style={{ fontSize: '0.85rem' }}
                      readOnly={userLoggedIn}
                    />
                  </div>
                </Col>
              </Row>

              {actionType === 'enquiry' && (
                <>
                  <Row className="g-2 mb-2">
                    <Col md={6} sm={12}>
                      <div className="input-group-modern py-0">
                        <span className="input-group-icon px-2" style={{ fontSize: '0.9rem' }}><i className="fas fa-bed"></i></span>
                        <Form.Select
                          value={roomType}
                          onChange={(e) => setRoomType(e.target.value)}
                          className="modern-input text-muted py-2"
                          style={{ border: 'none', background: 'transparent', fontSize: '0.85rem' }}
                        >
                          <option value="">Enquiry For</option>
                          {getOccupancyOptions(selectedProperty?.propertyType).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </Form.Select>
                      </div>
                    </Col>

                    <Col md={6} sm={12}>
                      <div className="input-group-modern py-0">
                        <span className="input-group-icon px-2" style={{ fontSize: '0.9rem' }}><i className="fas fa-calendar-plus"></i></span>
                        <Form.Control
                          type="date"
                          value={moveInDate}
                          onChange={(e) => setMoveInDate(e.target.value)}
                          className="modern-input text-muted py-2"
                          style={{ fontSize: '0.85rem' }}
                          placeholder="Move-in Date"
                        />
                      </div>
                    </Col>
                  </Row>

                  <div className="input-group-modern py-0 mb-3">
                    <span className="input-group-icon px-2 align-self-start mt-2" style={{ fontSize: '0.9rem' }}><i className="fas fa-comment-dots"></i></span>
                    <Form.Control
                      as="textarea"
                      rows={1}
                      placeholder="Any specific requirements or comments?"
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      className="modern-input py-2"
                      style={{ fontSize: '0.85rem', resize: 'none' }}
                    />
                  </div>
                </>
              )}

              {actionType === 'enquiry' && (
                <div className="schedule-visit-section mb-4">
                  <div className={`schedule-toggle-card p-3 rounded-3 border ${scheduleVisit ? 'border-orange bg-orange-light' : 'border-light bg-light'} transition-all`} style={{ cursor: 'pointer' }} onClick={() => setScheduleVisit(!scheduleVisit)}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <div className={`icon-circle ${scheduleVisit ? 'bg-orange text-white' : 'bg-white text-muted'} rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '36px', height: '36px', transition: 'all 0.3s ease' }}>
                          <i className="fas fa-calendar-alt"></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.95rem' }}>Schedule a Visit</h6>
                          <small className="text-muted">Pick a date to view the property</small>
                        </div>
                      </div>
                      <Form.Check 
                        type="switch"
                        id="schedule-visit-switch"
                        checked={scheduleVisit}
                        onChange={(e) => setScheduleVisit(e.target.checked)}
                        className="premium-switch"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {scheduleVisit && (
                    <div className="schedule-details-card mt-2 p-3 bg-white rounded-3 border border-light shadow-sm animate-slide-down">
                      <div className="d-flex align-items-center mb-3">
                        <div className="icon-circle bg-orange-light text-orange rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                          <i className="fas fa-info"></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>Available Timings</h6>
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>{getVisitingHoursText(selectedProperty)}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label fw-bold text-dark mb-2 d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
                          <i className="far fa-calendar-alt text-orange me-2"></i> Select Date
                        </label>
                        <div className="d-flex overflow-auto gap-2 pb-2 custom-scrollbar" style={{ margin: '0 -4px', padding: '0 4px' }}>
                          {(() => {
                            const dates = [];
                            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            
                            const allowedDays = selectedProperty?.visitingHours?.availableDays?.length > 0 
                              ? selectedProperty.visitingHours.availableDays 
                              : fullDays;
                            
                            let currentDate = new Date();
                            for (let i = 0; i < 14; i++) {
                              const fullDayName = fullDays[currentDate.getDay()];
                              if (allowedDays.includes(fullDayName)) {
                                const dateString = currentDate.toISOString().split('T')[0];
                                const dayShort = daysOfWeek[currentDate.getDay()];
                                const dateNum = currentDate.getDate();
                                const monthShort = months[currentDate.getMonth()];
                                dates.push(
                                  <div 
                                    key={dateString}
                                    onClick={() => setVisitDate(dateString)}
                                    className={`date-chip d-flex flex-column align-items-center justify-content-center p-1 rounded-3 border flex-shrink-0 transition-all ${visitDate === dateString ? 'bg-orange text-white border-orange shadow' : 'bg-white text-dark border-light hover-bg-light'}`}
                                    style={{ width: '55px', height: '65px', cursor: 'pointer' }}
                                  >
                                    <span className="fw-semibold mb-1 opacity-75" style={{ fontSize: '0.7rem' }}>{dayShort}</span>
                                    <span className="fw-bolder lh-1 mb-1" style={{ fontSize: '1.2rem' }}>{dateNum}</span>
                                    <span className="fw-semibold text-uppercase opacity-75" style={{ fontSize: '0.65rem' }}>{monthShort}</span>
                                  </div>
                                );
                              }
                              currentDate.setDate(currentDate.getDate() + 1);
                            }
                            return dates;
                          })()}
                        </div>
                      </div>

                      <div>
                        <label className="form-label fw-bold text-dark mb-2 d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
                          <i className="far fa-clock text-orange me-2"></i> Select Time
                        </label>
                        <div className="d-flex flex-wrap gap-2">
                          {(() => {
                             const options = [];
                             const vh = selectedProperty?.visitingHours;
                             let timeSlots = ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
                             
                             if (vh) {
                               try {
                                 options.length = 0;
                                 let start = parseInt(vh.startTime.split(':')[0]);
                                 let end = parseInt(vh.endTime.split(':')[0]);
                                 for(let h = start; h <= end; h++) {
                                   const ampm = h >= 12 ? 'PM' : 'AM';
                                   let hour12 = h % 12;
                                   hour12 = hour12 ? hour12 : 12;
                                   const formattedHour = hour12 < 10 ? `0${hour12}` : hour12;
                                   options.push(`${formattedHour}:00 ${ampm}`);
                                 }
                                 timeSlots = options;
                               } catch(e) {}
                             }
                             
                             return timeSlots.map(t => (
                               <div
                                 key={t}
                                 onClick={() => setVisitTime(t)}
                                 className={`time-chip px-2 py-1 rounded-pill border transition-all ${visitTime === t ? 'bg-orange text-white border-orange shadow' : 'bg-white text-secondary border-light hover-bg-light'}`}
                                 style={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                               >
                                 {t}
                               </div>
                             ));
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {actionType === 'callback' && (
                <div className="input-group-modern mb-4">
                  <span className="input-group-icon"><i className="fas fa-clock"></i></span>
                  <Form.Control
                    type="text"
                    placeholder="Preferred time (e.g., Tomorrow 10 AM)"
                    value={callbackTime}
                    onChange={(e) => setCallbackTime(e.target.value)}
                    className="modern-input"
                  />
                </div>
              )}

              {userLoggedIn ? (
                <button className="btn-premium-submit w-100 py-2" style={{ fontSize: '0.9rem' }} onClick={handleSubmitLeadDirectly} disabled={isLoading}>
                  {isLoading ? (
                    <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/> Submitting...</>
                  ) : (
                    <>Submit Enquiry <i className="fas fa-arrow-right ms-2"></i></>
                  )}
                </button>
              ) : (
                <button className="btn-premium-submit w-100 py-2" style={{ fontSize: '0.9rem' }} onClick={handleSendOtp} disabled={isLoading}>
                  {isLoading ? (
                    <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/> Sending...</>
                  ) : (
                    <>Send OTP <i className="fas fa-arrow-right ms-2"></i></>
                  )}
                </button>
              )}
            </div>
          )}

          {otpStep === 'otp' && (
            <div className="text-center py-2 animate-fade-in">
              <div className="mb-4">
                <div className="icon-circle bg-orange-light text-orange rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h5 className="fw-bold mb-1">Verify your number</h5>
                <p className="text-muted small">We've sent a code to <span className="fw-bold text-dark">{contactForm.phone}</span></p>
              </div>
              
              <Form.Control
                type="text"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="modern-otp-input text-center mb-4"
                maxLength="6"
                style={{ fontSize: '1.5rem', letterSpacing: '8px', fontWeight: 'bold' }}
              />
              
              <button className="btn-premium-submit w-100 mb-3 py-2" style={{ fontSize: '0.9rem' }} onClick={handleVerifyOtp} disabled={isLoading || otp.length !== 6}>
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              
              <div className="text-center">
                {otpTimer > 0 ? (
                  <span className="text-muted small"><i className="fas fa-clock me-1"></i> Resend code in <span className="fw-bold text-orange">{otpTimer}s</span></span>
                ) : (
                  <button className="btn btn-link text-orange text-decoration-none fw-bold p-0 small" onClick={handleResendOtp}>Resend Code</button>
                )}
                <div className="small text-warning mt-3 p-2 bg-warning-light rounded-3 d-inline-block">
                  <i className="fas fa-info-circle me-1"></i> Demo OTP: <strong>123456</strong>
                </div>
              </div>
            </div>
          )}

          {otpStep === 'success' && (
            <div className="text-center  animate-scale-in">
              <div className="text-start bg-white p-4 rounded-4 mx-2 border shadow-sm mb-4">
                <div className="row">
                  {/* Left Column: Property Details */}
                  <div className="col-md-6 mb-3 mb-md-0 border-end-md">
                    {selectedProperty && (
                      <>
                        <h6 className="fw-bold mb-3 border-bottom pb-2" style={{ fontSize: '0.95rem', color: '#334155' }}>Property Details</h6>
                        <div className="d-flex align-items-center gap-3 mb-4">
                          <div className="flex-shrink-0">
                            <img 
                              src={resolveImageUrl(selectedProperty.images?.[0]?.url || selectedProperty.coverImage)} 
                              alt="Property" 
                              style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px' }}
                            />
                          </div>
                          <div className="flex-grow-1 min-w-0">
                            <h6 className="mb-1 text-truncate fw-bold text-dark" style={{ fontSize: '0.95rem' }} title={getDisplayName(selectedProperty)}>
                              {getDisplayName(selectedProperty)}
                            </h6>
                            <p className="mb-1 text-muted text-truncate" style={{ fontSize: '0.8rem' }}>
                              <i className="fas fa-map-marker-alt text-orange me-1"></i>
                              {selectedProperty.area && `${selectedProperty.area}, `}{selectedProperty.city || '—'}
                            </p>
                            <div className="d-flex gap-2">
                               <span className="badge bg-light text-dark border">{getDisplayType(selectedProperty)}</span>
                               <span className="badge bg-light text-dark border">{getDisplayGender(selectedProperty)}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right Column: Contact Information */}
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3 border-bottom pb-2 mt-2 mt-md-0" style={{ fontSize: '0.95rem', color: '#334155' }}>
                      Contact Information
                    </h6>
                    <div className="d-flex flex-column gap-3 small">
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle bg-orange-light text-orange rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '36px', height: '36px', backgroundColor: '#fff7ed' }}>
                          <i className="fas fa-user"></i>
                        </div>
                        <div className="d-flex flex-column">
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Contact Person</span>
                          <span className="fw-bold text-dark">{selectedProperty?.managerName || selectedProperty?.ownerId?.name || 'Owner'}</span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle bg-orange-light text-orange rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '36px', height: '36px', backgroundColor: '#fff7ed' }}>
                          <i className="fas fa-phone-alt"></i>
                        </div>
                        <div className="d-flex flex-column">
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Phone Number</span>
                          <a href={`tel:${selectedProperty?.managerPhone || selectedProperty?.ownerId?.phone}`} className="text-decoration-none fw-bold text-dark">
                            {selectedProperty?.managerPhone || selectedProperty?.ownerId?.phone || 'Not available'}
                          </a>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-circle bg-orange-light text-orange rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '36px', height: '36px', backgroundColor: '#fff7ed' }}>
                          <i className="fas fa-envelope"></i>
                        </div>
                        <div className="d-flex flex-column">
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Email Address</span>
                          <a href={`mailto:${selectedProperty?.managerEmail || selectedProperty?.ownerId?.email}`} className="text-decoration-none fw-bold text-dark text-truncate" style={{ maxWidth: '200px' }}>
                            {selectedProperty?.managerEmail || selectedProperty?.ownerId?.email || 'Not available'}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="btn w-100 mt-4 py-3 fw-bold text-white shadow-sm" style={{ backgroundColor: '#f97316', borderRadius: '12px', fontSize: '1rem', transition: 'all 0.3s ease' }} onClick={handleCloseModal}>
                Done
              </button>
            </div>
          )}
        </Modal.Body>
      </Modal>
  );
});

export default LeadActionModal;
