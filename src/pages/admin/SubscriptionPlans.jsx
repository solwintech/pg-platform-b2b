import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Users,
  Building2,
  Phone,
  Star,
  Crown,
  Zap,
  Save,
  X,
  RefreshCw,
  Info,
  Clock,
  Award,
  Gift,
  TrendingUp,
  Eye,
  AlertCircle
} from 'lucide-react';
import adminService from '../../services/adminService';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    type: 'monthly',
    price: '',
    originalPrice: '',
    discount: 0,
    currency: 'INR',
    features: [],
    propertyLimit: 5,
    roomLimit: 50,
    leadLimit: 100,
    supportLevel: 'basic',
    featuredListing: false,
    analytics: false,
    managerAccess: false,
    prioritySupport: false,
    customDomain: false,
    apiAccess: false,
    status: 'active',
    popular: false,
    description: '',
    validFor: 30,
    color: '#4361ee'
  });

  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getSubscriptionPlans();
      setPlans(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Failed to load subscription plans');
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      if (showEditModal) {
        setSelectedPlan({
          ...selectedPlan,
          features: [...(selectedPlan.features || []), featureInput.trim()]
        });
      } else {
        setNewPlan({
          ...newPlan,
          features: [...newPlan.features, featureInput.trim()]
        });
      }
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    if (showEditModal) {
      const updatedFeatures = selectedPlan.features.filter((_, i) => i !== index);
      setSelectedPlan({ ...selectedPlan, features: updatedFeatures });
    } else {
      const updatedFeatures = newPlan.features.filter((_, i) => i !== index);
      setNewPlan({ ...newPlan, features: updatedFeatures });
    }
  };

  const handleAddPlan = async () => {
    if (!newPlan.name || !newPlan.price) {
      alert('Please fill plan name and price');
      return;
    }
    try {
      await adminService.createSubscriptionPlan(newPlan);
      setShowAddModal(false);
      resetNewPlan();
      fetchPlans();
      alert('Plan added successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding plan');
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;
    try {
      await adminService.updateSubscriptionPlan(selectedPlan._id, selectedPlan);
      setShowEditModal(false);
      fetchPlans();
      alert('Plan updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating plan');
    }
  };

  const deletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await adminService.deleteSubscriptionPlan(planId);
        fetchPlans();
      } catch (err) {
        alert('Error deleting plan');
      }
    }
  };

  const togglePlanStatus = async (plan) => {
    try {
      await adminService.updateSubscriptionPlan(plan._id, { 
        status: plan.status === 'active' ? 'inactive' : 'active' 
      });
      fetchPlans();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const resetNewPlan = () => {
    setNewPlan({
      name: '',
      type: 'monthly',
      price: '',
      originalPrice: '',
      discount: 0,
      currency: 'INR',
      features: [],
      propertyLimit: 5,
      roomLimit: 50,
      leadLimit: 100,
      supportLevel: 'basic',
      featuredListing: false,
      analytics: false,
      managerAccess: false,
      prioritySupport: false,
      customDomain: false,
      apiAccess: false,
      status: 'active',
      popular: false,
      description: '',
      validFor: 30,
      color: '#4361ee'
    });
    setFeatureInput('');
  };

  const openEditModal = (plan) => {
    setSelectedPlan({ ...plan });
    setShowEditModal(true);
  };

  const openViewModal = (plan) => {
    setSelectedPlan(plan);
    setShowViewModal(true);
  };

  const getSupportBadge = (level) => {
    switch(level) {
      case 'basic': return <span className="badge-premium badge-info">Basic Support</span>;
      case 'priority': return <span className="badge-premium badge-warning">Priority Support</span>;
      case 'premium': return <span className="badge-premium badge-success">24/7 Premium Support</span>;
      default: return <span className="badge-premium badge-info">Basic Support</span>;
    }
  };

  const stats = {
    total: plans.length,
    active: plans.filter(p => p.status === 'active').length,
    inactive: plans.filter(p => p.status === 'inactive').length,
    popular: plans.filter(p => p.popular).length
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Plans...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Subscription Plans</h3>
        <button className="btn-premium d-flex align-items-center gap-2" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add New Plan
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="modern-card p-3 d-flex align-items-center gap-3">
            <div className="icon-box-small bg-primary bg-opacity-10 text-primary p-2 rounded-3">
              <Package size={20} />
            </div>
            <div>
              <div className="h4 mb-0 fw-bold">{stats.total}</div>
              <div className="text-muted small">Total Plans</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="modern-card p-3 d-flex align-items-center gap-3">
            <div className="icon-box-small bg-success bg-opacity-10 text-success p-2 rounded-3">
              <CheckCircle size={20} />
            </div>
            <div>
              <div className="h4 mb-0 fw-bold">{stats.active}</div>
              <div className="text-muted small">Active Plans</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="modern-card p-3 d-flex align-items-center gap-3">
            <div className="icon-box-small bg-warning bg-opacity-10 text-warning p-2 rounded-3">
              <Crown size={20} />
            </div>
            <div>
              <div className="h4 mb-0 fw-bold">{stats.popular}</div>
              <div className="text-muted small">Popular Plans</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="modern-card p-3 d-flex align-items-center gap-3">
            <div className="icon-box-small bg-danger bg-opacity-10 text-danger p-2 rounded-3">
              <XCircle size={20} />
            </div>
            <div>
              <div className="h4 mb-0 fw-bold">{stats.inactive}</div>
              <div className="text-muted small">Inactive Plans</div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="row">
        {plans.length === 0 ? (
          <div className="col-12">
            <div className="modern-card py-5 text-center">
              <Package size={60} className="text-muted mb-3" />
              <h5 className="mb-2">No subscription plans found</h5>
              <p className="text-muted">Create your first plan to start managing subscriptions</p>
            </div>
          </div>
        ) : (
          plans.map(plan => (
            <div key={plan._id} className="col-md-6 col-lg-4 mb-4">
              <div className={`modern-card h-100 overflow-hidden d-flex flex-column ${plan.status === 'inactive' ? 'opacity-75' : ''}`}>
                <div 
                  className="p-4 text-white position-relative" 
                  style={{ background: plan.color || '#4361ee' }}
                >
                  {plan.popular && (
                    <span className="position-absolute top-0 end-0 m-2 badge bg-white text-dark shadow-sm d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                      <Star size={10} className="text-warning fill-warning" /> MOST POPULAR
                    </span>
                  )}
                  <div className="h5 fw-bold mb-1">{plan.name}</div>
                  <div className="d-flex align-items-baseline gap-1">
                    <span className="h3 fw-bold mb-0">₹{plan.price.toLocaleString()}</span>
                    <span className="small opacity-75">/{plan.type === 'monthly' ? 'mo' : plan.type === 'yearly' ? 'yr' : 'qtr'}</span>
                  </div>
                  {plan.originalPrice > plan.price && (
                    <div className="small opacity-75 text-decoration-line-through">
                      ₹{plan.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex-grow-1">
                  <p className="text-muted small mb-3">{plan.description || 'Basic subscription plan features'}</p>
                  <div className="features-list">
                    {plan.features?.slice(0, 5).map((feature, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-2 mb-2">
                        <CheckCircle size={14} className="text-success flex-shrink-0" />
                        <span className="small">{feature}</span>
                      </div>
                    ))}
                    {plan.features?.length > 5 && (
                      <div className="text-muted small ps-4">+{plan.features.length - 5} more features</div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-light border-top d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1" onClick={() => openViewModal(plan)}>
                    <Eye size={14} /> View
                  </button>
                  <button className="btn btn-sm btn-outline-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-1" onClick={() => openEditModal(plan)}>
                    <Edit size={14} /> Edit
                  </button>
                  <button 
                    className={`btn btn-sm ${plan.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'} flex-grow-1 d-flex align-items-center justify-content-center gap-1`} 
                    onClick={() => togglePlanStatus(plan)}
                    title={plan.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    {plan.status === 'active' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    {plan.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center" 
                    onClick={() => deletePlan(plan._id)}
                    title="Delete Plan"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal (Simplified for common use) */}
      {(showAddModal || showEditModal) && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content modern-card">
              <div className="modal-header border-0 p-4">
                <h5 className="modal-title fw-bold">
                  {showAddModal ? 'Create New Subscription Plan' : `Edit Plan: ${selectedPlan?.name}`}
                </h5>
                <button type="button" className="btn-close" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}></button>
              </div>
              <div className="modal-body p-4 pt-0">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Plan Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={showAddModal ? newPlan.name : selectedPlan.name}
                      onChange={(e) => showAddModal ? setNewPlan({...newPlan, name: e.target.value}) : setSelectedPlan({...selectedPlan, name: e.target.value})}
                      placeholder="e.g. Professional"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Billing Cycle</label>
                    <select 
                      className="form-select"
                      value={showAddModal ? newPlan.type : selectedPlan.type}
                      onChange={(e) => showAddModal ? setNewPlan({...newPlan, type: e.target.value}) : setSelectedPlan({...selectedPlan, type: e.target.value})}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Price (₹) *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={showAddModal ? newPlan.price : selectedPlan.price}
                      onChange={(e) => showAddModal ? setNewPlan({...newPlan, price: e.target.value}) : setSelectedPlan({...selectedPlan, price: e.target.value})}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Property Limit</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={showAddModal ? newPlan.propertyLimit : selectedPlan.propertyLimit}
                      onChange={(e) => showAddModal ? setNewPlan({...newPlan, propertyLimit: e.target.value}) : setSelectedPlan({...selectedPlan, propertyLimit: e.target.value})}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Theme Color</label>
                    <input 
                      type="color" 
                      className="form-control form-control-color w-100" 
                      value={showAddModal ? newPlan.color : selectedPlan.color}
                      onChange={(e) => showAddModal ? setNewPlan({...newPlan, color: e.target.value}) : setSelectedPlan({...selectedPlan, color: e.target.value})}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">Features</label>
                    <div className="d-flex gap-2 mb-2">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Add a feature..." 
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                      />
                      <button className="btn btn-primary" onClick={addFeature}>Add</button>
                    </div>
                    <div className="d-flex flex-wrap gap-2 p-2 border rounded bg-light min-vh-10">
                      {(showAddModal ? newPlan.features : selectedPlan.features)?.map((f, i) => (
                        <span key={i} className="badge bg-white text-dark border px-3 py-2 d-flex align-items-center gap-2">
                          {f} <X size={12} className="cursor-pointer" onClick={() => removeFeature(i)} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button className="btn btn-light border px-4" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>Cancel</button>
                <button className="btn btn-primary px-5" onClick={showAddModal ? handleAddPlan : handleUpdatePlan}>
                  {showAddModal ? 'Create Plan' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPlan && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modern-card">
              <div className="modal-header border-0 p-4">
                <h5 className="modal-title fw-bold">Plan Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body p-4 pt-0">
                <div className="text-center p-4 rounded-4 mb-4 text-white" style={{ background: selectedPlan.color }}>
                  <div className="h4 fw-bold mb-0">{selectedPlan.name}</div>
                  <div className="h2 fw-bold mb-1">₹{selectedPlan.price}</div>
                  <div className="opacity-75 small">Billed {selectedPlan.type}</div>
                </div>
                
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-muted small">Property Limit</div>
                    <div className="fw-bold">{selectedPlan.propertyLimit === -1 ? 'Unlimited' : selectedPlan.propertyLimit}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted small">Support Level</div>
                    <div className="fw-bold text-capitalize">{selectedPlan.supportLevel}</div>
                  </div>
                  <div className="col-12 mt-3">
                    <div className="text-muted small mb-2">Included Features</div>
                    {selectedPlan.features?.map((f, i) => (
                      <div key={i} className="d-flex align-items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-success" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-primary w-100" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;