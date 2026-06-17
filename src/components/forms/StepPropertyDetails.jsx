import React from 'react';
import { Home, Users, Building, Clock, Calendar } from 'lucide-react';

const StepPropertyDetails = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleVisitingHoursChange = (field, value) => {
    const currentVisitingHours = data.visitingHours || { availableDays: [], startTime: '', endTime: '' };
    updateData({
      visitingHours: {
        ...currentVisitingHours,
        [field]: value
      }
    });
  };

  const toggleDay = (day) => {
    const currentDays = data.visitingHours?.availableDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    handleVisitingHoursChange('availableDays', newDays);
  };

  return (
    <div className="step-property-details">
      <h5 className="mb-3 fw-semibold">Property Specifications</h5>
      <p className="text-muted small mb-4">Tell us about the structure and capacity of your {data.propertyType || 'property'}</p>

      <div className="row g-3">
        <div className="col-md-12">
          <label className="form-label small fw-bold text-dark">Gender Allowed *</label>
          <div className="premium-radio-group">
            {[
              { val: 'Boys Only', label: '👨 Boys Only' },
              { val: 'Girls Only', label: '👩 Girls Only' },
              { val: 'Unisex / Co-ed', label: '👥 Unisex / Co-ed' }
            ].map((opt) => (
              <label key={opt.val} className="premium-radio-item">
                <input
                  type="radio"
                  name="genderAllowed"
                  value={opt.val}
                  checked={data.genderAllowed === opt.val}
                  onChange={handleChange}
                />
                <span className="premium-radio-label sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label small fw-bold text-dark">Total No of Beds *</label>
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light">
              <Users size={14} />
            </span>
            <input
              type="number"
              className="form-control"
              name="totalBeds"
              value={data.totalBeds || ''}
              onChange={handleChange}
              placeholder="Total beds in property"
            />
          </div>
        </div>

        <div className="col-md-4">
          <label className="form-label small fw-medium text-muted">Total Floors</label>
          <input
            type="number"
            className="form-control form-control-sm"
            name="totalFloors"
            value={data.totalFloors || ''}
            onChange={handleChange}
            placeholder="e.g., 3"
          />
        </div>

        <div className="col-md-4">
          <label className="form-label small fw-medium text-muted">Property Floor</label>
          <input
            type="text"
            className="form-control form-control-sm"
            name="floorNumber"
            value={data.floorNumber || ''}
            onChange={handleChange}
            placeholder="Ground, 1st, etc."
          />
        </div>

        <div className="col-md-4">
          <label className="form-label small fw-medium text-muted">Total Rooms</label>
          <input
            type="number"
            className="form-control form-control-sm"
            name="totalRooms"
            value={data.totalRooms || ''}
            onChange={handleChange}
            placeholder="e.g. 10"
          />
        </div>

        {/* Housekeeping Section */}
        <div className="col-12 mt-2">
          <label className="form-label small fw-bold text-dark">Housekeeping Options *</label>
          <div className="d-flex flex-wrap gap-2">
            {[
              'Daily',
              'Alternate Days',
              'Weekly',
              'Not Available'
            ].map((option) => (
              <label key={option} className="housekeeping-option-label">
                <input
                  type="radio"
                  name="housekeeping"
                  value={option}
                  className="d-none"
                  checked={data.housekeeping === option}
                  onChange={handleChange}
                />
                <div className={`housekeeping-chip ${data.housekeeping === option ? 'active' : ''}`}>
                  {option === 'Daily' && '🧹 '}
                  {option === 'Alternate Days' && '📅 '}
                  {option === 'Weekly' && '🧼 '}
                  {option === 'Not Available' && '❌ '}
                  {option}
                </div>
              </label>
            ))}
          </div>
        </div>
        {/* Visiting Availability Section */}
        <div className="col-12 mt-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Clock size={18} className="text-primary" />
            <h6 className="mb-0 fw-bold text-dark">Visiting Availability</h6>
          </div>
          
          <div className="card border-0 bg-light-orange-subtle p-3 rounded-4">
            <div className="row g-3">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label small fw-bold text-muted mb-0">Select Available Days</label>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-link text-primary p-0 text-decoration-none" 
                    style={{ fontSize: '12px' }}
                    onClick={() => {
                      const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                      const currentDays = data.visitingHours?.availableDays || [];
                      if (currentDays.length === 7) {
                        handleVisitingHoursChange('availableDays', []);
                      } else {
                        handleVisitingHoursChange('availableDays', allDays);
                      }
                    }}
                  >
                    {data.visitingHours?.availableDays?.length === 7 ? 'Deselect All' : 'Select All Days'}
                  </button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 ${data.visitingHours?.availableDays?.includes(day) ? 'btn-primary' : 'btn-outline-secondary bg-white'}`}
                      onClick={() => toggleDay(day)}
                      style={{ fontSize: '11px' }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Visit Start Time</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-end-0">
                    <Clock size={14} className="text-muted" />
                  </span>
                  <input
                    type="time"
                    className="form-control border-start-0"
                    value={data.visitingHours?.startTime || ''}
                    onChange={(e) => handleVisitingHoursChange('startTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Visit End Time</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-end-0">
                    <Clock size={14} className="text-muted" />
                  </span>
                  <input
                    type="time"
                    className="form-control border-start-0"
                    value={data.visitingHours?.endTime || ''}
                    onChange={(e) => handleVisitingHoursChange('endTime', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepPropertyDetails;