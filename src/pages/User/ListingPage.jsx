// ListingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Spinner, Pagination, Modal, Dropdown } from 'react-bootstrap';
import Header from './Header';
import Footer from './Footer';
import propertyService from '../../services/propertyService';
import leadService from '../../services/leadService';
import PropertyMap from '../../components/MapComponent';
import PromotionalAd from '../../components/PromotionalAd';
import './ListingPage.css';
import authService from '../../services/authService';
import { useAuthModal } from '../../context/AuthModalContext';
import { useGoogleMaps } from '../../context/GoogleMapsContext';
import { Autocomplete } from '@react-google-maps/api';
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

const getVisitingHoursText = (property) => {
  if (!property?.visitingHours) return '10:00 AM - 06:00 PM (All Days)';
  
  const { availableDays, startTime, endTime } = property.visitingHours;
  const formattedStart = formatTime12hr(startTime);
  const formattedEnd = formatTime12hr(endTime);
  
  let daysText = 'All Days';
  if (availableDays && Array.isArray(availableDays) && availableDays.length > 0) {
    const daysOfWeekOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    // Sort selected days in standard calendar order
    const sortedDays = [...availableDays].sort((a, b) => daysOfWeekOrder.indexOf(a) - daysOfWeekOrder.indexOf(b));
    // Display as neat, abbreviated list
    daysText = sortedDays.map(d => d.substring(0, 3)).join(', ');
  }
  
  return `${formattedStart} - ${formattedEnd} (${daysText})`;
};

const ListingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { agentName: urlAgentName } = useParams();
  const { openAuthModal } = useAuthModal();
  const cityAutocompleteRef = useRef(null);
  const { isLoaded } = useGoogleMaps();
  
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
    city: location.state?.city || localStorage.getItem('selected_city') || "",
    propertyType: location.state?.propertyType || "all",
    agentName: urlAgentName || location.state?.agentName || ""
  });

  const [appliedFilters, setAppliedFilters] = useState({
    minPrice: location.state?.minPrice || 0,
    maxPrice: location.state?.maxPrice || 50000,
    occupancy: location.state?.occupancy || [],
    amenities: location.state?.amenities || [],
    gender: location.state?.gender || "all",
    city: location.state?.city || localStorage.getItem('selected_city') || "",
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
  
  const [currentSort, setCurrentSort] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [showAllOccupancy, setShowAllOccupancy] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPropertyForReviews, setSelectedPropertyForReviews] = useState(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
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


  // Check login status
  const [userLoggedIn, setUserLoggedIn] = useState(!!localStorage.getItem('token') || !!localStorage.getItem('user'));

  // Helper functions for data display
  const getPropertyMinPrice = (property) => {
    if (property.minPrice) return property.minPrice;
    if (property.pricing?.deposit) return property.pricing.deposit;
    const rooms = property.roomTypes || property.rooms;
    if (rooms && rooms.length > 0) {
      return Math.min(...rooms.map(r => Number(r.price) || 0));
    }
    return property.totalRooms * 1000;
  };

  const getDisplayName = (property) => {
    return property.pgName || property.title || 'Property';
  };

  const getDisplayGender = (property) => {
    if (property.genderPreference === 'male') return 'Boys only';
    if (property.genderPreference === 'female') return 'Girls only';
    if (property.genderAllowed === 'Boys' || property.genderAllowed === 'Boys Only') return 'Boys only';
    if (property.genderAllowed === 'Girls' || property.genderAllowed === 'Girls Only') return 'Girls only';
    if (property.genderAllowed === 'Unisex' || property.genderAllowed === 'Co-ed') return 'Co-ed';
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
      // Fetch all properties to filter locally
      const response = await propertyService.getProperties({ public: true }, false);
      let fetchedProperties = response.properties || [];

      // Apply local filters
      if (appliedFilters.city && appliedFilters.city.toLowerCase() !== 'all india') {
        fetchedProperties = fetchedProperties.filter(p => {
          const cityString = (p.city || p.location?.city || '').toLowerCase();
          const searchCity = appliedFilters.city.toLowerCase();
          
          if (!cityString || !searchCity) return false;
          
          return cityString.includes(searchCity) || 
                 searchCity.includes(cityString) || 
                 (cityString === 'bangalore' && searchCity === 'bengaluru') ||
                 (cityString === 'bengaluru' && searchCity === 'bangalore');
        });
      }
      if (appliedFilters.propertyType && appliedFilters.propertyType !== 'all') {
        fetchedProperties = fetchedProperties.filter(p => p.propertyType === appliedFilters.propertyType);
      }
      if (appliedFilters.gender && appliedFilters.gender !== 'all') {
        fetchedProperties = fetchedProperties.filter(p => {
          if (appliedFilters.gender === 'male') {
            return p.genderPreference === 'male' || p.genderAllowed === 'Boys' || p.genderAllowed === 'Boys Only';
          }
          if (appliedFilters.gender === 'female') {
            return p.genderPreference === 'female' || p.genderAllowed === 'Girls' || p.genderAllowed === 'Girls Only';
          }
          if (appliedFilters.gender === 'any') {
            return p.genderPreference === 'any' || p.genderAllowed === 'Unisex' || p.genderAllowed === 'Co-ed' || p.genderAllowed === 'Unisex / Co-ed';
          }
          return true;
        });
      }
      if (appliedFilters.agentName) {
        fetchedProperties = fetchedProperties.filter(p => p.agentName === appliedFilters.agentName);
      }
      if (appliedFilters.minPrice !== undefined) {
        fetchedProperties = fetchedProperties.filter(p => getPropertyMinPrice(p) >= appliedFilters.minPrice);
      }
      if (appliedFilters.maxPrice !== undefined) {
        fetchedProperties = fetchedProperties.filter(p => getPropertyMinPrice(p) <= appliedFilters.maxPrice);
      }
      if (appliedFilters.amenities?.length > 0) {
        fetchedProperties = fetchedProperties.filter(p => 
          appliedFilters.amenities.every(a => p.amenities && p.amenities.includes(a))
        );
      }
      if (appliedFilters.occupancy?.length > 0) {
        fetchedProperties = fetchedProperties.filter(p => 
          p.roomTypes && p.roomTypes.some(r => appliedFilters.occupancy.includes(r.sharingType) || appliedFilters.occupancy.includes(r.name))
        );
      }

      // Sort locally
      if (currentSort === 'price_asc') {
        fetchedProperties.sort((a, b) => getPropertyMinPrice(a) - getPropertyMinPrice(b));
      } else if (currentSort === 'price_desc') {
        fetchedProperties.sort((a, b) => getPropertyMinPrice(b) - getPropertyMinPrice(a));
      } else if (currentSort === 'popularity') {
        fetchedProperties.sort((a, b) => (b.views || 0) - (a.views || 0));
      } else if (currentSort === 'rating') {
        fetchedProperties.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else {
        // default recent
        fetchedProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setTotal(fetchedProperties.length);
      setTotalPages(Math.ceil(fetchedProperties.length / 10) || 1);
      
      // Pagination locally
      const startIndex = (currentPage - 1) * 10;
      const paginatedProperties = fetchedProperties.slice(startIndex, startIndex + 10);
      
      setProperties(paginatedProperties);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlAgentName) {
      setFilters(prev => ({ ...prev, agentName: urlAgentName }));
      setAppliedFilters(prev => ({ ...prev, agentName: urlAgentName }));
    }
  }, [urlAgentName]);

  useEffect(() => {
    let eventSource = null;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://staysorted.in/api/v1' : 'http://localhost:5000/api/v1');
      eventSource = new EventSource(`${apiUrl}/events/stream`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'property_approved') {
            const newProperty = data.payload;
            setProperties(prev => {
              if (!prev.find(p => p._id === newProperty._id)) {
                return [newProperty, ...prev];
              }
              return prev;
            });
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
  }, []);

  useEffect(() => {
    const handleCityChange = (e) => {
      if (e.detail) {
        setFilters(prev => ({ ...prev, city: e.detail }));
        setAppliedFilters(prev => ({ ...prev, city: e.detail }));
        setCurrentPage(1);
      }
    };
    window.addEventListener('city-changed', handleCityChange);
    return () => window.removeEventListener('city-changed', handleCityChange);
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [appliedFilters, currentSort, currentPage]);

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

  const onCityPlaceChanged = () => {
    if (cityAutocompleteRef.current !== null) {
      const place = cityAutocompleteRef.current.getPlace();
      if (place && place.name) {
        setFilters(prev => ({ ...prev, city: place.name }));
      }
    }
  };

  const handlePropertyTypeChange = (value) => {
    setFilters({ ...filters, propertyType: value });
  };

  const applyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters(filters);
    
    const cityToSave = filters.city || 'All India';
    localStorage.setItem('selected_city', cityToSave);
    window.dispatchEvent(new CustomEvent('city-changed', { detail: cityToSave }));
  };

  const handleAgentClick = (agentName) => {
    navigate(`/agent/${encodeURIComponent(agentName)}`);
  };

  const resetFilters = () => {
    const defaultFilters = {
      minPrice: 0,
      maxPrice: 50000,
      occupancy: [],
      amenities: [],
      gender: "all",
      city: "",
      propertyType: "all",
      agentName: ""
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setCurrentPage(1);
    
    localStorage.setItem('selected_city', 'All India');
    window.dispatchEvent(new CustomEvent('city-changed', { detail: 'All India' }));
  };

  const handleSortChange = (sortType) => {
    setCurrentSort(sortType);
    setCurrentPage(1);
  };

  const openOtpModal = async (property, action) => {
    if (!authService.isAuthenticated()) {
      openAuthModal(() => {
        openOtpModal(property, action);
      });
      return;
    }
    
    setUserLoggedIn(true);

    if (authService.isAuthenticated() && action === 'contact') {
      setSelectedProperty(property);
      setActionType('contact');
      setOtpStep('success');
      setShowOtpModal(true);
      
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
    
    // Pre-fill contact form if user is logged in
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
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      alert('Something went wrong. Please try again.');
      setIsLoading(false);
    }
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
    } catch (error) {
      console.error('Failed to submit directly:', error);
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

  const handleViewDetails = (property) => {
    navigate(`/property/${property.slug || property._id}`);
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
    <div className="listing-page" style={{ overflowX: 'hidden' }}>
      <SEO 
        title={`Find PGs & Hostels in ${filters.city || 'India'}`} 
        description={`Explore the best PGs, Hostels, and Service Apartments in ${filters.city || 'India'}. Filter by budget, amenities, and occupancy to find your perfect stay.`} 
      />
      <Header />
      
      <main>
      <Container fluid className="px-3 px-lg-2 py-1 listing-layout-container" style={{ overflowX: 'hidden' }}>
        <div className="d-flex justify-content-between align-items-center mb-2 d-lg-none">
          <h1 className="h5 fw-bold mb-0">Properties in {filters.city || 'India'}</h1>
          <Button 
            variant="warning" 
            onClick={() => setShowFilters(!showFilters)}
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
          >
            <i className="fas fa-filter me-2"></i>
            {showFilters ? 'Hide' : 'Filter'}
          </Button>
        </div>
        <h1 className="visually-hidden d-none d-lg-block">Properties in {filters.city || 'India'}</h1>

        <Row className="g-3 align-items-start listing-layout-row">
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
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={ref => cityAutocompleteRef.current = ref}
                        onPlaceChanged={onCityPlaceChanged}
                        options={{ types: ['(cities)'], componentRestrictions: { country: 'in' } }}
                      >
                        <Form.Control 
                          type="text" 
                          placeholder="Enter city name"
                          value={filters.city}
                          onChange={(e) => handleCityChange(e.target.value)}
                          className="filter-input"
                        />
                      </Autocomplete>
                    ) : (
                      <Form.Control 
                        type="text" 
                        placeholder="Enter city name"
                        value={filters.city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="filter-input"
                      />
                    )}
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
                      <div className="dual-range-slider">
                        <div className="slider-track"></div>
                        <div 
                          className="slider-range" 
                          style={{ 
                            left: `${(filters.minPrice / 100000) * 100}%`, 
                            right: `${100 - (filters.maxPrice / 100000) * 100}%` 
                          }}
                        ></div>
                        <input 
                          type="range" 
                          min={0} max={100000} step={500} 
                          value={filters.minPrice} 
                          onChange={(e) => {
                            const val = Math.min(Number(e.target.value), filters.maxPrice - 500);
                            handlePriceChange('minPrice', val);
                          }}
                          className="thumb thumb-left"
                        />
                        <input 
                          type="range" 
                          min={0} max={100000} step={500} 
                          value={filters.maxPrice} 
                          onChange={(e) => {
                            const val = Math.max(Number(e.target.value), filters.minPrice + 500);
                            handlePriceChange('maxPrice', val);
                          }}
                          className="thumb thumb-right"
                        />
                      </div>
                      <div className="d-flex justify-content-between mt-4">
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

                  <div className="mb-4 ">
                    <h6 className="filter-section-title">Room Type / Occupancy</h6>
                    <div className="d-flex flex-wrap  filter-scroll-area">
                      {getOccupancyOptions(filters.propertyType).slice(0, showAllOccupancy ? undefined : 6).map(occ => (
                        <span 
                          key={occ}
                          className={`filter-chip ${filters.occupancy.includes(occ) ? 'active' : ''}`}
                          onClick={() => handleOccupancyChange(occ)}
                        >
                          {occ}
                        </span>
                      ))}
                    </div>
                    {getOccupancyOptions(filters.propertyType).length > 6 && (
                      <div className="mt-3">
                        <button 
                          className="view-more-modern-btn"
                          onClick={() => setShowAllOccupancy(!showAllOccupancy)}
                        >
                          {showAllOccupancy ? (
                            <><i className="fas fa-chevron-up me-2"></i> View Less</>
                          ) : (
                            <><i className="fas fa-chevron-down me-2"></i> View More</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h6 className="filter-section-title">Amenities</h6>
                    <div className="d-flex flex-wrap  filter-scroll-area">
                      {mockAmenitiesList.slice(0, showAllAmenities ? undefined : 6).map(amenity => (
                        <span 
                          key={amenity}
                          className={`filter-chip ${filters.amenities.includes(amenity) ? 'active' : ''}`}
                          onClick={() => handleAmenitiesChange(amenity)}
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                    {mockAmenitiesList.length > 6 && (
                      <div className="mt-3">
                        <button 
                          className="view-more-modern-btn"
                          onClick={() => setShowAllAmenities(!showAllAmenities)}
                        >
                          {showAllAmenities ? (
                            <><i className="fas fa-chevron-up me-2"></i> View Less</>
                          ) : (
                            <><i className="fas fa-chevron-down me-2"></i> View More</>
                          )}
                        </button>
                      </div>
                    )}
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

          <Col lg={urlAgentName ? 9 : 7} md={urlAgentName ? 12 : 8} className={urlAgentName ? "mx-auto" : 'listing-scroll-col'}>
            {urlAgentName ? (
              <div className="agent-header mb-4 p-4 bg-white rounded-3 shadow-sm border-start border-warning border-5">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h1 className="mb-1 fw-bold text-dark h2">Properties by {urlAgentName}</h1>
                    <p className="text-muted mb-0">Discover all premium listings managed by {urlAgentName}</p>
                  </div>
                  <Button variant="outline-warning" onClick={() => navigate('/listings')} size="sm">
                    <i className="fas fa-arrow-left me-2"></i> Back to All
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="sorting-card mb-1">
                <Card.Body className="d-flex justify-content-between align-items-center gap-2 p-2 px-3">
                  <div className="flex-grow-1" style={{ maxWidth: '300px' }}>
                    <Dropdown className="w-100">
                      <Dropdown.Toggle 
                        variant={currentSort ? "warning" : "outline-warning"} 
                        size="sm" 
                        className={`rounded-pill fw-semibold shadow-sm d-flex justify-content-between align-items-center w-100 ${currentSort ? 'text-white' : ''}`}
                        style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                      >
                        <span className="text-truncate">
                          {/* <span className="d-none d-sm-inline me-1 text-muted">Sort:</span> */}
                          {!currentSort ? 'Sort By' : 
                           currentSort === 'popularity' ? 'Most Viewed' :
                           currentSort === 'rating' ? 'Top Rated' :
                           currentSort === 'price_asc' ? 'Price: Low to High' :
                           currentSort === 'price_desc' ? 'Price: High to Low' :
                           currentSort === 'recent' ? 'Recently Added' : 'Sort By'}
                        </span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu style={{ fontSize: '0.85rem' }} className="shadow border-0 rounded-3 mt-1 w-100">
                        <Dropdown.Item onClick={() => handleSortChange('popularity')} active={currentSort === 'popularity'}>Most Viewed</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleSortChange('rating')} active={currentSort === 'rating'}>Top Rated</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleSortChange('price_asc')} active={currentSort === 'price_asc'}>Price: Low to High</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleSortChange('price_desc')} active={currentSort === 'price_desc'}>Price: High to Low</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleSortChange('recent')} active={currentSort === 'recent'}>Recently Added</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  
                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <div className="view-toggle-btns d-flex bg-light p-1 rounded-3">
                      <button 
                        className={`btn btn-sm ${viewMode === 'list' ? 'btn-warning shadow-sm' : 'btn-light'}`}
                        onClick={() => setViewMode('list')}
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        <i className="fas fa-list"></i><span className="d-none d-sm-inline ms-1">List</span>
                      </button>
                      <button 
                        className={`btn btn-sm ${viewMode === 'map' ? 'btn-warning shadow-sm' : 'btn-light'}`}
                        onClick={() => setViewMode('map')}
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        <i className="fas fa-map-marked-alt"></i><span className="d-none d-sm-inline ms-1">Map</span>
                      </button>
                    </div>
                    <div className="result-count d-none d-md-block" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      <i className="fas fa-building me-1"></i>{total} properties
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
              <div className="d-flex flex-column ">
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
                  <Card key={property._id} className="pc-card">
                    <div className="pc-body">

                      {/* ── Image ── */}
                      <div className="pc-img-wrap">
                        <div
                          className="pc-img"
                          style={{ backgroundImage: `url(${resolveImageUrl(property.images?.[0]?.url || property.coverImage)})` }}
                        />
                        <span className="pc-type-badge">{getDisplayType(property)}</span>
                        <span className="pc-photo-count">
                          <i className="fas fa-camera" /> {property.images?.length || 1}
                        </span>
                      </div>

                      {/* ── Details ── */}
                      <div className="pc-details" onClick={() => handleViewDetails(property)} style={{ cursor: 'pointer' }}>

                        {/* Row 1: Title + Price */}
                        <div className="pc-title-row">
                          <div className="pc-title-block">
                            <h6 className="pc-title" title={getDisplayName(property)}>
                              {getDisplayName(property)}
                               <div className="pc-info-pill pc-status-pill ms-2">
                            <i className="fas fa-check-circle" style={{color:'#10b981'}}/>
                            <span style={{color:'#10b981', fontWeight: 600, fontSize: '0.60rem'}}>Available</span>
                          </div>
                            </h6>
                              

                            <div className="pc-location">
                              <i className="fas fa-map-marker-alt me-1" style={{color:'#f97316'}}/>
                              {property.area && `${property.area}, `}{property.city || '—'}
                            </div>
                          </div>
                          <div className="pc-price-block">
                            <div className="pc-price">₹{getPropertyMinPrice(property).toLocaleString()}</div>
                            <div className="pc-price-label">/ month</div>
                          </div>
                        </div>

                        {/* Row 2: Quick Info Grid (Pills) */}
                        <div className="pc-info-grid ">
                          <div className="pc-info-pill">
                            <i className="fas fa-door-open pc-info-icon"/>
                            <span className="pc-info-val">{property.totalRooms || 20}</span>
                          </div>
                          <div className="pc-info-pill">
                            <i className="fas fa-venus-mars pc-info-icon"/>
                            <span className="pc-info-val">{getDisplayGender(property)}</span>
                          </div>
                          <div className="pc-info-pill">
                            <i className="fas fa-couch pc-info-icon"/>
                            <span className="pc-info-val">{property.furnishingStatus || 'Furnished'}</span>
                          </div>
                          <div className="pc-info-pill">
                            <i className="fas fa-snowflake pc-info-icon"/>
                            <span className="pc-info-val">{property.acStatus || 'AC'}</span>
                          </div>
                         
                        </div>

                        {/* Row 3: Available Status */}
       
                        {/* Row 4: Amenity pills */}
                        {property.amenities?.length > 0 && (
                          <div className="pc-amenities">
                            {(property.amenities || []).slice(0, 5).map(a => (
                              <span key={a} className="pc-amenity-pill">{a}</span>
                            ))}
                            {property.amenities?.length > 5 && (
                              <span className="pc-amenity-pill pc-amenity-more">+{property.amenities.length - 5}</span>
                            )}
                          </div>
                        )}

                      </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="pc-footer">
                      <div className="pc-footer-left" style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px'}}>
                        <span className="text-muted" style={{fontSize: '0.8rem'}}>
                          <i className="fas fa-clock me-1 text-slate-400"></i>
                          {property.createdAt ? new Date(property.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 1, 2023'}
                        </span>
                        <div className="d-flex align-items-center gap-2">
                          <img 
                            src={property.owner?.profileImage && property.owner.profileImage.trim() !== '' 
                              ? `${getBaseImageUrl()}/uploads/${property.owner.profileImage}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(property.managerName || property.owner?.name || 'Arjun Rao')}&background=f97316&color=fff&size=50`} 
                            alt="Posted by" 
                            className="rounded-circle" 
                            style={{ width: '24px', height: '24px', objectFit: 'cover', border: '1px solid #e2e8f0' }} 
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(property.managerName || 'Arjun Rao')}&background=f97316&color=fff&size=50`; }}
                          />
                          <span className="text-muted" style={{fontSize: '0.8rem'}}>
                            By <span 
                              style={{color: '#f97316', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px'}} 
                              onClick={() => handleAgentClick(property.agentName)}
                            >
                              {property.managerName}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="pc-footer-actions">
                        <button className="pc-btn-ghost" onClick={() => handleViewDetails(property)}>Details</button>
                        <button className="pc-btn-ghost" onClick={() => openOtpModal(property, 'enquiry')}>Enquire</button>
                        <button className="pc-btn-solid" onClick={() => openOtpModal(property, 'contact')}>
                          <i className="fas fa-phone-alt me-1"/>Contact
                        </button>
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

          {/* Right-side Banner Column */}
          {!urlAgentName && (
            <Col lg={2} className="d-none d-lg-block right-banner-col">
              <div className="right-banner-sticky">
                {/* Single Advertisement Banner */}
                <div className="right-banner-card ad-banner-card">
                  <div 
                    className="ad-banner-image"
                    style={{ backgroundImage: "url('https://placehold.co/300x400/FFF3E0/FF8C42?text=Premium+Ad')" }}
                  >
                    <span className="ad-badge">SPONSORED</span>
                  </div>
                  <div className="ad-banner-content text-center">
                    <h5 className="ad-headline">List Your Property Free</h5>
                    <p className="ad-subtext">Reach thousands of genuine tenants directly.</p>
                    <button className="ad-btn" onClick={() => navigate('/agent/login')}>
                      Post Property →
                    </button>
                  </div>
                </div>
              </div>
            </Col>
          )}
        </Row>

      </Container>

      <Modal show={showOtpModal} onHide={handleCloseModal} centered size="lg" className="premium-modal">
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
                          <span className="fw-bold text-dark">{selectedProperty?.managerPhone ? 'Property Manager' : (selectedProperty?.ownerId?.name || 'Owner')}</span>
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
                          <a href={`mailto:${selectedProperty?.ownerId?.email}`} className="text-decoration-none fw-bold text-dark text-truncate" style={{ maxWidth: '200px' }}>
                            {selectedProperty?.ownerId?.email || 'Not available'}
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

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: '600' }}>
            Reviews for {selectedPropertyForReviews ? getDisplayName(selectedPropertyForReviews) : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="reviews-list">
            <div className="review-item p-3 border-bottom">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <img src="https://ui-avatars.com/api/?name=Rohan+Kumar&background=e2e8f0&color=475569" alt="user" className="rounded-circle" style={{ width: '32px', height: '32px' }} />
                  <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Rohan Kumar</span>
                </div>
                <div className="text-warning small">
                  <i className="fas fa-star"></i> <i className="fas fa-star"></i> <i className="fas fa-star"></i> <i className="fas fa-star"></i> <i className="fas fa-star-half-alt"></i>
                </div>
              </div>
              <p className="text-muted small mb-0">"Great place to stay! The owner is very responsive and the amenities are exactly as described."</p>
            </div>
            <div className="review-item p-3 border-bottom">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <img src="https://ui-avatars.com/api/?name=Priya+Sharma&background=e2e8f0&color=475569" alt="user" className="rounded-circle" style={{ width: '32px', height: '32px' }} />
                  <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Priya Sharma</span>
                </div>
                <div className="text-warning small">
                  <i className="fas fa-star"></i> <i className="fas fa-star"></i> <i className="fas fa-star"></i> <i className="fas fa-star"></i> <i className="far fa-star"></i>
                </div>
              </div>
              <p className="text-muted small mb-0">"Good location, but the Wi-Fi can be a bit slow sometimes. Overall a decent experience."</p>
            </div>
            <div className="review-item p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <img src="https://ui-avatars.com/api/?name=Amit+Patel&background=e2e8f0&color=475569" alt="user" className="rounded-circle" style={{ width: '32px', height: '32px' }} />
                  <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Amit Patel</span>
                </div>
                <div className="text-warning small">
                  <i className="fas fa-star"></i> <i className="fas fa-star"></i> <i className="fas fa-star"></i> <i className="fas fa-star"></i> <i className="fas fa-star"></i>
                </div>
              </div>
              <p className="text-muted small mb-0">"Excellent food and very clean rooms. Highly recommended!"</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowReviewModal(false)}>Close</button>
        </Modal.Footer>
      </Modal>
      </main>

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

        /* --- Custom Modal Styling --- */
        .premium-modal .modal-content {
          border: none;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .premium-modal .modal-header {
          padding: 0;
          border: none;
        }
        .bg-orange { background-color: #f97316; }
        .text-orange { color: #f97316; }
        .bg-orange-light { background-color: #fff7ed; }
        .bg-warning-light { background-color: #fef3c7; color: #d97706; }
        .border-orange { border-color: #fed7aa !important; }
        .border-light { border-color: #e2e8f0 !important; }
        
        .input-group-modern {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.25rem 0.5rem;
          transition: all 0.3s ease;
        }
        .input-group-modern:focus-within {
          border-color: #f97316;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
        }
        .input-group-icon {
          padding: 0 15px;
          color: #94a3b8;
          font-size: 1.1rem;
        }
        .input-group-modern:focus-within .input-group-icon {
          color: #f97316;
        }
        .modern-input, .modern-otp-input {
          border: none;
          background: transparent;
          padding: 12px 0;
          font-size: 1rem;
          box-shadow: none !important;
          color: #1e293b;
        }
        .modern-select {
          border: 1px solid #e2e8f0;
          background-color: #f8fafc;
          border-radius: 10px;
          padding: 10px 15px;
          font-size: 0.95rem;
          color: #334155;
          transition: all 0.2s ease;
        }
        .modern-select:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
          background-color: #fff;
        }
        
        .premium-switch .form-check-input {
          width: 3rem;
          height: 1.5rem;
          cursor: pointer;
        }
        .premium-switch .form-check-input:checked {
          background-color: #f97316;
          border-color: #f97316;
        }
        
        .btn-premium-submit {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-weight: 600;
          font-size: 1.05rem;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
        }
        .btn-premium-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
        }
        .btn-premium-submit:disabled {
          opacity: 0.7;
          background: #cbd5e1;
          box-shadow: none;
        }
        
        .btn-premium-outline {
          background: transparent;
          color: #475569;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .btn-premium-outline:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .hover-bg-light:hover {
          background-color: #f8fafc !important;
          border-color: #cbd5e1 !important;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Animations */
        .animate-slide-down {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: top;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) scaleY(0.95); }
          to { opacity: 1; transform: translateY(0) scaleY(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ListingPage;