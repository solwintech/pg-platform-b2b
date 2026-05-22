// ListingPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Spinner, Pagination, Modal } from 'react-bootstrap';
import Header from './Header';
import Footer from './Footer';
import propertyService from '../../services/propertyService';
import leadService from '../../services/leadService';
import PropertyMap from '../../components/MapComponent';
import PromotionalAd from '../../components/PromotionalAd';
import './ListingPage.css';

const ListingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { agentName: urlAgentName } = useParams();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    minPrice: location.state?.minPrice || 0,
    maxPrice: location.state?.maxPrice || 50000,
    occupancy: location.state?.occupancy || [],
    amenities: location.state?.amenities || [],
    gender: location.state?.gender || "all",
    city: location.state?.city || "",
    propertyType: location.state?.propertyType || "all",
    agentName: urlAgentName || location.state?.agentName || ""
  });

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

  const mockAmenitiesList = [
    "WiFi", "AC", "Laundry", "Housekeeping", "Power Backup", 
    "Parking", "CCTV", "Security Guard", "Lift", "RO Water", "Gym",
    "Swimming Pool", "Gaming Zone", "Study Room", "Library", "Meditation Area",
    "TV", "Refrigerator", "Microwave", "Geyser", "Washing Machine"
  ];
  
  const [currentSort, setCurrentSort] = useState("popularity");
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpStep, setOtpStep] = useState('form');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    whatsapp: ''
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

  // Check login status
  const isLoggedIn = !!localStorage.getItem('token') || !!localStorage.getItem('user');

  // Helper functions for data display
  const getPropertyMinPrice = (property) => {
    if (property.minPrice) return property.minPrice;
    if (property.pricing?.deposit) return property.pricing.deposit;
    if (property.rooms && property.rooms.length > 0) {
      return Math.min(...property.rooms.map(r => r.price));
    }
    return property.totalRooms * 1000;
  };

  const getDisplayName = (property) => {
    return property.pgName || property.title || 'Property';
  };

  const getDisplayGender = (property) => {
    if (property.genderPreference === 'male') return 'Boys only';
    if (property.genderPreference === 'female') return 'Girls only';
    if (property.genderAllowed === 'Boys') return 'Boys only';
    if (property.genderAllowed === 'Girls') return 'Girls only';
    if (property.genderAllowed === 'Unisex') return 'Co-ed';
    return 'Co-ed';
  };

  const getDisplayType = (property) => {
    return property.propertyType || property.type || 'PG';
  };

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      let sortParam = '-createdAt';
      if (currentSort === 'price_asc') sortParam = 'price';
      if (currentSort === 'price_desc') sortParam = '-price';
      if (currentSort === 'popularity') sortParam = '-views';
      if (currentSort === 'rating') sortParam = '-rating';
      if (currentSort === 'recent') sortParam = '-createdAt';
      
      const apiFilters = {
        page: currentPage,
        limit: 10,
        sort: sortParam,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        gender: filters.gender !== 'all' ? filters.gender : undefined,
        city: filters.city || undefined,
        propertyType: filters.propertyType !== 'all' ? filters.propertyType : undefined,
        agentName: filters.agentName || undefined
      };
      
      const response = await propertyService.getProperties(apiFilters);
      setProperties(response.properties || []);
      setTotal(response.total || 0);
      setTotalPages(response.pages || 1);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlAgentName) {
      setFilters(prev => ({ ...prev, agentName: urlAgentName }));
    }
  }, [urlAgentName]);

  useEffect(() => {
    fetchProperties();
  }, [filters, currentSort, currentPage]);

  const handlePriceChange = (type, value) => {
    setFilters({ ...filters, [type]: value });
  };

  const handleOccupancyChange = (value) => {
    const updated = filters.occupancy.includes(value)
      ? filters.occupancy.filter(o => o !== value)
      : [...filters.occupancy, value];
    setFilters({ ...filters, occupancy: updated });
  };

  const handleAmenitiesChange = (value) => {
    const updated = filters.amenities.includes(value)
      ? filters.amenities.filter(a => a !== value)
      : [...filters.amenities, value];
    setFilters({ ...filters, amenities: updated });
  };

  const handleGenderChange = (value) => {
    setFilters({ ...filters, gender: value });
  };

  const handleCityChange = (value) => {
    setFilters({ ...filters, city: value });
  };

  const handlePropertyTypeChange = (value) => {
    setFilters({ ...filters, propertyType: value });
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchProperties();
  };

  const handleAgentClick = (agentName) => {
    navigate(`/agent/${encodeURIComponent(agentName)}`);
  };

  const resetFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 50000,
      occupancy: [],
      amenities: [],
      gender: "all",
      city: "",
      propertyType: "all",
      agentName: ""
    });
    setCurrentPage(1);
  };

  const handleSortChange = (sortType) => {
    setCurrentSort(sortType);
    setCurrentPage(1);
  };

  const openOtpModal = (property, action) => {
    if (!isLoggedIn) {
      alert("Please login to continue");
      navigate('/auth', { state: { from: location.pathname } });
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
    setContactForm({
      name: '',
      email: '',
      whatsapp: ''
    });
    setShowOtpModal(true);
  };

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
    if (!contactForm.whatsapp.trim() || !/^\d{10}$/.test(contactForm.whatsapp)) {
      alert('Please enter a valid 10-digit WhatsApp number');
      return;
    }

    setIsLoading(true);
    
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpTimer(60);
    
    console.log(`OTP for ${contactForm.whatsapp}: ${newOtp}`);
    
    setOtpStep('otp');
    setIsLoading(false);
    
    alert(`Demo OTP: ${newOtp}\n(Check console for OTP)`);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter the 6-digit OTP');
      return;
    }

    if (otp !== generatedOtp) {
      alert('Invalid OTP. Please try again.');
      return;
    }

    setIsLoading(true);
    
    try {
      let leadData = {
        propertyId: selectedProperty._id,
        actionType: actionType,
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.whatsapp
      };

      if (actionType === 'enquiry') {
        leadData.enquiryMessage = enquiryMessage || 'General enquiry about property';
        leadData.roomType = roomType;
        leadData.moveInDate = moveInDate;
        leadData.stayDuration = stayDuration;
      } else if (actionType === 'visit') {
        leadData.visitDate = visitDate;
        leadData.visitTime = visitTime;
      } else if (actionType === 'callback') {
        leadData.preferredCallbackTime = callbackTime || 'ASAP';
      }

      // Logic: Only send mobile number if B2B has an active plan
      if (!selectedProperty.b2bActivePlan) {
        console.log("B2B plan inactive. Masking phone number in lead data.");
        // leadData.phone = "MASKED"; // Example of policy enforcement
      }

      await leadService.createLead(leadData);
      
      setOtpStep('success');
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      alert('Something went wrong. Please try again.');
      setIsLoading(false);
    }
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
    setShowOtpModal(false);
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
      case 'enquiry': return 'Send Enquiry';
      case 'visit': return 'Schedule a Visit';
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
      case 'enquiry': 
        return 'Your enquiry has been sent successfully! The agent/owner will respond shortly with availability details.';
      case 'visit':
        return `Your visit has been scheduled for ${visitDate} at ${visitTime}. A confirmation email has been sent to ${contactForm.email}.`;
      case 'callback': 
        return 'Your callback request has been sent! The owner will call you at your preferred time.';
      default: 
        return 'Request sent successfully!';
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/property/${id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="listing-page">
        <Header />
        <Container className="py-5">
          <div className="text-center py-5">
            <Spinner animation="border" variant="warning" style={{ width: '2.5rem', height: '2.5rem' }} />
            <p className="mt-3 text-muted">Loading properties...</p>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="listing-page">
      <Header />
      
      <Container fluid className="px-lg-4 py-3">
        <Button 
          variant="warning" 
          className="d-lg-none mb-2 w-100"
          onClick={() => setShowFilters(!showFilters)}
        >
          <i className="fas fa-filter me-2"></i>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>

        <Row className="g-3 align-items-start">
          {!urlAgentName && (
            <Col lg={3} md={4} className={`filter-sidebar ${showFilters ? 'd-block' : 'd-none d-lg-block'}`}>
              <Card className="filter-card overflow-hidden">


                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="filter-header mb-0">
                      <i className="fas fa-sliders-h me-2"></i> Filters
                    </h5>
                    <Button 
                      variant="link" 
                      className="reset-filters-btn p-0"
                      onClick={resetFilters}
                    >
                      Reset All
                    </Button>
                  </div>
                  
                  <div className="mb-3">
                    <Form.Control 
                      type="text" 
                      placeholder="Enter city name"
                      value={filters.city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="filter-input"
                    />
                  </div>

                  <div className="mb-3">
                    <Form.Select 
                      value={filters.propertyType}
                      onChange={(e) => handlePropertyTypeChange(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Property Types</option>
                      <option value="PG">PG</option>
                      <option value="Hostel">Hostel</option>
                      <option value="Home Stay">Home Stay</option>
                      <option value="Service Apartment">Service Apartment</option>
                    </Form.Select>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="filter-section-title">Budget (₹{filters.minPrice} - ₹{filters.maxPrice})</h6>
                    <div className="range-container px-2">
                      <Form.Range 
                        min={0}
                        max={100000}
                        step={500}
                        value={filters.maxPrice}
                        onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                        className="custom-range"
                      />
                      <div className="d-flex justify-content-between mt-2">
                        <Form.Control 
                          type="number" 
                          size="sm"
                          placeholder="Min" 
                          className="price-input-sm"
                          value={filters.minPrice}
                          onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                          style={{ width: '80px' }}
                        />
                        <Form.Control 
                          type="number" 
                          size="sm"
                          placeholder="Max" 
                          className="price-input-sm"
                          value={filters.maxPrice}
                          onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                          style={{ width: '80px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="filter-section-title">Room Type / Occupancy</h6>
                    <div className="d-flex flex-wrap gap-2 filter-scroll-area">
                      {getOccupancyOptions(filters.propertyType).map(occ => (
                        <span 
                          key={occ}
                          className={`filter-chip ${filters.occupancy.includes(occ) ? 'active' : ''}`}
                          onClick={() => handleOccupancyChange(occ)}
                        >
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="filter-section-title">Amenities</h6>
                    <div className="d-flex flex-wrap gap-2 filter-scroll-area" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                      {mockAmenitiesList.map(amenity => (
                        <span 
                          key={amenity}
                          className={`filter-chip ${filters.amenities.includes(amenity) ? 'active' : ''}`}
                          onClick={() => handleAmenitiesChange(amenity)}
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="filter-section-title">Gender Preference</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {[
                        { value: "all", label: "All Genders" },
                        { value: "male", label: "Boys Only" },
                        { value: "female", label: "Girls Only" },
                        { value: "any", label: "Co-ed" }
                      ].map(option => (
                        <span 
                          key={option.value}
                          className={`filter-chip ${filters.gender === option.value ? 'active' : ''}`}
                          onClick={() => handleGenderChange(option.value)}
                        >
                          {option.label}
                        </span>
                      ))}
                    </div>
                  </div>

                </Card.Body>
                <div className="filter-footer sticky-bottom bg-white p-3 border-top">
                  <Button 
                    className="apply-filters-btn w-100"
                    onClick={applyFilters}
                  >
                    <i className="fas fa-search me-2"></i> Apply Filters
                  </Button>
                </div>
              </Card>

              <PromotionalAd location="listing_sidebar" className="mt-3" />
            </Col>
          )}

          <Col lg={urlAgentName ? 10 : 9} md={urlAgentName ? 12 : 8} className={urlAgentName ? "mx-auto" : ""}>
            {urlAgentName ? (
              <div className="agent-header mb-4 p-4 bg-white rounded-3 shadow-sm border-start border-warning border-5">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h2 className="mb-1 fw-bold text-dark">Properties by {urlAgentName}</h2>
                    <p className="text-muted mb-0">Discover all premium listings managed by {urlAgentName}</p>
                  </div>
                  <Button variant="outline-warning" onClick={() => navigate('/listings')} size="sm">
                    <i className="fas fa-arrow-left me-2"></i> Back to All
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="sorting-card mb-3">
                <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div className="d-flex gap-2 flex-wrap">
                    <span className="fw-semibold">Sort by:</span>
                    <button 
                      className={`sort-btn ${currentSort === 'price_asc' ? 'sort-btn-active' : ''}`}
                      onClick={() => handleSortChange('price_asc')}
                    >
                      Price: Low to High
                    </button>
                    <button 
                      className={`sort-btn ${currentSort === 'price_desc' ? 'sort-btn-active' : ''}`}
                      onClick={() => handleSortChange('price_desc')}
                    >
                      Price: High to Low
                    </button>
                    <button 
                      className={`sort-btn ${currentSort === 'popularity' ? 'sort-btn-active' : ''}`}
                      onClick={() => handleSortChange('popularity')}
                    >
                      Most Viewed
                    </button>
                    <button 
                      className={`sort-btn ${currentSort === 'rating' ? 'sort-btn-active' : ''}`}
                      onClick={() => handleSortChange('rating')}
                    >
                      Top Rated
                    </button>
                    <button 
                      className={`sort-btn ${currentSort === 'recent' ? 'sort-btn-active' : ''}`}
                      onClick={() => handleSortChange('recent')}
                    >
                      Recently Added
                    </button>
                  </div>
                  
                  <div className="d-flex align-items-center gap-3">
                    <div className="view-toggle-btns d-flex bg-light p-1 rounded-3">
                      <button 
                        className={`btn btn-sm ${viewMode === 'list' ? 'btn-warning shadow-sm' : 'btn-light'}`}
                        onClick={() => setViewMode('list')}
                      >
                        <i className="fas fa-list me-1"></i> List
                      </button>
                      <button 
                        className={`btn btn-sm ${viewMode === 'map' ? 'btn-warning shadow-sm' : 'btn-light'}`}
                        onClick={() => setViewMode('map')}
                      >
                        <i className="fas fa-map-marked-alt me-1"></i> Map
                      </button>
                    </div>
                    <div className="result-count">
                      <i className="fas fa-building me-1"></i> {total} properties
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            {viewMode === 'map' ? (
              <div className="map-view-container mb-4" style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
                <PropertyMap 
                  properties={properties} 
                  height="100%" 
                  center={properties.length > 0 && properties[0].location?.lat ? { lat: properties[0].location.lat, lng: properties[0].location.lng } : null}
                  zoom={12}
                />
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
              {properties.length === 0 ? (
                <Card className="text-center p-5">
                  <i className="fas fa-search fa-3x text-muted mb-3"></i>
                  <h5>No properties found</h5>
                  <p className="text-muted">Try adjusting your filters</p>
                  <Button variant="warning" onClick={resetFilters} className="mt-2">
                    Reset Filters
                  </Button>
                </Card>
              ) : (
                properties.map(property => (
                  <Card key={property._id} className="property-card ho-dense-card">
                    <div className="d-flex flex-column flex-md-row p-3 gap-3">
                      
                      {/* Left: Image Container */}
                      <div className="dense-image-container">
                        <div 
                          className="dense-image"
                          style={{ 
                            backgroundImage: `url(${property.images?.[0]?.url || property.coverImage || 'https://placehold.co/400x300/FFF3E0/FF8C42?text=Property'})`,
                          }}
                        >
                          <span className="dense-image-badge">{getDisplayType(property)}</span>
                        </div>
                        <div className="dense-photo-count">
                          <i className="fas fa-camera"></i> {property.images?.length || 1}
                        </div>
                      </div>

                      {/* Right: Details Container */}
                      <div className="dense-details-container flex-grow-1">
                        
                        {/* Top Row: Title & Price */}
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="pe-3">
                            <h5 className="dense-title mb-1 text-truncate" title={getDisplayName(property)}>
                              {getDisplayName(property)}
                            </h5>
                            <div className="dense-sub-title text-truncate">
                              {property.pgName ? `PG Name: ${property.pgName}` : `Location: ${property.location?.area || property.location?.city}`}
                            </div>
                          </div>
                          <div className="text-end shrink-0">
                            <div className="dense-price">₹ {getPropertyMinPrice(property).toLocaleString()}</div>
                            <div className="dense-price-sub">per month <a href="#" className="small-link ms-1">Charges</a></div>
                          </div>
                        </div>

                        {/* Info Grid Bar */}
                        <div className="dense-info-bar mb-3">
                          <div className="info-cell">
                            <span className="info-label">Total Rooms</span>
                            <span className="info-value">{property.totalRooms || 1} Units</span>
                          </div>
                          <div className="info-cell">
                            <span className="info-label">Status</span>
                            <span className="info-value text-dark">Available</span>
                          </div>
                          <div className="info-cell">
                            <span className="info-label">Gender</span>
                            <span className="info-value">{getDisplayGender(property)}</span>
                          </div>
                          <div className="info-cell">
                            <span className="info-label">Food Included</span>
                            <span className="info-value">{property.amenities?.includes('Meals') ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="info-cell">
                            <span className="info-label">Furnishing</span>
                            <span className="info-value">{property.furnishingStatus || 'Semi'}</span>
                          </div>
                          <div className="info-cell">
                            <span className="info-label">Air Conditioning</span>
                            <span className="info-value">{property.acStatus || 'Non AC'}</span>
                          </div>
                        </div>

                        {/* Description Text */}
                        <div className="dense-desc-text text-truncate mb-2">
                          This {getDisplayType(property)} located in {property.location?.area}, {property.location?.city} offers great amenities including {(property.amenities || []).slice(0,3).join(', ')}... <span className="dense-more-link" onClick={() => handleViewDetails(property._id)}>More</span>
                        </div>

                      </div>
                    </div>

                    {/* Full Width Footer */}
                    <div className="dense-card-footer">
                      <div className="footer-date">
                        Posted on {new Date(property.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      
                      <div className="footer-actions d-flex align-items-center gap-2 gap-md-3">
                        <span className="footer-owner-name" onClick={() => handleAgentClick(property.agentName)}>
                          Posted by: <u style={{ color: '#f15a29' }}>{property.agentName || 'Arjun Rao'}</u>
                        </span>
                        
                        <div className="d-flex gap-2 ms-auto flex-wrap justify-content-end">
                          <button 
                            className="dense-btn-outline d-none d-lg-inline-block"
                            onClick={() => handleViewDetails(property._id)}
                          >
                            View Details
                          </button>
                          <button 
                            className="dense-btn-outline"
                            onClick={() => openOtpModal(property, 'enquiry')}
                          >
                            Enquire Now
                          </button>
                          <button 
                            className="dense-btn-outline"
                            onClick={() => openOtpModal(property, 'visit')}
                          >
                            Schedule Visit
                          </button>
                          <button 
                            className="dense-btn-solid"
                            onClick={() => openOtpModal(property, 'call')}
                          >
                            Contact Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
              
              <PromotionalAd location="listing_bottom" className="mt-4" />
              </div>
            )}

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination>
                  <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                  <span className="px-3 py-1">{currentPage} / {totalPages}</span>
                  <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                </Pagination>
              </div>
            )}

            <PromotionalAd location="listing_bottom" className="mt-5" />
          </Col>
        </Row>
      </Container>

      <Modal show={showOtpModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{getActionTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {otpStep === 'form' && (
            <div>
              <Form.Control
                type="text"
                name="name"
                placeholder="Full Name"
                value={contactForm.name}
                onChange={handleContactFormChange}
                className="mb-3"
              />
              <Form.Control
                type="email"
                name="email"
                placeholder="Email Address"
                value={contactForm.email}
                onChange={handleContactFormChange}
                className="mb-3"
              />
              <Form.Control
                type="tel"
                name="whatsapp"
                placeholder="WhatsApp Number"
                value={contactForm.whatsapp}
                onChange={handleContactFormChange}
                className="mb-3"
                maxLength="10"
              />
              {actionType === 'enquiry' && (
                <>
                  <Form.Select 
                    className="mb-3"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                  >
                    <option value="">Select Room Type</option>
                    {getOccupancyOptions(selectedProperty?.propertyType).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </Form.Select>
                  <div className="row mb-3">
                    <div className="col-6">
                      <Form.Label className="small text-muted mb-1">Move-in Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <Form.Label className="small text-muted mb-1">Stay Duration</Form.Label>
                      <Form.Select
                        value={stayDuration}
                        onChange={(e) => setStayDuration(e.target.value)}
                      >
                        <option value="">Duration</option>
                        <option value="1 month">1 Month</option>
                        <option value="3 months">3 Months</option>
                        <option value="6 months">6 Months</option>
                        <option value="1 year+">1 Year+</option>
                      </Form.Select>
                    </div>
                  </div>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Your message..."
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    className="mb-3"
                  />
                </>
              )}
              {actionType === 'visit' && (
                <>
                  <div className="alert alert-info py-2 small mb-3">
                    <i className="fas fa-clock me-2"></i>
                    Available timings: {selectedProperty?.visitTimings || '10:00 AM - 06:00 PM'}
                  </div>
                  <Form.Control
                    type="date"
                    className="mb-3"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                  />
                  <Form.Select
                    className="mb-3"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                  >
                    <option value="">Select Timing</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </Form.Select>
                </>
              )}
              {actionType === 'callback' && (
                <Form.Control
                  type="text"
                  placeholder="Preferred time (e.g., Tomorrow 10 AM - 12 PM)"
                  value={callbackTime}
                  onChange={(e) => setCallbackTime(e.target.value)}
                  className="mb-3"
                />
              )}
              <button className="btn-otp-send w-100" onClick={handleSendOtp} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          )}

          {otpStep === 'otp' && (
            <div>
              <p className="text-muted mb-3">OTP sent to {contactForm.whatsapp}</p>
              <Form.Control
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center mb-3"
                maxLength="6"
              />
              <div className="text-center mb-3">
                {otpTimer > 0 ? (
                  <span className="text-muted">Resend OTP in {otpTimer}s</span>
                ) : (
                  <button className="btn-resend" onClick={handleResendOtp}>Resend OTP</button>
                )}
              </div>
              <button className="btn-otp-verify w-100" onClick={handleVerifyOtp} disabled={isLoading || otp.length !== 6}>
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </div>
          )}

          {otpStep === 'success' && (
            <div className="text-center">
              <i className="fas fa-check-circle text-success fs-1 mb-3"></i>
              <h5>Verification Successful!</h5>
              <p className="text-muted mt-2">{getSuccessMessage()}</p>
              <button className="btn-close-modal w-100 mt-3" onClick={handleCloseModal}>Close</button>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Footer />

      <style>{`
        .filter-chip {
          display: inline-block;
          padding: 0.35rem 1rem;
          font-size: 0.8rem;
          font-weight: 500;
          background: #f1f5f9;
          color: #475569;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-chip.active {
          background: #f97316;
          color: white;
        }
        .filter-chip:hover {
          background: #e2e8f0;
        }
        .filter-section-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.75rem;
        }
        .filter-input, .filter-select, .price-input {
          font-size: 0.85rem;
          padding: 0.5rem 0.75rem;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
        .property-image {
          height: 100%;
          min-height: 160px;
          background-size: cover;
          background-position: center;
          position: relative;
          border-radius: 16px 0 0 16px;
        }
        @media (max-width: 768px) {
          .property-image {
            min-height: 140px;
            border-radius: 16px 16px 0 0;
          }
        }
        .image-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(0, 0, 0, 0.7);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
        }
        .price {
          font-size: 1.5rem;
          font-weight: 800;
          color: #f97316;
        }
        .price-period {
          font-size: 0.8rem;
          color: #64748b;
        }
        .rating {
          background: #10b981;
          color: white;
          padding: 0.25rem 0.6rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .property-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
        }
        .location {
          font-size: 0.8rem;
          color: #64748b;
        }
        .info-tag {
          font-size: 0.75rem;
          color: #475569;
        }
        .amenity-tag {
          background: #f1f5f9;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          color: #475569;
        }
        .btn-detail, .btn-call, .btn-enquiry {
          padding: 0.4rem 1rem;
          font-size: 0.8rem;
          border-radius: 30px;
          border: none;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-detail {
          background: #f1f5f9;
          color: #1e293b;
        }
        .btn-call {
          background: #f97316;
          color: white;
        }
        .btn-enquiry {
          background: #25D366;
          color: white;
        }
        .btn-detail:hover, .btn-call:hover, .btn-enquiry:hover {
          opacity: 0.85;
        }
        .sort-btn {
          padding: 0.35rem 1rem;
          font-size: 0.8rem;
          border-radius: 30px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
        }
        .sort-btn-active {
          background: #f97316;
          color: white;
          border: none;
        }
        .result-count {
          font-size: 0.85rem;
          background: #f1f5f9;
          padding: 0.35rem 1rem;
          border-radius: 30px;
        }
        .btn-otp-send, .btn-otp-verify {
          background: #f97316;
          border: none;
          padding: 0.6rem;
          font-size: 0.9rem;
          border-radius: 10px;
          font-weight: 600;
          color: white;
        }
        .btn-resend {
          background: none;
          border: none;
          color: #f97316;
          font-size: 0.8rem;
        }
        .btn-close-modal {
          background: #f1f5f9;
          border: none;
          padding: 0.6rem;
          font-size: 0.9rem;
          border-radius: 10px;
          color: #475569;
        }
      `}</style>
    </div>
  );
};

export default ListingPage;