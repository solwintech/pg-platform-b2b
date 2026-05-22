import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adService from '../services/adService';

const PromotionalAd = ({ location, className = "" }) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await adService.getAdsByLocation(location);
        setAds(response.advertisements || []);
      } catch (error) {
        console.error('Failed to fetch ads for', location, error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [location]);

  if (loading || ads.length === 0) return null;

  // For now, just show the first active ad for that location
  const ad = ads[0];

  const handleClick = () => {
    if (ad._id) {
      adService.recordClick(ad._id).catch(err => console.error('Failed to record click:', err));
    }
    if (ad.link) {
      if (ad.link.startsWith('http')) {
        window.open(ad.link, '_blank');
      } else {
        navigate(ad.link);
      }
    }
  };

  if (location === 'home_hero') {
    return (
      <div 
        className={`ad-home-hero ${className}`} 
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${ad.imageUrl})`,
          cursor: ad.link ? 'pointer' : 'default'
        }}
        onClick={handleClick}
      >
        <div className="ad-content">
          <h3>{ad.title}</h3>
          <p>{ad.subtitle}</p>
          {ad.link && <button className="btn btn-warning">Learn More</button>}
        </div>
      </div>
    );
  }

  if (location === 'home_mid' || location === 'listing_bottom') {
    return (
      <div 
        className={`ad-promotional-wide container ${location === 'home_mid' ? 'my-5' : 'mt-5'} ${className}`}
        onClick={handleClick}
        style={{ cursor: ad.link ? 'pointer' : 'default' }}
      >
        <div className="row align-items-center bg-white rounded shadow-sm overflow-hidden border">
          <div className="col-md-8 p-4 p-md-5">
            <h2 className={location === 'home_mid' ? 'display-6 fw-bold mb-3' : 'h3 fw-bold mb-2'}>{ad.title}</h2>
            <p className={location === 'home_mid' ? 'lead text-muted' : 'text-muted'}>{ad.subtitle}</p>
            {ad.link && <button className="btn btn-warning mt-2">Explore Now</button>}
          </div>
          <div className="col-md-4 p-0">
            <img src={ad.imageUrl} alt={ad.title} className="img-fluid" style={{ minHeight: '200px', width: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
    );
  }

  // Sidebar / Small card version
  return (
    <div 
      className={`ad-sidebar-card mb-4 ${className}`}
      onClick={handleClick}
      style={{ cursor: ad.link ? 'pointer' : 'default' }}
    >
      <div className="card border-0 shadow-sm overflow-hidden rounded-3">
        <img src={ad.imageUrl} className="card-img-top" alt={ad.title} style={{ height: '140px', objectFit: 'cover' }} />
        <div className="card-body p-3">
          <h6 className="card-title fw-bold mb-1">{ad.title}</h6>
          <p className="card-text small text-muted mb-2">{ad.subtitle}</p>
          {ad.link && <span className="text-warning fw-bold small">Explore Now <i className="fas fa-arrow-right ms-1"></i></span>}
        </div>
      </div>
    </div>
  );
};

export default PromotionalAd;
