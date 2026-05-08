import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Settings, ChevronDown, Search, Menu } from 'lucide-react';
import authService from '../../services/authService';

const Navbar = ({ userRole, userName, userImage, toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  // Base URL for images
  const getBaseImageUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1');
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
          <button className="btn btn-light position-relative p-2 rounded-circle">
            <Bell size={18} />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
              3
            </span>
          </button>
          
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