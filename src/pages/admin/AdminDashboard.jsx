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
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/dateFormatter';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState(null);

  const [timeframe, setTimeframe] = useState('day');
  const [viewType, setViewType] = useState('date');
  const [analyticsData, setAnalyticsData] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, viewType]);

  const fetchAnalytics = async () => {
    try {
      const response = await adminService.getAnalytics(timeframe, viewType);
      setAnalyticsData(response.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

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
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted fw-500">Initializing Command Center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-command-center">
        <div className="alert alert-danger d-flex align-items-center gap-3 rounded-4 shadow-sm border-0">
          <AlertCircle size={28} />
          <div>
            <h6 className="mb-0 fw-bold">Error Loading Dashboard</h6>
            <p className="mb-0 small">{error}</p>
          </div>
          <button className="btn btn-outline-danger btn-sm ms-auto fw-600 rounded-pill px-3" onClick={fetchDashboardStats}>
            <RefreshCw size={14} className="me-1" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Generate mock trend data for the area chart based on monthly data
  const userTrendData = statsData?.monthlyData?.users.map((val, i) => ({
    name: `M${i + 1}`,
    users: val
  })) || [];

  const propertyStatusData = [
    { name: 'Approved', value: statsData.approvedProperties || 0, color: '#10b981' },
    { name: 'Pending', value: statsData.pendingProperties || 0, color: '#f59e0b' },
    { name: 'Rejected', value: Math.max(0, (statsData.totalProperties || 0) - ((statsData.approvedProperties || 0) + (statsData.pendingProperties || 0))), color: '#ef4444' }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="premium-badge badge-pending"><Clock size={12} /> Pending</span>;
      case 'approved': return <span className="premium-badge badge-active"><CheckCircle size={12} /> Approved</span>;
      case 'rejected': return <span className="premium-badge badge-inactive"><XCircle size={12} /> Rejected</span>;
      default: return <span className="premium-badge badge-inactive">{status}</span>;
    }
  };

  const getUserBadge = (active) => {
    if (active) return <span className="premium-badge badge-active">Active</span>;
    return <span className="premium-badge badge-inactive">Inactive</span>;
  };

  return (
    <div className="admin-command-center fade-in-up">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Admin Command Center</h4>
          <p className="text-muted mb-0 small">Welcome back. Here is what is happening on your platform today.</p>
        </div>
        <div>
          <button className="btn btn-primary shadow-sm rounded-pill px-4 fw-600 d-flex align-items-center gap-2">
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card-glass stat-primary cursor-pointer" onClick={() => navigate('/admin/users')}>
            <div className="stat-content">
              <div className="stat-title">Total Users</div>
              <div className="stat-value">{statsData.totalUsers?.toLocaleString() || "0"}</div>
              <div className="stat-trend trend-up">
                <ArrowUp size={14} /> <span>{statsData.newUsersThisMonth} this month</span>
              </div>
            </div>
            <div className="stat-icon-wrapper"><Users /></div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card-glass stat-success cursor-pointer" onClick={() => navigate('/admin/properties')}>
            <div className="stat-content">
              <div className="stat-title">Total Listings</div>
              <div className="stat-value">{statsData.totalProperties?.toLocaleString() || "0"}</div>
              <div className="stat-trend trend-up">
                <ArrowUp size={14} /> <span>{statsData.newPropertiesThisMonth} this month</span>
              </div>
            </div>
            <div className="stat-icon-wrapper"><Building2 /></div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card-glass stat-info cursor-pointer" onClick={() => navigate('/admin/properties')}>
            <div className="stat-content">
              <div className="stat-title">Approved Properties</div>
              <div className="stat-value">{statsData.approvedProperties?.toLocaleString() || "0"}</div>
              <div className="stat-trend trend-neutral">
                <CheckCircle size={14} /> <span>Verified</span>
              </div>
            </div>
            <div className="stat-icon-wrapper"><Shield /></div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card-glass stat-warning cursor-pointer" onClick={() => navigate('/admin/properties')}>
            <div className="stat-content">
              <div className="stat-title">Pending Approvals</div>
              <div className="stat-value">{statsData.pendingProperties?.toLocaleString() || "0"}</div>
              <div className="stat-trend trend-down">
                <Clock size={14} /> <span>Action Required</span>
              </div>
            </div>
            <div className="stat-icon-wrapper"><AlertCircle /></div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        {/* Left Chart: Time Trend */}
        <div className="col-12 col-xl-8">
          <div className="premium-card">
            <div className="premium-card-header mb-4">
              <div>
                <h5 className="premium-card-title">User Registration Trend</h5>
                <p className="premium-card-subtitle">Monthly active registration volume</p>
              </div>
              <div className="segment-control">
                <button className="segment-btn active">6 Months</button>
              </div>
            </div>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <AreaChart data={userTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Chart: Doughnut */}
        <div className="col-12 col-xl-4">
          <div className="premium-card">
            <div className="premium-card-header mb-0">
              <div>
                <h5 className="premium-card-title">Property Status</h5>
                <p className="premium-card-subtitle">Distribution of listings</p>
              </div>
            </div>
            <div style={{ height: 300, width: '100%' }} className="d-flex flex-column align-items-center justify-content-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={propertyStatusData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {propertyStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Data Table Row */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="premium-card p-0">
            <div className="p-4 border-bottom border-light">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                <div>
                  <h5 className="premium-card-title">Performance Analytics</h5>
                  <p className="premium-card-subtitle">Detailed breakdown of views and leads</p>
                </div>
                
                <div className="d-flex gap-2 flex-wrap">
                  <div className="segment-control">
                    <button 
                      className={`segment-btn ${viewType === 'date' ? 'active' : ''}`}
                      onClick={() => setViewType('date')}
                    >
                      Time Trend
                    </button>
                    <button 
                      className={`segment-btn ${viewType === 'property' ? 'active' : ''}`}
                      onClick={() => setViewType('property')}
                    >
                      Property Wise
                    </button>
                  </div>
                  <select 
                    className="form-select form-select-sm shadow-sm" 
                    value={timeframe} 
                    onChange={(e) => setTimeframe(e.target.value)} 
                    style={{ width: '140px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="day">Today / Daily</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="premium-table">
                <thead>
                  <tr>
                    {viewType === 'date' ? <th>Date</th> : <th>Property</th>}
                    <th style={{ width: '40%' }}>Performance Matrix (Clicks & Leads)</th>
                    <th className="text-end">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-5">
                        <BarChart3 size={40} className="text-muted opacity-25 mb-3" />
                        <p className="text-muted fw-500 mb-0">No analytics data available for this period.</p>
                      </td>
                    </tr>
                  ) : (
                    (viewType === 'property' ? analyticsData.slice(0, 5) : analyticsData).map((item, idx) => {
                      const views = viewType === 'property' ? item.historicViews : item.clicks;
                      const maxViews = Math.max(...(viewType === 'property' ? analyticsData.slice(0, 5).map(d => d.historicViews || 0) : analyticsData.map(d => d.clicks || 0)), 1);
                      const viewsWidth = ((views || 0) / maxViews) * 100;
                      
                      const maxLeads = Math.max(...(viewType === 'property' ? analyticsData.slice(0, 5) : analyticsData).map(d => d.leads || 0), 1);
                      const leadsWidth = ((item.leads || 0) / maxLeads) * 100;
                      
                      const conversion = views > 0 ? ((item.leads / views) * 100).toFixed(1) : 0;

                      return (
                        <tr key={item.date || item.propertyId || idx}>
                          <td>
                            {viewType === 'date' ? (
                              <span className="fw-bold" style={{ color: '#334155' }}>{item.date}</span>
                            ) : (
                              <div className="d-flex align-items-center gap-3">
                                <div className="user-avatar-premium shadow-sm">
                                  <Building2 size={16} />
                                </div>
                                <div>
                                  <div className="fw-bold" style={{ color: '#1e293b' }}>{item.propertyName}</div>
                                  <div className="text-muted small">{item.city}</div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex flex-column gap-2" style={{ minWidth: '200px' }}>
                              <div className="d-flex align-items-center gap-3">
                                <div className="text-muted fw-bold" style={{ fontSize: '10px', width: '45px', letterSpacing: '0.5px' }}>VIEWS</div>
                                <div className="progress flex-grow-1 shadow-sm" style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                                  <div className="progress-bar rounded" style={{ width: `${viewsWidth}%`, backgroundColor: '#4f46e5' }}></div>
                                </div>
                                <div className="fw-bold text-end" style={{ width: '35px', color: '#1e293b' }}>{views}</div>
                              </div>
                              <div className="d-flex align-items-center gap-3">
                                <div className="text-muted fw-bold" style={{ fontSize: '10px', width: '45px', letterSpacing: '0.5px' }}>LEADS</div>
                                <div className="progress flex-grow-1 shadow-sm" style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                                  <div className="progress-bar rounded" style={{ width: `${leadsWidth}%`, backgroundColor: '#10b981' }}></div>
                                </div>
                                <div className="fw-bold text-end" style={{ width: '35px', color: '#1e293b' }}>{item.leads}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-end">
                            <span className={`premium-badge ${conversion > 10 ? 'badge-active' : (conversion > 0 ? 'badge-pending' : 'badge-inactive')}`}>
                              {conversion}% Rate
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Two Data Tables Row */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-6">
          <div className="premium-card p-0 h-100">
            <div className="p-4 border-bottom border-light d-flex justify-content-between align-items-center">
              <div>
                <h5 className="premium-card-title">Recent Properties</h5>
                <p className="premium-card-subtitle">Latest listings needing review</p>
              </div>
              <Link to="/admin/properties" className="btn btn-light btn-sm fw-600 rounded-pill px-3 text-primary">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {statsData.recentProperties?.slice(0, 5).map(listing => (
                    <tr key={listing._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="user-avatar-premium" style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)' }}>
                            <Home size={14} />
                          </div>
                          <div>
                            <div className="fw-bold" style={{ color: '#1e293b', fontSize: '13px' }}>{listing.pgName}</div>
                            <div className="text-muted" style={{ fontSize: '11px' }}>{listing.city}</div>
                          </div>
                        </div>
                      </td>
                      <td>{getStatusBadge(listing.status)}</td>
                      <td className="small text-muted fw-500">{formatDate(listing.createdAt)}</td>
                    </tr>
                  ))}
                  {!statsData.recentProperties?.length && (
                    <tr><td colSpan="3" className="text-center py-4 text-muted small">No recent properties</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="premium-card p-0 h-100">
            <div className="p-4 border-bottom border-light d-flex justify-content-between align-items-center">
              <div>
                <h5 className="premium-card-title">Recent Users</h5>
                <p className="premium-card-subtitle">Latest platform signups</p>
              </div>
              <Link to="/admin/users" className="btn btn-light btn-sm fw-600 rounded-pill px-3 text-primary">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {statsData.recentUsers?.slice(0, 5).map(user => (
                    <tr key={user._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="user-avatar-premium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold" style={{ color: '#1e293b', fontSize: '13px' }}>{user.name}</div>
                            <div className="text-muted" style={{ fontSize: '11px' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="premium-badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                          {user.role}
                        </span>
                      </td>
                      <td>{getUserBadge(user.active)}</td>
                    </tr>
                  ))}
                  {!statsData.recentUsers?.length && (
                    <tr><td colSpan="3" className="text-center py-4 text-muted small">No recent users</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;