import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Phone, 
  Clock, 
  TrendingUp, 
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Shield,
  UserCheck,
  Home,
  MessageCircle,
  Star,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/dateFormatter';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await adminService.getDashboardStats();
      setStatsData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading dashboard statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4 d-flex align-items-center gap-3">
        <AlertCircle size={24} />
        <div>
          <h6 className="mb-0">Error Loading Dashboard</h6>
          <p className="mb-0 small">{error}</p>
        </div>
        <button className="btn btn-sm btn-outline-danger ms-auto" onClick={fetchDashboardStats}>
          <RefreshCw size={14} className="me-1" /> Retry
        </button>
      </div>
    );
  }

  // Enhanced Stats Cards
  const stats = [
    { 
      title: "Total Users", 
      value: statsData?.totalUsers?.toLocaleString() || "0", 
      icon: Users, 
      color: "primary", 
      trend: statsData?.newUsersThisMonth > 0 ? 100 : 0, 
      subtext: `+${statsData?.newUsersThisMonth || 0} this month` 
    },
    { 
      title: "Total Listings", 
      value: statsData?.totalProperties?.toLocaleString() || "0", 
      icon: Building2, 
      color: "success", 
      trend: statsData?.newPropertiesThisMonth > 0 ? 100 : 0, 
      subtext: `+${statsData?.newPropertiesThisMonth || 0} new listings` 
    },
    { 
      title: "Approved Properties", 
      value: statsData?.approvedProperties?.toLocaleString() || "0", 
      icon: CheckCircle, 
      color: "info", 
      trend: 0, 
      subtext: "Verified on platform" 
    },
    { 
      title: "Pending Approvals", 
      value: statsData?.pendingProperties?.toLocaleString() || "0", 
      icon: Clock, 
      color: "danger", 
      trend: 0, 
      subtext: "Requires review" 
    }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="badge-premium badge-warning"><Clock size={10} className="me-1" /> Pending</span>;
      case 'approved':
        return <span className="badge-premium badge-success"><CheckCircle size={10} className="me-1" /> Approved</span>;
      case 'rejected':
        return <span className="badge-premium badge-danger"><XCircle size={10} className="me-1" /> Rejected</span>;
      default:
        return <span className="badge-premium badge-info">{status}</span>;
    }
  };

  return (
    <div className="fade-in-up">
      {/* Stats Cards - 4 in a row */}
      <div className="row mb-1">
        {stats.map((stat, index) => (
          <div className="col-md-3 col-sm-6 mb-3" key={index}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* Charts Section - Row with 2 col-6 cards */}
      <div className="row mb-4">
        <div className="col-lg-6 mb-4">
          <div className="modern-card h-100">
            <div className="card-header-modern d-flex justify-content-between align-items-center">
              <div>
                <span className="fw-semibold">User Growth Trend</span>
                <p className="text-muted small mb-0">Platform registration activity</p>
              </div>
              <BarChart3 size={18} className="text-muted" />
            </div>
            <div className="card-body p-4">
              <div className="chart-container">
                <div className="d-flex justify-content-between align-items-end mb-3" style={{ height: '200px' }}>
                  {statsData?.monthlyData?.users.map((value, idx) => (
                    <div key={idx} className="text-center" style={{ flex: 1 }}>
                      <div className="mb-2">
                        <div 
                          className="bg-gradient-primary rounded mx-auto"
                          style={{ 
                            width: '35px', 
                            height: `${(value / Math.max(...statsData.monthlyData.users, 1)) * 160}px`,
                            transition: 'height 0.3s ease'
                          }}
                        ></div>
                      </div>
                      <small className="text-muted">P{idx+1}</small>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-top">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="small text-muted">Active Users</div>
                      <div className="h6 mb-0">{statsData.totalUsers}</div>
                    </div>
                    <div className="text-success d-flex align-items-center">
                      <ArrowUp size={14} /> Dynamic
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="modern-card h-100">
            <div className="card-header-modern d-flex justify-content-between align-items-center">
              <div>
                <span className="fw-semibold">Recent Activity Summary</span>
                <p className="text-muted small mb-0">Quick breakdown of counts</p>
              </div>
              <Activity size={18} className="text-muted" />
            </div>
            <div className="card-body p-4">
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small text-muted">Properties Approved</span>
                  <span className="fw-600">{statsData.approvedProperties} / {statsData.totalProperties}</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: `${(statsData.approvedProperties / (statsData.totalProperties || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small text-muted">Properties Pending</span>
                  <span className="fw-600">{statsData.pendingProperties}</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-warning" 
                    style={{ width: `${(statsData.pendingProperties / (statsData.totalProperties || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-xs text-muted text-uppercase fw-bold">New This Month</div>
                  <div className="h5 mb-0 text-primary">+{statsData.newUsersThisMonth + statsData.newPropertiesThisMonth}</div>
                </div>
                <TrendingUp size={24} className="text-primary opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Listings Table */}
      <div className="modern-card mb-4">
        <div className="card-header-modern d-flex justify-content-between align-items-center">
          <div>
            <span className="fw-semibold">Recent Listings</span>
            <p className="text-muted small mb-0">Latest property listings awaiting review</p>
          </div>
          <Link to="/admin/properties" className="btn-outline-premium btn-sm text-decoration-none d-flex align-items-center gap-1">
            <Filter size={12} /> View All
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Property Name</th>
                <th>Owner</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {statsData.recentProperties?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No recent listings found</td>
                </tr>
              ) : (
                statsData.recentProperties?.map(listing => (
                  <tr key={listing._id}>
                    <td className="fw-600">{listing.pgName}</td>
                    <td className="small">{listing.managerName || 'Owner'}</td>
                    <td className="small">{listing.city}</td>
                    <td><span className="badge-premium badge-info">{listing.propertyType}</span></td>
                    <td>{getStatusBadge(listing.status)}</td>
                    <td className="small">{formatDate(listing.createdAt)}</td>
                    <td>
                      <Link 
                        to="/admin/properties" 
                        className="btn-outline-premium text-decoration-none" 
                        style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={12} /> Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Users Section */}
      <div className="modern-card mb-4">
        <div className="card-header-modern d-flex justify-content-between align-items-center">
          <div>
            <span className="fw-semibold">Recent Users</span>
            <p className="text-muted small mb-0">Newly registered platform users</p>
          </div>
          <Link to="/admin/users" className="btn-outline-premium btn-sm text-decoration-none">View All Users</Link>
        </div>
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {statsData.recentUsers?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No recent users found</td>
                </tr>
              ) : (
                statsData.recentUsers?.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                          {user.name.charAt(0)}
                        </div>
                        <span className="fw-600 small">{user.name}</span>
                      </div>
                    </td>
                    <td className="small">{user.email}</td>
                    <td><span className="badge-premium badge-info">{user.role}</span></td>
                    <td>
                      <span className={`badge-premium ${user.active ? 'badge-success' : 'badge-warning'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="small">{formatDate(user.createdAt)}</td>
                    <td>
                      <Link 
                        to="/admin/users" 
                        className="btn-outline-premium text-decoration-none" 
                        style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={12} /> Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="modern-card">
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h6 className="mb-1">Admin Quick Actions</h6>
              <p className="text-muted small mb-0">Manage platform settings, users, and listings</p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <Link to="/admin/users" className="btn-premium me-2 d-inline-flex align-items-center gap-1 text-decoration-none" style={{ padding: '6px 14px', fontSize: '12px' }}>
                <Shield size={14} /> Manage Users
              </Link>
              <Link to="/admin/properties" className="btn-outline-premium d-inline-flex align-items-center gap-1 text-decoration-none" style={{ padding: '6px 14px', fontSize: '12px' }}>
                <Building2 size={14} /> View Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;