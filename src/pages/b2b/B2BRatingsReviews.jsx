import React, { useState, useEffect } from 'react';
import {
  Star,
  StarHalf,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  User,
  Calendar,
  Filter,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Reply,
  Flag,
  Share2,
  BarChart3,
  PieChart,
  Clock,
  Edit,
  Trash2,
  Shield,
  CheckCheck,
  Ban
} from 'lucide-react';
import reviewService from '../../services/reviewService';
import propertyService from '../../services/propertyService';
import authService from '../../services/authService';

const B2BRatingsReviews = () => {
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  // Properties list
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const user = authService.getUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // For B2B, we should only get reviews for their own properties
      // The backend 'getReviews' with optionalProtect/protect might handle this if I adjust it,
      // but for now let's filter on the frontend if the backend returns all or just theirs.
      // Ideally backend should handle this: GET /api/v1/reviews?owner=me
      const [reviewsRes, propsRes] = await Promise.all([
        reviewService.getReviews(),
        propertyService.getProperties({}, false)
      ]);
      
      const myProperties = propsRes.properties || [];
      const myPropertyIds = myProperties.map(p => p._id);
      
      // Filter reviews to only show those belonging to my properties
      const myReviews = (reviewsRes.data || []).filter(r => 
        r.property && myPropertyIds.includes(r.property._id)
      );

      setReviews(myReviews);
      setProperties(myProperties);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Statistics
  const stats = {
    total: reviews.length,
    average: reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0",
    approved: reviews.filter(r => r.status === 'approved').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    totalLikes: reviews.reduce((acc, r) => acc + (r.likes || 0), 0),
    responseRate: reviews.length > 0
      ? ((reviews.filter(r => r.reply).length / reviews.length) * 100).toFixed(0)
      : "0"
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesProperty = selectedProperty === 'all' || review.property?._id === selectedProperty;
    const matchesRating = ratingFilter === 'all' || 
      (ratingFilter === '5' && review.rating >= 4.5) ||
      (ratingFilter === '4' && review.rating >= 3.5 && review.rating < 4.5) ||
      (ratingFilter === '3' && review.rating >= 2.5 && review.rating < 3.5) ||
      (ratingFilter === '2' && review.rating < 2.5);
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesSearch = (review.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (review.comment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (review.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (review.property?.pgName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProperty && matchesRating && matchesStatus && matchesSearch;
  });

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="text-warning fill-current" fill="#f59e0b" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" size={14} className="text-warning" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} className="text-muted" />);
    }
    return stars;
  };

  const handleOpenReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || '');
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
      await reviewService.replyToReview(selectedReview._id, replyText);
      setReviews(reviews.map(r => r._id === selectedReview._id ? { ...r, reply: replyText, replyAt: new Date() } : r));
      setShowReplyModal(false);
      alert('✅ Reply sent successfully!');
    } catch (error) {
      alert('❌ Failed to send reply.');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <span className="badge-premium badge-success"><CheckCircle size={10} className="me-1" /> Approved</span>;
      case 'pending':
        return <span className="badge-premium badge-warning"><Clock size={10} className="me-1" /> Pending Moderation</span>;
      case 'rejected':
        return <span className="badge-premium badge-danger"><XCircle size={10} className="me-1" /> Rejected</span>;
      default:
        return <span className="badge-premium badge-info">{status}</span>;
    }
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Property Ratings & Reviews</h4>
          <p className="text-muted small">Manage feedback from your residents</p>
        </div>
        <button className="btn-premium btn-sm" onClick={fetchData}>
          <Clock size={14} className="me-1" /> Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="stats-card-small">
            <div className="stats-card-small-content">
              <div className="stats-card-small-left">
                <div className="stats-icon-small" style={{ background: '#e0e7ff' }}>
                  <MessageCircle size={16} color="#4f46e5" />
                </div>
                <div className="stats-info-small">
                  <div className="stats-number-small">{stats.total}</div>
                  <div className="stats-label-small">Total Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stats-card-small">
            <div className="stats-card-small-content">
              <div className="stats-card-small-left">
                <div className="stats-icon-small" style={{ background: '#fef3c7' }}>
                  <Star size={16} color="#f59e0b" />
                </div>
                <div className="stats-info-small">
                  <div className="stats-number-small">{stats.average}</div>
                  <div className="stats-label-small">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stats-card-small">
            <div className="stats-card-small-content">
              <div className="stats-card-small-left">
                <div className="stats-icon-small" style={{ background: '#d1fae5' }}>
                  <CheckCircle size={16} color="#10b981" />
                </div>
                <div className="stats-info-small">
                  <div className="stats-number-small">{stats.approved}</div>
                  <div className="stats-label-small">Approved Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="stats-card-small">
            <div className="stats-card-small-content">
              <div className="stats-card-small-left">
                <div className="stats-icon-small" style={{ background: '#e0e7ff' }}>
                  <Reply size={16} color="#4f46e5" />
                </div>
                <div className="stats-info-small">
                  <div className="stats-number-small">{stats.responseRate}%</div>
                  <div className="stats-label-small">Response Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  placeholder="Search in reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '13px', padding: '8px 12px 8px 36px' }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-control-modern"
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
              >
                <option value="all">All My Properties</option>
                {properties.map(p => (
                  <option key={p._id} value={p._id}>{p.pgName}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-control-modern"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Star</option>
                <option value="4">4 Star</option>
                <option value="3">3 Star</option>
                <option value="2">2 Star & Below</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn-outline-premium w-100" onClick={() => {
                setSelectedProperty('all');
                setRatingFilter('all');
                setStatusFilter('all');
                setSearchTerm('');
              }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="modern-card">
        <div className="card-header-modern">
          <span className="fw-semibold">Recent Reviews ({filteredReviews.length})</span>
        </div>
        <div className="card-body p-0">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-5">
              <MessageCircle size={50} className="text-muted mb-3" />
              <h6>No reviews yet</h6>
              <p className="text-muted small">When residents rate your property, they will appear here</p>
            </div>
          ) : (
            filteredReviews.slice(0, 10).map(review => (
              <div key={review._id} className="modern-card mb-3 p-3 border-0 shadow-sm" style={{ borderLeft: '4px solid #0ea5e9' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                      {review.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-600 small">{review.user?.name}</span>
                        <span className="badge bg-light text-dark border">{review.property?.pgName}</span>
                        {review.isVerified && <span className="text-success small" style={{ fontSize: '10px' }}>✓ Verified</span>}
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <div className="d-flex align-items-center text-warning" style={{ gap: '2px' }}>
                          {renderStars(review.rating)} <span className="text-dark fw-600 ms-1 small" style={{ fontSize: '11px' }}>{review.rating}</span>
                        </div>
                        <span className="text-muted small" style={{ fontSize: '10px' }}>• <Calendar size={10} className="mx-1" />{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(review.status)}
                  </div>
                </div>
                
                <div className="mb-2">
                  {review.title && <span className="fw-600 small me-2">{review.title}</span>}
                  <span className="small text-muted">{review.comment}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                  <div className="d-flex gap-3 text-muted" style={{ fontSize: '11px' }}>
                    <span className="d-flex align-items-center gap-1"><ThumbsUp size={12} /> {review.likes || 0}</span>
                    <span className="d-flex align-items-center gap-1"><ThumbsDown size={12} /> {review.dislikes || 0}</span>
                  </div>
                  <button className="btn btn-sm btn-outline-primary py-1 px-2" style={{ fontSize: '11px' }} onClick={() => handleOpenReply(review)}>
                    <Reply size={12} className="me-1" /> {review.reply ? 'Edit Reply' : 'Reply'}
                  </button>
                </div>
                
                {review.reply && (
                  <div className="mt-2 bg-light p-2 rounded small d-flex gap-2 align-items-start border-start border-3 border-primary">
                    <Reply size={12} className="text-primary mt-1 flex-shrink-0" />
                    <div className="w-100">
                      <div className="d-flex justify-content-between align-items-center">
                        <strong style={{ fontSize: '11px' }}>My Response</strong>
                        <span className="text-muted" style={{ fontSize: '10px' }}>{new Date(review.replyAt || review.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-muted mt-1" style={{ fontSize: '11px' }}>{review.reply}</div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modern-card">
              <div className="modal-header border-0 p-4 pb-0">
                <h5 className="modal-title">Reply to Resident</h5>
                <button className="btn-close" onClick={() => setShowReplyModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3 p-3 bg-light rounded small">
                  <div className="fw-bold mb-1">{selectedReview.user?.name} says:</div>
                  <div className="fst-italic">"{selectedReview.comment}"</div>
                </div>
                <div className="mb-0">
                  <label className="form-label small fw-medium">Your Response</label>
                  <textarea
                    className="form-control-modern"
                    rows="5"
                    placeholder="Write a polite response to the resident..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <small className="text-muted mt-1 d-block">Your reply will be visible to all potential residents.</small>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button className="btn-outline-premium" onClick={() => setShowReplyModal(false)}>Cancel</button>
                <button className="btn-premium" onClick={handleSendReply}>Post Reply</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BRatingsReviews;