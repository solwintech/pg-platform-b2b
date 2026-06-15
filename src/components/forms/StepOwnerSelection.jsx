import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const StepOwnerSelection = ({ data, updateData }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminService.getUsers();
        if (response.success && response.data) {
          // Filter only B2B users
          const b2bUsers = response.data.filter(u => u.role === 'b2b');
          setUsers(b2bUsers);
        }
      } catch (error) {
        console.error('Error fetching B2B users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="step-content animate__animated animate__fadeIn">
      <h4 className="mb-4">Select Property Owner</h4>
      <p className="text-muted mb-4">Choose the B2B user on whose behalf you are adding this property. The property will automatically be approved and published.</p>
      
      <div className="row">
        <div className="col-md-12 mb-4">
          <label className="form-label fw-bold">Owner (B2B User) <span className="text-danger">*</span></label>
          <select 
            className="form-select form-select-lg"
            value={data.owner || ''} 
            onChange={(e) => updateData({ owner: e.target.value })}
          >
            <option value="">-- Select an Owner --</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {!data.owner && (
            <div className="form-text text-danger mt-2">
              <i className="fas fa-info-circle me-1"></i>
              You must select an owner before proceeding.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepOwnerSelection;
