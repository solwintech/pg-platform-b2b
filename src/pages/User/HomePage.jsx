// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import propertyService from '../../services/propertyService';
import PromotionalAd from '../../components/PromotionalAd';
import SearchWrapper from '../../components/SearchWrapper';
import './HomePage.css';
import authService from '../../services/authService';
import { useAuthModal } from '../../context/AuthModalContext';
import SEO from '../../components/SEO';
import CityNotAvailableModal from '../../components/modals/CityNotAvailableModal';
import WhyChooseUs from '../../components/common/WhyChooseUs';
import HowItWorks from '../../components/common/HowItWorks';
import CTASection from '../../components/common/CTASection';

const DEFAULT_CITIES_DATA = [
  { name: "Mumbai", image: "/images/cities/mumbai.png" },
  { name: "Delhi", image: "/images/cities/delhi.png" },
  { name: "Bangalore", image: "/images/cities/bangalore.png" },
  { name: "Hyderabad", image: "/images/cities/hyderabad.png" },
  { name: "Chennai", image: "/images/cities/chennai.png" },
  { name: "Pune", image: "/images/cities/pune.png" },
  { name: "Kolkata", image: "/images/cities/kolkata.png" },
  { name: "Ahmedabad", image: "/images/cities/ahmedabad.png" },
  { name: "Jaipur", image: "/images/cities/jaipur.png" },
  { name: "Lucknow", image: "/images/cities/lucknow.png" }
];

const getBaseImageUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1');
  return apiUrl.replace('/api/v1', '');
};

const resolveImageUrl = (url) => {
  if (!url) return 'https://placehold.co/600x400/FFF3E0/FF8C42?text=Property';
  if (url.startsWith('http')) return url;
  const baseUrl = getBaseImageUrl();
  if (url.startsWith('/uploads/')) return `${baseUrl}${url}`;
  if (url.startsWith('uploads/')) return `${baseUrl}/${url}`;
  return url;
};

const HomePage = () => {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const [allProperties, setAllProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [newlyLaunched, setNewlyLaunched] = useState([]);
  const [topBrands, setTopBrands] = useState([]);
  const [activeCities, setActiveCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCityModal, setShowCityModal] = useState(false);
  const [unavailableCity, setUnavailableCity] = useState('');
  
  const [filters, setFilters] = useState({
    city: localStorage.getItem('selected_city') || 'Bangalore',
    locality: '',
    propertyType: 'all',
    budget: 'any',
    occupancy: 'any',
    gender: 'all'
  });
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    loadHomePageData();
    if (!localStorage.getItem('selected_city')) {
      getUserLocation();
    }

    const handleCityChange = (e) => {
      setFilters(prev => ({ ...prev, city: e.detail }));
    };
    window.addEventListener('city-changed', handleCityChange);
    return () => window.removeEventListener('city-changed', handleCityChange);
  }, []);

  const getUserLocation = (e) => {
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
              const cleanedCity = city.replace(/ City$/, '');
              setFilters(prev => ({ ...prev, city: cleanedCity }));
              localStorage.setItem('selected_city', cleanedCity);
              window.dispatchEvent(new CustomEvent('city-changed', { detail: cleanedCity }));
            }
          } catch (error) {
            console.error("Error fetching location details:", error);
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationLoading(false);
        }
      );
    }
  };

  const loadHomePageData = async () => {
    setLoading(true);
    try {
      // Fetch real properties for Featured Section
      const response = await propertyService.getProperties({ limit: 200, public: true }, false); 
      const realProperties = response.properties || [];
      
      setAllProperties(realProperties);
      
      // 1. Featured Properties: only explicitly marked properties
      const featured = realProperties
        .filter(p => p.isFeatured === true)
        .slice(0, 10);
      setFeaturedProperties(featured);
      
      // 2. Newly Launched: Sort by creation date (from database data)
      const newest = [...realProperties]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 10);
      setNewlyLaunched(newest);
      
      // 3. Top Brands: Aggregate by ownerName (from database data)
      const brandsMap = {};
      realProperties.forEach(p => {
        const ownerName = p.ownerId?.name || p.ownerName;
        if (ownerName) {
          if (!brandsMap[ownerName]) {
            brandsMap[ownerName] = { 
              name: ownerName, 
              count: 0, 
              ratingSum: 0,
              // We'll use UI Avatars to generate a placeholder brand logo
              logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=f15a29&color=fff&size=100` 
            };
          }
          brandsMap[ownerName].count += 1;
          brandsMap[ownerName].ratingSum += parseFloat(p.rating || 0);
        }
      });
      
      const brands = Object.values(brandsMap)
        .filter(b => b.count >= 1)
        .map(b => ({ ...b, avgRating: b.ratingSum > 0 ? (b.ratingSum / b.count).toFixed(1) : "5.0" }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      setTopBrands(brands);
      
      // 4. Popular Cities: Dynamic aggregation (from database data)
      const cityMap = {};
      realProperties.forEach(p => {
        const city = p.location?.city;
        if (city) {
          cityMap[city] = (cityMap[city] || 0) + 1;
        }
      });
      
      // Use default cities data to ensure popular cities always show
      const activeCitiesData = DEFAULT_CITIES_DATA.map(city => {
        const count = cityMap[city.name] || cityMap[city.name.toLowerCase()] || 0;
        return {
          name: city.name,
          count: count > 0 ? `${count} properties` : '0 properties',
          image: city.image
        };
      });
      
      setActiveCities(activeCitiesData);
      
    } catch (error) {
      console.error('Failed to load homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'city') {
      localStorage.setItem('selected_city', value);
      window.dispatchEvent(new CustomEvent('city-changed', { detail: value }));
    }
  };

  const getPropertyMinPrice = (property) => {
    if (property.minPrice) return property.minPrice;
    if (property.pricing?.deposit) return property.pricing.deposit;
    const pRooms = property.roomTypes || property.rooms;
    if (pRooms && pRooms.length > 0) {
      return Math.min(...pRooms.map(r => Number(r.price) || 0));
    }
    return (property.totalRooms * 1000) || 5000;
  };

  const getDisplayName = (property) => {
    return property.pgName || property.title || 'Property';
  };

  const getDisplayLocation = (property) => {
    if (property.area) return property.area;
    if (property.location?.area) return property.location.area;
    if (property.address) return property.address;
    if (property.location?.address) return property.location.address;
    return property.city || property.location?.city || 'Location';
  };

  const goToListings = (overrideCity = null) => {
    const finalCity = (typeof overrideCity === 'string') ? overrideCity : filters.city;
    
    // Check if the finalCity has any properties
    if (finalCity && finalCity.toLowerCase() !== 'all india') {
      const hasProps = allProperties.some(p => {
        const cityString = (p.city || p.location?.city || '').toLowerCase();
        const searchCity = finalCity.toLowerCase();
        return cityString.includes(searchCity) || 
               searchCity.includes(cityString) || 
               (cityString === 'bangalore' && searchCity === 'bengaluru') ||
               (cityString === 'bengaluru' && searchCity === 'bangalore');
      });

      if (!hasProps) {
        setUnavailableCity(finalCity);
        setShowCityModal(true);
        return; // Stop navigation
      }
    }

    let minPrice = 0, maxPrice = 100000;
    if (filters.budget === '<8000') {
      maxPrice = 8000;
    } else if (filters.budget === '8000-15000') {
      minPrice = 8000;
      maxPrice = 15000;
    } else if (filters.budget === '>15000') {
      minPrice = 15000;
      maxPrice = 100000;
    }
    
    let genderMap = { boys: 'male', girls: 'female', 'co-ed': 'any', all: 'all' };
    
    navigate('/listings', { 
      state: {
        city: finalCity,
        locality: filters.locality,
        propertyType: filters.propertyType === 'all' ? 'all' : filters.propertyType,
        minPrice: minPrice,
        maxPrice: maxPrice,
        gender: genderMap[filters.gender] || 'all',
        occupancy: filters.occupancy === 'any' ? [] : (Array.isArray(filters.occupancy) ? filters.occupancy : [filters.occupancy])
      }
    });
  };

  // Helper for rendering property grids
  const renderPropertyGrid = (properties, emptyMessage) => (
    <div className="compact-grid">
      {properties.length === 0 ? (
        <div className="no-results">{emptyMessage}</div>
      ) : (
        properties.map(property => (
          <div 
            key={property._id} 
            className="compact-card"
            onClick={() => navigate(`/property/${property.slug || property._id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div 
              className="compact-card-img" 
              style={{ 
                backgroundImage: `url(${resolveImageUrl(property.images?.[0]?.url || property.coverImage)})`,
              }}
            >
              <div className="compact-badge">{property.propertyType || property.type || 'PG'}</div>
            </div>
            <div className="compact-card-content">
              <div className="compact-title">{getDisplayName(property)}</div>
              <div className="compact-location">
                <i className="fas fa-map-pin"></i> {getDisplayLocation(property)}, {property.city || property.location?.city || 'City'}
              </div>
              <div className="compact-features">
                <span><i className="fas fa-bed"></i> {property.totalRooms} rooms</span>
                <span className="compact-price">₹{getPropertyMinPrice(property).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="homepage">
      <SEO 
        title="Find the Best PGs, Hostels & Service Apartments" 
        description="Sortify Stays is India's leading platform to discover verified PGs, Hostels, and Service Apartments in top cities like Bangalore, Mumbai, and Delhi." 
      />
      <Header />
      
      <main>
        <section className="hero">
          <div className="container">
            <h1 className="hero-title">
              Find <span className="highlight">PG, Hostel, Home Stay</span> or <span className="highlight">Service Apartment</span>
            </h1>
          <div className="hero-sub">
            Verified stays • Flexible stays • All across India
          </div>

          <PromotionalAd location="home_hero" className="mt-4 mb-5" />

          <div className="ho-search-wrapper-new">
            <SearchWrapper 
              filters={filters}
              updateFilter={updateFilter}
              onSearch={goToListings}
              locationLoading={locationLoading}
              getUserLocation={getUserLocation}
            />
          </div>
        </div>
      </section>

     

      <div className="container">
        
        {loading ? (
          <div className="text-center py-5 my-5">
            <i className="fas fa-spinner fa-spin fa-2x text-warning"></i>
            <p className="mt-2 text-muted">Loading data...</p>
          </div>
        ) : (
          <>
            {/* 1. FEATURED PROPERTIES */}
            <div className="section-header compact">
              <h3><i className="fas fa-star" style={{ color: '#f97316' }}></i> Featured Properties</h3>
              <a href="#" className="section-link" onClick={(e) => { e.preventDefault(); navigate('/featured-properties'); }}>
                View all <i className="fas fa-arrow-right"></i>
              </a>
            </div>
            {renderPropertyGrid(featuredProperties, '🏠 No featured properties found')}

            {/* 2. TOP BRANDS */}
            {topBrands.length > 0 && (
              <div className="top-brands-section mt-5 mb-4">
                <div className="section-header compact">
                  <h3><i className="fas fa-crown" style={{ color: '#fbbf24' }}></i> Top Brands</h3>
                </div>
                <div className="brands-grid">
                  {topBrands.map((brand, idx) => (
                    <div key={idx} className="brand-card shadow-sm">
                      <img src={brand.logoUrl} alt={brand.name} className="brand-logo" />
                      <div className="brand-info">
                        <h5 className="brand-name">{brand.name}</h5>
                        <p className="brand-meta">{brand.count} Properties • <i className="fas fa-star text-warning"></i> {brand.avgRating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <PromotionalAd location="home_mid" />

            {/* 3. NEWLY LAUNCHED */}
            <div className="section-header compact mt-5">
              <h3><i className="fas fa-rocket" style={{ color: '#ef4444' }}></i> Newly Launched</h3>
              <a href="#" className="section-link" onClick={(e) => { e.preventDefault(); navigate('/new-properties'); }}>
                Explore more <i className="fas fa-arrow-right"></i>
              </a>
            </div>
            {renderPropertyGrid(newlyLaunched, '🏠 No new properties found')}

            {/* 4. POPULAR CITIES */}
            {activeCities.length > 0 && (
              <div className="popular-cities-section mt-5 mb-5">
                <div className="section-header compact">
                  <h3><i className="fas fa-globe" style={{ color: '#3b82f6' }}></i> Popular Cities</h3>
                  <a href="#" className="section-link" onClick={(e) => { e.preventDefault(); goToListings(); }}>
                    Explore all
                  </a>
                </div>
                <div className="cities-image-grid">
                  {activeCities.map((city, index) => (
                    <div 
                      key={index} 
                      className="city-image-card"
                      onClick={() => {
                        updateFilter('city', city.name);
                        goToListings(city.name);
                      }}
                    >
                      <img src={city.image} alt={city.name} className="city-card-img" loading="lazy" />
                      <div className="city-card-overlay">
                        <h4 className="city-name-overlay">{city.name}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </main>
      
      
      <div className="container mb-5 mt-2">
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-8">
            <div className="bg-white rounded-4 shadow-sm border border-light h-100 p-4 p-md-5">
              <HowItWorks />
            </div>
          </div>
          <div className="col-lg-4">
            <CTASection />
          </div>
        </div>
      </div>
<WhyChooseUs />
      <Footer />
      
      <CityNotAvailableModal 
        show={showCityModal} 
        onHide={() => setShowCityModal(false)} 
        city={unavailableCity} 
      />
    </div>
  );
};

export default HomePage;