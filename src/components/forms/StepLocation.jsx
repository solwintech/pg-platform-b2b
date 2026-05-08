import React, { useState } from 'react';
import { MapPin, Navigation, Building, Plus, Trash2, LocateFixed, Crosshair } from 'lucide-react';

const StepLocation = ({ data, updateData }) => {
  const [nearbyPlaces, setNearbyPlaces] = useState(data.nearbyPlaces || []);
  const [newPlace, setNewPlace] = useState({ name: '', distance: '' });
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  // Get current location using browser geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateData({
          latitude: latitude,
          longitude: longitude
        });
        setGettingLocation(false);
        alert(`📍 Location captured: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = 'Unable to get location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Please enter coordinates manually.';
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
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
      <p className="text-muted small mb-4">Where is your property located?</p>
      
      <div className="row g-3">
        {/* Area / Sector Selection */}
        <div className="col-md-12">
          <label className="form-label small fw-medium text-muted">Area / Sector *</label>
          <input
            type="text"
            className="form-control form-control-sm"
            name="area"
            value={data.area || ''}
            onChange={handleChange}
            placeholder="e.g. Shahapura A-sector, B-Sector, E-1"
            autoComplete="off"
          />
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
            autoComplete="off"
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
            autoComplete="off"
          />
        </div>

        {/* Coordinates Section */}
        <div className="col-12">
          <label className="form-label small fw-medium text-muted">Map Coordinates</label>
          <div className="d-flex gap-2 mb-2">
            <button 
              className="btn btn-sm btn-outline-primary flex-grow-1"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              type="button"
            >
              <Crosshair size={12} className="me-1" />
              {gettingLocation ? 'Getting Location...' : 'Use My Current Location'}
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary flex-grow-1"
              type="button"
              onClick={() => alert('Map selection interface would open here')}
            >
              <MapPin size={12} className="me-1" /> Select on Map
            </button>
          </div>
          
          <div className="row g-2">
            <div className="col-md-6">
              <input
                type="number"
                className="form-control form-control-sm"
                name="latitude"
                value={data.latitude || ''}
                onChange={handleChange}
                placeholder="Latitude"
                step="any"
              />
            </div>
            <div className="col-md-6">
              <input
                type="number"
                className="form-control form-control-sm"
                name="longitude"
                value={data.longitude || ''}
                onChange={handleChange}
                placeholder="Longitude"
                step="any"
              />
            </div>
          </div>
        </div>

        {/* Multiple Nearby Places Section */}
        <div className="col-12 mt-2">
          <label className="form-label small fw-medium text-muted">Popular Destinations</label>
          <p className="text-muted small mb-2">Distance will be calculated from these points</p>
          
          <div className="nearby-places-list mb-2">
            {nearbyPlaces.map((place, idx) => (
              <div key={idx} className="d-flex align-items-center gap-2 mb-2 p-2 border rounded bg-white">
                <Navigation size={14} className="text-primary" />
                <span className="small flex-grow-1 fw-medium">{place.name}</span>
                <span className="badge bg-light text-dark">{place.distance} km</span>
                <button 
                  className="btn-icon-sm text-danger border-0 bg-transparent"
                  onClick={() => removeNearbyPlace(idx)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm flex-grow-1"
              placeholder="Search destination (e.g. DB Mall, MANIT)"
              value={newPlace.name}
              onChange={(e) => setNewPlace({...newPlace, name: e.target.value})}
              autoComplete="off"
            />
            <div className="input-group input-group-sm" style={{ width: '120px' }}>
              <input
                type="number"
                className="form-control"
                placeholder="Dist."
                value={newPlace.distance}
                onChange={(e) => setNewPlace({...newPlace, distance: e.target.value})}
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
    </div>
  );
};

export default StepLocation;