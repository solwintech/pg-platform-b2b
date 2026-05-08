import React, { useState } from 'react';
import { Mail, Phone, User, Building2 } from 'lucide-react';


const StepBasicInfo = ({ data, updateData }) => {


  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };



  return (
    <div className="step-basic-info">
      <h5 className="mb-3 fw-semibold">Property Information</h5>
      <p className="text-muted small mb-4">Fill in the basic details about your property and manager</p>

      <div className="row g-3">
        {/* Property Type Selection */}
        <div className="col-md-12 mb-2">
          <label className="form-label small fw-bold text-dark">Property Type *</label>
          <div className="premium-radio-group">
            {['PG', 'Hostel', 'Home Stay', 'Service Apartment'].map((type) => (
              <label key={type} className="premium-radio-item">
                <input
                  type="radio"
                  name="propertyType"
                  value={type}
                  checked={data.propertyType === type}
                  onChange={handleChange}
                />
                <span className="premium-radio-label">
                  {type === 'PG' && '🏘️ '}
                  {type === 'Hostel' && '🏢 '}
                  {type === 'Home Stay' && '🏡 '}
                  {type === 'Service Apartment' && '🛋️ '}
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sub-category for Home Stay */}
        {(data.propertyType === 'Home Stay') && (
          <div className="col-md-12 mb-3">
            <label className="form-label small fw-bold text-primary">Configuration Details *</label>
            <select
              className="form-select form-select-sm border-primary border-opacity-25"
              name="propertySubCategory"
              value={data.propertySubCategory || ''}
              onChange={handleChange}
            >
              <option value="">Select Configuration</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
              <option value="Independent House">Independent House</option>
            </select>
          </div>
        )}

        {/* Property Name */}
        <div className="col-md-12">
          <label className="form-label small fw-medium text-muted">
            Property Name * <span className="text-primary" style={{ fontSize: '10px' }}>(requires admin approval to change)</span>
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <Building2 size={14} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control form-control-sm border-start-0"
              name="pgName"
              value={data.pgName || ''}
              onChange={handleChange}
              placeholder="e.g. Royal Residency"
            />
          </div>
        </div>

        {/* Managed By (Property Manager) */}
        <div className="col-md-6">
          <label className="form-label small fw-medium text-muted">Manager Name *</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <User size={14} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control form-control-sm border-start-0"
              name="managerName"
              value={data.managerName || ''}
              onChange={handleChange}
              placeholder="Full name of manager"
            />
          </div>
        </div>

        {/* Manager Phone Number */}
        <div className="col-md-6">
          <label className="form-label small fw-medium text-muted">Manager Mobile Number *</label>
          <div className="input-group">
            <span className="input-group-text bg-light">
              <Phone size={14} className="text-muted" />
            </span>
            <input
              type="tel"
              className="form-control form-control-sm"
              name="managerPhone"
              value={data.managerPhone || ''}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              maxLength="10"
            />
          </div>
        </div>

        {/* Manager Email */}
        <div className="col-md-12">
          <label className="form-label small fw-medium text-muted">Manager Email ID</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <Mail size={14} className="text-muted" />
            </span>
            <input
              type="email"
              className="form-control form-control-sm border-start-0"
              name="managerEmail"
              value={data.managerEmail || ''}
              onChange={handleChange}
              placeholder="manager@example.com (optional)"
            />
          </div>
        </div>

        {/* Posted By */}
        <div className="col-md-12 mt-2">
          <label className="form-label small fw-medium text-muted">Posted By *</label>
          <div className="d-flex gap-3 mt-1">
            {['Self', 'Manager', 'Other'].map((option) => (
              <div key={option} className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="postedBy"
                  id={`posted-${option}`}
                  value={option}
                  checked={data.postedBy === option}
                  onChange={handleChange}
                />
                <label className="form-check-label small" htmlFor={`posted-${option}`}>
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {data.postedBy === 'Other' && (
          <div className="col-md-12">
            <label className="form-label small fw-medium text-muted">Specify Name *</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <User size={14} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control form-control-sm border-start-0"
                name="postedByName"
                value={data.postedByName || ''}
                onChange={handleChange}
                placeholder="Enter name"
              />
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default StepBasicInfo;