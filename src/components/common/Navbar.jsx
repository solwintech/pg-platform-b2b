import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Bell, User, LogOut, Settings, ChevronDown, Search, Menu, MessageSquare, UserPlus, Info, CheckCircle2 } from 'lucide-react';
import authService from '../../services/authService';

const Navbar = ({ userRole, userName, userImage, toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://staysorted.in/api/v1' : 'http://localhost:5000/api/v1');
    const currentUser = authService.getUser();
    const userId = currentUser ? (currentUser._id || currentUser.id) : null;
    
    let eventSource = null;
    try {
      eventSource = new EventSource(`${apiUrl}/events/stream?userId=${userId}`);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.event === 'new_notification') {
            setNotifications(prev => [data.payload, ...prev]);
            setUnreadCount(prev => prev + 1);
          } else if (data.event === 'property_viewed') {
            window.dispatchEvent(new CustomEvent('property_viewed', { detail: data.payload }));
          }
        } catch (e) {
          console.error('Error parsing SSE data', e);
        }
      };

      eventSource.onerror = (err) => {
        // SSE will automatically try to reconnect.
        // We log it only in dev or suppress it.
      };

    } catch (err) {
      console.log('SSE initialization failed:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif._id);
    }
    
    setShowNotifDropdown(false);
    
    // Redirect based on type
    if (notif.type === 'lead') {
      navigate(`/${userRole}/leads`);
    } else if (notif.type === 'review') {
      navigate(`/${userRole}/reviews`);
    } else if (notif.type === 'property') {
      navigate(userRole === 'admin' ? '/admin/properties' : '/b2b/listings');
    }
  };

  // Base URL for images
  const getBaseImageUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://staysorted.in/api/v1' : 'http://localhost:5000/api/v1');
    return apiUrl.replace('/api/v1', '');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const profileImageUrl = (userImage && userImage.trim() !== '') 
    ? `${getBaseImageUrl()}/uploads/${userImage}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'U')}&background=4361ee&color=fff&size=256`;

  return (
    <nav className="modern-navbar">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <button 
            className="btn btn-light d-md-none p-2 rounded-3 border-0"
            onClick={toggleMobileSidebar}
          >
            <Menu size={20} />
          </button>
          <div className="navbar-search">
            
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="dropdown" ref={notifRef}>
            <button 
              className="btn btn-light position-relative p-2 rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              style={{ width: '38px', height: '38px', transition: 'all 0.2s ease' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Bell size={18} className="text-secondary" />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ width: '12px', height: '12px' }}>
                  <span className="visually-hidden">New alerts</span>
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="dropdown-menu show position-absolute end-0 mt-2 shadow-lg border-0 rounded-4 overflow-hidden" style={{ minWidth: '400px', zIndex: 1050, animation: 'fadeIn 0.2s ease-out' }}>
                <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom">
                  <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                    Notifications 
                    {unreadCount > 0 && <span className="badge bg-primary rounded-pill px-2 py-1" style={{ fontSize: '0.75rem' }}>{unreadCount}</span>}
                  </h6>
                  {unreadCount > 0 && (
                    <button 
                      className="btn btn-sm btn-link text-decoration-none p-0 text-primary small d-flex align-items-center gap-1 hover-opacity-75 transition-all" 
                      onClick={handleMarkAllAsRead}
                    >
                      <CheckCircle2 size={14} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="py-0 custom-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div className="text-center text-muted py-5 px-3">
                      <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                        <Bell size={32} className="text-secondary opacity-50" />
                      </div>
                      <h6 className="fw-semibold text-dark mb-1">No new notifications</h6>
                      <p className="mb-0 small">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        className={`dropdown-item px-4 py-3 border-bottom text-wrap transition-all position-relative ${!notif.isRead ? 'bg-primary bg-opacity-10' : 'bg-white hover-bg-light'}`}
                        onClick={() => handleNotificationClick(notif)}
                        style={{ cursor: 'pointer', whiteSpace: 'normal' }}
                      >
                        {!notif.isRead && (
                          <div className="position-absolute start-0 top-0 bottom-0 bg-primary" style={{ width: '4px' }}></div>
                        )}
                        <div className="d-flex gap-3 align-items-start">
                          <div className={`flex-shrink-0 p-2 rounded-circle d-flex align-items-center justify-content-center ${
                            notif.type === 'lead' ? 'bg-success bg-opacity-10 text-success' : 
                            notif.type === 'review' ? 'bg-warning bg-opacity-10 text-warning' : 
                            'bg-primary bg-opacity-10 text-primary'
                          }`} style={{ width: '40px', height: '40px' }}>
                            {notif.type === 'lead' ? <UserPlus size={20} /> : 
                             notif.type === 'review' ? <MessageSquare size={20} /> : 
                             <Info size={20} />}
                          </div>
                          
                          <div className="w-100 min-w-0">
                            <div className="d-flex justify-content-between align-items-baseline mb-1 gap-2">
                               <span className={`small text-truncate d-block ${!notif.isRead ? 'fw-bold text-dark' : 'fw-semibold text-secondary'}`}>
                                 {notif.type === 'lead' ? 'New Lead' : notif.type === 'review' ? 'New Review' : 'Notification'}
                               </span>
                               <span className="x-small text-muted flex-shrink-0" style={{ fontSize: '0.75rem' }}>
                                 {new Date(notif.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                            <div className={`small ${!notif.isRead ? 'fw-medium text-dark' : 'text-secondary'}`} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {notif.message}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="bg-light p-2 text-center border-top">
                      <button 
                        className="btn btn-sm btn-link text-decoration-none fw-medium w-100"
                        onClick={() => {
                          setShowNotifDropdown(false);
                          navigate(`/${userRole}/notifications`);
                        }}
                      >
                        View All Notifications
                      </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="dropdown">
            <button 
              className="btn btn-light d-flex align-items-center gap-2 px-2 py-1 rounded-pill border"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ minWidth: '150px', justifyContent: 'space-between' }}
            >
              <div className="d-flex align-items-center gap-2">
                <div className="user-avatar overflow-hidden" style={{ width: '32px', height: '32px', borderRadius: '50%' }}>
                  <img src={profileImageUrl} alt="Avatar" className="w-100 h-100 object-fit-cover" />
                </div>
                <span className="fw-600 small d-none d-lg-inline-block">{userName || 'User'}</span>
              </div>
              <ChevronDown size={14} className="text-muted" />
            </button>
            
            {showDropdown && (
              <div className="dropdown-menu show position-absolute end-0 mt-2 shadow-lg border-0 rounded-3" style={{ minWidth: '220px', zIndex: 1050 }}>
                <div className="px-3 py-3 border-bottom bg-light bg-opacity-50">
                  <div className="fw-bold text-dark">{userName || 'User'}</div>
                  <div className="text-muted x-small mt-1">{userRole === 'b2b' ? 'Property Owner' : 'Administrator'}</div>
                </div>
                <button 
                  className="dropdown-item py-2 d-flex align-items-center gap-2 mt-1"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate(userRole === 'admin' ? '/admin/settings' : '/b2b/profile');
                  }}
                >
                  <User size={16} className="text-primary" /> <span>Account Profile</span>
                </button>
                <button className="dropdown-item py-2 d-flex align-items-center gap-2">
                  <Settings size={16} className="text-secondary" /> <span>Settings</span>
                </button>
                <hr className="my-1 opacity-25" />
                <button 
                  className="dropdown-item py-2 text-danger d-flex align-items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;