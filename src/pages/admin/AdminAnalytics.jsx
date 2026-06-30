import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Building2, 
  X,
  Activity,
  BarChart3,
  TrendingUp,
  Download,
  Eye
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import adminService from '../../services/adminService';
import './AdminDashboard.css';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('day');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState('views_desc');
  
  // Modal State
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchPropertiesAnalytics();
  }, [timeframe]);

  const fetchPropertiesAnalytics = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAnalytics(timeframe, 'property');
      setAnalyticsData(response.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyClick = async (property) => {
    setSelectedProperty(property);
    setModalLoading(true);
    try {
      // Fetch time trend for this specific property
      const response = await adminService.getAnalytics(timeframe, 'date', property.propertyId);
      setModalData(response.data || []);
    } catch (err) {
      console.error('Error fetching property specific analytics:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedProperty(null);
    setModalData([]);
  };

  // Get unique cities for filter
  const uniqueCities = [...new Set(analyticsData.map(item => item.city).filter(Boolean))].sort();

  // Filter properties based on search query and city
  let filteredData = analyticsData.filter(item => {
    const matchesSearch = item.propertyName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter ? item.city === cityFilter : true;
    return matchesSearch && matchesCity;
  });

  // Sort properties
  filteredData = filteredData.sort((a, b) => {
    switch (sortBy) {
      case 'views_desc':
        return (b.historicViews || 0) - (a.historicViews || 0);
      case 'leads_desc':
        return (b.leads || 0) - (a.leads || 0);
      case 'name_asc':
        return (a.propertyName || '').localeCompare(b.propertyName || '');
      case 'conversion_desc':
        const convA = a.historicViews > 0 ? a.leads / a.historicViews : 0;
        const convB = b.historicViews > 0 ? b.leads / b.historicViews : 0;
        return convB - convA;
      default:
        return 0;
    }
  });

  return (
    <div className="admin-command-center fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Performance Analytics</h4>
          <p className="text-muted mb-0 small">Deep dive into property-specific metrics</p>
        </div>
        <div className="d-flex gap-3">
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
          <button className="btn btn-outline-primary btn-sm fw-600 rounded-pill px-3 d-flex align-items-center gap-2">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="premium-card p-0">
        <div className="p-4 border-bottom border-light d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          <div className="position-relative" style={{ width: '100%', maxWidth: '350px' }}>
            <Search className="position-absolute text-muted" size={16} style={{ top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
            <input 
              type="text" 
              className="form-control form-control-sm ps-5 bg-light border-0" 
              placeholder="Search by property name or city..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: '10px', padding: '10px' }}
            />
          </div>
          <div className="d-flex gap-2">
            <select 
              className="form-select form-select-sm bg-light border-0 text-muted" 
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{ borderRadius: '10px', padding: '10px 30px 10px 15px' }}
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select 
              className="form-select form-select-sm bg-light border-0 text-muted" 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ borderRadius: '10px', padding: '10px 30px 10px 15px' }}
            >
              <option value="views_desc">Highest Views</option>
              <option value="leads_desc">Highest Leads</option>
              <option value="conversion_desc">Best Conversion</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="premium-table table-hover">
            <thead>
              <tr>
                <th>Property Details</th>
                <th>Total Views</th>
                <th>Total Leads</th>
                <th>Conversion Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border text-primary border-2" style={{ width: '2rem', height: '2rem' }} role="status"></div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <Activity size={40} className="text-muted opacity-25 mb-3" />
                    <p className="text-muted fw-500 mb-0">No properties found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => {
                  const conversion = item.historicViews > 0 ? ((item.leads / item.historicViews) * 100).toFixed(1) : 0;
                  return (
                    <tr key={item.propertyId || idx} style={{ cursor: 'pointer' }} onClick={() => handlePropertyClick(item)}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="user-avatar-premium shadow-sm">
                            <Building2 size={16} />
                          </div>
                          <div>
                            <div className="fw-bold" style={{ color: '#1e293b' }}>{item.propertyName}</div>
                            <div className="text-muted small">{item.city}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold" style={{ color: '#4f46e5' }}>{item.historicViews}</div>
                      </td>
                      <td>
                        <div className="fw-bold" style={{ color: '#10b981' }}>{item.leads}</div>
                      </td>
                      <td>
                        <span className={`premium-badge ${conversion > 10 ? 'badge-active' : (conversion > 0 ? 'badge-pending' : 'badge-inactive')}`}>
                          {conversion}% Rate
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-light text-primary rounded-pill px-3 fw-600">
                          Analyze
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Deep-Dive Modal */}
      {selectedProperty && (
        <>
          <div className="modal-backdrop fade show" style={{ backdropFilter: 'blur(4px)' }} onClick={closeModal}></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-labelledby="analyticsModalLabel">
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                  <div>
                    <h5 className="modal-title fw-bold" style={{ color: '#0f172a' }}>{selectedProperty.propertyName}</h5>
                    <p className="text-muted small mb-0">{selectedProperty.city} • Performance Breakdown</p>
                  </div>
                  <button type="button" className="btn-close shadow-none" onClick={closeModal} aria-label="Close"></button>
                </div>
                <div className="modal-body p-4">
                  {/* Summary Metric Cards in Modal */}
                  <div className="row g-3 mb-4">
                    <div className="col-4">
                      <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                        <div>
                          <div className="small text-muted fw-600 text-uppercase">Total Views</div>
                          <div className="h4 mb-0 fw-bold" style={{ color: '#4f46e5' }}>{selectedProperty.historicViews}</div>
                        </div>
                        <Eye className="opacity-25" size={24} style={{ color: '#4f46e5' }} />
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                        <div>
                          <div className="small text-muted fw-600 text-uppercase">Total Leads</div>
                          <div className="h4 mb-0 fw-bold" style={{ color: '#10b981' }}>{selectedProperty.leads}</div>
                        </div>
                        <TrendingUp className="opacity-25" size={24} style={{ color: '#10b981' }} />
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                        <div>
                          <div className="small text-muted fw-600 text-uppercase">Conversion</div>
                          <div className="h4 mb-0 fw-bold text-dark">
                            {selectedProperty.historicViews > 0 ? ((selectedProperty.leads / selectedProperty.historicViews) * 100).toFixed(1) : 0}%
                          </div>
                        </div>
                        <Activity className="opacity-25" size={24} />
                      </div>
                    </div>
                  </div>

                  {/* Modal Chart */}
                  <div className="border rounded-3 p-3 pt-4">
                    <h6 className="fw-600 mb-3" style={{ color: '#1e293b' }}>Time Trend Analysis</h6>
                    {modalLoading ? (
                      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                        <div className="spinner-border text-primary border-2" role="status"></div>
                      </div>
                    ) : modalData.length === 0 ? (
                      <div className="d-flex flex-column justify-content-center align-items-center text-muted" style={{ height: '300px' }}>
                        <BarChart3 size={40} className="opacity-25 mb-2" />
                        <p>No historical data for this period.</p>
                      </div>
                    ) : (
                      <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                          <AreaChart data={modalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <RechartsTooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" name="Views" dataKey="clicks" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                            <Area type="monotone" name="Leads" dataKey="leads" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
