import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { useGoogleMaps } from '../context/GoogleMapsContext';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 23.2599,
  lng: 77.4126 // Bhopal
};

const PropertyMap = ({ properties, center, zoom, height = "400px", highlightedId = null, minimal = false }) => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded } = useGoogleMaps();

  const getLat = (p) => p?.location?.lat || p?.location?.latitude || p?.latitude || p?.lat;
  const getLng = (p) => p?.location?.lng || p?.location?.longitude || p?.longitude || p?.lng;

  // Calculate center
  let mapCenter = defaultCenter;
  if (center) {
    if (Array.isArray(center) && center.length === 2 && center[0] && center[1]) {
      mapCenter = { lat: parseFloat(center[0]), lng: parseFloat(center[1]) };
    } else if (typeof center === 'object' && center.lat && center.lng) {
      mapCenter = { lat: parseFloat(center.lat), lng: parseFloat(center.lng) };
    }
  } else if (properties.length > 0 && getLat(properties[0]) && getLng(properties[0])) {
    mapCenter = { lat: parseFloat(getLat(properties[0])), lng: parseFloat(getLng(properties[0])) };
  }

  const mapZoom = zoom || (highlightedId ? 15 : 12);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    if (properties.length > 1 && !center) {
      const bounds = new window.google.maps.LatLngBounds();
      properties.forEach(p => {
        if (getLat(p) && getLng(p)) {
          bounds.extend({ lat: parseFloat(getLat(p)), lng: parseFloat(getLng(p)) });
        }
      });
      map.fitBounds(bounds);
    }
  }, [properties, center]);

  useEffect(() => {
    if (highlightedId) {
      const property = properties.find(p => p._id === highlightedId);
      if (property && getLat(property)) {
        setSelectedProperty(property);
      }
    }
  }, [highlightedId, properties]);

  if (!isLoaded) return <div style={{ height, width: '100%', background: '#f8f9fa' }} className="d-flex align-items-center justify-content-center">Loading Map...</div>;

  return (
    <div style={{ height, width: '100%', borderRadius: minimal ? '0px' : '12px', overflow: 'hidden', boxShadow: minimal ? 'none' : '0 4px 12px rgba(0,0,0,0.1)' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: minimal,
          zoomControl: !minimal,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: !minimal,
          styles: [
            {
              "featureType": "poi",
              "elementType": "labels",
              "stylers": [{ "visibility": "off" }]
            }
          ]
        }}
      >
        {properties.map((property) => {
          if (!getLat(property) || !getLng(property)) return null;
          
          const isActive = property._id === highlightedId;
          
          return (
            <Marker 
              key={property._id} 
              position={{ lat: parseFloat(getLat(property)), lng: parseFloat(getLng(property)) }}
              onClick={() => setSelectedProperty(property)}
              icon={isActive ? {
                url: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
              } : {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
            />
          );
        })}

        {selectedProperty && (
          <InfoWindow
            position={{ 
              lat: parseFloat(getLat(selectedProperty)), 
              lng: parseFloat(getLng(selectedProperty)) 
            }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div className="map-popup-card shadow-sm" style={{ width: '250px', padding: '0', overflow: 'hidden', borderRadius: '12px', fontFamily: 'inherit' }}>
              <div className="popup-image-wrapper position-relative" style={{ height: '140px', overflow: 'hidden', borderBottom: '1px solid #f1f5f9' }}>
                <img 
                  src={selectedProperty.images?.[0]?.url || selectedProperty.coverImage || 'https://placehold.co/250x140?text=Property'} 
                  alt={selectedProperty.pgName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="position-absolute bottom-0 start-0 w-100 p-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
                  <span className="badge bg-white text-dark fw-bold px-2 py-1 shadow-sm rounded-pill" style={{ fontSize: '0.7rem' }}>
                    <i className="fas fa-star text-warning me-1"></i> {selectedProperty.rating || '4.5'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <h6 className="popup-title mb-1 fw-bold text-dark text-truncate" style={{ fontSize: '15px', letterSpacing: '-0.3px' }}>
                  {selectedProperty.pgName || selectedProperty.title || 'Property Name'}
                </h6>
                <div className="popup-location text-muted mb-3 text-truncate" style={{ fontSize: '0.8rem' }}>
                  <i className="fas fa-map-marker-alt me-1" style={{ color: '#ef4444' }}></i> {selectedProperty.location?.area || selectedProperty.location?.city || 'Location Details'}
                </div>
                <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-2" style={{ borderColor: '#f1f5f9' }}>
                  <div className="popup-price-info">
                    <span className="text-muted d-block fw-semibold" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Starts from</span>
                    <span className="fw-bolder" style={{ fontSize: '1.15rem', color: '#ea580c' }}>₹{selectedProperty.minPrice?.toLocaleString() || 'N/A'}</span>
                    <span className="text-muted fw-medium" style={{ fontSize: '0.75rem' }}>/mo</span>
                  </div>
                  <button 
                    className="btn btn-sm px-3 py-2 fw-bold shadow-sm"
                    style={{ fontSize: '0.8rem', backgroundColor: '#14b8a6', color: 'white', borderRadius: '8px', border: 'none' }}
                    onClick={() => navigate(`/property/${selectedProperty.slug || selectedProperty._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default PropertyMap;

