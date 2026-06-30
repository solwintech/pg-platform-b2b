import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import authService from '../../services/authService';
import logo from '../../assets/logo.png';
import './Header.css';
import { useAuthModal } from '../../context/AuthModalContext';
import { useGoogleMaps } from '../../context/GoogleMapsContext';
import { Autocomplete } from '@react-google-maps/api';
import CityNotAvailableModal from '../../components/modals/CityNotAvailableModal';
import propertyService from '../../services/propertyService';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const [expanded, setExpanded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const { isLoaded } = useGoogleMaps();
  const cityAutocompleteRef = useRef(null);
  const megaMenuRef = useRef(null);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [unavailableCity, setUnavailableCity] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = authService.isAuthenticated();
      const userData = authService.getUser();
      setIsLoggedIn(loggedIn);
      setUser(userData);
    };

    checkAuth();

    window.addEventListener('auth-change', checkAuth);
    return () => {
      window.removeEventListener('auth-change', checkAuth);
    };
  }, [location]);

  const navLinks = [
    { path: '/', label: 'Home', icon: 'fas fa-home' },
    { path: '/verified-pg-hostels/all-properties', label: 'Properties', icon: 'fas fa-building' },
    { path: '/contact', label: 'Contact', icon: 'fas fa-envelope' }
  ];

  const handleAuthClick = () => {
    openAuthModal();
    setExpanded(false);
  };

  const handlePostProperty = () => {
    navigate('/register');
    setExpanded(false);
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
    setExpanded(false);
  };

  const [currentCity, setCurrentCity] = useState(() => localStorage.getItem('selected_city') || 'All India');
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    // Automatically detect location if no city is manually selected
    if (!localStorage.getItem('selected_city')) {
      detectLocation();
    }

    const handleCityChange = (e) => {
      if (e.detail && e.detail !== currentCity) {
        setCurrentCity(e.detail);
      }
    };
    window.addEventListener('city-changed', handleCityChange);
    return () => window.removeEventListener('city-changed', handleCityChange);
  }, [currentCity]);

  const handleCitySelect = async (city) => {
    // Check if city has any properties before selecting it
    if (city !== 'All India') {
      try {
        const res = await propertyService.getProperties({ public: true }, false);
        const properties = res.properties || [];
        const hasProps = properties.some(p => {
          const cityString = (p.city || p.location?.city || '').toLowerCase();
          const searchCity = city.toLowerCase();
          return cityString.includes(searchCity) || 
                 searchCity.includes(cityString) || 
                 (cityString === 'bangalore' && searchCity === 'bengaluru') ||
                 (cityString === 'bengaluru' && searchCity === 'bangalore');
        });

        if (!hasProps) {
          setUnavailableCity(city);
          setShowCityModal(true);
          setShowMegaMenu(false);
          return; // Do not update selected city or navigate
        }
      } catch (error) {
        console.error("Failed to fetch properties for city check:", error);
      }
    }

    setCurrentCity(city);
    setShowMegaMenu(false);
    localStorage.setItem('selected_city', city);
    window.dispatchEvent(new CustomEvent('city-changed', { detail: city }));
  };

  const detectLocation = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if ("geolocation" in navigator) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.district || data.address.county || data.address.state_district;
            if (city) {
              const detectedCity = city.replace(/ City$/, '');
              setCurrentCity(detectedCity);
              localStorage.setItem('selected_city', detectedCity);
              window.dispatchEvent(new CustomEvent('city-changed', { detail: detectedCity }));
              setShowMegaMenu(false);
            } else {
              setCurrentCity('All India');
              localStorage.setItem('selected_city', 'All India');
              window.dispatchEvent(new CustomEvent('city-changed', { detail: 'All India' }));
              setShowMegaMenu(false);
            }
          } catch (error) {
            console.error("Location error", error);
          } finally {
            setLocationLoading(false);
          }
        },
        () => setLocationLoading(false)
      );
    }
  };

  const popularCities = ['Bhopal', 'Indore', 'Jaipur', 'Raipur', 'Nagpur', 'Nashik', 'Jabalpur', 'Gwalior', 'Udaipur', 'Kota', 'Ajmer', 'Rewa', 'Satna', 'Ahmedabad', 'Surat', 'Bhilai', 'Durg'];
  const otherCities = ['Ahmednagar', 'Akola', 'Alwar', 'Amritsar', 'Aurangabad', 'Bathinda', 'Bharatpur', 'Bhilwara', 'Bhiwadi', 'Bhuj', 'Bikaner', 'Delhi NCR', 'Dhanbad', 'Dhar', 'Faridabad', 'Gaya', 'Ghaziabad', 'Greater Noida', 'Gurgaon', 'Hisar', 'Hoshangabad', 'Hyderabad', 'Jalandhar', 'Jalgaon', 'Jamshedpur', 'Jhunjhunu', 'Jodhpur', 'Karnal', 'Khandwa', 'Ludhiana', 'Mehsana', 'Mohali', 'Mumbai', 'Muzaffarpur', 'Neemrana', 'New Delhi', 'Noida', 'Panchkula', 'Rajkot', 'Ranchi', 'Ratlam', 'Rohtak', 'Sagar', 'Shimla', 'Solapur', 'Sri Ganganagar', 'Ujjain', 'Vapi', 'Chandigarh', 'Bhavnagar', 'Gandhinagar'];

  const splitIntoCols = (array, cols) => {
    const result = [];
    for (let i = 0; i < cols; i++) result.push([]);
    array.forEach((item, index) => {
      result[index % cols].push(item);
    });
    return result;
  };

  const filteredPopularCities = popularCities.filter(c => c.toLowerCase().includes(citySearchQuery.toLowerCase()));
  const filteredOtherCities = otherCities.filter(c => c.toLowerCase().includes(citySearchQuery.toLowerCase()));

  const onCityPlaceChanged = () => {
    if (cityAutocompleteRef.current !== null) {
      const place = cityAutocompleteRef.current.getPlace();
      if (place && place.name) {
        handleCitySelect(place.name);
        setCitySearchQuery(''); // Clear after selection
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        if (event.target.closest('.pac-container')) return;
        setShowMegaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseLeave = () => {
    if (document.activeElement && document.activeElement.placeholder === 'Search City') {
      return;
    }
    setShowMegaMenu(false);
  };

  return (
    <Navbar
      bg="white"
      expand="lg"
      sticky="top"
      expanded={expanded}
      className="header-navbar shadow-sm"
    >
      <Container fluid className="px-3 px-lg-4 position-relative">
        <Navbar.Brand as={Link} to="/" className="py-2">
          <img src={logo} alt="Sortify Stays Logo" height="40" style={{ objectFit: 'contain' }} />
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(!expanded)}
          className="border-0"
        >
          <i className={`fas ${expanded ? 'fa-times' : 'fa-bars'} fs-4 text-dark`}></i>
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto gap-3 flex-wrap align-items-lg-center">

            {/* Mega Menu Location Selector */}
            <div
              className="nav-item position-relative location-mega-wrapper"
              ref={megaMenuRef}
              onMouseEnter={() => setShowMegaMenu(true)}
              onMouseLeave={handleMouseLeave}
            >
              <button className="location-nav-btn">
                <i className="fas fa-map-marker-alt text-warning me-1"></i>
                <span className="fw-semibold text-dark">{currentCity}</span>
                <i className="fas fa-chevron-down ms-1" style={{ fontSize: '0.7em' }}></i>
              </button>

              {showMegaMenu && (
                <div className="mega-menu-dropdown shadow-lg">
                  <div className="mega-menu-header">
                    <div className="d-flex align-items-center gap-3">
                      <button className="all-india-btn" onClick={() => handleCitySelect('All India')}>
                        <i className={`fas fa-check-circle ${currentCity === 'All India' ? 'text-warning' : 'text-muted'}`}></i> All India
                      </button>
                      <div className="mega-search-box">
                        {isLoaded ? (
                          <Autocomplete
                            onLoad={ref => cityAutocompleteRef.current = ref}
                            onPlaceChanged={onCityPlaceChanged}
                            options={{ types: ['(cities)'], componentRestrictions: { country: 'in' } }}
                          >
                            <input 
                              type="text" 
                              placeholder="Search City" 
                              value={citySearchQuery}
                              onChange={(e) => setCitySearchQuery(e.target.value)}
                            />
                          </Autocomplete>
                        ) : (
                          <input 
                            type="text" 
                            placeholder="Search City" 
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                          />
                        )}
                        <i className="fas fa-search"></i>
                      </div>
                      <button className="location-detect-btn ms-2" onClick={detectLocation} title="Detect my location">
                        <i className={`fas ${locationLoading ? 'fa-spinner fa-spin' : 'fa-crosshairs'}`}></i> Detect
                      </button>
                    </div>

                  </div>

                  <div className="mega-menu-body">
                    <div className="mega-menu-col popular-cities-sec">
                      <h6 className="mega-col-title">Popular Cities</h6>
                      <div className="mega-list-grid popup-grid-3">
                        <span className="city-link" onClick={() => handleCitySelect('All India')}>All India</span>
                        {filteredPopularCities.map(city => (
                          <span key={city} className="city-link" onClick={() => handleCitySelect(city)}>{city}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mega-menu-divider"></div>

                    <div className="mega-menu-col other-cities-sec">
                      <h6 className="mega-col-title">Other Cities</h6>
                      <div className="mega-list-grid popup-grid-4">
                        {filteredOtherCities.map(city => (
                          <span key={city} className="city-link" onClick={() => handleCitySelect(city)}>{city}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {navLinks.map((link) => {
              const toPath = link.label === 'Properties' && currentCity && currentCity !== 'All India'
                ? `${link.path}?cityName=${currentCity}`
                : link.path;
              const isActive = (link.label === 'Properties' && location.pathname.includes('/verified-pg-hostels')) || 
                               (link.label === 'Home' && location.pathname === '/') ||
                               (link.label === 'Contact' && location.pathname === '/contact');
              return (
              <Nav.Link
                key={link.path}
                as={Link}
                to={toPath}
                onClick={() => setExpanded(false)}
                className={`d-flex align-items-center gap-2 ${isActive ? 'active-link' : ''}`}
              >
                <i className={link.icon}></i>
                <span>{link.label}</span>
              </Nav.Link>
              );
            })}
          </Nav>

          <div className="d-flex gap-2 align-items-center mt-3 mt-lg-0">
            {isLoggedIn ? (
              <>
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="light"
                    className="rounded-pill px-3 py-2 d-flex align-items-center gap-2 user-dropdown"
                  >
                    <i className="fas fa-user-circle fs-5 text-warning"></i>
                    <span className="d-none d-md-inline">
                      Hi, {user?.name?.split(' ')[0] || 'User'}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i> Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <Button
                  variant="warning"
                  className="rounded-pill px-4 py-2 fw-semibold text-white post-property-btn"
                  onClick={handlePostProperty}
                >
                  <i className="fas fa-plus-circle me-2"></i>
                  <span className="d-none d-md-inline">Post Property</span>
                  <span className="d-inline d-md-none">Post</span>
                </Button>
              </>
            ) : (
              <>

                <Button
                  variant="outline-secondary"
                  className="rounded-pill px-4 py-2 fw-semibold login-btn"
                  onClick={handleAuthClick}
                >
                  <i className="fas fa-user me-2"></i>
                  <span className="d-none d-md-inline">Login / Signup</span>
                  <span className="d-inline d-md-none">Login</span>
                </Button>
                <Button
                  variant="warning"
                  className="rounded-pill px-4 py-2 fw-semibold text-white post-property-btn"
                  onClick={handlePostProperty}
                >
                  <i className="fas fa-plus-circle me-2"></i>
                  <span className="d-none d-md-inline">Post Property</span>
                  <span className="d-inline d-md-none">Post</span>
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
      <CityNotAvailableModal 
        show={showCityModal} 
        onHide={() => setShowCityModal(false)} 
        city={unavailableCity} 
      />
    </Navbar>
  );
};

export default Header;