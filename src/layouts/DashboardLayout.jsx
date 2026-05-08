import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

import authService from '../services/authService';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState(authService.getUser());

  useEffect(() => {
    // Load fresh user data on mount to ensure we have latest info (like profile image)
    const loadUser = async () => {
      try {
        const response = await authService.getMe();
        if (response.success && response.data) {
          setUser(response.data);
          // Sync localStorage
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Error syncing user data:', error);
      }
    };
    loadUser();
  }, []);

  const userRole = user?.role || 'b2b';
  const userName = user?.name || 'User';
  const userImage = user?.profileImage;

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar 
        role={userRole} 
        isCollapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar}
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}
      
      <div 
        className="main-content"
        style={{ 
          marginLeft: window.innerWidth > 768 ? (sidebarCollapsed ? '80px' : '260px') : '0',
          transition: 'all 0.3s',
          minHeight: '100vh'
        }}
      >
        <Navbar 
          userRole={userRole} 
          userName={userName} 
          userImage={userImage}
          toggleMobileSidebar={toggleMobileSidebar}
        />
        
        <div className="content-wrapper p-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;