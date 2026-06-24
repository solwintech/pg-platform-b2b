// ListingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Spinner, Pagination, Modal, Dropdown, Carousel } from 'react-bootstrap';
import Header from './Header';
import Footer from './Footer';
import propertyService from '../../services/propertyService';
import leadService from '../../services/leadService';
import PropertyMap from '../../components/MapComponent';
import PromotionalAd from '../../components/PromotionalAd';
import LeadActionModal from '../../components/modals/LeadActionModal';
import './ListingPage.css';
import authService from '../../services/authService';
import { useAuthModal } from '../../context/AuthModalContext';
import { useGoogleMaps } from '../../context/GoogleMapsContext';
import { Autocomplete } from '@react-google-maps/api';
import SEO from '../../components/SEO';
import CityNotAvailableModal from '../../components/modals/CityNotAvailableModal';


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
  const leadActionModalRef = useRef(null);
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
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    minPrice: location.state?.minPrice || 0,
    maxPrice: location.state?.maxPrice || 100000,
    occupancy: location.state?.occupancy || [],
    amenities: location.state?.amenities || [],
    gender: location.state?.gender || "all",
    city: location.state?.city || localStorage.getItem('selected_city') || "",
    localities: [],
    propertyType: location.state?.propertyType || "all",
    agentName: urlAgentName || location.state?.agentName || ""
  });

  const [appliedFilters, setAppliedFilters] = useState({
    minPrice: location.state?.minPrice || 0,
    maxPrice: location.state?.maxPrice || 100000,
    occupancy: location.state?.occupancy || [],
    amenities: location.state?.amenities || [],
    gender: location.state?.gender || "all",
    city: location.state?.city || localStorage.getItem('selected_city') || "",
    localities: [],
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
  const [localityInput, setLocalityInput] = useState("");
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPropertyForReviews, setSelectedPropertyForReviews] = useState(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const [showCityNotAvailableModal, setShowCityNotAvailableModal] = useState(false);
  const [showAllOccupancy, setShowAllOccupancy] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const loaderRef = useRef(null);

  const handleImageClick = (e, property) => {
    e.stopPropagation();
    const images = [];
    if (property.coverImage) images.push(property.coverImage);
    if (property.galleryImages && property.galleryImages.length > 0) {
      property.galleryImages.forEach(img => images.push(img.url || img.image || img));
    } else if (property.images && property.images.length > 0) {
      property.images.forEach(img => images.push(img.url || img.image || img));
    }
    const uniqueImages = [...new Set(images)];
    if (uniqueImages.length > 0) {
      setModalImages(uniqueImages.map(url => resolveImageUrl(url)));
      setActiveImageIndex(0);
      setShowImageModal(true);
    }
  };


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
        if (fetchedProperties.length === 0) {
          setShowCityNotAvailableModal(true);
        } else {
          setShowCityNotAvailableModal(false);
        }
      } else {
        setShowCityNotAvailableModal(false);
      }
      if (appliedFilters.localities && appliedFilters.localities.length > 0) {
        fetchedProperties = fetchedProperties.filter(p => {
          const areaString = (p.area || p.address || p.location?.area || p.location?.address || '').toLowerCase();
          if (!areaString) return false;
          return appliedFilters.localities.some(loc => {
            const searchLoc = loc.toLowerCase();
            return areaString.includes(searchLoc) || searchLoc.includes(areaString);
          });
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
        fetchedProperties = fetchedProperties.filter(p => p.agentName === appliedFilters.agentName || p.managerName === appliedFilters.agentName || (p.owner && p.owner.name === appliedFilters.agentName));
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
      
      setFilteredProperties(fetchedProperties);
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
    const handleObserver = (entries) => {
      const target = entries[0];
      if (target.isIntersecting && currentPage < totalPages) {
        handleLoadMore();
      }
    };
    
    const observer = new IntersectionObserver(handleObserver, { 
      root: null, 
      rootMargin: '100px', 
      threshold: 0.1 
    });
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [currentPage, totalPages]);

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
    setFilters(prev => ({ ...prev, agentName: urlAgentName || "" }));
    setAppliedFilters(prev => ({ ...prev, agentName: urlAgentName || "" }));
    setCurrentPage(1);
  }, [urlAgentName]);

  useEffect(() => {
    fetchProperties();
  }, [appliedFilters, currentSort]);

  useEffect(() => {
    const numItems = currentPage * 10;
    setProperties(filteredProperties.slice(0, numItems));
  }, [filteredProperties, currentPage]);

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

  const handleLocalityChange = (value) => {
    setLocalityInput(value);
  };

  const handleLocalityKeyDown = (e) => {
    if (e.key === 'Enter' && localityInput.trim()) {
      e.preventDefault();
      const val = localityInput.trim();
      if (!filters.localities.includes(val)) {
        setFilters(prev => ({ ...prev, localities: [...prev.localities, val] }));
      }
      setLocalityInput("");
    }
  };

  const removeLocality = (loc) => {
    setFilters(prev => ({ ...prev, localities: prev.localities.filter(l => l !== loc) }));
  };

  const onLocalityPlaceChanged = () => {
    if (cityAutocompleteRef.current !== null) {
      const place = cityAutocompleteRef.current.getPlace();
      if (place && place.name) {
        if (!filters.localities.includes(place.name)) {
          setFilters(prev => ({ ...prev, localities: [...prev.localities, place.name] }));
        }
        setLocalityInput("");
      }
    }
  };

  const handlePropertyTypeChange = (value) => {
    setFilters({ ...filters, propertyType: value });
  };

  const applyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters(filters);
    
    // Only update global city if the header city was explicitly changed
    if (filters.city !== appliedFilters.city) {
      const cityToSave = filters.city || 'All India';
      localStorage.setItem('selected_city', cityToSave);
      window.dispatchEvent(new CustomEvent('city-changed', { detail: cityToSave }));
    }
  };

  const handleAgentClick = (agentName) => {
    navigate(`/agent/${encodeURIComponent(agentName)}`);
  };

  const resetFilters = () => {
    const defaultFilters = {
      minPrice: 0,
      maxPrice: 100000,
      occupancy: [],
      amenities: [],
      gender: "all",
      city: appliedFilters.city, // retain the globally selected city
      localities: [],
      propertyType: "all",
      agentName: ""
    };
    setLocalityInput("");
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (sortType) => {
    setCurrentSort(sortType);
    setCurrentPage(1);
  };

  const handleViewDetails = (property) => {
    navigate(`/property/${property.slug || property._id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
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
                    <div className="d-flex gap-3 align-items-center">
                      <Button 
                        variant="link" 
                        className="reset-filters-btn p-0 text-muted"
                        style={{ textDecoration: 'none', fontSize: '0.85rem' }}
                        onClick={resetFilters}
                      >
                        Reset
                      </Button>
                      <Button 
                        variant="warning" 
                        size="sm"
                        className="fw-bold shadow-sm"
                        style={{ borderRadius: '6px', padding: '0.25rem 0.75rem' }}
                        onClick={applyFilters}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={ref => cityAutocompleteRef.current = ref}
                        onPlaceChanged={onLocalityPlaceChanged}
                        options={{ types: ['geocode'], componentRestrictions: { country: 'in' } }}
                      >
                        <Form.Control 
                          type="text" 
                          placeholder={`Search locality in ${appliedFilters.city || 'your city'}`}
                          value={localityInput}
                          onChange={(e) => handleLocalityChange(e.target.value)}
                          onKeyDown={handleLocalityKeyDown}
                          className="filter-input"
                        />
                      </Autocomplete>
                    ) : (
                      <Form.Control 
                        type="text" 
                        placeholder={`Search locality in ${appliedFilters.city || 'your city'}`}
                        value={localityInput}
                        onChange={(e) => handleLocalityChange(e.target.value)}
                        onKeyDown={handleLocalityKeyDown}
                        className="filter-input"
                      />
                    )}
                    
                    {filters.localities.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {filters.localities.map((loc, idx) => (
                          <div key={idx} className="badge bg-light text-dark border px-2 py-1 d-flex align-items-center gap-1 rounded-pill" style={{ fontSize: '0.8rem' }}>
                            {loc}
                            <i className="fas fa-times text-muted" style={{ cursor: 'pointer' }} onClick={() => removeLocality(loc)}></i>
                          </div>
                        ))}
                      </div>
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
                          style={{ width: '90px' }}
                        />
                        <Form.Control 
                          type="number" 
                          size="sm"
                          placeholder="Max" 
                          className="price-input-sm"
                          value={filters.maxPrice}
                          onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                          style={{ width: '100px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="filter-section-title">Room Type / Occupancy</h6>
                    <div className="d-flex flex-wrap filter-scroll-area" style={{ gap: '6px' }}>
                      {getOccupancyOptions(filters.propertyType).slice(0, showAllOccupancy ? undefined : 5).map(occ => (
                        <span 
                          key={occ}
                          className={`filter-chip ${filters.occupancy.includes(occ) ? 'active' : ''}`}
                          onClick={() => handleOccupancyChange(occ)}
                          style={{ marginBottom: '0' }}
                        >
                          {occ}
                        </span>
                      ))}
                      {!showAllOccupancy && getOccupancyOptions(filters.propertyType).length > 5 && (
                        <span 
                          className="filter-chip fw-bold text-warning border-warning"
                          onClick={() => setShowAllOccupancy(true)}
                          style={{ marginBottom: '0', cursor: 'pointer', backgroundColor: '#fff7ed' }}
                        >
                          +{getOccupancyOptions(filters.propertyType).length - 5} More
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="filter-section-title">Amenities</h6>
                    <div className="d-flex flex-wrap filter-scroll-area" style={{ gap: '6px' }}>
                      {mockAmenitiesList.slice(0, showAllAmenities ? undefined : 6).map(amenity => (
                        <span 
                          key={amenity}
                          className={`filter-chip ${filters.amenities.includes(amenity) ? 'active' : ''}`}
                          onClick={() => handleAmenitiesChange(amenity)}
                          style={{ marginBottom: '0' }}
                        >
                          {amenity}
                        </span>
                      ))}
                      {!showAllAmenities && mockAmenitiesList.length > 6 && (
                        <span 
                          className="filter-chip fw-bold text-warning border-warning"
                          onClick={() => setShowAllAmenities(true)}
                          style={{ marginBottom: '0', cursor: 'pointer', backgroundColor: '#fff7ed' }}
                        >
                          +{mockAmenitiesList.length - 6} More
                        </span>
                      )}
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
                      <div className="pc-img-wrap" onClick={(e) => handleImageClick(e, property)} style={{ cursor: 'pointer' }}>
                        <div
                          className="pc-img"
                          style={{ backgroundImage: `url(${resolveImageUrl(property.galleryImages?.[0]?.url || property.galleryImages?.[0] || property.images?.[0]?.url || property.images?.[0] || property.coverImage)})` }}
                        />
                        <span className="pc-type-badge">{getDisplayType(property)}</span>
                        <span className="pc-photo-count">
                          <i className="fas fa-camera" /> {property.galleryImages?.length || property.images?.length || (property.coverImage ? 1 : 0) || 1}
                        </span>
                      </div>

                      {/* ── Details ── */}
                      <div className="pc-details" onClick={() => handleViewDetails(property)} style={{ cursor: 'pointer' }}>

                        {/* Row 1: Title + Price */}
                        <div className="pc-title-row">
                          <div className="pc-title-block">
                            <div className="d-flex align-items-center">
                              <h6 className="pc-title mb-0" title={getDisplayName(property)}>
                                {getDisplayName(property)}
                              </h6>
                              <div className="pc-info-pill pc-status-pill ms-2 flex-shrink-0">
                                <i className="fas fa-check-circle" style={{color:'#10b981'}}/>
                                <span style={{color:'#10b981', fontWeight: 600, fontSize: '0.60rem'}}>Available</span>
                              </div>
                            </div>
                              

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
                              onClick={() => handleAgentClick(property.managerName || property.owner?.name || property.agentName)}
                            >
                              {property.managerName || property.owner?.name || 'Owner'}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="pc-footer-actions">
                        <button className="pc-btn-ghost" onClick={() => handleViewDetails(property)}>Details</button>
                        <button className="pc-btn-ghost" onClick={() => leadActionModalRef.current?.open(property, 'enquiry')}>Enquire</button>
                        <button className="pc-btn-solid" onClick={() => leadActionModalRef.current?.open(property, 'contact')}>
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

            {currentPage < totalPages && (
              <div ref={loaderRef} className="d-flex justify-content-center mt-5">
                <Spinner animation="border" variant="warning" />
              </div>
            )}

            <PromotionalAd location="listing_bottom" className="mt-5" />
          </Col>

          {/* Right-side Banner Column */}
          {!urlAgentName && (
            <Col lg={2} className="d-none d-lg-block right-banner-col">
              <div className="right-banner-sticky">
                <PromotionalAd location="listing_sidebar_1" className="mb-4" />
                <PromotionalAd location="listing_sidebar_2" />
              </div>
            </Col>
          )}
        </Row>

      </Container>

      <LeadActionModal ref={leadActionModalRef} />

      <CityNotAvailableModal 
        show={showCityNotAvailableModal} 
        onHide={() => setShowCityNotAvailableModal(false)} 
        city={filters.city} 
      />

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

      {/* Image Gallery Modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="lg" centered className="image-gallery-modal">
        <Modal.Header closeButton className="border-0 pb-0" style={{ position: 'absolute', right: '10px', top: '10px', zIndex: 1050 }}>
        </Modal.Header>
        <Modal.Body className="p-0 bg-dark text-center" style={{ overflow: 'hidden' }}>
          {modalImages.length > 0 ? (
            <Carousel activeIndex={activeImageIndex} onSelect={(idx) => setActiveImageIndex(idx)} interval={null}>
              {modalImages.map((imgUrl, idx) => (
                <Carousel.Item key={idx} style={{ height: '70vh' }}>
                  <img
                    className="d-block w-100 h-100"
                    src={imgUrl}
                    alt={`Property image ${idx + 1}`}
                    style={{ objectFit: 'contain' }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <div className="p-5 text-white">No images available</div>
          )}
        </Modal.Body>
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