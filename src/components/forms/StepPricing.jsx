import React from 'react';
import { DollarSign, IndianRupee, Zap, Utensils, Wrench } from 'lucide-react';

const StepPricing = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="step-pricing">
      <h5 className="mb-3 fw-semibold">Common Charges</h5>
      <p className="text-muted small mb-4">Set up financial terms and common services</p>
      
      <div className="row g-3">
        {/* Security Deposit */}
        <div className="col-md-6">
          <label className="form-label small fw-bold text-dark">Security Deposit *</label>
          <div className="premium-radio-group">
            {['1 month', '2 month', '3 month', 'Custom'].map((val) => (
              <label key={val} className="premium-radio-item">
                <input
                  type="radio"
                  name="depositType"
                  value={val}
                  checked={data.depositType === val}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateData({ 
                      depositType: v,
                      deposit: (v === '1 month' || v === '2 month' || v === '3 month') ? v : data.deposit
                    });
                  }}
                />
                <span className="premium-radio-label sm">
                  {val === 'Custom' ? '💰 Custom' : `${val.split(' ')[0]} Month`}
                </span>
              </label>
            ))}
          </div>
          
          {data.depositType === 'Custom' && (
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light">₹</span>
              <input
                type="number"
                className="form-control"
                name="deposit"
                value={data.deposit || ''}
                onChange={handleChange}
                placeholder="Amount"
              />
            </div>
          )}
        </div>

        {/* Payment Cycle */}
        <div className="col-md-6">
          <label className="form-label small fw-bold text-dark">Payment Cycle *</label>
          <select 
            className="form-select form-select-sm"
            name="paymentCycle"
            value={data.paymentCycle || ''}
            onChange={handleChange}
          >
            <option value="" disabled>Select payment cycle</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Annually">Annually</option>
          </select>
        </div>
 
         {/* Minimum Locking */}
         <div className="col-md-6">
           <label className="form-label small fw-bold text-dark">Minimum Locking *</label>
           <select 
             className="form-select form-select-sm"
             name="minLocking"
             value={data.minLocking || ''}
             onChange={handleChange}
           >
             <option value="">Select Months</option>
             <option value="1">1 Month</option>
             <option value="2">2 Months</option>
             <option value="3">3 Months</option>
             <option value="6">6 Months</option>
             <option value="9">9 Months</option>
             <option value="12">12 Months</option>
           </select>
         </div>

        {/* Food Options */}
        <div className="col-md-6">
          <label className="form-label small fw-bold text-dark">Food Options *</label>
          <select 
            className="form-select form-select-sm"
            name="foodOption"
            value={data.foodOption || ''}
            onChange={handleChange}
          >
            <option value="">Select Food Plan</option>
            <option value="Breakfast Only">🍳 Breakfast Only</option>
            <option value="Half Meal">🍱 Half Meal (2 times)</option>
            <option value="Full Meal">🍽️ Full Meal (3 times)</option>
            <option value="Not Included">❌ Not Included</option>
          </select>
        </div>

        {/* Electricity Charges */}
        <div className="col-md-6">
          <label className="form-label small fw-bold text-dark">Electricity Charges *</label>
          <div className="premium-radio-group mt-1">
            <label className="premium-radio-item">
              <input 
                type="radio" 
                name="electricityCharges" 
                value="Included" 
                checked={data.electricityCharges === 'Included'}
                onChange={handleChange}
              />
              <span className="premium-radio-label sm">✅ Included</span>
            </label>
            <label className="premium-radio-item">
              <input 
                type="radio" 
                name="electricityCharges" 
                value="Not Included" 
                checked={data.electricityCharges === 'Not Included'}
                onChange={handleChange}
              />
              <span className="premium-radio-label sm">❌ Not Included</span>
            </label>
          </div>
        </div>

        {/* Maintenance */}
        <div className="col-md-6">
          <label className="form-label small fw-medium text-muted">Maintenance (Optional)</label>
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light">₹</span>
            <input
              type="number"
              className="form-control"
              name="maintenance"
              value={data.maintenance || ''}
              onChange={handleChange}
              placeholder="e.g. 500"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 p-2 bg-info bg-opacity-10 rounded">
        <small className="text-muted">
          <strong>Note:</strong> Room-specific prices will be set in the Room Types section. These are common charges applicable to all rooms.
        </small>
      </div>
    </div>
  );
};

export default StepPricing;