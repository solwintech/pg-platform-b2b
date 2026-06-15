import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Phone,
  Eye,
  TrendingUp,
  PlusCircle,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  Clock,
  CheckCircle,
  Activity,
  Target,
  MessageCircle,
  Star
} from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import propertyService from '../../services/propertyService';
import leadService from '../../services/leadService';
import reviewService from '../../services/reviewService';

const B2BDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    fetchDashboardData();

    const handlePropertyViewed = (e) => {
      const { propertyId, views } = e.detail;
      setProperties(prev => prev.map(p => {
        if (p.id === propertyId) {
          const newConversion = views > 0 ? ((p.leads / views) * 100).toFixed(1) : 0;
          return { ...p, views, conversion: newConversion };
        }
        return p;
      }));
    };

    window.addEventListener('property_viewed', handlePropertyViewed);
    return () => window.removeEventListener('property_viewed', handlePropertyViewed);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await propertyService.getProperties({}, false);
      if (response.success) {
        // Map backend properties to the format expected by dashboard
        const mappedProps = (response.properties || []).map(p => ({
          id: p._id,
          name: p.pgName || p.title || 'Unnamed Property',
          views: p.views || 0,
          leads: p.leads || 0,
          conversion: p.views > 0 ? ((p.leads / p.views) * 100).toFixed(1) : 0,
          status: p.status || 'Active'
        }));
        setProperties(mappedProps);
      }

      // Fetch Leads
      const leadsRes = await leadService.getB2BLeads();
      if (leadsRes.success) {
        setRecentLeads(leadsRes.data || []);
      }

      // Fetch Reviews
      try {
        const reviewsRes = await reviewService.getReviews();
        const allReviews = reviewsRes.success ? reviewsRes.data : (Array.isArray(reviewsRes) ? reviewsRes : []);
        const myPropertyIds = response.success ? (response.properties || []).map(p => p._id) : [];
        const myReviews = allReviews.filter(r => r.property && myPropertyIds.includes(r.property._id));
        // Sort descending by date
        myReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentReviews(myReviews);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total stats
  const totalStats = {
    totalViews: properties.reduce((acc, p) => acc + (typeof p.views === 'number' ? p.views : 0), 0),
    totalLeads: recentLeads.length,
    avgConversion: properties.length > 0
      ? (properties.reduce((acc, p) => acc + parseFloat(p.conversion), 0) / properties.length).toFixed(1)
      : "0.0"
  };

  // Stats Cards - Focus only on Clicks & Leads (No Revenue)
  const statsRow1 = [
    { title: "Total Properties", value: properties.length.toString(), icon: Building2, color: "primary", trend: properties.length > 0 ? 12 : 0, subtext: properties.length > 0 ? "+2 this month" : "No properties added", onClick: () => navigate('/b2b/listings') },
    { title: "Active Listings", value: properties.length.toString(), icon: Users, color: "success", trend: properties.length > 0 ? 8 : 0, subtext: properties.length > 0 ? "All properties active" : "Add listing to start", onClick: () => navigate('/b2b/listings') },
    { title: "Total Clicks (Views)", value: totalStats.totalViews.toLocaleString(), icon: Eye, color: "info", trend: properties.length > 0 ? 24 : 0, subtext: properties.length > 0 ? "↑ 1,240 from last month" : "No views yet", onClick: () => navigate('/b2b/listings') }
  ];

  const statsRow2 = [
    { title: "Total Leads", value: totalStats.totalLeads.toString(), icon: Phone, color: "warning", trend: recentLeads.length > 0 ? 18 : 0, subtext: recentLeads.length > 0 ? "45 this month" : "Waiting for leads", onClick: () => navigate('/b2b/leads') },
    { title: "Click → Lead Rate", value: `${totalStats.avgConversion}%`, icon: Target, color: "success", trend: properties.length > 0 ? 5 : 0, subtext: properties.length > 0 ? "↑ 0.5% improvement" : "N/A", onClick: () => navigate('/b2b/leads') },
    { title: "Occupancy Rate", value: properties.length > 0 ? "78%" : "0%", icon: Activity, color: "info", trend: properties.length > 0 ? 8 : 0, subtext: properties.length > 0 ? "↑ 12% from last quarter" : "No data", onClick: () => navigate('/b2b/listings') }
  ];

  // Weekly Trends Data (Zeroed out)
  const weeklyClicks = [0, 0, 0, 0, 0, 0, 0];
  const weeklyLeads = [0, 0, 0, 0, 0, 0, 0];


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in-up">

      {/* Stats Cards - Row 1 (3 cards) */}
      <div className="row mb-1">
        {statsRow1.map((stat, index) => (
          <div className="col-md-4 mb-3" key={index}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* Stats Cards - Row 2 (3 cards) */}
      <div className="row mb-4">
        {statsRow2.map((stat, index) => (
          <div className="col-md-4 mb-3" key={index}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>
      {/* Recent Leads */}
      <div className="modern-card mb-4">
        <div className="card-header-modern d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Recent Leads</span>
          <button className="btn-outline-premium btn-sm" onClick={() => navigate('/b2b/leads')}>View All</button>
        </div>
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Name</th>
                <th>Property</th>
                <th>Date</th>
                <th>Visit Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.length > 0 ? (
                recentLeads.slice(0, 5).map(lead => (
                  <tr key={lead._id}>
                    <td className="small fw-600">{lead.name}</td>
                    <td className="small">{lead.property?.pgName || 'N/A'}</td>
                    <td>
                      <div className="small fw-600 d-flex align-items-center gap-1">
                        <Calendar size={10} className="text-muted" />
                        {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-muted mt-1 d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                        <Clock size={10} />
                        {new Date(lead.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      {lead.visitDate ? (
                        <div style={{ background: '#f0fdfa', padding: '6px 8px', borderRadius: '6px', border: '1px solid #ccfbf1', display: 'inline-block' }}>
                           <div className="fw-bold d-flex align-items-center gap-1 mb-1" style={{ fontSize: '9px', color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                             <Calendar size={10} /> Scheduled Visit
                           </div>
                           <div className="d-flex align-items-center gap-1" style={{ fontSize: '10px', color: '#115e59' }}>
                             <span className="fw-600">{new Date(lead.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                             {lead.visitTime && <><span className="mx-1 opacity-50">|</span><Clock size={10} /> <span className="fw-600">{lead.visitTime}</span></>}
                           </div>
                        </div>
                      ) : (
                        <span className="text-muted opacity-50" style={{ fontSize: '12px' }}>-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-premium ${lead.status === 'New' ? 'badge-warning' : lead.status === 'Contacted' ? 'badge-info' : 'badge-success'}`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="text-muted mb-2">
                      <Phone size={32} className="opacity-20 mb-3" />
                      <h5>No Leads Yet</h5>
                      <p className="small">Leads from potential tenants will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Reviews (Latest 10) */}
      <div className="modern-card mb-4">
        <div className="card-header-modern d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Recent Reviews</span>
          <button className="btn-outline-premium btn-sm" onClick={() => navigate('/b2b/reviews')}>View All</button>
        </div>
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Property</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentReviews.length > 0 ? (
                recentReviews.slice(0, 10).map(review => (
                  <tr key={review._id}>
                    <td className="small fw-600">{review.user?.name || 'Anonymous'}</td>
                    <td className="small">{review.property?.pgName || 'N/A'}</td>
                    <td>
                      <div className="d-flex align-items-center text-warning" style={{ gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="text-truncate small" style={{ maxWidth: '250px' }}>
                        {review.title && <span className="fw-bold me-1">{review.title}</span>}
                        <span className="text-muted">{review.comment}</span>
                      </div>
                    </td>
                    <td>
                      <div className="small fw-600 d-flex align-items-center gap-1">
                        <Calendar size={10} className="text-muted" />
                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="text-muted mb-2">
                      <MessageCircle size={32} className="opacity-20 mb-3" />
                      <h5>No Reviews Yet</h5>
                      <p className="small">Reviews from your residents will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Performance Table - Focus on Clicks & Leads */}
      <div className="modern-card mb-4">
        <div className="card-header-modern d-flex justify-content-between align-items-center">
          <div>
            <span className="fw-semibold">Property Performance</span>
            <p className="text-muted small mb-0">Clicks, leads & conversion insights per property</p>
          </div>
          <select
            className="form-control-modern w-auto"
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            style={{ fontSize: '12px', padding: '4px 8px', width: 'auto' }}
          >
            <option value="all">All Properties</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Property Name</th>
                  <th>Total Clicks (Views)</th>
                  <th>Total Leads</th>
                  <th>Click → Lead Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {properties.length > 0 ? (
                  properties.map(property => (
                    <tr key={property.id}>
                      <td className="fw-600">{property.name}</td>
                      <td className="fw-600 text-primary">{property.views.toLocaleString()}</td>
                      <td className="fw-600 text-success">{property.leads}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '4px', width: '80px' }}>
                            <div className="progress-bar bg-success" style={{ width: `${property.conversion * 10}%` }}></div>
                          </div>
                          <span className="small">{property.conversion}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-premium badge-success">
                          <CheckCircle size={10} className="me-1" /> Active
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="text-muted mb-2">
                        <Building2 size={32} className="opacity-20 mb-3" />
                        <h5>No Properties Yet</h5>
                        <p className="small">Add your first property to start seeing performance data.</p>
                        <button className="btn-premium btn-sm mt-2" onClick={() => navigate('/b2b/add-pg')}>Add Property</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Weekly Trends Charts */}
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="modern-card">
            <div className="card-header-modern">
              <span className="fw-semibold">Weekly Clicks Trend</span>
              <p className="text-muted small mb-0">Last 7 days property views</p>
            </div>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-end mb-3" style={{ height: '150px' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                  <div key={idx} className="text-center" style={{ flex: 1 }}>
                    <div className="mb-2">
                      <div
                        className="bg-gradient-primary rounded mx-auto"
                        style={{
                          width: '35px',
                          height: `${(weeklyClicks[idx] / 2500) * 120}px`,
                          transition: 'height 0.3s ease'
                        }}
                      ></div>
                    </div>
                    <small className="text-muted">{day}</small>
                    <div className="small fw-semibold">{weeklyClicks[idx].toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-top">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="small text-muted">Total Weekly Clicks</div>
                    <div className="h6 mb-0">{weeklyClicks.reduce((a, b) => a + b, 0).toLocaleString()}</div>
                  </div>
                  <div className="text-success d-flex align-items-center">
                    <ArrowUp size={14} /> +24%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="modern-card">
            <div className="card-header-modern">
              <span className="fw-semibold">Weekly Leads Trend</span>
              <p className="text-muted small mb-0">Last 7 days lead generation</p>
            </div>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-end mb-3" style={{ height: '150px' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                  <div key={idx} className="text-center" style={{ flex: 1 }}>
                    <div className="mb-2">
                      <div
                        className="bg-gradient-success rounded mx-auto"
                        style={{
                          width: '35px',
                          height: `${(weeklyLeads[idx] / 80) * 120}px`,
                          transition: 'height 0.3s ease',
                          background: 'linear-gradient(135deg, #10b981, #059669)'
                        }}
                      ></div>
                    </div>
                    <small className="text-muted">{day}</small>
                    <div className="small fw-semibold">{weeklyLeads[idx]}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-top">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="small text-muted">Total Weekly Leads</div>
                    <div className="h6 mb-0">{weeklyLeads.reduce((a, b) => a + b, 0)}</div>
                  </div>
                  <div className="text-success d-flex align-items-center">
                    <ArrowUp size={14} /> +18%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Insights Card */}
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="modern-card">
            <div className="card-header-modern">
              <span className="fw-semibold">Conversion Insights</span>
              <p className="text-muted small mb-0">Click to lead conversion analysis</p>
            </div>
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center mx-auto"
                  style={{ width: '120px', height: '120px' }}>
                  <div className="text-center">
                    <div className="h2 mb-0">{totalStats.avgConversion}%</div>
                    <small className="text-muted">Avg Conversion</small>
                  </div>
                </div>
              </div>
              <div className="row text-center">
                <div className="col-6">
                  <div className="p-3 bg-light rounded">
                    <Eye size={20} className="text-primary mb-2" />
                    <div className="small text-muted">Total Clicks</div>
                    <div className="h5 mb-0">{totalStats.totalViews.toLocaleString()}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded">
                    <Phone size={20} className="text-success mb-2" />
                    <div className="small text-muted">Total Leads</div>
                    <div className="h5 mb-0">{totalStats.totalLeads}</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-2 bg-info bg-opacity-10 rounded text-center">
                <small className="text-muted">
                  💡 For every 100 clicks, you get approximately {Math.round(totalStats.avgConversion)} leads
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="modern-card">
            <div className="card-header-modern">
              <span className="fw-semibold">Quick Insights</span>
              <p className="text-muted small mb-0">Key performance indicators</p>
            </div>
            <div className="card-body p-4">
              {properties.length > 0 ? (
                <>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small">Best Performing Property (Clicks)</span>
                      <span className="small fw-600 text-primary">{properties.sort((a, b) => b.views - a.views)[0].name}</span>
                    </div>
                    <div className="progress" style={{ height: '4px' }}>
                      <div className="progress-bar bg-primary" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small">Best Conversion Rate</span>
                      <span className="small fw-600 text-success">
                        {properties.sort((a, b) => b.conversion - a.conversion)[0].name} ({properties.sort((a, b) => b.conversion - a.conversion)[0].conversion}%)
                      </span>
                    </div>
                    <div className="progress" style={{ height: '4px' }}>
                      <div className="progress-bar bg-success" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small">Most Leads Generated</span>
                      <span className="small fw-600 text-warning">
                        {properties.sort((a, b) => b.leads - a.leads)[0].name} ({properties.sort((a, b) => b.leads - a.leads)[0].leads})
                      </span>
                    </div>
                    <div className="progress" style={{ height: '4px' }}>
                      <div className="progress-bar bg-warning" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <hr className="my-3" />
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="text-success small fw-600">Best Performer</div>
                      <div className="small text-muted text-truncate">{properties.sort((a, b) => b.views - a.views)[0].name}</div>
                    </div>
                    <div className="col-4">
                      <div className="text-warning small fw-600">Highest Leads</div>
                      <div className="small text-muted text-truncate">{properties.sort((a, b) => b.leads - a.leads)[0].name}</div>
                    </div>
                    <div className="col-4">
                      <div className="text-info small fw-600">Top Conversion</div>
                      <div className="small text-muted text-truncate">{properties.sort((a, b) => b.conversion - a.conversion)[0].name}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <Target size={32} className="opacity-20 mb-3" />
                  <p className="small text-muted">No insights available yet. Add properties and get clicks to see analysis.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Quick Actions Footer */}
      <div className="modern-card">
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h6 className="mb-1">Need to update your property details?</h6>
              <p className="text-muted small mb-0">Keep your listings up to date to attract more customers</p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <button className="btn-premium me-2" onClick={() => navigate('/b2b/add-pg')}>
                <PlusCircle size={16} className="me-1" /> Add Property
              </button>
              <button className="btn-outline-premium" onClick={() => navigate('/b2b/listings')}>
                <Filter size={16} className="me-1" /> Manage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BDashboard;