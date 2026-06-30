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
import NotificationsPage from "../pages/common/NotificationsPage";


import Leads from "../pages/b2b/Leads";
import AddPG from "../pages/b2b/AddPG";
import EditPG from "../pages/b2b/EditPG";
import ManageListings from "../pages/b2b/ManageListings";


// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAnalytics from "../pages/admin/AdminAnalytics";

import ManageAmenities from "../pages/admin/ManageAmenities";
import ManageUsers from "../pages/admin/ManageUsers";


import ManageRegistrations from "../pages/admin/ManageRegistrations";
import WebsiteSettings from "../pages/admin/WebsiteSettings";



import AdminRatingsReviews from '../pages/admin/AdminRatingsReviews';
import B2BRatingsReviews from '../pages/b2b/B2BRatingsReviews';
import RoomManagement from '../pages/b2b/RoomManagement';
import B2BDashboard from '../pages/b2b/B2BDashboard';

import ManagerDashboard from '../pages/manager/ManagerDashboard';
import SubscriptionPlans from '../pages/admin/SubscriptionPlans';

import AdminProperties from '../pages/admin/AdminProperties';
import AdminAddPG from '../pages/admin/AdminAddPG';
import ManageAdvertisements from '../pages/admin/ManageAdvertisements';
import ActivityLogs from "../pages/admin/ActivityLogs";
import Profile from "../pages/b2b/Profile";


// User Pages (Removed)

import HomePage from '../pages/User/HomePage';
import FeaturedProperties from '../pages/User/FeaturedProperties';
import NewProperties from '../pages/User/NewProperties';
import ListingPage from '../pages/User/ListingPage';
import Contact from '../pages/User/Contact';
import AuthPage from '../pages/User/AuthPage';
import PropertyDetails from '../pages/User/PropertyDetails';
import LegalPage from '../pages/User/LegalPage';
import propertyService from "../services/propertyService";

const B2BRedirect = () => {
  const [loading, setLoading] = React.useState(true);
  const [hasProperties, setHasProperties] = React.useState(false);

  React.useEffect(() => {
    const checkProps = async () => {
      try {
        const res = await propertyService.getProperties({}, false);
        if (res.success && res.backendCount > 0) {
          setHasProperties(true);
        }
      } catch (err) {
        console.error("Redirect check failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkProps();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return hasProperties ? <Navigate to="dashboard" replace /> : <Navigate to="add-pg" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/featured-properties" element={<FeaturedProperties />} />
      <Route path="/new-properties" element={<NewProperties />} />
      
      {/* SEO Friendly Listing Routes */}
      <Route path="/verified-pg-hostels/:propertyType" element={<ListingPage />} />
      <Route path="/verified-pg-hostels" element={<ListingPage />} />
      
      {/* Original Listing Routes (Retained for compatibility) */}
      <Route path="/listings" element={<ListingPage />} />
      <Route path="/properties" element={<ListingPage />} />
      <Route path="/agent/:agentName" element={<ListingPage />} />
      
      <Route path="/contact" element={<Contact />} />
      <Route path="/auth" element={<AuthPage />} />
      
      {/* SEO Friendly Property Detail Routes */}
      <Route path="/pg-in-:city/:slug" element={<PropertyDetails />} />
      <Route path="/hostels-in-:city/:slug" element={<PropertyDetails />} />
      <Route path="/property-in-:city/:slug" element={<PropertyDetails />} />
      
      <Route path="/property/:id" element={<PropertyDetails />} />
      <Route path="/about-us" element={<LegalPage type="about" title="About Us" />} />
      <Route path="/privacy-policy" element={<LegalPage type="privacy" title="Privacy Policy" />} />
      <Route path="/terms-of-service" element={<LegalPage type="terms" title="Terms of Service" />} />


      <Route path="/register" element={<Register />} />


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
        <Route index element={<B2BRedirect />} />
        <Route path="dashboard" element={<B2BDashboard />} />
        <Route path="add-pg" element={<AddPG />} />
        <Route path="edit-pg/:id" element={<EditPG />} />
        <Route path="listings" element={<ManageListings />} />
        <Route path="leads" element={<Leads />} />

        <Route path="rooms/:propertyId" element={<RoomManagement />} />

        <Route path="reviews" element={<B2BRatingsReviews />} />
        <Route path="notifications" element={<NotificationsPage />} />
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
          <Route path="analytics" element={<AdminAnalytics />} />
          {/* <Route path="approvals" element={<ApproveListings />} /> */}
          <Route path="amenities" element={<ManageAmenities />} />
          <Route path="users" element={<ManageUsers />} />
          {/* In Admin routes, add: */}
          <Route path="registrations" element={<ManageRegistrations />} />
          <Route path="settings" element={<WebsiteSettings />} />
          <Route path="reviews" element={<AdminRatingsReviews />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="subscription-plans" element={<SubscriptionPlans />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="add-pg" element={<AdminAddPG />} />
          <Route path="edit-pg/:id" element={<EditPG />} />
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
