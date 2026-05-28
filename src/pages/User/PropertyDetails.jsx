import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Modal, Carousel } from 'react-bootstrap';
import { Star, StarHalf, MessageCircle, ThumbsUp, Calendar, Plus, User as UserIcon } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import propertyService from '../../services/propertyService';
import leadService from '../../services/leadService';
import reviewService from '../../services/reviewService';
import authService from '../../services/authService';
import PropertyMap from '../../components/MapComponent';
import PromotionalAd from '../../components/PromotionalAd';
import './PropertyDetails.css';

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

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  
  const [formState, setFormState] = useState('input'); // input, sending, success
  const [ownerContact, setOwnerContact] = useState(null);
  
  const [allProperties, setAllProperties] = useState([]);
  const [showLargeMap, setShowLargeMap] = useState(false);

  const [userLoggedIn, setUserLoggedIn] = useState(authService.isAuthenticated());
  
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    mobile: '',
    email: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleSelectImage = (selectedIndex) => {
    setActiveImageIndex(selectedIndex);
  };

  useEffect(() => {
    fetchPropertyDetails();
    fetchReviews();
  }, [id]);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const response = await propertyService.getPropertyById(id);
      setProperty(response.data || response.property);
      setRooms(response.rooms || (response.data?.rooms) || []);
      
      // Fetch all properties for the map
      const allPropsResponse = await propertyService.getProperties({ limit: 50 });
      setAllProperties(allPropsResponse.properties || []);
    } catch (error) {
      console.error('Failed to fetch property:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getPropertyReviews(id);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!userLoggedIn) {
      navigate('/auth');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await reviewService.addReview(id, reviewForm);
      alert('Review submitted successfully! It will be visible after admin approval.');
      setShowReviewModal(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      fetchReviews();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="text-warning fill-current" fill="#ffc107" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" size={14} className="text-warning" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} className="text-muted" />);
    }
    return stars;
  };

  const getDisplayName = () => property?.pgName || property?.title || 'Property for Rent';
  const getDisplayLocation = () => property?.location?.area || property?.location?.address || '';
  
  const getMinPrice = () => {
    if (rooms && rooms.length > 0) return Math.min(...rooms.map(r => r.price));
    if (property?.minPrice) return property.minPrice;
    return 5000;
  };

  const getImagesArray = () => {
    if (property?.images && Array.isArray(property.images) && property.images.length > 0) {
      return property.images;
    }
    return [];
  };

  const coverImage = getImagesArray()[0]?.url || property?.coverImage || 'https://placehold.co/800x500/FFF3E0/FF8C42?text=No+Image';

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 120, // Offset for sticky headers
        behavior: 'smooth'
      });
    }
  };

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!enquiryForm.mobile || !enquiryForm.email) {
      alert("Please enter Mobile number and Email ID.");
      return;
    }
    setOtpSent(true);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (enquiryForm.otp !== '123456') {
      alert("Invalid OTP! Please enter 123456 to verify.");
      return;
    }
    
    setVerifyingOtp(true);
    
    // Simulate dummy login
    localStorage.setItem('token', 'dummy-token-123456');
    localStorage.setItem('user', JSON.stringify({
      _id: 'dummy-user-id',
      name: contactForm.name || 'Enquiry User',
      email: enquiryForm.email,
      phone: enquiryForm.mobile,
      role: 'user'
    }));
    
    setUserLoggedIn(true);
    window.dispatchEvent(new Event('auth-change'));
    setVerifyingOtp(false);
    setShowEnquiryModal(false);
    
    setContactForm(prev => ({
      ...prev,
      mobile: enquiryForm.mobile,
      email: enquiryForm.email
    }));
    
    setTimeout(() => {
      handleSubmitContact();
    }, 100);
  };

  const handleSubmitContact = async (e) => {
    if (e) e.preventDefault();

    if (!userLoggedIn) {
      setEnquiryForm({
        mobile: contactForm.mobile,
        email: contactForm.email,
        otp: ''
      });
      setOtpSent(false);
      setShowEnquiryModal(true);
      return;
    }

    if (!contactForm.name || !contactForm.mobile) {
      alert("Please enter Name and Mobile number.");
      return;
    }
    
    setFormState('sending');
    try {
      await leadService.createLead({
        propertyId: id,
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.mobile,
        type: 'Enquiry',
        message: `I am interested in ${property?.pgName || 'this property'}.`
      });
      
      setOwnerContact({
        name: property?.ownerId?.name || 'Verified Owner',
        phone: property?.ownerId?.phone || '+91 98765 43210',
        email: property?.ownerId?.email || 'owner@staynest.com'
      });
      setFormState('success');
    } catch (error) {
      console.error(error);
      alert("Failed to send request");
      setFormState('input');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f2f2f2' }}>
          <Spinner animation="border" variant="warning" />
        </div>
        <Footer />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Header />
        <div className="ho-container" style={{ padding: '100px 0', textAlign: 'center', background: '#f2f2f2' }}>
          <h2>Property Not Found</h2>
          <button className="ho-btn-primary" style={{ width: '200px', marginTop: '20px' }} onClick={() => navigate('/listings')}>
            Browse Properties
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="ho-property-details">
      <Header />
      

      <div className="ho-container">
        {/* Hero Card */}
        <div className="ho-hero-card">
          <div className="ho-hero-row">
            <div className="ho-hero-gallery flex-column">
              <div className="position-relative">
                <Carousel 
                  interval={null} 
                  indicators={false} 
                  className="ho-image-carousel"
                  activeIndex={activeImageIndex}
                  onSelect={handleSelectImage}
                >
                  {getImagesArray().map((img, idx) => (
                    <Carousel.Item key={idx}>
                      <img src={img.url} alt={`${getDisplayName()} - ${idx + 1}`} className="ho-main-img" />
                    </Carousel.Item>
                  ))}
                  {getImagesArray().length === 0 && (
                    <Carousel.Item>
                      <img src={coverImage} alt={getDisplayName()} className="ho-main-img" />
                    </Carousel.Item>
                  )}
                </Carousel>
                <div className="ho-photo-badge">
                  <i className="fas fa-camera"></i> {getImagesArray().length || 1} Photos
                </div>
              </div>

              {/* Thumbnails */}
              {getImagesArray().length > 1 && (
                <div className="ho-hero-thumbnails mt-2 d-flex gap-2 overflow-x-auto hide-scrollbar pb-2 pt-1 px-1">
                  {getImagesArray().map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img.url} 
                      alt={`Thumbnail ${idx + 1}`} 
                      onClick={() => handleSelectImage(idx)}
                      className="shadow-sm"
                      style={{ 
                        width: '80px', 
                        height: '60px', 
                        minWidth: '80px',
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: activeImageIndex === idx ? '2px solid #f97316' : '2px solid transparent',
                        opacity: activeImageIndex === idx ? 1 : 0.6,
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="ho-hero-details">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h1 className="ho-title">{getDisplayName()}</h1>
                  <div className="ho-location">
                    <i className="fas fa-map-marker-alt"></i> {getDisplayLocation()}, {property.location?.city}
                  </div>
                </div>
                <div className="ho-price-box text-end">
                  <h2 className="ho-price">
                    ₹ {getMinPrice().toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#666', display: 'block' }}>/ month</span>
                  </h2>
                </div>
              </div>

              <div className="ho-hero-meta-grid">
                <div className="meta-item">
                  <span className="label">Type:</span>
                  <span className="value">{property.propertyType || 'PG'}</span>
                </div>
                <div className="meta-item">
                  <span className="label">For:</span>
                  <span className="value">{property.genderPreference === 'male' ? 'Boys' : property.genderPreference === 'female' ? 'Girls' : 'Co-ed'}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Units:</span>
                  <span className="value">{property.totalRooms || rooms.length || 1} Rooms</span>
                </div>
                <div className="meta-item">
                  <span className="label">Furnishing:</span>
                  <span className="value">Fully Furnished</span>
                </div>
              </div>

              <div className="ho-hero-details-list mt-3">
                <div className="detail-pill">
                  <i className="fas fa-bolt text-warning"></i> Power Backup
                </div>
                <div className="detail-pill">
                  <i className="fas fa-utensils text-danger"></i> {property.amenities?.includes('Meals') ? 'Food Included' : 'Food Available'}
                </div>
                <div className="detail-pill">
                  <i className="fas fa-shield-alt text-success"></i> Verified Owner
                </div>
              </div>
              
              <div className="ho-owner-compact mt-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="owner-avatar">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">{property.ownerId?.name || 'Property Owner'}</h6>
                    <small className="text-muted">Member since {new Date(property.createdAt).getFullYear()}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content & Sidebar Layout */}
        <div className="ho-main-layout">
          {/* Left Column */}
          <div className="ho-left-column">
            
            {/* Overview & Details merged into Hero, so we start with Amenities/Description */}

            {/* Amenities Section */}
            <div className="ho-section-card" id="amenities">
              <h3 className="ho-section-title">Amenities & Facilities</h3>
              <div className="ho-amenities-grid">
                {property.amenities?.map((amenity, index) => {
                  const amName = typeof amenity === 'object' ? amenity.name : amenity;
                  // Map some dummy icons based on name
                  let icon = "fa-check";
                  if (amName.toLowerCase().includes('wifi')) icon = "fa-wifi";
                  if (amName.toLowerCase().includes('ac') || amName.toLowerCase().includes('air')) icon = "fa-snowflake";
                  if (amName.toLowerCase().includes('meal') || amName.toLowerCase().includes('food')) icon = "fa-utensils";
                  if (amName.toLowerCase().includes('laundry') || amName.toLowerCase().includes('wash')) icon = "fa-tshirt";
                  if (amName.toLowerCase().includes('security') || amName.toLowerCase().includes('cctv')) icon = "fa-shield-alt";
                  if (amName.toLowerCase().includes('gym')) icon = "fa-dumbbell";
                  if (amName.toLowerCase().includes('park')) icon = "fa-parking";
                  if (amName.toLowerCase().includes('tv') || amName.toLowerCase().includes('television')) icon = "fa-tv";
                  if (amName.toLowerCase().includes('fridge') || amName.toLowerCase().includes('refrigerator')) icon = "fa-snowflake";
                  if (amName.toLowerCase().includes('geyser') || amName.toLowerCase().includes('heater')) icon = "fa-temperature-high";
                  if (amName.toLowerCase().includes('backup') || amName.toLowerCase().includes('power')) icon = "fa-bolt";
                  if (amName.toLowerCase().includes('cctv') || amName.toLowerCase().includes('camera')) icon = "fa-video";
                  if (amName.toLowerCase().includes('lift') || amName.toLowerCase().includes('elevator')) icon = "fa-building";
                  if (amName.toLowerCase().includes('water') || amName.toLowerCase().includes('ro')) icon = "fa-tint";

                  return (
                    <div key={index} className="ho-amenity-item">
                      <div className="ho-amenity-icon">
                        <i className={`fas ${icon}`}></i>
                      </div>
                      <span className="ho-amenity-name">{amName}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description Section */}
            <div className="ho-section-card" id="description">
              <h3 className="ho-section-title">Description</h3>
              <p className="ho-desc-text">
                {property.description || 'This property features modern amenities suitable for comfortable living. It is located in a prime neighborhood with easy access to transport, shopping, and commercial areas.'}
              </p>
              
              {property.goodToKnow && property.goodToKnow.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h6 style={{ fontWeight: '700', marginBottom: '10px' }}>Good to Know</h6>
                  <ul className="ho-desc-text" style={{ paddingLeft: '20px' }}>
                    {property.goodToKnow.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* House Rules Section */}
            <div className="ho-section-card" id="house-rules">
              <h3 className="ho-section-title">House Rules</h3>
              <div className="ho-rules-list">
                {(property.houseRules && property.houseRules.length > 0) ? (
                  property.houseRules.map((rule, idx) => (
                    <div key={idx} className="ho-rule-item">
                      <i className="fas fa-check-circle ho-rule-icon"></i>
                      <span className="ho-rule-text">{rule}</span>
                    </div>
                  ))
                ) : (
                  [
                    "Maintain cleanliness in common areas",
                    "No loud music after 10 PM",
                    "Guests allowed with prior permission",
                    "Smoking and drinking strictly prohibited inside rooms"
                  ].map((rule, idx) => (
                    <div key={idx} className="ho-rule-item">
                      <i className="fas fa-check-circle ho-rule-icon"></i>
                      <span className="ho-rule-text">{rule}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Visiting Availability Section */}
            <div className="ho-section-card" id="visiting-availability">
              <h3 className="ho-section-title">Visiting Availability</h3>
              <div className="visiting-availability-wrapper">
                <div className="row align-items-center">
                  <div className="col-md-6 mb-4 mb-md-0">
                    <div className="visiting-days-container">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="fas fa-calendar-alt text-warning"></i>
                        <span className="fw-bold text-muted small text-uppercase" style={{ letterSpacing: '0.5px' }}>Available Days</span>
                      </div>
                      <div className="d-flex flex-wrap gap-2 mt-3">
                        {(() => {
                          const displayDays = property.visitingHours?.availableDays && property.visitingHours.availableDays.length > 0
                            ? property.visitingHours.availableDays
                            : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                          return displayDays.map((day) => (
                            <span 
                              key={day} 
                              className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill fw-semibold border border-warning border-opacity-25" 
                              style={{ fontSize: '0.85rem' }}
                            >
                              {day}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="visiting-hours-container border-start ps-md-4">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="fas fa-clock text-warning"></i>
                        <span className="fw-bold text-muted small text-uppercase" style={{ letterSpacing: '0.5px' }}>Visiting Hours</span>
                      </div>
                      <div className="d-flex align-items-center gap-3 mt-3">
                        {(() => {
                          const displayStartTime = property.visitingHours?.startTime || '09:00';
                          const displayEndTime = property.visitingHours?.endTime || '19:00';
                          return (
                            <>
                              <div>
                                <small className="text-muted d-block" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 500 }}>Start Time</small>
                                <span className="fw-bold text-dark" style={{ fontSize: '1.2rem' }}>
                                  {formatTime12hr(displayStartTime)}
                                </span>
                              </div>
                              <div className="text-muted fw-light" style={{ fontSize: '1.5rem', alignSelf: 'flex-end', paddingBottom: '2px' }}>—</div>
                              <div>
                                <small className="text-muted d-block" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 500 }}>End Time</small>
                                <span className="fw-bold text-dark" style={{ fontSize: '1.2rem' }}>
                                  {formatTime12hr(displayEndTime)}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Map Section */}
            <div className="ho-section-card" id="location">
              <h3 className="ho-section-title">Location & Neighborhood</h3>
              <p className="ho-desc-text mb-3">
                <i className="fas fa-map-marker-alt text-warning me-2"></i>
                {property.location?.address}, {property.location?.area}, {property.location?.city}
              </p>
              <div 
                className="small-map-wrapper position-relative" 
                style={{ cursor: 'pointer', height: '250px', borderRadius: '12px', overflow: 'hidden' }}
                onClick={() => setShowLargeMap(true)}
              >
                <PropertyMap 
                  properties={[property]} 
                  center={{ lat: property.location?.lat, lng: property.location?.lng }} 
                  zoom={15} 
                  height="250px" 
                />
                <div 
                  className="map-overlay-btn position-absolute top-50 start-50 translate-middle"
                  style={{ zIndex: 1000, pointerEvents: 'none' }}
                >
                  <button className="btn btn-warning shadow-lg fw-bold">
                    <i className="fas fa-expand-arrows-alt me-2"></i>
                    VIEW LARGE MAP
                  </button>
                </div>
              </div>
            </div>

            {/* Nearby Places Section */}
            <div className="ho-section-card" id="nearby">
              <h3 className="ho-section-title">Nearby Places</h3>
              <div className="ho-nearby-grid">
                {(property.nearbyPlaces && property.nearbyPlaces.length > 0) ? (
                  property.nearbyPlaces.map((place, idx) => (
                    <div key={idx} className="ho-nearby-item">
                      <div className="ho-nearby-info">
                        <i className="fas fa-navigation"></i>
                        <span className="ho-nearby-name">{place.name}</span>
                      </div>
                      <span className="ho-nearby-dist">{place.distance} km</span>
                    </div>
                  ))
                ) : (
                  [
                    { name: "Main Metro Station", distance: "0.8" },
                    { name: "City Shopping Mall", distance: "1.5" },
                    { name: "Multi-specialty Hospital", distance: "2.0" },
                    { name: "Local Bus Stand", distance: "0.4" }
                  ].map((place, idx) => (
                    <div key={idx} className="ho-nearby-item">
                      <div className="ho-nearby-info">
                        <i className="fas fa-navigation"></i>
                        <span className="ho-nearby-name">{place.name}</span>
                      </div>
                      <span className="ho-nearby-dist">{place.distance} km</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="ho-section-card" id="reviews">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="ho-section-title mb-0">Ratings & Reviews</h3>
                <button className="ho-btn-outline-primary btn-sm" onClick={() => setShowReviewModal(true)}>
                  <Plus size={14} className="me-1" /> Write a Review
                </button>
              </div>

              <div className="row mb-4 align-items-center">
                <div className="col-md-4 text-center border-end">
                  <div className="display-4 fw-bold text-warning">{averageRating}</div>
                  <div className="mb-2">{renderStars(parseFloat(averageRating))}</div>
                  <div className="small text-muted">{reviews.length} Verified Reviews</div>
                </div>
                <div className="col-md-8 px-4">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => Math.round(r.rating) === star).length;
                    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="d-flex align-items-center mb-1">
                        <span className="small me-2" style={{ width: '50px' }}>{star} star</span>
                        <div className="progress flex-grow-1" style={{ height: '6px' }}>
                          <div className="progress-bar bg-warning" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="small ms-2 text-muted" style={{ width: '30px' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ho-reviews-list">
                {reviews.length === 0 ? (
                  <div className="text-center py-4 bg-light rounded">
                    <MessageCircle size={32} className="text-muted mb-2" />
                    <p className="text-muted small mb-0">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  reviews.map((review, idx) => (
                    <div key={idx} className="ho-review-item py-3 border-bottom">
                      <div className="d-flex justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                            {review.user?.name?.charAt(0).toUpperCase() || <UserIcon size={16} />}
                          </div>
                          <div>
                            <div className="fw-600 small">{review.user?.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                              <Calendar size={10} className="me-1" />
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div>{renderStars(review.rating)}</div>
                      </div>
                      <h6 className="small fw-bold mb-1">{review.title}</h6>
                      <p className="small text-muted mb-2">{review.comment}</p>
                      {review.reply && (
                        <div className="ms-4 p-2 bg-light rounded small mt-2 border-start border-primary border-4">
                          <div className="fw-bold mb-1">Owner Response:</div>
                          <div className="text-muted fst-italic">"{review.reply}"</div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Available Rooms Section (Extra context for PG) */}
            {rooms && rooms.length > 0 && (
              <div className="ho-section-card">
                <h3 className="ho-section-title">Available Units</h3>
                {rooms.map((room, idx) => (
                  <div key={idx} style={{ padding: '15px 0', borderBottom: idx !== rooms.length - 1 ? '1px dashed #ddd' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h6 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#122b46' }}>{room.name}</h6>
                      <strong style={{ color: '#f15a29', fontSize: '1.2rem' }}>₹{room.price}/mo</strong>
                    </div>
                    <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                      {room.capacity} | {room.attachedBathroom ? 'Attached Bath' : 'Shared Bath'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column / Sidebar */}
          <div className="ho-right-column">
            <div className="ho-sticky-sidebar">
              <div className="ho-contact-form-card">
                {/* Mini Map at top of contact form */}
                <div 
                  className="sidebar-mini-map mb-3 overflow-hidden rounded-3 border"
                  onClick={() => setShowLargeMap(true)}
                  style={{ cursor: 'pointer', height: '200px' }}
                >
                  <PropertyMap 
                    properties={[property]} 
                    center={[property.location?.lat, property.location?.lng]} 
                    zoom={15} 
                    height="200px"
                    minimal={true}
                  />
                </div>
                <h4 className="ho-form-title">Contact Owner</h4>
                <p className="ho-form-subtitle">Share details to instantly view owner contact</p>
                
                {formState === 'input' && (
                  <form onSubmit={handleSubmitContact}>
                    <div className="ho-form-group">
                      <input 
                        type="text" 
                        name="name"
                        placeholder="Name" 
                        className="ho-input" 
                        value={contactForm.name}
                        onChange={handleContactChange}
                        required
                      />
                    </div>
                    <div className="ho-form-group">
                      <input 
                        type="email" 
                        name="email"
                        placeholder="Email ID" 
                        className="ho-input" 
                        value={contactForm.email}
                        onChange={handleContactChange}
                      />
                    </div>
                    <div className="ho-form-group">
                      <input 
                        type="tel" 
                        name="mobile"
                        placeholder="Mobile Number" 
                        maxLength="10"
                        className="ho-input" 
                        value={contactForm.mobile}
                        onChange={handleContactChange}
                        required
                      />
                    </div>
                    <div className="ho-form-group" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '15px' }}>
                      <input type="checkbox" id="terms" defaultChecked />
                      <label htmlFor="terms" style={{ fontSize: '0.75rem', color: '#777' }}>
                        I agree to Terms & Conditions
                      </label>
                    </div>
                    
                    <button type="submit" className="ho-btn-primary">
                      GET CONTACT
                    </button>
                  </form>
                )}

                {formState === 'sending' && (
                  <div className="ho-success-box">
                    <Spinner animation="border" style={{ color: '#f15a29' }} />
                    <p style={{ marginTop: '10px', color: '#666' }}>Fetching details...</p>
                  </div>
                )}

                {formState === 'success' && ownerContact && (
                  <div className="ho-success-box" style={{ padding: '10px 0' }}>
                    <i className="fas fa-check-circle"></i>
                    <h5 style={{ margin: '0 0 15px 0' }}>Request Successful</h5>
                    
                    <div className="ho-contact-reveal">
                      <div className="ho-contact-reveal-row">
                        <i className="fas fa-user"></i>
                        <span>{ownerContact.name}</span>
                      </div>
                      <div className="ho-contact-reveal-row">
                        <i className="fas fa-phone-alt"></i>
                        <a href={`tel:${ownerContact.phone}`}>{ownerContact.phone}</a>
                      </div>
                      <div className="ho-contact-reveal-row">
                        <i className="fas fa-fab fa-whatsapp"></i>
                        <a href={`https://wa.me/${ownerContact.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Promotional Ad in Sidebar */}
              <PromotionalAd location="property_sidebar" className="mt-4" />
            </div>
          </div>

        </div>
      </div>

      {/* Large Map Modal */}
      <Modal 
        show={showLargeMap} 
        onHide={() => setShowLargeMap(false)} 
        size="xl" 
        centered
        className="map-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Explore Area - {property.pgName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0" style={{ height: '70vh' }}>
          <PropertyMap 
            properties={allProperties} 
            center={{ lat: property.location?.lat, lng: property.location?.lng }} 
            zoom={15} 
            height="100%" 
            highlightedId={property._id}
          />
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <p className="text-muted small mb-0">
            <i className="fas fa-info-circle me-1"></i>
            Showing {property.pgName} (orange marker) and other properties nearby.
          </p>
        </Modal.Footer>
      </Modal>

      {/* Similar Properties Section */}
      <div className="ho-container mb-5">
        <div className="ho-section-card">
          <h3 className="ho-section-title">Similar Properties in {property.location?.city}</h3>
          <div className="ho-related-grid">
            {allProperties
              .filter(p => p._id !== id)
              .slice(0, 4)
              .map(related => (
                <div 
                  key={related._id} 
                  className="ho-related-card"
                  onClick={() => {
                    navigate(`/property/${related._id}`);
                    window.scrollTo(0,0);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="related-img-box">
                    <Carousel interval={null} indicators={false} className="related-carousel">
                      {related.images?.slice(0, 4).map((img, i) => (
                        <Carousel.Item key={i}>
                          <img src={img.url} alt={related.pgName} />
                        </Carousel.Item>
                      ))}
                      {!related.images?.length && (
                        <Carousel.Item>
                          <img src={related.coverImage || 'https://placehold.co/300x200?text=Property'} alt={related.pgName} />
                        </Carousel.Item>
                      )}
                    </Carousel>
                    <div className="related-badge">{related.propertyType}</div>
                  </div>
                  <div className="related-info">
                    <h6>{related.pgName || related.title}</h6>
                    <p><i className="fas fa-map-marker-alt"></i> {related.location?.area}</p>
                    <div className="related-price">₹{related.minPrice?.toLocaleString()} <span>/mo</span></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <Footer />

      {/* Add Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Write a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <form onSubmit={handleAddReview}>
            <div className="mb-3 text-center py-3">
              <label className="d-block small text-muted mb-2">Tap to Rate</label>
              <div className="d-flex justify-content-center gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star 
                    key={s} 
                    size={32} 
                    className={`cursor-pointer ${s <= reviewForm.rating ? 'text-warning fill-current' : 'text-muted'}`} 
                    fill={s <= reviewForm.rating ? '#ffc107' : 'none'}
                    onClick={() => setReviewForm({...reviewForm, rating: s})}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">Review Title</label>
              <input 
                type="text" 
                className="ho-input" 
                placeholder="Summarize your experience" 
                value={reviewForm.title}
                onChange={e => setReviewForm({...reviewForm, title: e.target.value})}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">Your Review</label>
              <textarea 
                className="ho-input" 
                rows="4" 
                placeholder="What was it like staying here?"
                value={reviewForm.comment}
                onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                required
              ></textarea>
            </div>
            <button type="submit" className="ho-btn-primary w-100" disabled={submittingReview}>
              {submittingReview ? <Spinner size="sm" /> : 'SUBMIT REVIEW'}
            </button>
          </form>
        </Modal.Body>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal show={showEnquiryModal} onHide={() => setShowEnquiryModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-dark d-flex align-items-center gap-2">
            <i className="fas fa-shield-alt text-warning"></i> Secure Verification
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <p className="text-muted small mb-4">
            Verify your mobile number and email to securely access owner contact information and complete your enquiry.
          </p>

          {!otpSent ? (
            <form onSubmit={handleSendOtp}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">Mobile Number *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fas fa-phone-alt text-muted"></i>
                  </span>
                  <input 
                    type="tel" 
                    className="form-control border-start-0 ho-input" 
                    placeholder="Enter 10-digit number"
                    maxLength="10"
                    value={enquiryForm.mobile}
                    onChange={e => setEnquiryForm({ ...enquiryForm, mobile: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">Email ID *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fas fa-envelope text-muted"></i>
                  </span>
                  <input 
                    type="email" 
                    className="form-control border-start-0 ho-input" 
                    placeholder="Enter your email address"
                    value={enquiryForm.email}
                    onChange={e => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="ho-btn-primary w-100 mt-2">
                SEND VERIFICATION OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="bg-light p-3 rounded-3 mb-4 border border-dashed border-warning">
                <small className="text-muted d-block mb-1">Verification details:</small>
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Mobile:</span>
                  <span className="fw-bold text-dark">{enquiryForm.mobile}</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span className="text-muted">Email:</span>
                  <span className="fw-bold text-dark">{enquiryForm.email}</span>
                </div>
              </div>

              <div className="mb-4 text-center">
                <label className="form-label small fw-bold text-dark d-block mb-2">Enter Verification Code</label>
                <input 
                  type="text" 
                  className="form-control text-center fw-bold fs-4 ho-input" 
                  placeholder="------" 
                  maxLength="6"
                  style={{ letterSpacing: '8px' }}
                  value={enquiryForm.otp}
                  onChange={e => setEnquiryForm({ ...enquiryForm, otp: e.target.value })}
                  required
                />
                <span className="small text-warning d-block mt-2">
                  <i className="fas fa-info-circle me-1"></i> Use dummy OTP <strong>123456</strong> to verify.
                </span>
              </div>

              <button type="submit" className="ho-btn-primary w-100" disabled={verifyingOtp}>
                {verifyingOtp ? <Spinner size="sm" /> : 'VERIFY & SUBMIT ENQUIRY'}
              </button>
            </form>
          )}
        </Modal.Body>
      </Modal>

      <style>{`
        .ho-btn-outline-primary {
          background: transparent;
          border: 1px solid #f15a29;
          color: #f15a29;
          padding: 6px 16px;
          border-radius: 6px;
          font-weight: 600;
          transition: 0.3s;
        }
        .ho-btn-outline-primary:hover {
          background: #f15a29;
          color: white;
        }
        .cursor-pointer { cursor: pointer; }
        .fill-current { fill: currentColor; }
      `}</style>
    </div>
  );
};

export default PropertyDetails;