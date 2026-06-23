import React, { useState } from 'react';
import { Plus, X, CheckCircle } from 'lucide-react';

const predefinedRules = [
  "Maintain cleanliness in common areas",
  "No loud music after 10 PM",
  "Guests allowed only with prior permission",
  "Smoking and alcohol prohibited inside rooms",
  "Keep rooms and property damage-free",
  "Respect fellow residents' privacy",
  "Timely rent payment is mandatory",
  "Use water and electricity responsibly",
  "Report maintenance issues promptly",
  "Keep personal belongings secure",
  "Security deposit refund is subject to property policies",
  "Any damage to property, furniture, or appliances will be charged to the resident."
];

const StepHouseRules = ({ data, updateData }) => {
  const [selectedRules, setSelectedRules] = useState(data.houseRules || []);

  const toggleRule = (rule) => {
    let updated;
    if (selectedRules.includes(rule)) {
      updated = selectedRules.filter(r => r !== rule);
    } else {
      updated = [...selectedRules, rule];
    }
    setSelectedRules(updated);
    updateData({ houseRules: updated });
  };

  return (
    <div className="step-house-rules">
      <h5 className="mb-3 fw-semibold">House Rules & Policies</h5>
      
      {/* Predefined Rules Section */}
      <div className="rules-section mb-4">
        <p className="text-muted small mb-4">Select the house rules applicable to your property</p>
        <div className="row g-2">
          {predefinedRules.map(rule => (
            <div key={rule} className="col-md-6 col-sm-12">
              <div 
                className={`amenity-toggle-card ${selectedRules.includes(rule) ? 'active' : ''}`}
                onClick={() => toggleRule(rule)}
                style={{ justifyContent: 'flex-start' }}
              >
                <CheckCircle size={16} className={selectedRules.includes(rule) ? "text-primary" : "text-muted"} />
                <span className="small ms-2" style={{ textAlign: 'left', lineHeight: '1.2' }}>{rule}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Rules */}
      <div className="mb-4">
        <label className="form-label small fw-medium text-muted">Add Custom House Rules</label>
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-light">
            <Plus size={14} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="e.g., Gate closes at 11 PM (press Enter)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value) {
                const custom = e.target.value.trim();
                if (!selectedRules.includes(custom)) {
                  const updated = [...selectedRules, custom];
                  setSelectedRules(updated);
                  updateData({ houseRules: updated });
                }
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      {/* Selected Rules Display */}
      {selectedRules.length > 0 && (
        <div className="selected-amenities-display p-3 bg-light rounded border">
          <label className="form-label small fw-bold text-muted mb-2">Selected Rules</label>
          <div className="d-flex flex-wrap gap-2">
            {selectedRules.map(rule => (
              <div key={rule} className="amenity-chip">
                <span className="ms-1">{rule}</span>
                <button 
                  className="remove-btn" 
                  onClick={() => toggleRule(rule)}
                  title="Remove"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 text-muted x-small">
            ✓ Total {selectedRules.length} rules selected
          </div>
        </div>
      )}
    </div>
  );
};

export default StepHouseRules;
