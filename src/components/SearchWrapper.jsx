import React, { useRef } from 'react';
import { MapPin, Building, Bed, Search, Sparkles, ChevronDown } from 'lucide-react';
import { Autocomplete } from '@react-google-maps/api';
import { useGoogleMaps } from '../context/GoogleMapsContext';
import './SearchWrapper.css';

const SearchWrapper = ({ filters, updateFilter, onSearch, locationLoading, getUserLocation }) => {
  const autocompleteRef = useRef(null);

  const { isLoaded } = useGoogleMaps();

  const propertyTypes = [
    { label: 'All Stays', value: 'all', icon: <Sparkles size={16} /> },
    { label: 'PG', value: 'PG', icon: <Building size={16} /> },
    { label: 'Hostel', value: 'Hostel', icon: <Building size={16} /> },
    { label: 'Home Stay', value: 'Home Stay', icon: <Building size={16} /> },
    { label: 'Service Apartment', value: 'Service Apartment', icon: <Building size={16} /> }
  ];

  const genderOptions = [
    { label: 'Boys', value: 'boys' },
    { label: 'Girls', value: 'girls' },
    { label: 'Co-ed', value: 'co-ed' },
    { label: 'All', value: 'all' }
  ];

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.name) {
        updateFilter('locality', place.name);
        
        // Also extract city if possible
        const addressComponents = place.address_components || [];
        const cityComponent = addressComponents.find(c => c.types.includes('locality'));
        if (cityComponent) {
          updateFilter('city', cityComponent.long_name);
        }
      }
    }
  };

  return (
    <div className="sw-main-container">
      {/* Property Type Tabs */}
      <div className="sw-tabs-container">
        {propertyTypes.map(type => (
          <button 
            key={type.value}
            className={`sw-tab-btn ${filters.propertyType === type.value ? 'active' : ''}`}
            onClick={() => updateFilter('propertyType', type.value)}
          >
            {type.icon}
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      <div className="sw-search-box">
        <div className="sw-search-inner">
          {/* City / Locality Combined Search */}
          <div className="sw-input-section city-section">
            <MapPin size={20} className="sw-icon" />
            <div className="sw-input-group">
              <span className="sw-label">CITY</span>
              <input 
                type="text" 
                placeholder={locationLoading ? "Detecting..." : "Bangalore"} 
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
              />
            </div>
            {getUserLocation && (
              <button className="sw-detect-btn" onClick={getUserLocation} title="Detect Location">
                <div className={`sw-loc-dot ${locationLoading ? 'loading' : ''}`}></div>
              </button>
            )}
          </div>

          <div className="sw-divider"></div>

          <div className="sw-input-section locality-section">
            <Search size={20} className="sw-icon" />
            <div className="sw-input-group">
              <span className="sw-label">SEARCH LOCALITY / AREA</span>
              {isLoaded ? (
                <Autocomplete
                  onLoad={ref => autocompleteRef.current = ref}
                  onPlaceChanged={onPlaceChanged}
                >
                  <input 
                    type="text" 
                    placeholder="Koramangala, Indiranagar..." 
                    value={filters.locality}
                    onChange={(e) => updateFilter('locality', e.target.value)}
                  />
                </Autocomplete>
              ) : (
                <input 
                  type="text" 
                  placeholder="Koramangala, Indiranagar..." 
                  value={filters.locality}
                  onChange={(e) => updateFilter('locality', e.target.value)}
                />
              )}
            </div>
          </div>

          <button className="sw-search-btn" onClick={onSearch}>
            <Search size={22} />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Quick Filters Row */}
      <div className="sw-quick-filters">
        <div className="sw-filter-item">
          <span className="sw-filter-label">Gender:</span>
          <div className="sw-chips">
            {genderOptions.map(opt => (
              <button 
                key={opt.value}
                className={`sw-chip ${filters.gender === opt.value ? 'active' : ''}`}
                onClick={() => updateFilter('gender', opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchWrapper;

