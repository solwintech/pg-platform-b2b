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

  // Calculate center
  let mapCenter = defaultCenter;
  if (center) {
    if (Array.isArray(center) && center.length === 2) {
      mapCenter = { lat: parseFloat(center[0]), lng: parseFloat(center[1]) };
    } else if (typeof center === 'object' && center.lat && center.lng) {
      mapCenter = { lat: parseFloat(center.lat), lng: parseFloat(center.lng) };
    }
  } else if (properties.length > 0 && properties[0].location?.lat) {
    mapCenter = { lat: parseFloat(properties[0].location.lat), lng: parseFloat(properties[0].location.lng) };
  }

  const mapZoom = zoom || (highlightedId ? 15 : 12);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    if (properties.length > 1 && !center) {
      const bounds = new window.google.maps.LatLngBounds();
      properties.forEach(p => {
        if (p.location?.lat && p.location?.lng) {
          bounds.extend({ lat: parseFloat(p.location.lat), lng: parseFloat(p.location.lng) });
        }
      });
      map.fitBounds(bounds);
    }
  }, [properties, center]);

  useEffect(() => {
    if (highlightedId) {
      const property = properties.find(p => p._id === highlightedId);
      if (property && property.location?.lat) {
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
          if (!property.location?.lat || !property.location?.lng) return null;
          
          const isActive = property._id === highlightedId;
          
          return (
            <Marker 
              key={property._id} 
              position={{ lat: parseFloat(property.location.lat), lng: parseFloat(property.location.lng) }}
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
              lat: parseFloat(selectedProperty.location.lat), 
              lng: parseFloat(selectedProperty.location.lng) 
            }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div className="map-popup-card" style={{ width: '220px', padding: '5px' }}>
              <div className="popup-image-wrapper mb-2" style={{ height: '100px', overflow: 'hidden', borderRadius: '4px' }}>
                <img 
                  src={selectedProperty.images?.[0]?.url || selectedProperty.coverImage || 'https://placehold.co/220x100?text=Property'} 
                  alt={selectedProperty.pgName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h6 className="popup-title mb-1 fw-bold" style={{ fontSize: '14px' }}>{selectedProperty.pgName || selectedProperty.title}</h6>
              <div className="popup-location small text-muted mb-2">
                <i className="fas fa-map-marker-alt me-1"></i> {selectedProperty.location?.area}
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="popup-price-info">
                  <span className="fw-bold text-primary">₹{selectedProperty.minPrice?.toLocaleString()}</span>
                  <span className="text-muted small">/mo</span>
                </div>
                <button 
                  className="btn btn-primary btn-sm py-0 px-2"
                  style={{ fontSize: '11px' }}
                  onClick={() => navigate(`/property/${selectedProperty._id}`)}
                >
                  View
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default PropertyMap;

