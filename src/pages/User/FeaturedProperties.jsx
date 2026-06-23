import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import propertyService from '../../services/propertyService';
import SEO from '../../components/SEO';
import './HomePage.css';

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

const FeaturedProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await propertyService.getProperties({ limit: 1000, public: true }, false); 
      const realProperties = response.properties || [];
      const featured = realProperties.filter(p => p.isFeatured === true);
      setProperties(featured);
    } catch (error) {
      console.error('Failed to load featured properties:', error);
    } finally {
      setLoading(false);
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

  const renderPropertyGrid = (props, emptyMessage) => (
    <div className="compact-grid">
      {props.length === 0 ? (
        <div className="no-results">{emptyMessage}</div>
      ) : (
        props.map(property => (
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
      <SEO title="Featured Properties | Sortify Stays" description="Explore our featured PGs, Hostels & Service Apartments." />
      <Header />
      <main className="py-5" style={{ minHeight: '60vh', backgroundColor: '#f8fafc' }}>
        <div className="container mt-4">
          <div className="section-header compact mb-4">
            <h2><i className="fas fa-star" style={{ color: '#f97316' }}></i> Featured Properties</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <i className="fas fa-spinner fa-spin fa-2x text-warning"></i>
              <p className="mt-2 text-muted">Loading properties...</p>
            </div>
          ) : (
            renderPropertyGrid(properties, '🏠 No featured properties found')
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturedProperties;
