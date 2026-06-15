import React, { useState, useEffect, useRef } from 'react';
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
import { useAuthModal } from '../../context/AuthModalContext';
import SEO from '../../components/SEO';

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

const getBaseImageUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1');
  return apiUrl.replace('/api/v1', '');
};

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = getBaseImageUrl();
  if (url.startsWith('/uploads/')) return `${baseUrl}${url}`;
  if (url.startsWith('uploads/')) return `${baseUrl}/${url}`;
  return url;
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
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
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeTab, setActiveTab] = useState('rooms');
  const [nearbyTab, setNearbyTab] = useState('Transit');

  const handleSelectImage = (selectedIndex) => {
    setActiveImageIndex(selectedIndex);
    setShowLightbox(true);
  };

  const hasIncremented = useRef(false);

  useEffect(() => {
    if (!hasIncremented.current) {
      propertyService.incrementViews(id);
      hasIncremented.current = true;
    }
    fetchPropertyDetails();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    let eventSource = null;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://staysorted.in/api/v1' : 'http://localhost:5000/api/v1');
      eventSource = new EventSource(`${apiUrl}/events/stream`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.event === 'review_approved') {
            const newReview = data.payload;
            const propertyId = newReview.property?._id || newReview.property;
            if (propertyId === id) {
              setReviews(prev => {
                if (!prev.find(r => r._id === newReview._id)) {
                  return [newReview, ...prev];
                }
                return prev;
              });
            }
          } else if (data.event === 'review_replied') {
            const updatedReview = data.payload;
            const propertyId = updatedReview.property?._id || updatedReview.property;
            if (propertyId === id) {
              setReviews(prev => prev.map(r => r._id === updatedReview._id ? updatedReview : r));
            }
          }
        } catch (e) {
          console.error('Error parsing SSE data:', e);
        }
      };

      eventSource.onerror = (err) => {
        // Suppress connection errors
      };
    } catch (error) {
      console.log('SSE initialization skipped or failed:', error);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [id]);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (userLoggedIn && savedUser.role === 'user') {
      setContactForm({
        name: savedUser.name || '',
        email: savedUser.email || '',
        mobile: savedUser.phone || savedUser.whatsapp || ''
      });
    } else {
      setContactForm({
        name: '',
        email: '',
        mobile: ''
      });
    }
  }, [userLoggedIn]);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const response = await propertyService.getPropertyById(id);
      const propData = response.data || response.property;
      setProperty(propData);
      setRooms(response.rooms || propData?.roomTypes || propData?.rooms || []);
      
      // Fetch similar properties from the same city
      const allPropsResponse = await propertyService.getProperties({ limit: 50, public: true }, false);
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
      setReviews(response.reviews || response.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setReviews([]);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!authService.isAuthenticated()) {
      openAuthModal(() => {
        setShowReviewModal(true);
      });
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
  const getDisplayLocation = () => property?.area || property?.address || '';
  
  const getDisplayGender = () => {
    if (property?.genderPreference === 'male') return 'Boys';
    if (property?.genderPreference === 'female') return 'Girls';
    if (property?.genderAllowed === 'Boys' || property?.genderAllowed === 'Boys Only') return 'Boys';
    if (property?.genderAllowed === 'Girls' || property?.genderAllowed === 'Girls Only') return 'Girls';
    if (property?.genderAllowed === 'Unisex' || property?.genderAllowed === 'Co-ed') return 'Co-ed';
    return 'Co-ed';
  };
  
  const getMinPrice = () => {
    if (rooms && rooms.length > 0) return Math.min(...rooms.map(r => Number(r.price) || 0));
    if (property?.minPrice) return property.minPrice;
    return 5000;
  };

  const getPropertyMinPrice = (p) => {
    if (p.minPrice) return p.minPrice;
    if (p.pricing?.deposit) return p.pricing.deposit;
    const pRooms = p.roomTypes || p.rooms;
    if (pRooms && pRooms.length > 0) {
      return Math.min(...pRooms.map(r => Number(r.price) || 0));
    }
    return p.totalRooms * 1000 || 5000;
  };

  const getSimilarProperties = () => {
    if (!property) return [];
    let similar = allProperties.filter(p => p._id !== property._id && p.city?.toLowerCase() === property?.city?.toLowerCase());
    if (similar.length === 0) {
      similar = allProperties.filter(p => p._id !== property._id);
    }
    return similar;
  };

  const getImagesArray = () => {
    let images = [];
    if (property?.coverImage) {
      images.push({ url: resolveImageUrl(property.coverImage), tag: 'Cover' });
    }
    
    if (property?.galleryImages && Array.isArray(property.galleryImages)) {
      property.galleryImages.forEach(img => {
        images.push({ 
          url: resolveImageUrl(typeof img === 'string' ? img : img.url),
          tag: typeof img === 'object' && img.tag ? img.tag : ''
        });
      });
    } else if (property?.images && Array.isArray(property.images)) {
      property.images.forEach(img => {
        images.push({ 
          url: resolveImageUrl(typeof img === 'string' ? img : img.url),
          tag: typeof img === 'object' && img.tag ? img.tag : ''
        });
      });
    }

    if (rooms && Array.isArray(rooms)) {
      rooms.forEach(room => {
        if (room.image) {
          images.push({ url: resolveImageUrl(room.image), tag: room.name || 'Room' });
        }
      });
    }
    
    // Fallback if absolutely no images
    if (images.length === 0) {
      images.push({ url: 'https://placehold.co/800x600/e2e8f0/64748b?text=No+Photos' });
    }

    // Deduplicate
    const uniqueImages = [];
    const urls = new Set();
    images.forEach(img => {
      if (!urls.has(img.url)) {
        urls.add(img.url);
        uniqueImages.push(img);
      }
    });

    return uniqueImages;
  };

  const coverImage = getImagesArray()[0]?.url;

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
    
    // Process OTP verification without dummy login
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

    if (!authService.isAuthenticated()) {
      openAuthModal(() => {
        handleSubmitContact();
      });
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
        name: property?.owner?.name || property?.ownerId?.name || 'Verified Owner',
        phone: property?.owner?.phone || property?.ownerId?.phone || '+91 98765 43210',
        email: property?.owner?.email || property?.ownerId?.email || 'owner@staynest.com'
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
      <SEO 
        title={property ? `${getDisplayName()} in ${getDisplayLocation()}` : 'Property Details'} 
        description={property?.description || `View details, amenities, and rooms for ${getDisplayName()} located at ${getDisplayLocation()}.`} 
        image={getImagesArray()[0]?.url}
      />
      <Header />
      
      <main>
      <div className="ho-container">
        {/* Hero Card */}
        <div className="ho-hero-card p-3 position-relative mt-1 overflow-hidden border border-light bg-white rounded-4 shadow-sm">
          
          {/* Top Header Row */}
          <div className="d-flex flex-wrap justify-content-between align-items-start mb-2 pb-2" style={{borderBottom: '1px solid #e5e7eb'}}>
            <div className="pe-3">
              {/* Badges */}
              <div className="d-inline-flex align-items-center gap-2 shadow-sm px-3 py-1 mb-2 rounded-pill" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fdba74' }}>
                <span className="d-flex align-items-center fw-bold" style={{fontSize:'0.75rem', letterSpacing: '0.5px'}}><i className="fas fa-check-circle me-1"></i>Partner Verified</span>
                <span className="opacity-50" style={{fontSize:'0.6rem'}}>•</span>
                <span className="d-flex align-items-center fw-bold" style={{fontSize:'0.75rem', letterSpacing: '0.5px'}}><i className="fas fa-star me-1"></i>Brand New</span>
              </div>
              
              <h1 className="ho-title m-0 d-flex align-items-center flex-wrap gap-2" style={{ fontSize: '1.7rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#111827' }}>
                <span>{getDisplayName()}</span>
                <span className="px-2 py-1 rounded-3 d-flex align-items-center shadow-sm" style={{ fontSize: '1.2rem', color: '#ea580c', backgroundColor: '#fff7ed', border: '1px solid #fdba74' }}>
                  ₹{getMinPrice().toLocaleString()}{property.maxPrice ? ` - ${property.maxPrice.toLocaleString()}` : ''}
                </span>
              </h1>
              <div className="d-flex align-items-center gap-2 mt-2">
                <span className="text-muted" style={{fontSize: '0.8rem'}}>in {getDisplayLocation()}</span>
                <div className="badge bg-light text-dark border d-flex align-items-center gap-1">
                  <span className="fw-bold">{averageRating}</span><span className="text-muted" style={{fontSize:'0.65rem'}}>/5</span> <i className="fas fa-star text-warning" style={{fontSize:'0.65rem'}}></i>
                </div>
              </div>
            </div>

            {/* Sortify Ad Banner Image */}
            {/* <div className="mx-md-auto my-3 my-md-0 d-flex align-items-center justify-content-center" style={{ width: '100%', maxWidth: '500px', flex: '1 1 auto' }}>
              <img 
                src="/images/sortify-ad.png" 
                alt="Sortify PRO - Managed property. Zero brokerage." 
                className="img-fluid rounded-4 shadow-sm border border-light" 
                style={{ objectFit: 'cover', height: '110px', width: '100%' }} 
              />
            </div> */}

            <div className="text-start text-md-end mt-2 mt-md-0">
              <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>Posted by : <strong className="text-dark">{property?.owner?.name || property?.ownerId?.name || 'Owner'}</strong></div>
              <div className="d-flex gap-2 justify-content-md-end">
                <button className="btn  px-3 py-1 fw-bold text-white" style={{fontSize: '1rem', background: '#f15a29', border: 'none'}} onClick={() => scrollToSection('contact-form')}>Enquire</button>
                <button className="btn  px-3 py-1 fw-bold text-white" style={{fontSize: '1rem', background: '#ea580c', border: 'none'}} onClick={() => scrollToSection('contact-form')}>Contact Now</button>
              </div>
            </div>
          </div>

          {/* Images and Info Grid Row */}
          <div className="row g-2 mt-1">
            {/* Left: Image Gallery */}
            <div className="col-md-8 d-flex gap-2" style={{height: '350px'}}>
              <div className="position-relative w-50 h-100 rounded-3 overflow-hidden shadow-sm" style={{backgroundColor: '#f1f5f9'}}>
                <img src={getImagesArray()[0]?.url || coverImage} className="w-100 h-100" style={{objectFit: 'cover', cursor: 'pointer', transition: 'transform 0.3s ease'}} onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'} onClick={() => handleSelectImage(0)} onError={(e) => { e.target.src = 'https://placehold.co/800x600/e2e8f0/64748b?text=Image+Unavailable'; }} />
                <div className="position-absolute bottom-0 end-0 m-2 badge bg-dark bg-opacity-75 text-white shadow-sm" style={{fontSize: '0.7rem', cursor: 'pointer', padding: '6px 10px'}} onClick={() => handleSelectImage(0)}>{getImagesArray().length} Property & Guest Photos <i className="fas fa-arrow-right ms-1"></i></div>
              </div>
              <div className="d-flex flex-column gap-2 w-50 h-100">
                <div className="h-50 rounded-3 overflow-hidden shadow-sm" style={{backgroundColor: '#f1f5f9'}}>
                   <img src={getImagesArray()[1]?.url || 'https://placehold.co/400x300'} className="w-100 h-100" style={{objectFit: 'cover', cursor: 'pointer', transition: 'transform 0.3s ease'}} onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'} onClick={() => handleSelectImage(1)} onError={(e) => { e.target.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Img'; }} />
                </div>
                <div className="h-50 rounded-3 overflow-hidden shadow-sm position-relative" style={{backgroundColor: '#f1f5f9'}}>
                   <img src={getImagesArray()[2]?.url || 'https://placehold.co/400x300'} className="w-100 h-100" style={{objectFit: 'cover', cursor: 'pointer', transition: 'transform 0.3s ease'}} onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'} onClick={() => handleSelectImage(2)} onError={(e) => { e.target.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Img'; }} />
                   {getImagesArray().length > 3 && (
                     <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style={{ top: 0, left: 0, background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }} onClick={() => handleSelectImage(3)}>
                       <span className="text-white fw-bold" style={{ fontSize: '1.2rem' }}>+{getImagesArray().length - 3} More</span>
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* Right: Info Grid */}
            <div className="col-md-4">
              <div className="bg-white rounded-4 shadow-sm border border-light h-100 d-flex flex-column overflow-hidden transition-all hover-shadow">
                {/* Rent & Deposit Section */}
                <div className="p-3" style={{ background: 'linear-gradient(145deg, #fff7ed 0%, #ffffff 100%)', borderBottom: '1px solid #fed7aa' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div>
                      <div className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Monthly Rent</div>
                      <div className="fw-bolder" style={{ fontSize: '1.4rem', color: '#ea580c', letterSpacing: '-0.5px' }}>
                        ₹{getMinPrice().toLocaleString()}{property.maxPrice ? ` - ${property.maxPrice.toLocaleString()}` : ''}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Deposit</div>
                      <div className="fw-bold text-dark" style={{ fontSize: '1rem' }}>{property.deposit || '1 Month'}</div>
                    </div>
                  </div>
                </div>
                
                {/* Details Grid Section */}
                <div className="flex-grow-1 p-3">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {[
                      { icon: 'fa-file-contract', label: 'Contract', value: property.minLocking ? `${property.minLocking} Months` : '1/3/6/12 Months', color: '#ea580c', bg: '#fff7ed' },
                      { icon: 'fa-calendar-alt', label: 'Notice', value: property.noticePeriod || '1 Month', color: '#ea580c', bg: '#fff7ed' },
                      { icon: 'fa-home', label: 'Occupancy', value: property.propertyType || 'PG', color: '#ea580c', bg: '#fff7ed' },
                      { icon: 'fa-user-friends', label: 'Gender', value: getDisplayGender(), color: '#ea580c', bg: '#fff7ed' },
                      { icon: 'fa-couch', label: 'Furnishing', value: property.furnishingStatus || 'Semi Furnished', color: '#ea580c', bg: '#fff7ed' },
                      { icon: 'fa-utensils', label: 'Food', value: property.foodOption || 'Veg/Non-Veg', color: '#ea580c', bg: '#fff7ed' },
                      { icon: 'fa-snowflake', label: 'AC Type', value: property.acType || 'AC/Non-AC', color: '#ea580c', bg: '#fff7ed' },
                      { icon: 'fa-bath', label: 'Washroom', value: property.attachedBathroom ? 'Attached' : 'Common', color: '#ea580c', bg: '#fff7ed' }
                    ].map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-2 p-2 border rounded-3 transition-all hover-shadow-sm" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                        <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 shadow-sm" style={{ width: '32px', height: '32px', backgroundColor: item.bg, color: item.color }}>
                          <i className={`fas ${item.icon}`} style={{ fontSize: '0.85rem' }}></i>
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-muted fw-bold text-uppercase text-truncate" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>{item.label}</div>
                          <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.75rem' }}>{item.value}</div>
                        </div>
                      </div>
                    ))}
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
            
            {/* Tab Navigation Bar */}
            <div id="property-tabs" className="ho-section-card p-2 mb-1 sticky-top shadow-sm" style={{ top: '0px', zIndex: 100, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {[
                { id: 'description', label: 'Description' },
                { id: 'rooms', label: 'Rooms & Pricing' },
                { id: 'amenities', label: 'Amenities & Facilities' },
                { id: 'rules', label: 'House Rules' },
                { id: 'policies', label: 'Policies & Fees' },
                { id: 'visiting', label: 'Visiting Availability' },
                { id: 'explore', label: 'Explore Neighborhood' },
                { id: 'reviews', label: 'Ratings & Reviews' },
                { id: 'similar', label: 'Similar Properties' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    const el = document.getElementById(tab.id);
                    if (el) {
                      const offsetTop = el.getBoundingClientRect().top + window.scrollY - 120; // 120px offset for sticky tabs + main header
                      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    }
                  }}
                  className={`btn rounded-pill px-4 py-2 fw-bold ${activeTab === tab.id ? 'shadow-sm text-white' : 'text-secondary'}`}
                  style={{ 
                    fontSize: '0.9rem', 
                    transition: 'all 0.2s ease',
                    backgroundColor: activeTab === tab.id ? '#ea580c' : '#f8fafc',
                    border: activeTab === tab.id ? '1px solid #ea580c' : '1px solid #cbd5e1'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Description Section */}
            <div className="ho-section-card" id="description" style={{ marginBottom: '8px' }}>
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

            {/* Rooms Section */}
            <div className="ho-section-card" id="rooms" style={{ marginBottom: '8px' }}>
              <h3 className="ho-section-title">Rooms & Pricing</h3>
              {property.roomTypes && property.roomTypes.length > 0 ? (
                <div className="table-responsive rounded-3 border shadow-sm mt-3 bg-white">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="fw-semibold text-muted py-3 px-4 text-center" style={{ width: '15%' }}>Image</th>
                        <th scope="col" className="fw-semibold text-muted py-3 px-4" style={{ width: '60%' }}>Configuration & Details</th>
                        <th scope="col" className="fw-semibold text-muted py-3 px-4 text-end" style={{ width: '25%' }}>Availability & Pricing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {property.roomTypes.map((room, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-center align-middle">
                            {room.image ? (
                              <img 
                                src={resolveImageUrl(room.image)} 
                                alt={room.name} 
                                className="rounded shadow-sm mx-auto d-block cursor-pointer transition-all" 
                                style={{ width: '100px', height: '75px', objectFit: 'cover' }}
                                onClick={() => {
                                  const url = resolveImageUrl(room.image);
                                  const allImages = getImagesArray();
                                  const idx = allImages.findIndex(img => img.url === url);
                                  if (idx !== -1) handleSelectImage(idx);
                                }}
                              />
                            ) : (
                              <div className="bg-light rounded shadow-sm d-flex align-items-center justify-content-center text-muted mx-auto" style={{ width: '100px', height: '75px' }}>
                                <i className="fas fa-bed"></i>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <h6 className="mb-1 fw-bolder text-dark" style={{ letterSpacing: '-0.2px' }}>{room.name || 'Standard Room'}</h6>
                            {room.size && (
                              <div className="text-muted small fw-medium mb-2">
                                <i className="fas fa-vector-square me-1"></i>{room.size} sq.ft
                              </div>
                            )}
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {room.acType && <span className="badge bg-white text-dark border shadow-sm"><i className="fas fa-snowflake text-primary me-1"></i>{room.acType}</span>}
                              {room.bedSize && <span className="badge bg-white text-dark border shadow-sm"><i className="fas fa-bed text-secondary me-1"></i>{room.bedSize}</span>}
                              {room.furnishingStatus && <span className="badge bg-white text-dark border shadow-sm"><i className="fas fa-couch text-warning me-1"></i>{room.furnishingStatus}</span>}
                              {room.attachedBathroom && <span className="badge bg-white text-dark border shadow-sm"><i className="fas fa-bath text-info me-1"></i>Attached Bath</span>}
                              {room.balcony && <span className="badge bg-white text-dark border shadow-sm"><i className="fas fa-wind text-success me-1"></i>Balcony</span>}
                              {room.kitchen && <span className="badge bg-white text-dark border shadow-sm"><i className="fas fa-utensils text-danger me-1"></i>Kitchen</span>}
                              {room.livingRoom && <span className="badge bg-white text-dark border shadow-sm"><i className="fas fa-tv text-primary me-1"></i>Living Area</span>}
                            </div>
                            <div className="d-flex flex-wrap gap-1">
                              {room.amenities?.map((am, i) => (
                                <span key={i} className="badge bg-light text-secondary border">{am}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-end align-middle">
                            <div className="mb-1">
                              {room.isAvailable !== false ? (
                                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">Available</span>
                              ) : (
                                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1">Unavailable</span>
                              )}
                            </div>
                            {room.numberOfRooms && (
                              <div className="text-muted small fw-medium mb-1">
                                <i className="fas fa-door-open me-1"></i>{room.numberOfRooms} Units
                              </div>
                            )}
                            <h5 className="mb-0 fw-bolder text-dark mt-2">
                              ₹{Number(room.price).toLocaleString()} <span className="text-muted fw-normal" style={{fontSize: '0.8rem'}}>/mo</span>
                            </h5>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-5 bg-light rounded-4">
                  <i className="fas fa-bed fa-3x text-muted mb-3"></i>
                  <h5 className="text-secondary">Room details not available</h5>
                  <p className="text-muted small">Contact the owner for pricing and room availability.</p>
                </div>
              )}
            </div>

            {/* Amenities Section */}
            <div className="ho-section-card" id="amenities" style={{ marginBottom: '8px' }}>
              <h3 className="ho-section-title">Amenities & Facilities</h3>
              <div className="ho-amenities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
                {(property.amenities?.length > 0 ? property.amenities : ['High-Speed WiFi', 'AC Rooms', '3 Meals a Day', 'Daily Housekeeping', '24/7 Security', 'RO Water', 'Washing Machine', 'Power Backup', 'Gym', 'Parking', 'TV Lounge', 'Biometric Entry']).map((amenity, index) => {
                  const amName = typeof amenity === 'object' ? amenity.name : amenity;
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
                  if (amName.toLowerCase().includes('housekeeping')) icon = "fa-broom";
                  if (amName.toLowerCase().includes('biometric')) icon = "fa-fingerprint";

                  return (
                    <div key={index} className="ho-amenity-item" style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', transition: 'all 0.2s'}}>
                      <div className="ho-amenity-icon" style={{width: '40px', height: '40px', borderRadius: '50%', background: '#fff0e6', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0}}>
                        <i className={`fas ${icon}`}></i>
                      </div>
                      <span className="ho-amenity-name" style={{fontWeight: 600, color: '#334155'}}>{amName}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* House Rules Section */}
            <div className="ho-section-card" id="rules" style={{ marginBottom: '8px' }}>
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

            {/* Policies Section */}
            <div className="ho-section-card" id="policies" style={{ marginBottom: '8px' }}>
              <h3 className="ho-section-title">Policies & Fees</h3>
              <div className="row g-4">
                
                {/* Financial Details */}
                <div className="col-12 col-md-6">
                  <div className="bg-white p-4 rounded-4 border shadow-sm h-100">
                    <h5 className="fw-bolder mb-4 text-dark d-flex align-items-center gap-2">
                      <div className="bg-orange-light text-orange rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', backgroundColor: '#fff7ed', color: '#ea580c' }}>
                        <i className="fas fa-wallet small"></i>
                      </div>
                      Financial Details
                    </h5>
                    
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                      <li className="d-flex justify-content-between align-items-center border-bottom pb-2">
                        <span className="text-muted fw-semibold small"><i className="fas fa-money-bill-wave me-2 opacity-50"></i>Security Deposit</span>
                        <span className="fw-bold text-dark">{property.deposit || 'N/A'} {property.depositType ? `(${property.depositType})` : ''}</span>
                      </li>
                      <li className="d-flex justify-content-between align-items-center border-bottom pb-2">
                        <span className="text-muted fw-semibold small"><i className="fas fa-calendar-check me-2 opacity-50"></i>Payment Cycle</span>
                        <span className="fw-bold text-dark">{property.paymentCycle || 'Monthly'}</span>
                      </li>
                      <li className="d-flex justify-content-between align-items-center border-bottom pb-2">
                        <span className="text-muted fw-semibold small"><i className="fas fa-tools me-2 opacity-50"></i>Maintenance</span>
                        <span className="fw-bold text-dark">{property.maintenance ? `₹${property.maintenance}` : 'Included'}</span>
                      </li>
                      <li className="d-flex justify-content-between align-items-center">
                        <span className="text-muted fw-semibold small"><i className="fas fa-bolt me-2 opacity-50"></i>Electricity Charges</span>
                        <span className="fw-bold text-dark">{property.electricityCharges || 'As per usage'}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Stay Policies */}
                <div className="col-12 col-md-6">
                  <div className="bg-white p-4 rounded-4 border shadow-sm h-100">
                    <h5 className="fw-bolder mb-4 text-dark d-flex align-items-center gap-2">
                      <div className="bg-orange-light text-orange rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', backgroundColor: '#fff7ed', color: '#ea580c' }}>
                        <i className="fas fa-clipboard-list small"></i>
                      </div>
                      Stay Policies
                    </h5>
                    
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                      <li className="d-flex justify-content-between align-items-center border-bottom pb-2">
                        <span className="text-muted fw-semibold small"><i className="fas fa-lock me-2 opacity-50"></i>Lock-in Period</span>
                        <span className="fw-bold text-dark">{property.minLocking ? `${property.minLocking} Month(s)` : 'No Lock-in'}</span>
                      </li>
                      <li className="d-flex justify-content-between align-items-center border-bottom pb-2">
                        <span className="text-muted fw-semibold small"><i className="fas fa-utensils me-2 opacity-50"></i>Food Option</span>
                        <span className="fw-bold text-dark">{property.foodOption || 'Not Available'}</span>
                      </li>
                      <li className="d-flex justify-content-between align-items-center border-bottom pb-2">
                        <span className="text-muted fw-semibold small"><i className="fas fa-users me-2 opacity-50"></i>Preferred Tenants</span>
                        <span className="fw-bold text-dark">{getDisplayGender()}</span>
                      </li>
                      <li className="d-flex justify-content-between align-items-center">
                        <span className="text-muted fw-semibold small"><i className="fas fa-file-contract me-2 opacity-50"></i>Agreement Duration</span>
                        <span className="fw-bold text-dark">11 Months Standard</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>

            {/* Visiting Availability Section */}
            <div className="ho-section-card" id="visiting" style={{ marginBottom: '8px' }}>
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

            {/* Explore Neighborhood Section */}
            <div className="ho-section-card p-0 overflow-hidden" id="explore" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div className="p-4 border-bottom" style={{ backgroundColor: '#fcfdfd' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '48px', height: '48px', backgroundColor: '#e6f8f6', color: '#14b8a6', border: '1px solid #ccf0eb' }}>
                    <i className="fas fa-map-marked-alt" style={{ fontSize: '1.2rem' }}></i>
                  </div>
                  <div>
                    <h3 className="ho-section-title mb-1" style={{ fontSize: '1.35rem', color: '#1e293b' }}>Explore Neighborhood</h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem', fontWeight: '500' }}>Discover key locations, transit, and essentials near your stay.</p>
                  </div>
                </div>
              </div>

              <div className="row g-0">
                {/* Left Side: Map */}
                <div className="col-md-7 border-end position-relative" style={{ minHeight: '450px' }}>
                  <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
                    <PropertyMap 
                      properties={[property]} 
                      center={{ lat: property.latitude || property.location?.lat || property.lat, lng: property.longitude || property.location?.lng || property.lng }} 
                      zoom={15} 
                      height="100%" 
                    />
                  </div>
                  <div className="position-absolute bottom-0 end-0 m-3" style={{ zIndex: 10 }}>
                     <button className="btn btn-light shadow-sm btn-sm fw-bold px-3 py-2" onClick={() => setShowLargeMap(true)}>
                       <i className="fas fa-expand me-1"></i> View Large Map
                     </button>
                  </div>
                </div>

                {/* Right Side: Nearby Places List */}
                <div className="col-md-5 d-flex flex-column" style={{ height: '450px' }}>
                  {/* List (No Tabs) */}
                  <div className="overflow-auto p-4 flex-grow-1 bg-white">
                    {(() => {
                      let places = property.nearbyPlaces && property.nearbyPlaces.length > 0 
                         ? property.nearbyPlaces.map(p => ({
                             name: p.name,
                             distance: p.distance,
                             time: p.time || `${Math.ceil(parseFloat(p.distance) * 3)} min drive`,
                             type: p.type || 'Location'
                         }))
                         : [];
                      
                      const displayPlaces = places;

                      if (displayPlaces.length === 0) {
                        return (
                          <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center h-100" style={{ backgroundColor: '#f8fafc', borderRadius: '1rem', border: '2px dashed #e2e8f0' }}>
                            <div className="mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: '64px', height: '64px', backgroundColor: '#f1f5f9', color: '#94a3b8' }}>
                              <i className="fas fa-map-marked-alt" style={{ fontSize: '1.75rem' }}></i>
                            </div>
                            <h5 className="text-dark fw-bold mb-2" style={{ letterSpacing: '-0.3px' }}>No Places Found</h5>
                            <p className="text-muted small mb-0" style={{ maxWidth: '200px' }}>Nearby locations haven't been added for this property yet.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="d-flex flex-column gap-2 mt-2">
                           {displayPlaces.map((place, idx) => {
                             let iconClass = 'fa-map-marker-alt';
                             let iconColor = '#64748b';
                             let bgColor = '#f8fafc';
                             const nameLower = place.name.toLowerCase();
                             if (nameLower.includes('bus') || nameLower.includes('train') || nameLower.includes('station')) {
                               iconClass = 'fa-bus'; iconColor = '#ea580c'; bgColor = '#fff7ed';
                             } else if (nameLower.includes('mall') || nameLower.includes('market') || nameLower.includes('shop') || nameLower.includes('supermarket')) {
                               iconClass = 'fa-shopping-bag'; iconColor = '#10b981'; bgColor = '#ecfdf5';
                             } else if (nameLower.includes('hospital') || nameLower.includes('clinic') || nameLower.includes('aiims')) {
                               iconClass = 'fa-hospital'; iconColor = '#ef4444'; bgColor = '#fef2f2';
                             } else if (nameLower.includes('college') || nameLower.includes('school') || nameLower.includes('university') || nameLower.includes('institute')) {
                               iconClass = 'fa-graduation-cap'; iconColor = '#8b5cf6'; bgColor = '#f5f3ff';
                             } else if (nameLower.includes('park') || nameLower.includes('garden')) {
                               iconClass = 'fa-tree'; iconColor = '#84cc16'; bgColor = '#f7fee7';
                             } else if (nameLower.includes('office') || nameLower.includes('tech') || nameLower.includes('it park') || nameLower.includes('tcs')) {
                               iconClass = 'fa-briefcase'; iconColor = '#3b82f6'; bgColor = '#eff6ff';
                             }

                             return (
                               <div 
                                 key={idx} 
                                 className="d-flex justify-content-between align-items-center p-3 rounded-4 border bg-white" 
                                 style={{ borderColor: '#e2e8f0', transition: 'all 0.2s ease', cursor: 'default' }} 
                                 onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#cbd5e1'; }} 
                                 onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                               >
                                 <div className="d-flex align-items-center gap-3">
                                   <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '42px', height: '42px', backgroundColor: bgColor, color: iconColor }}>
                                     <i className={`fas ${iconClass}`} style={{ fontSize: '1.1rem' }}></i>
                                   </div>
                                   <span className="text-dark fw-bold" style={{ fontSize: '0.95rem', letterSpacing: '-0.3px' }}>{place.name}</span>
                                 </div>
                                 <div className="badge px-3 py-2 rounded-pill" style={{ backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '600' }}>
                                   {place.distance} km
                                 </div>
                               </div>
                             );
                           })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="ho-section-card" id="reviews" style={{ marginBottom: '8px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="ho-section-title mb-0">Ratings & Reviews</h3>
                <button className="ho-btn-outline-primary btn-sm" onClick={() => {
                  if (!authService.isAuthenticated()) {
                    openAuthModal(() => setShowReviewModal(true));
                  } else {
                    setShowReviewModal(true);
                  }
                }}>
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

            {/* Similar Properties Tab Section */}
            <div className="ho-section-card" id="similar" style={{ marginBottom: '8px' }}>
              <h3 className="ho-section-title">Similar Properties</h3>
              <div className="d-flex gap-4 custom-scrollbar" style={{ overflowX: 'auto', paddingBottom: '15px' }}>
                {getSimilarProperties().map(related => (
                  <div 
                    key={related._id} 
                    className="ho-related-card flex-shrink-0"
                    onClick={() => {
                      navigate(`/property/${related._id}`);
                      window.scrollTo(0,0);
                    }}
                    style={{ width: '300px', cursor: 'pointer', background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div className="related-img-box" style={{height: '180px', position: 'relative'}}>
                      <img src={related.images?.[0]?.url || related.coverImage || 'https://placehold.co/300x200?text=Property'} alt={related.pgName} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      <div className="related-badge" style={{position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', color: '#f97316', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>{related.propertyType || 'PG'}</div>
                    </div>
                    <div className="related-info" style={{padding: '15px'}}>
                      <h6 style={{fontWeight: 700, marginBottom: '8px', fontSize: '1.05rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{related.pgName || related.title}</h6>
                      <p style={{color: '#64748b', fontSize: '0.85rem', marginBottom: '12px'}}><i className="fas fa-map-marker-alt text-orange me-1" style={{color: '#f97316'}}></i> {related.location?.area || related.location?.city || 'Location'}</p>
                      <div className="related-price" style={{fontSize: '1.2rem', fontWeight: 800, color: '#f97316'}}>₹{getPropertyMinPrice(related).toLocaleString()} <span style={{fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500}}>/mo</span></div>
                    </div>
                  </div>
                ))}
              </div>
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
            center={{ lat: property.latitude || property.location?.lat || property.lat, lng: property.longitude || property.location?.lng || property.lng }} 
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
      </main>

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

      {/* Lightbox Modal for Images */}
      <Modal 
        show={showLightbox} 
        onHide={() => setShowLightbox(false)} 
        centered 
        size="xl" 
        contentClassName="bg-transparent border-0"
      >
        <Modal.Header closeButton closeVariant="white" className="border-0 pb-0" style={{ position: 'absolute', top: '0px', right: '10px', zIndex: 1050, background: 'rgba(0,0,0,0.5)', borderRadius: '50%' }}>
          <Modal.Title className="text-white d-none">{getDisplayName()} - Photos</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex align-items-center justify-content-center w-100" style={{ height: '80vh' }}>
          <Carousel 
            interval={null} 
            activeIndex={activeImageIndex}
            onSelect={(idx) => setActiveImageIndex(idx)}
            className="w-100 h-100 d-flex align-items-center"
            fade={false}
          >
            {getImagesArray().map((img, idx) => (
              <Carousel.Item key={idx} className="h-100">
                <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center position-relative">
                  <img 
                    src={img.url} 
                    alt={`${getDisplayName()} - ${idx + 1}`} 
                    style={{ maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain' }} 
                  />
                  {img.tag && (
                    <div className="position-absolute bottom-0 mb-5 px-3 py-2 bg-dark text-white rounded-3 shadow bg-opacity-75 fw-semibold" style={{ letterSpacing: '0.5px' }}>
                      {img.tag}
                    </div>
                  )}
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
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