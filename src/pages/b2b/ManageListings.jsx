import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  PlusCircle,
  Search,
  Building2,
  Clock,
  Tag,
  Percent,
  Gift,
  Save,
  X,
  DoorOpen,
  Users
} from 'lucide-react';
import { mockListings } from '../../utils/mockData';
import propertyService from '../../services/propertyService';

const ManageListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const response = await propertyService.getProperties();
      setListings(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings([]);
      setLoading(false);
    }
  };

  // Open View Modal
  const openViewModal = (property) => {
    setSelectedProperty(property);
    setShowViewModal(true);
  };

  // Toggle Room Availability status
  // Toggle Room Availability
  const toggleRoomAvailabilityStatus = async (propertyId, roomTypeId) => {
    try {
      const response = await propertyService.toggleRoomAvailability(propertyId, roomTypeId);
      if (response.success) {
        setListings(listings.map(p =>
          p._id === propertyId
            ? { ...p, roomTypes: p.roomTypes.map(rt => (rt._id || rt.id || rt.name) === roomTypeId ? { ...rt, isAvailable: !rt.isAvailable } : rt) }
            : p
        ));

        // Update selected property if it's currently being viewed
        if (selectedProperty && selectedProperty._id === propertyId) {
          setSelectedProperty({
            ...selectedProperty,
            roomTypes: selectedProperty.roomTypes.map(rt => (rt._id || rt.id || rt.name) === roomTypeId ? { ...rt, isAvailable: !rt.isAvailable } : rt)
          });
        }
      }
    } catch (error) {
      console.error('Error toggling room availability:', error);
      alert('Failed to update room availability');
    }
  };

  const togglePublishStatus = async (property) => {
    try {
      const response = await propertyService.togglePublish(property._id);
      if (response.success) {
        setListings(listings.map(l => l._id === property._id ? { ...l, isPublished: !l.isPublished } : l));
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update publication status');
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
        return <span className="badge-premium badge-info">{status || 'Pending'}</span>;
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.pgName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: listings.length,
    approved: listings.filter(l => l.status === 'approved').length,
    pending: listings.filter(l => l.status === 'pending').length,
    rejected: listings.filter(l => l.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading properties...</p>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      {/* Stats Cards */}
      <div className="row mb-3">
        <div className="col-md-3 mb-2">
          <div className="stats-card-small">
            <div className="stats-card-small-content">
              <div className="stats-card-small-left">
                <div className="stats-icon-small" style={{ background: '#e0e7ff' }}>
                  <Building2 size={14} color="#4f46e5" />
                </div>
                <div className="stats-info-small">
                  <div className="stats-number-small">{stats.total}</div>
                  <div className="stats-label-small">Total Properties</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="stats-card-small">
            <div className="stats-card-small-content">
              <div className="stats-card-small-left">
                <div className="stats-icon-small" style={{ background: '#d1fae5' }}>
                  <CheckCircle size={14} color="#10b981" />
                </div>
                <div className="stats-info-small">
                  <div className="stats-number-small">{stats.approved}</div>
                  <div className="stats-label-small">Approved</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-2">
          <div className="stats-card-small">
            <div className="stats-card-small-content">
              <div className="stats-card-small-left">
                <div className="stats-icon-small" style={{ background: '#fee2e2' }}>
                  <Clock size={14} color="#ef4444" />
                </div>
                <div className="stats-info-small">
                  <div className="stats-number-small">{stats.pending}</div>
                  <div className="stats-label-small">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="modern-card mb-3">
        <div className="card-header-modern">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="navbar-search">
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  className="form-control-premium"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '13px', padding: '8px 12px 8px 36px' }}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <select
                className="form-control-premium w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '13px', padding: '8px 12px', width: 'auto', minWidth: '140px' }}
              >
                <option value="all">All Status ({stats.total})</option>
                <option value="approved">Approved ({stats.approved})</option>
                <option value="pending">Pending ({stats.pending})</option>
                <option value="rejected">Rejected ({stats.rejected})</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="modern-card">
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Property Name</th>
                <th>Location</th>
                <th>Beds</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="text-center">
                      <Building2 size={50} className="text-muted mb-3" />
                      <h6 className="mb-2">No properties found</h6>
                      <p className="text-muted small mb-0">Click "Add New Property" to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredListings.map(listing => (
                  <tr key={listing._id || listing.id}>
                    <td style={{ fontSize: '13px' }}>
                      <div className="fw-600">{listing.pgName}</div>
                      <div className="text-muted" style={{ fontSize: '10px' }}>{listing.propertyType || 'PG'}</div>
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {listing.city || 'N/A'}
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {listing.totalBeds || 0}
                    </td>
                    <td>{getStatusBadge(listing.status)}</td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input cursor-pointer"
                          type="checkbox"
                          role="switch"
                          id={`publishSwitch-${listing._id}`}
                          checked={listing.isPublished !== false}
                          onChange={() => togglePublishStatus(listing)}
                        />
                        <label className="form-check-label small text-muted" htmlFor={`publishSwitch-${listing._id}`}>
                          {listing.isPublished !== false ? 'Published' : 'Unpublished'}
                        </label>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className="btn-outline-premium"
                          onClick={() => {
                            setSelectedProperty(listing);
                            setShowRoomsModal(true);
                          }}
                          style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <DoorOpen size={12} /> Rooms
                        </button>
                        <button
                          className="btn-outline-premium"
                          onClick={() => openViewModal(listing)}
                          style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> View
                        </button>
                        <button
                          className="btn-outline-premium"
                          onClick={() => navigate(`/b2b/edit-pg/${listing._id}`)}
                          style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit size={12} /> Edit
                        </button>
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
                                <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: '10px' }}>Not Available</span>
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
                              id={`modalRoomAvail-${roomTypeId}`}
                              checked={room.isAvailable !== false}
                              onChange={() => toggleRoomAvailabilityStatus(selectedProperty._id, roomTypeId)}
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
              <button className="btn btn-primary w-100" onClick={() => setShowRoomsModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* View Property Modal */}
      {showViewModal && selectedProperty && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-container" style={{ maxWidth: '1100px', maxHeight: '92vh', overflowY: 'auto', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header border-0 pb-0 px-4 pt-4">
              <div>
                <h5 className="modal-title fw-bold text-dark mb-1" style={{ fontSize: '18px' }}>Property Overview: {selectedProperty.pgName}</h5>
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
                        const roomTypeId = room._id || room.id || room.name;
                        return (
                          <div key={idx} className="room-item-premium p-3 border rounded-3 bg-light bg-opacity-50">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <div className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '12px' }}>
                                  {room.name}
                                  {room.isAvailable !== false ?
                                    <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: '9px' }}>Available</span> :
                                    <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: '9px' }}>Not Available</span>
                                  }
                                </div>
                                <div className="text-muted mt-1" style={{ fontSize: '10px' }}>{room.sharingType} • {room.size} sqft • {room.attachedBathroom ? 'Attached Bath' : 'Common Bath'}</div>
                              </div>
                              <div className="text-end d-flex flex-column align-items-end gap-2">
                                <div className="fw-bold text-primary" style={{ fontSize: '13px' }}>₹{room.price}</div>
                                <div className="form-check form-switch p-0 m-0 d-flex align-items-center gap-2">
                                  <label className="form-check-label x-small text-muted" htmlFor={`roomAvail-${roomTypeId}`}>
                                    Status
                                  </label>
                                  <input
                                    className="form-check-input cursor-pointer ms-0"
                                    type="checkbox"
                                    role="switch"
                                    id={`roomAvail-${roomTypeId}`}
                                    checked={room.isAvailable !== false}
                                    onChange={() => toggleRoomAvailabilityStatus(selectedProperty._id, roomTypeId)}
                                  />
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
                        <small className="text-muted" style={{ fontSize: '9px' }}>{selectedProperty.depositType}</small>
                      </div>
                      <div className="col-6">
                        <label className="text-muted d-block mb-1" style={{ fontSize: '10px' }}>CYCLE</label>
                        <span className="fw-bold text-dark d-block" style={{ fontSize: '12px' }}>{selectedProperty.paymentCycle}</span>
                        <small className="text-muted" style={{ fontSize: '9px' }}>Billing period</small>
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
              <button className="btn btn-light px-4 border" onClick={() => setShowViewModal(false)} style={{ fontSize: '12px', fontWeight: '500' }}>Close Window</button>
              <button
                className="btn btn-primary px-4 shadow-sm"
                onClick={() => {
                  setShowViewModal(false);
                  navigate(`/b2b/edit-pg/${selectedProperty._id}`);
                }}
                style={{ fontSize: '12px', fontWeight: '600', background: 'linear-gradient(135deg, #4361ee, #3f37c9)', border: 'none' }}
              >
                Edit Property Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageListings;