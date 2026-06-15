import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Bell, MessageSquare, UserPlus, Info, CheckCircle2, Filter, Search, Clock } from 'lucide-react';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, lead, review, property, etc.
  const [filterStatus, setFilterStatus] = useState('all'); // all, read, unread
  const [searchQuery, setSearchQuery] = useState('');

  const userRole = location.pathname.includes('/admin') ? 'admin' : 'b2b';

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(notif => notif._id === id ? { ...notif, isRead: true } : notif)
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif._id);
    }
    
    // Redirect based on type
    if (notif.type === 'lead') {
      navigate(`/${userRole}/leads`);
    } else if (notif.type === 'review') {
      navigate(`/${userRole}/reviews`);
    } else if (notif.type === 'property') {
      navigate(userRole === 'admin' ? '/admin/properties' : '/b2b/listings');
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    // Search filter
    const matchesSearch = (notif.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (notif.message || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const matchesType = filterType === 'all' || notif.type === filterType;
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notif.isRead) || 
                         (filterStatus === 'unread' && !notif.isRead);
                         
    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="container-fluid px-4 py-4">


      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-header bg-white border-bottom p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <Search size={14} />
                </span>
                <input 
                  type="text" 
                  className="form-control bg-light border-start-0 ps-0 shadow-none small" 
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-7 d-flex flex-wrap justify-content-md-end gap-2 align-items-center">
              <div className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded-2 border">
                <Filter size={14} className="text-muted" />
                <select 
                  className="form-select form-select-sm border-0 bg-transparent shadow-none w-auto pe-3 small text-dark"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  <option value="all">All Types</option>
                  <option value="lead">Leads</option>
                  <option value="review">Reviews</option>
                  <option value="property">Properties</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded-2 border">
                <select 
                  className="form-select form-select-sm border-0 bg-transparent shadow-none w-auto pe-3 small text-dark"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
              {unreadCount > 0 && (
                <button 
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" 
                  onClick={handleMarkAllAsRead}
                  style={{ fontSize: '0.8rem' }}
                >
                  <CheckCircle2 size={14} />
                  Mark all read
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-3 fw-medium">Loading your notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                <Bell size={48} className="text-secondary opacity-50" />
              </div>
              <h5 className="fw-bold text-dark mb-2">No notifications found</h5>
              <p className="text-muted mb-4">
                {notifications.length === 0 
                  ? "You're all caught up! No notifications yet." 
                  : "No notifications match your current filters."}
              </p>
              {notifications.length > 0 && (
                <button 
                  className="btn btn-light fw-medium px-4 border"
                  onClick={() => { setFilterType('all'); setFilterStatus('all'); setSearchQuery(''); }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {filteredNotifications.map(notif => (
                <div 
                  key={notif._id} 
                  className={`list-group-item list-group-item-action p-3 border-bottom position-relative transition-all ${!notif.isRead ? 'bg-primary bg-opacity-10' : 'bg-white hover-bg-light'}`}
                  onClick={() => handleNotificationClick(notif)}
                  style={{ cursor: 'pointer' }}
                >
                  {!notif.isRead && (
                    <div className="position-absolute start-0 top-0 bottom-0 bg-primary" style={{ width: '3px' }}></div>
                  )}
                  <div className="d-flex gap-3 align-items-start">
                    <div className={`flex-shrink-0 p-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm ${
                      notif.type === 'lead' ? 'bg-success text-white' : 
                      notif.type === 'review' ? 'bg-warning text-white' : 
                      'bg-primary text-white'
                    }`} style={{ width: '36px', height: '36px' }}>
                      {notif.type === 'lead' ? <UserPlus size={16} /> : 
                       notif.type === 'review' ? <MessageSquare size={16} /> : 
                       <Info size={16} />}
                    </div>
                    
                    <div className="w-100 min-w-0">
                      <div className="d-flex justify-content-between align-items-baseline mb-1 gap-2">
                         <h6 className={`mb-0 text-truncate ${!notif.isRead ? 'fw-bold text-dark' : 'fw-semibold text-secondary'}`} style={{ fontSize: '0.85rem' }}>
                           {notif.title || (notif.type === 'lead' ? 'New Lead Received' : notif.type === 'review' ? 'New Review Posted' : 'System Notification')}
                         </h6>
                         <div className="d-flex align-items-center gap-2">
                           <span className="text-muted flex-shrink-0 d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                             <Clock size={10} />
                             {new Date(notif.createdAt).toLocaleString(undefined, { 
                               year: 'numeric', month: 'short', day: 'numeric', 
                               hour: '2-digit', minute: '2-digit' 
                             })}
                           </span>
                         </div>
                      </div>
                      <p className={`mb-2 ${!notif.isRead ? 'fw-medium text-dark' : 'text-secondary'}`} style={{ fontSize: '0.8rem' }}>
                        {notif.message}
                      </p>
                      
                      <div className="d-flex align-items-center gap-2">
                        {notif.isRead ? (
                          <span className="badge bg-light text-muted border px-2 py-0 fw-medium rounded-pill" style={{ fontSize: '0.65rem' }}>Read</span>
                        ) : (
                          <span className="badge bg-primary px-2 py-0 fw-medium rounded-pill" style={{ fontSize: '0.65rem' }}>New</span>
                        )}
                        <span className={`badge px-2 py-0 fw-medium rounded-pill border ${
                          notif.type === 'lead' ? 'bg-success bg-opacity-10 text-success border-success' : 
                          notif.type === 'review' ? 'bg-warning bg-opacity-10 text-warning border-warning' : 
                          'bg-primary bg-opacity-10 text-primary border-primary'
                        }`} style={{ fontSize: '0.65rem' }}>
                          {notif.type ? notif.type.charAt(0).toUpperCase() + notif.type.slice(1) : 'General'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
