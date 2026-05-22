import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapPin, Navigation, Building, Plus, Trash2, LocateFixed, Crosshair, Search, Map as MapIcon, X } from 'lucide-react';
import { GoogleMap, Marker, Autocomplete, InfoWindow } from '@react-google-maps/api';
import { Modal, Button } from 'react-bootstrap';
import { useGoogleMaps } from '../../context/GoogleMapsContext';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};
const defaultCenter = {
  lat: 23.2599,
  lng: 77.4126 // Bhopal
};

const StepLocation = ({ data, updateData }) => {
  const [nearbyPlaces, setNearbyPlaces] = useState(data.nearbyPlaces || []);
  const [newPlace, setNewPlace] = useState({ name: '', distance: '' });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    lat: parseFloat(data.latitude) || defaultCenter.lat,
    lng: parseFloat(data.longitude) || defaultCenter.lng
  });
  const [markerPosition, setMarkerPosition] = useState({
    lat: parseFloat(data.latitude) || defaultCenter.lat,
    lng: parseFloat(data.longitude) || defaultCenter.lng
  });
  const [modalAutocompleteRef, setModalAutocompleteRef] = useState(null);

  const autocompleteRef = useRef(null);
  const nearbyAutocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useGoogleMaps();

  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const pos = { lat, lng };

        const addressComponents = place.address_components || [];
        let city = '';
        let pinCode = '';
        let area = place.name || '';

        addressComponents.forEach(component => {
          if (component.types.includes('locality')) city = component.long_name;
          if (component.types.includes('postal_code')) pinCode = component.long_name;
          if (component.types.includes('sublocality') && !area) area = component.long_name;
        });

        updateData({
          latitude: lat,
          longitude: lng,
          city: city || data.city,
          pinCode: pinCode || data.pinCode,
          area: area || data.area,
          address: place.formatted_address || data.address
        });

        setMapCenter(pos);
        setMarkerPosition(pos);
      }
    }
  };

  const onModalPlaceChanged = () => {
    if (modalAutocompleteRef !== null) {
      const place = modalAutocompleteRef.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const pos = { lat, lng };
        
        setMapCenter(pos);
        setMarkerPosition(pos);
        
        const addressComponents = place.address_components || [];
        let city = '';
        let pinCode = '';
        let area = place.name || '';

        addressComponents.forEach(component => {
          if (component.types.includes('locality')) city = component.long_name;
          if (component.types.includes('postal_code')) pinCode = component.long_name;
          if (component.types.includes('sublocality') && !area) area = component.long_name;
        });

        updateData({
          latitude: lat,
          longitude: lng,
          city: city || data.city,
          pinCode: pinCode || data.pinCode,
          area: area || data.area,
          address: place.formatted_address || data.address
        });
      }
    }
  };

  const onNearbyPlaceChanged = () => {
    if (nearbyAutocompleteRef.current !== null) {
      const place = nearbyAutocompleteRef.current.getPlace();
      if (place.name) {
        setNewPlace(prev => ({ ...prev, name: place.name }));

        // If we have property coordinates, calculate distance
        if (data.latitude && data.longitude && place.geometry) {
          const service = new window.google.maps.DistanceMatrixService();
          service.getDistanceMatrix({
            origins: [{ lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) }],
            destinations: [place.geometry.location],
            travelMode: 'DRIVING',
          }, (response, status) => {
            if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
              const distanceKm = (response.rows[0].elements[0].distance.value / 1000).toFixed(1);
              setNewPlace(prev => ({ ...prev, distance: distanceKm }));
            }
          });
        }
      }
    }
  };

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const pos = { lat, lng };
    setMarkerPosition(pos);

    // Reverse Geocoding
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: pos }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const place = results[0];
        const addressComponents = place.address_components || [];
        let city = '';
        let pinCode = '';
        let area = '';

        addressComponents.forEach(component => {
          if (component.types.includes('locality')) city = component.long_name;
          if (component.types.includes('postal_code')) pinCode = component.long_name;
          if (component.types.includes('sublocality')) area = component.long_name;
        });

        updateData({
          latitude: lat,
          longitude: lng,
          city: city || data.city,
          pinCode: pinCode || data.pinCode,
          area: area || data.area,
          address: place.formatted_address
        });
      } else {
        updateData({ latitude: lat, longitude: lng });
      }
    });
  }, [data, updateData]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        
        console.log(`Captured location with accuracy: ${accuracy} meters`);
        
        setMapCenter(pos);
        setMarkerPosition(pos);
        
        // Update data immediately with raw coordinates to ensure they are captured
        updateData({
          latitude: latitude,
          longitude: longitude
        });

        // Reverse Geocoding for address details
        if (window.google) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: pos }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const place = results[0];
              const addressComponents = place.address_components || [];
              let city = '';
              let pinCode = '';

              addressComponents.forEach(component => {
                if (component.types.includes('locality')) city = component.long_name;
                if (component.types.includes('postal_code')) pinCode = component.long_name;
              });

              updateData({
                latitude,
                longitude,
                city: city || data.city,
                pinCode: pinCode || data.pinCode,
                address: place.formatted_address
              });
            }
          });
        }
        
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        let msg = 'Unable to get location.';
        if (error.code === 1) msg = 'Location permission denied. Please enable it in browser settings.';
        else if (error.code === 3) msg = 'Location request timed out.';
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const addNearbyPlace = () => {
    if (newPlace.name && newPlace.distance) {
      const updated = [...nearbyPlaces, { ...newPlace, id: Date.now() }];
      setNearbyPlaces(updated);
      updateData({ nearbyPlaces: updated });
      setNewPlace({ name: '', distance: '' });
    } else {
      alert('Please enter both place name and distance');
    }
  };

  const removeNearbyPlace = (index) => {
    const updated = nearbyPlaces.filter((_, i) => i !== index);
    setNearbyPlaces(updated);
    updateData({ nearbyPlaces: updated });
  };

  if (loadError) {
    return <div className="alert alert-danger">Error loading Google Maps. Please check your API key.</div>;
  }

  return (
    <div className="step-location">
      <h5 className="mb-3 fw-semibold">Location Details</h5>
      <div className="alert alert-primary py-2 px-3 rounded-3 mb-4" style={{ border: 'none', background: '#eef2ff' }}>
        <div className="d-flex align-items-center gap-2">
          <MapPin size={14} className="text-primary" />
          <p className="text-primary mb-0 fw-medium" style={{ fontSize: '11px' }}>
            Note: Any changes to location details require admin re-approval.
          </p>
        </div>
      </div>
      
      {/* Coordinates Section */}
      <div className="col-12 mb-4">
        <label className="form-label small fw-medium text-muted">Map Coordinates & Verification</label>
        <div className="d-flex gap-2 mb-2">
          <button
            className="btn btn-sm btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            type="button"
          >
            <Crosshair size={14} className={gettingLocation ? 'spinner-border spinner-border-sm border-0' : ''} />
            {gettingLocation ? 'Capturing GPS...' : 'Use My Current Location'}
          </button>
          <button
            className="btn btn-sm btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2"
            type="button"
            onClick={() => {
              if (data.latitude && data.longitude) {
                const pos = { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) };
                setMapCenter(pos);
                setMarkerPosition(pos);
              }
              setShowMapModal(true);
            }}
          >
            <MapIcon size={14} /> Select on Map
          </button>
        </div>

        <div className="row g-2">
          <div className="col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted" style={{ fontSize: '10px' }}>LAT</span>
              <input
                type="number"
                className="form-control"
                name="latitude"
                value={data.latitude || ''}
                onChange={handleChange}
                placeholder="0.000000"
                step="any"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted" style={{ fontSize: '10px' }}>LNG</span>
              <input
                type="number"
                className="form-control"
                name="longitude"
                value={data.longitude || ''}
                onChange={handleChange}
                placeholder="0.000000"
                step="any"
              />
            </div>
          </div>
        </div>
        {data.latitude && data.longitude && (
          <p className="text-success mt-2 mb-0 d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
            <LocateFixed size={12} /> Verified coordinates captured successfully
          </p>
        )}
      </div>

      <div className="row g-3">
        {/* Area / Sector Selection */}
        <div className="col-md-12">
          <label className="form-label small fw-medium text-muted">Search Area / Property Location *</label>
          {isLoaded ? (
            <Autocomplete
              onLoad={ref => autocompleteRef.current = ref}
              onPlaceChanged={onPlaceChanged}
            >
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">
                  <Search size={14} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  name="area"
                  value={data.area || ''}
                  onChange={handleChange}
                  placeholder="Type to search area, sector or landmark..."
                  autoComplete="off"
                />
              </div>
            </Autocomplete>
          ) : (
            <input
              type="text"
              className="form-control form-control-sm"
              name="area"
              value={data.area || ''}
              onChange={handleChange}
              placeholder="Loading search..."
              disabled
            />
          )}
        </div>

        {/* Full Address */}
        <div className="col-12">
          <label className="form-label small fw-medium text-muted">Full Address *</label>
          <textarea
            className="form-control form-control-sm"
            name="address"
            value={data.address || ''}
            onChange={handleChange}
            rows="2"
            placeholder="House No, Street name, Landmark, etc."
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        {/* City & State */}
        <div className="col-md-6">
          <label className="form-label small fw-medium text-muted">City *</label>
          <input
            type="text"
            className="form-control form-control-sm"
            name="city"
            value={data.city || ''}
            onChange={handleChange}
            placeholder="e.g. Bhopal"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-medium text-muted">PIN Code *</label>
          <input
            type="text"
            className="form-control form-control-sm"
            name="pinCode"
            value={data.pinCode || ''}
            onChange={handleChange}
            placeholder="462001"
          />
        </div>


        {/* Multiple Nearby Places Section */}
        <div className="col-12 mt-2">
          <label className="form-label small fw-medium text-muted">Popular Destinations Nearby</label>
          <p className="text-muted mb-2" style={{ fontSize: '11px' }}>Distance will be calculated automatically</p>

          <div className="nearby-places-list mb-2">
            {nearbyPlaces.map((place, idx) => (
              <div key={idx} className="d-flex align-items-center gap-2 mb-2 p-2 border rounded bg-white shadow-sm">
                <Navigation size={14} className="text-primary" />
                <span className="small flex-grow-1 fw-medium">{place.name}</span>
                <span className="badge bg-light text-dark border">{place.distance} km</span>
                <button
                  className="btn-icon-sm text-danger border-0 bg-transparent"
                  onClick={() => removeNearbyPlace(idx)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="d-flex gap-2">
            <div className="flex-grow-1">
              {isLoaded ? (
                <Autocomplete
                  onLoad={ref => nearbyAutocompleteRef.current = ref}
                  onPlaceChanged={onNearbyPlaceChanged}
                >
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search landmark (e.g. DB Mall)"
                    value={newPlace.name}
                    onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                  />
                </Autocomplete>
              ) : (
                <input type="text" className="form-control form-control-sm" disabled placeholder="Loading..." />
              )}
            </div>
            <div className="input-group input-group-sm" style={{ width: '100px' }}>
              <input
                type="number"
                className="form-control bg-light"
                placeholder="Dist."
                value={newPlace.distance}
                readOnly
                step="0.1"
              />
              <span className="input-group-text px-1">km</span>
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={addNearbyPlace}
              type="button"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Map Selection Modal */}
      <Modal show={showMapModal} onHide={() => setShowMapModal(false)} size="lg" centered scrollable={true}>
        <Modal.Header closeButton className="py-2 px-3 border-bottom-0">
          <Modal.Title className="h6 fw-bold mb-0">Select Property Location</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-0 px-3">
          <div className="mb-2">
            {isLoaded && (
              <Autocomplete
                onLoad={ref => setModalAutocompleteRef(ref)}
                onPlaceChanged={onModalPlaceChanged}
                options={{
                  fields: ["address_components", "geometry", "formatted_address", "name"],
                  types: ["geocode", "establishment"]
                }}
              >
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search city, building, street or area..."
                    autoComplete="off"
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  />
                </div>
              </Autocomplete>
            )}
          </div>
          
          {isLoaded ? (
            <div className="rounded-3 overflow-hidden border">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '320px' }}
                center={mapCenter}
                zoom={15}
                onClick={onMapClick}
                onLoad={map => mapRef.current = map}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                  gestureHandling: 'greedy'
                }}
              >
                <Marker
                  position={markerPosition}
                  draggable={true}
                  onDragEnd={onMapClick}
                  animation={window.google.maps.Animation.DROP}
                />
              </GoogleMap>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-center bg-light rounded-3" style={{ height: '320px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Map...</span>
              </div>
            </div>
          )}
          
          <div className="mt-2 p-2 bg-light rounded-3 border">
            <div className="d-flex align-items-center gap-2">
              <MapPin size={16} className="text-primary flex-shrink-0" />
              <div className="flex-grow-1 overflow-hidden">
                <p className="mb-0 text-muted text-truncate" style={{ fontSize: '11px' }}>
                  {data.address || 'Click map to pin location'}
                </p>
                <div className="d-flex gap-2 text-muted fw-medium" style={{ fontSize: '9px' }}>
                  <span>LAT: {markerPosition.lat.toFixed(6)}</span>
                  <span>LNG: {markerPosition.lng.toFixed(6)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="py-2 px-3 border-top-0">
          <Button variant="outline-secondary" size="sm" onClick={() => setShowMapModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" className="px-4" onClick={() => setShowMapModal(false)}>
            Confirm Location
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StepLocation;
