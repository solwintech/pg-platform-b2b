import React, { useState } from 'react';
import { 
  Wifi, Wind, Coffee, Shield, Zap, Car, Camera, Dumbbell, Plus, X, 
  Monitor, Refrigerator, Microwave, Flame, Table, Sofa, Armchair, 
  Tv, Droplets, ThermometerSnowflake, Waves, ArrowUp
} from 'lucide-react';
import { mockAmenities } from '../../utils/mockData';

const StepAmenities = ({ data, updateData }) => {
  const [selectedAmenities, setSelectedAmenities] = useState(data.amenities || []);

  const toggleAmenity = (amenity) => {
    let updated;
    if (selectedAmenities.includes(amenity)) {
      updated = selectedAmenities.filter(a => a !== amenity);
    } else {
      updated = [...selectedAmenities, amenity];
    }

    setSelectedAmenities(updated);
    updateData({ amenities: updated });
  };

  const getAmenityIcon = (amenity) => {
    const name = amenity.toLowerCase();
    if (name.includes('wifi')) return <Wifi size={14} />;
    if (name.includes('ac')) return <Wind size={14} />;
    if (name.includes('food') || name.includes('coffee')) return <Coffee size={14} />;
    if (name.includes('security')) return <Shield size={14} />;
    if (name.includes('power')) return <Zap size={14} />;
    if (name.includes('parking')) return <Car size={14} />;
    if (name.includes('cctv')) return <Camera size={14} />;
    if (name.includes('gym')) return <Dumbbell size={14} />;
    if (name.includes('tv')) return <Tv size={14} />;
    if (name.includes('fridge') || name.includes('refrigerator')) return <Refrigerator size={14} />;
    if (name.includes('microwave')) return <Microwave size={14} />;
    if (name.includes('heater')) return <Flame size={14} />;
    if (name.includes('table')) return <Table size={14} />;
    if (name.includes('sofa')) return <Sofa size={14} />;
    if (name.includes('chair')) return <Armchair size={14} />;
    if (name.includes('water')) return <Droplets size={14} />;
    if (name.includes('lift')) return <ArrowUp size={14} />;
    return null;
  };

  return (
    <div className="step-amenities">
      <h5 className="mb-3 fw-semibold">Amenities & Features</h5>
      
      {/* Common Amenities Section */}
      <div className="amenities-section mb-4">
        <p className="text-muted small mb-4">Select common facilities available for all residents in the building</p>
        <div className="row g-2">
          {mockAmenities.map(amenity => (
            <div key={amenity} className="col-md-3 col-sm-4 col-6">
              <div 
                className={`amenity-toggle-card ${selectedAmenities.includes(amenity) ? 'active' : ''}`}
                onClick={() => toggleAmenity(amenity)}
              >
                {getAmenityIcon(amenity)}
                <span className="small ms-2">{amenity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Amenities */}
      <div className="mb-4">
        <label className="form-label small fw-medium text-muted">Other Common Features</label>
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-light">
            <Plus size={14} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="e.g., Swimming Pool, Library (press Enter)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value) {
                const custom = e.target.value.trim();
                if (!selectedAmenities.includes(custom)) {
                  const updated = [...selectedAmenities, custom];
                  setSelectedAmenities(updated);
                  updateData({ amenities: updated });
                }
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      {/* Selected Amenities Display */}
      {selectedAmenities.length > 0 && (
        <div className="selected-amenities-display p-3 bg-light rounded border">
          <label className="form-label small fw-bold text-muted mb-2">Selected Common Amenities</label>
          <div className="d-flex flex-wrap gap-2">
            {selectedAmenities.map(amenity => (
              <div key={amenity} className="amenity-chip">
                {getAmenityIcon(amenity)}
                <span className="ms-1">{amenity}</span>
                <button 
                  className="remove-btn" 
                  onClick={() => toggleAmenity(amenity)}
                  title="Remove"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 text-muted x-small">
            ✓ Total {selectedAmenities.length} common features selected
          </div>
        </div>
      )}
    </div>
  );
};

export default StepAmenities;