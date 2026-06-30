import React, { useRef, useState, useEffect } from 'react';
import { MapPin, Building, Bed, Search, Sparkles, ChevronDown, X } from 'lucide-react';
import { Autocomplete } from '@react-google-maps/api';
import { useGoogleMaps } from '../context/GoogleMapsContext';
import './SearchWrapper.css';

const SearchWrapper = ({ filters, updateFilter, onSearch, locationLoading, getUserLocation }) => {
  const autocompleteRef = useRef(null);
  const cityAutocompleteRef = useRef(null);

  const { isLoaded } = useGoogleMaps();

  const [cityBounds, setCityBounds] = useState(null);
  const [localityInput, setLocalityInput] = useState("");

  useEffect(() => {
    if (isLoaded && filters.city && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: `${filters.city}, India` }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setCityBounds(results[0].geometry.viewport);
        }
      });
    }
  }, [isLoaded, filters.city]);

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
        const currentLocalities = filters.localities || [];
        if (!currentLocalities.includes(place.name)) {
          updateFilter('localities', [...currentLocalities, place.name]);
        }
        setLocalityInput("");
        
        // Also extract city if possible
        const addressComponents = place.address_components || [];
        const cityComponent = addressComponents.find(c => c.types.includes('locality'));
        if (cityComponent) {
          updateFilter('city', cityComponent.long_name);
        }
      }
    }
  };

  const handleLocalityKeyDown = (e) => {
    if (e.key === 'Enter' && localityInput.trim()) {
      e.preventDefault();
      const val = localityInput.trim();
      const currentLocalities = filters.localities || [];
      if (!currentLocalities.includes(val)) {
        updateFilter('localities', [...currentLocalities, val]);
      }
      setLocalityInput("");
    }
  };

  const removeLocality = (loc) => {
    const currentLocalities = filters.localities || [];
    updateFilter('localities', currentLocalities.filter(l => l !== loc));
  };

  const onCityPlaceChanged = () => {
    if (cityAutocompleteRef.current !== null) {
      const place = cityAutocompleteRef.current.getPlace();
      if (place && place.name) {
        updateFilter('city', place.name);
      }
    }
  };

  return (
    <div className="sw-main-container">
      {/* Property Type Filters */}
      <div className="sw-quick-filters" style={{ marginBottom: '20px' }}>
        <div className="sw-filter-item">
          <span className="sw-filter-label">Stay Type:</span>
          <div className="sw-chips">
            {propertyTypes.map(type => (
              <button 
                key={type.value}
                className={`sw-chip ${filters.propertyType === type.value ? 'active' : ''}`}
                onClick={() => updateFilter('propertyType', type.value)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {type.icon}
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sw-search-box">
        <div className="sw-search-inner">
          {/* City / Locality Combined Search */}
          <div className="sw-input-section city-section">
            <MapPin size={20} className="sw-icon" />
            <div className="sw-input-group">
              <span className="sw-label">CITY</span>
              {isLoaded ? (
                <Autocomplete
                  onLoad={ref => cityAutocompleteRef.current = ref}
                  onPlaceChanged={onCityPlaceChanged}
                  options={{ types: ['(cities)'], componentRestrictions: { country: 'in' } }}
                >
                  <input 
                    type="text" 
                    placeholder={locationLoading ? "Detecting..." : "Bangalore"} 
                    value={filters.city}
                    onChange={(e) => updateFilter('city', e.target.value)}
                  />
                </Autocomplete>
              ) : (
                <input 
                  type="text" 
                  placeholder={locationLoading ? "Detecting..." : "Bangalore"} 
                  value={filters.city}
                  onChange={(e) => updateFilter('city', e.target.value)}
                />
              )}
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
                  options={{
                    bounds: cityBounds,
                    strictBounds: true,
                    componentRestrictions: { country: 'in' }
                  }}
                >
                  <input 
                    type="text" 
                    placeholder="Koramangala, Indiranagar..." 
                    value={localityInput}
                    onChange={(e) => setLocalityInput(e.target.value)}
                    onKeyDown={handleLocalityKeyDown}
                  />
                </Autocomplete>
              ) : (
                <input 
                  type="text" 
                  placeholder="Koramangala, Indiranagar..." 
                  value={localityInput}
                  onChange={(e) => setLocalityInput(e.target.value)}
                  onKeyDown={handleLocalityKeyDown}
                />
              )}
              
              {(filters.localities && filters.localities.length > 0) && (
                <div className="d-flex flex-wrap gap-1 mt-2">
                  {filters.localities.map((loc, idx) => (
                    <div key={idx} className="badge bg-light text-dark border px-2 py-1 d-flex align-items-center gap-1 rounded-pill" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                      {loc}
                      <X size={12} className="text-muted" style={{ cursor: 'pointer' }} onClick={() => removeLocality(loc)} />
                    </div>
                  ))}
                </div>
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

