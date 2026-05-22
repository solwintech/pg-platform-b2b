import React, { useState, useEffect } from 'react';
import {
  Building2,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Bed,
  DollarSign,
  Star,
  RefreshCw,
  Tag,
  Users,
  Percent,
  AlertCircle,
  EyeOff,
  Check,
  X,
  MoreVertical,
  Home,
  Calendar,
  DoorOpen
} from 'lucide-react';
import { mockListings } from '../../utils/mockData';
import propertyService from '../../services/propertyService';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/dateFormatter';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const response = await propertyService.getProperties({}, false);
      const listings = response.properties || [];
      setProperties(listings);
      setFilteredProperties(listings);
      setLoading(false);
    } catch (error) {
      console.error('Error loading properties:', error);
      setLoading(false);
    }
  };

  const applyFilters = (data, search, status, type, gender) => {
    let filtered = [...data];

    if (search) {
      filtered = filtered.filter(p =>
        p.pgName?.toLowerCase().includes(search.toLowerCase()) ||
        p.managerName?.toLowerCase().includes(search.toLowerCase()) ||
        p.city?.toLowerCase().includes(search.toLowerCase()) ||
        p.managerEmail?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(p => p.status === status);
    }

    if (type !== 'all') {
      filtered = filtered.filter(p => p.propertyType === type);
    }

    if (gender !== 'all') {
      filtered = filtered.filter(p => p.genderAllowed === gender);
    }

    setFilteredProperties(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(properties, value, statusFilter, typeFilter, genderFilter);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    applyFilters(properties, searchTerm, value, typeFilter, genderFilter);
  };

  const handleTypeFilter = (value) => {
    setTypeFilter(value);
    applyFilters(properties, searchTerm, statusFilter, value, genderFilter);
  };

  const handleGenderFilter = (value) => {
    setGenderFilter(value);
    applyFilters(properties, searchTerm, statusFilter, typeFilter, value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setGenderFilter('all');
    setFilteredProperties(properties);
  };

  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const updatePropertyStatus = async (id, newStatus) => {
    // If it's an approval for a re-approval request, show a special confirmation modal first
    if (newStatus === 'approved' && selectedProperty?.isReapproval && !showApproveConfirm) {
      setShowApproveConfirm(true);
      return;
    }

    try {
      await adminService.updatePropertyStatus(id, { status: newStatus });
      const updatedProperties = properties.map(p =>
        p._id === id ? { ...p, status: newStatus, isReapproval: false, changedFields: [], previousValues: {} } : p
      );
      setProperties(updatedProperties);
      applyFilters(updatedProperties, searchTerm, statusFilter, typeFilter, genderFilter);
      
      setShowApproveConfirm(false);
      setShowViewModal(false);
      alert(`Property ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating property status');
    }
  };

  const deleteProperty = async (id) => {
    try {
      await propertyService.deleteProperty(id);
      const updatedProperties = properties.filter(p => p._id !== id);
      setProperties(updatedProperties);
      applyFilters(updatedProperties, searchTerm, statusFilter, typeFilter, genderFilter);
      setShowDeleteConfirm(false);
      alert('Property deleted successfully!');
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await propertyService.togglePublish(id);
      const updatedProperties = properties.map(p =>
        p._id === id ? { ...p, isPublished: !p.isPublished } : p
      );
      setProperties(updatedProperties);
      applyFilters(updatedProperties, searchTerm, statusFilter, typeFilter, genderFilter);
      
      if (selectedProperty && selectedProperty._id === id) {
        setSelectedProperty({ ...selectedProperty, isPublished: !selectedProperty.isPublished });
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Error updating publication status');
    }
  };

  const handleToggleRoomAvailability = async (propertyId, roomTypeId) => {
    try {
      await propertyService.toggleRoomAvailability(propertyId, roomTypeId);
      
      const updatedProperties = properties.map(p => {
        if (p._id === propertyId) {
          const updatedRoomTypes = p.roomTypes.map(rt => {
             const rtId = rt._id || rt.id || rt.name;
             if (rtId === roomTypeId) {
               return { ...rt, isAvailable: rt.isAvailable === false ? true : false };
             }
             return rt;
          });
          return { ...p, roomTypes: updatedRoomTypes };
        }
        return p;
      });
      
      setProperties(updatedProperties);
      applyFilters(updatedProperties, searchTerm, statusFilter, typeFilter, genderFilter);
      
      if (selectedProperty && selectedProperty._id === propertyId) {
        const updatedRoomTypes = selectedProperty.roomTypes.map(rt => {
           const rtId = rt._id || rt.id || rt.name;
           if (rtId === roomTypeId) {
             return { ...rt, isAvailable: rt.isAvailable === false ? true : false };
           }
           return rt;
        });
        setSelectedProperty({ ...selectedProperty, roomTypes: updatedRoomTypes });
      }
    } catch (error) {
      console.error('Error toggling room availability:', error);
      alert('Error updating room availability');
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      await adminService.updatePropertyStatus(id, { isFeatured: !currentStatus });
      setProperties(properties.map(p => p._id === id ? { ...p, isFeatured: !currentStatus } : p));
      setFilteredProperties(filteredProperties.map(p => p._id === id ? { ...p, isFeatured: !currentStatus } : p));
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert('Failed to update featured status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge-premium badge-success"><CheckCircle size={10} className="me-1" /> Approved</span>;
      case 'pending':
        return <span className="badge-premium badge-warning"><Clock size={10} className="me-1" /> Pending</span>;
      case 'rejected':
        return <span className="badge-premium badge-danger"><XCircle size={10} className="me-1" /> Rejected</span>;
      default:
        return <span className="badge-premium badge-info">{status}</span>;
    }
  };

  const stats = {
    total: properties.length,
    approved: properties.filter(p => p.status === 'approved').length,
    pending: properties.filter(p => p.status === 'pending').length,
    rejected: properties.filter(p => p.status === 'rejected').length,
    totalRooms: properties.reduce((acc, p) => acc + (p.totalRooms || 0), 0),
    totalBeds: properties.reduce((acc, p) => acc + (p.totalBeds || 0), 0),
    avgPrice: Math.round(properties.reduce((acc, p) => acc + (p.price || 0), 0) / (properties.length || 1))
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in-up">


      {/* Filters */}
      <div className="modern-card mb-4">
        <div className="card-header-modern">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="navbar-search">
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  className="form-control-premium"
                  placeholder="Search by name, manager, city or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{ fontSize: '13px', padding: '8px 12px 8px 36px' }}
                />
              </div>
            </div>
            <div className="col-md-2">
              <select
                className="form-control-modern"
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-control-modern"
                value={typeFilter}
                onChange={(e) => handleTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Home Stay">Home Stay</option>
                <option value="Service Apartment">Service Apartment</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-control-modern"
                value={genderFilter}
                onChange={(e) => handleGenderFilter(e.target.value)}
              >
                <option value="all">All Genders</option>
                <option value="Boys">Boys Only</option>
                <option value="Girls">Girls Only</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn-outline-premium w-100" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="modern-card">
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Property Details</th>
                <th>Manager Info</th>
                <th>Location</th>
                <th>Pricing</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Visibility</th>
                <th>Submitted On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <Building2 size={50} className="text-muted mb-3" />
                    <h6>No properties found</h6>
                    <p className="text-muted small">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                filteredProperties.map(property => (
                  <tr key={property._id}>
                    <td>
                      <div>
                        <div className="fw-600">{property.pgName}</div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>{property.propertyType}</div>
                      </div>
                    </td>
                    <td>
                      <div className="small fw-500">{property.managerName || 'Not assigned'}</div>
                      <div className="text-muted" style={{ fontSize: '10px' }}>{property.managerPhone}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <MapPin size={12} className="text-muted" />
                        <span className="small">{property.city}</span>
                      </div>
                    </td>
                    <td className="fw-600 text-primary">₹{property.price || property.pricing?.deposit || 'N/A'}</td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        {getStatusBadge(property.status)}
                      </div>
                    </td>
                    <td className="text-center">
                      <button 
                        className={`btn-icon-only ${property.isFeatured ? 'text-warning' : 'text-muted opacity-50'}`}
                        onClick={() => handleToggleFeatured(property._id, property.isFeatured)}
                        style={{ border: 'none', background: 'none' }}
                        title={property.isFeatured ? 'Remove from Featured' : 'Make Featured'}
                      >
                        <Star size={16} fill={property.isFeatured ? '#f59e0b' : 'none'} />
                      </button>
                    </td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          checked={property.isPublished}
                          onChange={() => handleTogglePublish(property._id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    </td>
                    <td className="small">{formatDate(property.createdAt)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn-icon-sm btn-outline-premium"
                          onClick={() => {
                            setSelectedProperty(property);
                            setShowViewModal(true);
                          }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn-icon-sm btn-outline-premium"
                          onClick={() => {
                            setSelectedProperty(property);
                            setShowRoomsModal(true);
                          }}
                          title="Manage Rooms"
                        >
                          <DoorOpen size={14} />
                        </button>
                        <div className="dropdown">
                          <button 
                            className="btn-icon-sm btn-outline-premium" 
                            type="button" 
                            data-bs-toggle="dropdown" 
                            aria-expanded="false"
                          >
                            <MoreVertical size={14} />
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 py-1" style={{ fontSize: '12px' }}>
                            <li>
                              <button 
                                className="dropdown-item d-flex align-items-center gap-2 py-2" 
                                onClick={() => updatePropertyStatus(property._id, 'approved')}
                              >
                                <CheckCircle size={14} className="text-success" /> Approve
                              </button>
                            </li>
                            <li>
                              <button 
                                className="dropdown-item d-flex align-items-center gap-2 py-2" 
                                onClick={() => updatePropertyStatus(property._id, 'rejected')}
                              >
                                <XCircle size={14} className="text-danger" /> Reject
                              </button>
                            </li>
                            <li className="border-top my-1"></li>
                            <li>
                              <button 
                                className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" 
                                onClick={() => {
                                  setSelectedProperty(property);
                                  setShowDeleteConfirm(true);
                                }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Property Modal */}
      {showViewModal && selectedProperty && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-container" style={{ maxWidth: '1100px', maxHeight: '92vh', overflowY: 'auto', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header border-0 pb-0 px-4 pt-4">
              <div>
                <h5 className="modal-title fw-bold text-dark mb-1" style={{ fontSize: '18px' }}>Property Inspection: {selectedProperty.pgName}</h5>
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge ${selectedProperty.status === 'approved' ? 'bg-success' : selectedProperty.status === 'pending' ? 'bg-warning' : 'bg-danger'} bg-opacity-10 text-${selectedProperty.status === 'approved' ? 'success' : selectedProperty.status === 'pending' ? 'warning text-dark' : 'danger'}`} style={{ fontSize: '10px' }}>
                    {selectedProperty.status?.toUpperCase()}
                  </span>
                  <span className="text-muted" style={{ fontSize: '11px' }}>ID: {selectedProperty._id}</span>
                </div>
              </div>
              <button className="modal-close bg-light rounded-circle p-2" onClick={() => setShowViewModal(false)} style={{ border: 'none' }}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body p-4">
              {/* Change Detection Section for Re-approvals */}
              {selectedProperty.isReapproval && selectedProperty.changedFields?.length > 0 && (
                <div className="alert alert-info border-0 shadow-sm rounded-4 mb-4 p-3" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)' }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <RefreshCw size={16} className="text-info" />
                    <h6 className="mb-0 fw-bold text-info" style={{ fontSize: '13px' }}>Update Request Details</h6>
                  </div>
                  <p className="text-muted mb-2" style={{ fontSize: '11px' }}>The owner has modified critical fields. Please verify the following changes:</p>
                  <div className="table-responsive mt-3">
                    <table className="table table-sm table-borderless mb-0">
                      <thead>
                        <tr>
                          <th className="text-muted" style={{ fontSize: '10px' }}>FIELD</th>
                          <th className="text-muted" style={{ fontSize: '10px' }}>PREVIOUS VALUE</th>
                          <th className="text-muted text-info" style={{ fontSize: '10px' }}>NEW VALUE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProperty.changedFields.map((field, idx) => (
                          <tr key={idx} className="border-bottom border-white border-opacity-50">
                            <td className="fw-bold text-dark py-2" style={{ fontSize: '11px' }}>{field.replace(/([A-Z])/g, ' $1').toUpperCase()}</td>
                            <td className="text-muted py-2" style={{ fontSize: '11px', textDecoration: 'line-through opacity-50' }}>{selectedProperty.previousValues?.[field] || 'N/A'}</td>
                            <td className="text-info fw-bold py-2" style={{ fontSize: '11px' }}>{selectedProperty[field]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Image Gallery Section - Refined */}

              <div className="row g-4">
                {/* Left Column */}
                <div className="col-md-7">
                  <div className="detail-card-premium mb-4 p-4 border-0 shadow-sm bg-white rounded-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div className="icon-box-small bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                        <Building2 size={16} />
                      </div>
                      <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>Property & Location</h6>
                    </div>

                    <div className="row g-3">
                      <div className="col-6">
                        <label className="text-muted d-block mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>PROPERTY TYPE</label>
                        <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>{selectedProperty.propertyType}</span>
                      </div>
                      <div className="col-6">
                        <label className="text-muted d-block mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>GENDER ALLOWED</label>
                        <span className="badge bg-indigo-soft text-indigo px-2 py-1" style={{ fontSize: '11px', background: '#eef2ff', color: '#4338ca' }}>{selectedProperty.genderAllowed}</span>
                      </div>
                      <div className="col-12">
                        <label className="text-muted d-block mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>FULL ADDRESS</label>
                        <span className="fw-bold text-dark" style={{ fontSize: '12px', lineHeight: '1.4' }}>{selectedProperty.address}, {selectedProperty.area}, {selectedProperty.city} - {selectedProperty.pinCode}</span>
                      </div>
                    </div>

                    <hr className="my-3 opacity-50" />

                    <div className="amenities-section">
                      <label className="text-muted d-block mb-2" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>COMMON AMENITIES</label>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedProperty.amenities?.map((a, i) => (
                          <span key={i} className="badge bg-light text-secondary border-0 px-3 py-2 rounded-pill fw-medium" style={{ fontSize: '11px' }}>
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="detail-card-premium p-4 border-0 shadow-sm bg-white rounded-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div className="icon-box-small bg-info bg-opacity-10 text-info p-2 rounded-3">
                        <Clock size={16} />
                      </div>
                      <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>Room Configurations</h6>
                    </div>

                    <div className="room-list-refined d-flex flex-column gap-3">
                      {selectedProperty.roomTypes?.map((room, idx) => {
                        const roomId = room._id || room.id || room.name;
                        return (
                          <div key={idx} className="room-item-premium p-3 border rounded-3 bg-light bg-opacity-50">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>{room.name}</div>
                                <div className="text-muted mt-1" style={{ fontSize: '10px' }}>{room.sharingType} • {room.size} sqft • {room.attachedBathroom ? 'Attached Bath' : 'Common Bath'}</div>
                              </div>
                              <div className="text-end d-flex flex-column align-items-end gap-1">
                                <div className="fw-bold text-primary" style={{ fontSize: '13px' }}>₹{room.price}</div>
                                <div className="form-check form-switch m-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    checked={room.isAvailable !== false}
                                    onChange={() => handleToggleRoomAvailability(selectedProperty._id, roomId)}
                                    style={{ width: '1.8em', height: '0.9em', cursor: 'pointer' }}
                                  />
                                  <label className="form-check-label small text-muted ms-1" style={{ fontSize: '9px' }}>
                                    {room.isAvailable !== false ? 'Available' : 'Occupied'}
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex flex-wrap gap-1 mt-2">
                              {room.amenities?.map((a, i) => (
                                <span key={i} className="badge bg-white text-muted border border-light shadow-sm" style={{ fontSize: '9px' }}>{a}</span>
                              ))}
                              {room.ac && <span className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: '9px' }}>AC Room</span>}
                              {room.furnishingStatus && <span className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: '9px' }}>{room.furnishingStatus}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-md-5">
                  <div className="detail-card-premium mb-4 p-4 border-0 shadow-sm bg-primary bg-opacity-10 rounded-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div className="icon-box-small bg-primary text-white p-2 rounded-3 shadow-sm">
                        <Users size={16} />
                      </div>
                      <h6 className="fw-bold mb-0 text-primary" style={{ fontSize: '14px' }}>Management</h6>
                    </div>

                    <div className="manager-profile d-flex align-items-center mb-3">
                      <div className="avatar me-3 bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '44px', height: '44px', fontSize: '18px', fontWeight: '700' }}>
                        {selectedProperty.managerName?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>{selectedProperty.managerName || 'Not assigned'}</div>
                        <div className="text-primary fw-medium" style={{ fontSize: '10px' }}>Property Manager</div>
                      </div>
                    </div>

                    <div className="contact-details mt-3">
                      <div className="mb-2">
                        <label className="text-muted d-block mb-1" style={{ fontSize: '10px' }}>MOBILE NUMBER</label>
                        <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>+91 {selectedProperty.managerPhone || 'N/A'}</span>
                      </div>
                      <div>
                        <label className="text-muted d-block mb-1" style={{ fontSize: '10px' }}>EMAIL ADDRESS</label>
                        <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>{selectedProperty.managerEmail || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-card-premium p-4 border-0 shadow-sm bg-white rounded-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div className="icon-box-small bg-warning bg-opacity-10 text-warning p-2 rounded-3">
                        <Percent size={16} />
                      </div>
                      <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>Pricing & Policies</h6>
                    </div>

                    <div className="policy-grid row g-3">
                      <div className="col-6">
                        <label className="text-muted d-block mb-1" style={{ fontSize: '10px' }}>DEPOSIT</label>
                        <span className="fw-bold text-dark d-block" style={{ fontSize: '12px' }}>{selectedProperty.deposit}</span>
                      </div>
                      <div className="col-6">
                        <label className="text-muted d-block mb-1" style={{ fontSize: '10px' }}>CYCLE</label>
                        <span className="fw-bold text-dark d-block" style={{ fontSize: '12px' }}>{selectedProperty.paymentCycle}</span>
                      </div>
                      <div className="col-6">
                        <label className="text-muted d-block mb-1" style={{ fontSize: '10px' }}>FOODING</label>
                        <span className="fw-bold text-dark d-block" style={{ fontSize: '12px' }}>{selectedProperty.foodOption}</span>
                      </div>
                      <div className="col-6">
                        <label className="text-muted d-block mb-1" style={{ fontSize: '10px' }}>LOCKING</label>
                        <span className="fw-bold text-dark d-block" style={{ fontSize: '12px' }}>{selectedProperty.minLocking}</span>
                      </div>
                      <div className="col-12">
                        <hr className="my-1 opacity-25" />
                        <label className="text-muted d-block mb-1" style={{ fontSize: '10px' }}>ELECTRICITY</label>
                        <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>{selectedProperty.electricityCharges}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="property-gallery-refined mb-4">
                <div className="row g-2">
                  <div className="col-md-8">
                    <div className="main-image-container rounded-4 overflow-hidden shadow-sm" style={{ height: '380px' }}>
                      <img
                        src={selectedProperty.coverImage}
                        alt="Cover"
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex flex-column gap-2" style={{ height: '380px' }}>
                      {selectedProperty.galleryImages?.slice(0, 2).map((img, idx) => (
                        <div key={idx} className="side-image-container rounded-4 overflow-hidden shadow-sm flex-grow-1">
                          <img
                            src={typeof img === 'string' ? img : img.url}
                            alt={`Gallery ${idx}`}
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'}
                          />
                        </div>
                      ))}
                      {selectedProperty.galleryImages?.length > 2 && (
                        <div className="more-images-overlay rounded-4 shadow-sm d-flex align-items-center justify-content-center bg-dark text-white position-relative" style={{ height: '120px' }}>
                          <img
                            src={typeof selectedProperty.galleryImages[2] === 'string' ? selectedProperty.galleryImages[2] : selectedProperty.galleryImages[2].url}
                            alt="More"
                            className="w-100 h-100 object-fit-cover opacity-50 rounded-4"
                          />
                          <div className="position-absolute text-center">
                            <div className="fw-bold" style={{ fontSize: '16px' }}>+{selectedProperty.galleryImages.length - 2}</div>
                            <div style={{ fontSize: '10px' }}>PHOTOS</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="modal-footer bg-light bg-opacity-50 border-top p-3 px-4 rounded-bottom-4">
              <div className="d-flex w-100 justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                   <div className="form-check form-switch m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="modal-publish-toggle"
                        checked={selectedProperty.isPublished}
                        onChange={() => handleTogglePublish(selectedProperty._id)}
                        style={{ cursor: 'pointer', scale: '1.1' }}
                      />
                      <label className="form-check-label fw-bold small ms-2" htmlFor="modal-publish-toggle">
                        {selectedProperty.isPublished ? 'PUBLISHED & LIVE' : 'HIDDEN FROM PUBLIC'}
                      </label>
                   </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-light px-4 border" onClick={() => setShowViewModal(false)} style={{ fontSize: '12px', fontWeight: '500' }}>Close</button>
                  <div className="dropdown">
                    <button className="btn btn-outline-premium px-4 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ fontSize: '12px', fontWeight: '600' }}>
                      Change Status
                    </button>
                    <ul className="dropdown-menu shadow border-0">
                      <li>
                        <button 
                          className="dropdown-item py-2" 
                          onClick={() => updatePropertyStatus(selectedProperty._id, 'approved')}
                          disabled={selectedProperty.status === 'approved'}
                        >
                          Approve Property
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item py-2" 
                          onClick={() => updatePropertyStatus(selectedProperty._id, 'rejected')}
                          disabled={selectedProperty.status === 'rejected'}
                        >
                          Reject Property
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item py-2" 
                          onClick={() => updatePropertyStatus(selectedProperty._id, 'pending')}
                          disabled={selectedProperty.status === 'pending'}
                        >
                          Mark as Pending
                        </button>
                      </li>
                    </ul>
                  </div>
                  {selectedProperty.status === 'pending' && (
                    <button
                      className="btn btn-success px-4"
                      onClick={() => {
                        updatePropertyStatus(selectedProperty._id, 'approved');
                        setShowViewModal(false);
                      }}
                      style={{ fontSize: '12px', fontWeight: '600', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
                    >Quick Approve</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedProperty && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-container" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title text-danger">Delete Property</h5>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body text-center">
              <AlertCircle size={48} className="text-danger mb-3" />
              <h6>Are you sure you want to delete this property?</h6>
              <p className="text-muted small">This action cannot be undone.</p>
              <div className="p-2 bg-light rounded mt-2">
                <strong>{selectedProperty.pgName}</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-premium" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-danger" onClick={() => deleteProperty(selectedProperty._id)}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* Re-approval Confirmation Modal */}
      {showApproveConfirm && selectedProperty && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-container" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold text-dark">Confirm Changes</h5>
              <button className="modal-close" onClick={() => setShowApproveConfirm(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body p-4">
              <div className="text-center mb-4">
                <div className="icon-box-large bg-primary bg-opacity-10 text-primary mx-auto mb-3" style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={28} />
                </div>
                <h6 className="fw-bold">Review & Approve Changes</h6>
                <p className="text-muted small">You are about to approve the following modifications for <strong>{selectedProperty.pgName}</strong>:</p>
              </div>

              <div className="change-summary-list bg-light p-3 rounded-4">
                 {selectedProperty.changedFields?.map((field, idx) => (
                   <div key={idx} className="mb-3 last-child-mb-0">
                      <label className="text-muted d-block mb-1" style={{ fontSize: '10px' }}>{field.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small text-decoration-line-through">{selectedProperty.previousValues?.[field] || 'N/A'}</span>
                        <Check size={12} className="text-success" />
                        <span className="fw-bold text-primary small">{selectedProperty[field]}</span>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
            <div className="modal-footer border-top-0 pt-0">
              <button className="btn btn-light px-4" onClick={() => setShowApproveConfirm(false)} style={{ fontSize: '12px' }}>Cancel</button>
              <button 
                className="btn btn-primary px-4 shadow-sm" 
                onClick={() => updatePropertyStatus(selectedProperty._id, 'approved')}
                style={{ fontSize: '12px', fontWeight: '600', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
              >
                Confirm & Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Management Modal */}
      {showRoomsModal && selectedProperty && (
        <div className="modal-overlay" onClick={() => setShowRoomsModal(false)}>
          <div className="modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">
                <DoorOpen size={18} className="me-2" />
                Manage Rooms - {selectedProperty.pgName}
              </h5>
              <button className="modal-close" onClick={() => setShowRoomsModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body p-4">
              <div className="room-list-refined d-flex flex-column gap-3">
                {selectedProperty.roomTypes?.length > 0 ? (
                  selectedProperty.roomTypes.map((room, idx) => {
                    const roomTypeId = room._id || room.id || room.name;
                    return (
                      <div key={idx} className="room-item-premium p-3 border rounded-3 bg-light bg-opacity-50">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <div className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '14px' }}>
                              {room.name}
                              {room.isAvailable !== false ? 
                                <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: '10px' }}>Available</span> :
                                <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: '10px' }}>Occupied</span>
                              }
                            </div>
                            <div className="text-muted mt-1" style={{ fontSize: '11px' }}>
                              {room.sharingType} • ₹{room.price}/month • {room.attachedBathroom ? 'Attached Bath' : 'Common Bath'}
                            </div>
                          </div>
                          <div className="form-check form-switch p-0 m-0">
                            <input 
                              className="form-check-input cursor-pointer" 
                              type="checkbox" 
                              role="switch" 
                              id={`adminRoomAvail-${roomTypeId}`}
                              checked={room.isAvailable !== false}
                              onChange={() => handleToggleRoomAvailability(selectedProperty._id, roomTypeId)}
                              style={{ width: '40px', height: '20px' }}
                            />
                          </div>
                        </div>
                        <div className="d-flex flex-wrap gap-1 mt-2">
                          {room.amenities?.slice(0, 3).map((a, i) => (
                            <span key={i} className="badge bg-white text-muted border" style={{ fontSize: '9px' }}>{a}</span>
                          ))}
                          {room.ac && <span className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: '9px' }}>AC</span>}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">No rooms configured for this property.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary w-100 shadow-sm" onClick={() => setShowRoomsModal(false)} style={{ background: 'linear-gradient(135deg, #4361ee, #3f37c9)', border: 'none' }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProperties;