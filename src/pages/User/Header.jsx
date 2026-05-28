import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import authService from '../../services/authService';
import logo from '../../assets/logo.png';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

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
    { path: '/listings', label: 'Listings', icon: 'fas fa-list' },
    { path: '/contact', label: 'Contact', icon: 'fas fa-envelope' }
  ];

  const handleAuthClick = () => {
    navigate('/auth');
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

  const [currentCity, setCurrentCity] = useState('All India');
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    // Automatically detect location to show in navbar
    detectLocation();
  }, []);

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.state_district;
            if (city) {
              setCurrentCity(city.replace(/ City$/, ''));
            } else {
              setCurrentCity('All India');
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
          <img src={logo} alt="StayNest Logo" height="40" style={{ objectFit: 'contain' }} />
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
              onMouseEnter={() => setShowMegaMenu(true)}
              onMouseLeave={() => setShowMegaMenu(false)}
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
                      <button className="all-india-btn" onClick={() => setCurrentCity('All India')}>
                        <i className={`fas fa-check-circle ${currentCity === 'All India' ? 'text-warning' : 'text-muted'}`}></i> All India
                      </button>
                      <div className="mega-search-box">
                        <input type="text" placeholder="Search City" />
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
                        <span className="city-link" onClick={() => setCurrentCity('All India')}>All India</span>
                        {popularCities.map(city => (
                          <span key={city} className="city-link" onClick={() => setCurrentCity(city)}>{city}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mega-menu-divider"></div>

                    <div className="mega-menu-col other-cities-sec">
                      <h6 className="mega-col-title">Other Cities</h6>
                      <div className="mega-list-grid popup-grid-4">
                        {otherCities.map(city => (
                          <span key={city} className="city-link" onClick={() => setCurrentCity(city)}>{city}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Nav.Link
                key={link.path}
                as={Link}
                to={link.path}
                onClick={() => setExpanded(false)}
                className={`d-flex align-items-center gap-2 ${location.pathname === link.path ? 'active-link' : ''}`}
              >
                <i className={link.icon}></i>
                <span>{link.label}</span>
              </Nav.Link>
            ))}
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
    </Navbar>
  );
};

export default Header;