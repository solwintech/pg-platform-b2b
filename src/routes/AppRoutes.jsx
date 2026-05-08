import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

// Auth Pages
import Login from "../pages/auth/Login";
import AdminLogin from "../pages/auth/AdminLogin";
import Register from "../pages/auth/Register";

// Public Pages
// Homepage component is not yet created

// B2B Pages
import ComingSoon from "../pages/common/ComingSoon";

import AddPG from "../pages/b2b/AddPG";
import EditPG from "../pages/b2b/EditPG";
import ManageListings from "../pages/b2b/ManageListings";


// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";

import ManageAmenities from "../pages/admin/ManageAmenities";
import ManageUsers from "../pages/admin/ManageUsers";


import ManageRegistrations from "../pages/admin/ManageRegistrations";
import WebsiteSettings from "../pages/admin/WebsiteSettings";



import AdminRatingsReviews from '../pages/admin/AdminRatingsReviews';
import RoomManagement from '../pages/b2b/RoomManagement';
import B2BDashboard from '../pages/b2b/B2BDashboard';

import ManagerDashboard from '../pages/manager/ManagerDashboard';
import SubscriptionPlans from '../pages/admin/SubscriptionPlans';

import AdminProperties from '../pages/admin/AdminProperties';
import ManageAdvertisements from '../pages/admin/ManageAdvertisements';
import ActivityLogs from "../pages/admin/ActivityLogs";
import Profile from "../pages/b2b/Profile";


// User Pages (Removed)


const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/" element={<Register />} />


      {/* Public Routes */}
      {/* Homepage route removed as it doesn't exist yet */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />


      {/* Protected B2B Routes */}
      <Route
        path="/b2b"
        element={
          <ProtectedRoute allowedRoles={["b2b"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<B2BDashboard />} />
        <Route path="add-pg" element={<AddPG />} />
        <Route path="edit-pg/:id" element={<EditPG />} />
        <Route path="listings" element={<ManageListings />} />
        <Route path="leads" element={<ComingSoon />} />

        <Route path="rooms/:propertyId" element={<RoomManagement />} />

        <Route path="reviews" element={<ComingSoon />} />
        <Route path="managers" element={<ComingSoon />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      {/* Protected Admin Routes */}
      <Route path="/admin">
        <Route index element={<AdminLogin />} />
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]} loginPath="/admin">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          {/* <Route path="approvals" element={<ApproveListings />} /> */}
          <Route path="amenities" element={<ManageAmenities />} />
          <Route path="users" element={<ManageUsers />} />
          {/* In Admin routes, add: */}
          <Route path="registrations" element={<ManageRegistrations />} />
          <Route path="settings" element={<WebsiteSettings />} />
          <Route path="reviews" element={<AdminRatingsReviews />} />
          <Route path="subscription-plans" element={<SubscriptionPlans />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="ads" element={<ManageAdvertisements />} />
          <Route path="logs" element={<ActivityLogs />} />
        </Route>
      </Route>



// Manager Routes (separate login)
      <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<ManagerDashboard />} />
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
