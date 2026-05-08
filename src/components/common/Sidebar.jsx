import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Phone, 
  Settings,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  List,
  CheckCircle,
  Award,
  Home,
  UserCheck,
  Tag,
  Star,
  Package,
  ClipboardList
} from 'lucide-react';

const Sidebar = ({ role, isCollapsed, toggleSidebar, isMobileOpen, closeMobile }) => {
  const menuItems = {
    b2b: [
      { path: '/b2b/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/b2b/listings', icon: List, label: 'My Listings' },
      { path: '/b2b/add-pg', icon: PlusCircle, label: 'Add Property' },
      { path: '/b2b/leads', icon: Phone, label: 'Leads' },
      
      { path: '/b2b/reviews', icon: Star, label: 'Ratings & Reviews' },
      { path: '/b2b/managers', icon: Users, label: 'Managers' },
      { path: '/b2b/profile', icon: Settings, label: 'Account Settings' },
    ],
    admin: [
      { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    //   { path: '/admin/approvals', icon: CheckCircle, label: 'Approvals' },
      { path: '/admin/amenities', icon: Award, label: 'Amenities' },
      { path: '/admin/properties', icon: Building2, label: 'All Properties' },
      { path: '/admin/users', icon: Users, label: 'Users' },
    //   { path: '/admin/settings', icon: Settings, label: 'Settings' },
      // In Sidebar.jsx, add to admin menuItems:
        { path: '/admin/registrations', icon: UserCheck, label: 'Registrations' },
        // Add to admin menuItems
        
        { path: '/admin/reviews', icon: Star, label: 'Reviews Moderation' },
        // Add to menuItems
        { path: '/admin/subscription-plans', icon: Package, label: 'Subscription Plans' },
        { path: '/admin/ads', icon: Tag, label: 'Ads & Promotions' },
        { path: '/admin/settings', icon: Settings, label: 'Website Settings' },
        { path: '/admin/logs', icon: ClipboardList, label: 'Activity Logs' },
     
    ]
  };

  const items = role === 'b2b' ? menuItems.b2b : menuItems.admin;

  return (
    <div className={`sidebar ${isMobileOpen ? 'mobile-show' : ''}`} style={{ width: isCollapsed ? '80px' : '260px' }}>
      <div className="sidebar-header">
        <div className="d-flex justify-content-between align-items-center">
          {!isCollapsed && (
            <div className="logo-wrapper-sidebar">
              <div className="logo-icon-premium-sm">
                <i className="fas fa-home"></i>
              </div>
              <div className="logo-text-container-sm">
                <span className="logo-brand-sm">Sortify<span className="brand-accent"> Stays</span></span>
                <span className="logo-tagline-sm">ADMIN</span>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="logo-icon-premium-sm mx-auto">
              <i className="fas fa-home"></i>
            </div>
          )}
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>
      
      <nav>
        {items.map((item) => (
          <div key={item.path} className="nav-item">
            <NavLink
              to={item.path}
              className={({ isActive }) => 
                `nav-link-custom ${isActive ? 'active' : ''}`
              }
              title={isCollapsed ? item.label : ''}
              onClick={closeMobile}
            >
              <item.icon className="nav-icon" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;