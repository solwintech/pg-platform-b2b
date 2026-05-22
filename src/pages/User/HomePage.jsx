// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import propertyService from '../../services/propertyService';
import PromotionalAd from '../../components/PromotionalAd';
import SearchWrapper from '../../components/SearchWrapper';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: 'Bangalore',
    locality: '',
    propertyType: 'all',
    budget: 'any',
    occupancy: 'any',
    gender: 'any'
  });
  const [locationLoading, setLocationLoading] = useState(false);

  const citiesData = [
    { name: "Mumbai", count: "240+ PGs", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80" },
    { name: "Delhi", count: "310+ PGs", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80" },
    { name: "Bangalore", count: "580+ PGs", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?w=400&q=80" },
    { name: "Hyderabad", count: "210+ PGs", image: "https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=400&q=80" },
    { name: "Chennai", count: "195+ PGs", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80" },
    { name: "Pune", count: "270+ PGs", image: "https://images.unsplash.com/photo-1572913017567-02f0649bed21?w=400&q=80" },
    { name: "Kolkata", count: "140+ PGs", image: "https://images.unsplash.com/photo-1536421469767-10559bc65c04?w=400&q=80" },
    { name: "Ahmedabad", count: "120+ PGs", image: "https://images.unsplash.com/photo-1597058712635-3182d1e0bf09?w=400&q=80" },
    { name: "Jaipur", count: "98+ PGs", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=80" },
    { name: "Lucknow", count: "85+ PGs", image: "https://images.unsplash.com/photo-1587541991851-fe4bbde8416d?w=400&q=80" }
  ];

  useEffect(() => {
    loadFeaturedProperties();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            
            // Extract city from response
            const city = data.address.city || data.address.town || data.address.state_district;
            if (city) {
              // Standardize city name and update state
              const cleanedCity = city.replace(/ City$/, '');
              setFilters(prev => ({ ...prev, city: cleanedCity }));
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

  const loadFeaturedProperties = async () => {
    setLoading(true);
    try {
      const response = await propertyService.getProperties({ 
        limit: 6,
        isFeatured: true
      });
      setFeaturedProperties(response.properties || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
      setFeaturedProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

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

  const getDisplayLocation = (property) => {
    if (property.location?.area) return property.location.area;
    if (property.location?.address) return property.location.address;
    return property.location?.city || 'Location';
  };

  const goToListings = () => {
    let minPrice = 0, maxPrice = 50000;
    if (filters.budget === '<8000') {
      maxPrice = 8000;
    } else if (filters.budget === '8000-15000') {
      minPrice = 8000;
      maxPrice = 15000;
    } else if (filters.budget === '>15000') {
      minPrice = 15000;
      maxPrice = 100000;
    }
    
    let genderMap = { boys: 'male', girls: 'female', 'co-ed': 'any', any: 'any' };
    
    navigate('/listings', { 
      state: {
        city: filters.city,
        locality: filters.locality,
        propertyType: filters.propertyType === 'all' ? 'all' : filters.propertyType,
        minPrice: minPrice,
        maxPrice: maxPrice,
        gender: genderMap[filters.gender] || 'any',
        occupancy: filters.occupancy
      }
    });
  };

  return (
    <div className="homepage">
      <Header />
      
      <section className="hero">
        <div className="container">
          <div className="hero-title">
            Find <span className="highlight">PG, Hostel, Home Stay</span> or <span className="highlight">Service Apartment</span>
          </div>
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
        <div className="section-header compact">
          <h3><i className="fas fa-star" style={{ color: '#f97316' }}></i> Featured Properties</h3>
          <a 
            href="#" 
            className="section-link"
            onClick={(e) => {
              e.preventDefault();
              goToListings();
            }}
          >
            View all <i className="fas fa-arrow-right"></i>
          </a>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <i className="fas fa-spinner fa-spin fa-2x text-warning"></i>
          </div>
        ) : (
          <div className="compact-grid">
            {featuredProperties.length === 0 ? (
              <div className="no-results">🏠 No properties found</div>
            ) : (
              featuredProperties.map(property => (
                <div 
                  key={property._id} 
                  className="compact-card"
                  onClick={() => navigate(`/property/${property._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div 
                    className="compact-card-img" 
                    style={{ 
                      backgroundImage: `url(${property.images?.[0]?.url || property.coverImage || 'https://placehold.co/600x400/FFF3E0/FF8C42?text=Property'})`,
                    }}
                  >
                    <div className="compact-badge">{property.propertyType || property.type || 'PG'}</div>
                  </div>
                  <div className="compact-card-content">
                    <div className="compact-title">{getDisplayName(property)}</div>
                    <div className="compact-location">
                      <i className="fas fa-map-pin"></i> {getDisplayLocation(property)}, {property.location?.city || 'City'}
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
        )}

        <PromotionalAd location="home_mid" />

        <div className="section-header compact">
          <h3><i className="fas fa-globe"></i> Popular Cities</h3>
          <a 
            href="#" 
            className="section-link"
            onClick={(e) => {
              e.preventDefault();
              goToListings();
            }}
          >
            Explore all
          </a>
        </div>
        <div className="cities-image-grid">
          {citiesData.map((city, index) => (
            <div 
              key={index} 
              className="city-image-card"
              onClick={() => {
                updateFilter('city', city.name);
                goToListings();
              }}
            >
              <img src={city.image} alt={city.name} className="city-card-img" loading="lazy" />
              <div className="city-card-overlay">
                <h4 className="city-name-overlay">{city.name}</h4>
                <p className="city-count-overlay">{city.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;