import React, { useState } from 'react';
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
  Target
} from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';

const B2BDashboard = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedProperty, setSelectedProperty] = useState('all');

  // Property Performance Data - Focus on Clicks & Leads only
  const properties = [];

  const recentLeads = [];

  // Calculate total stats
  const totalStats = {
    totalViews: properties.reduce((acc, p) => acc + p.views, 0),
    totalLeads: properties.reduce((acc, p) => acc + p.leads, 0),
    avgConversion: properties.length > 0
      ? (properties.reduce((acc, p) => acc + p.conversion, 0) / properties.length).toFixed(1)
      : "0.0"
  };

  // Stats Cards - Focus only on Clicks & Leads (No Revenue)
  const statsRow1 = [
    { title: "Total Properties", value: properties.length.toString(), icon: Building2, color: "primary", trend: properties.length > 0 ? 12 : 0, subtext: properties.length > 0 ? "+2 this month" : "No properties added" },
    { title: "Active Listings", value: properties.length.toString(), icon: Users, color: "success", trend: properties.length > 0 ? 8 : 0, subtext: properties.length > 0 ? "All properties active" : "Add listing to start" },
    { title: "Total Clicks (Views)", value: totalStats.totalViews.toLocaleString(), icon: Eye, color: "info", trend: properties.length > 0 ? 24 : 0, subtext: properties.length > 0 ? "↑ 1,240 from last month" : "No views yet" }
  ];

  const statsRow2 = [
    { title: "Total Leads", value: totalStats.totalLeads.toString(), icon: Phone, color: "warning", trend: recentLeads.length > 0 ? 18 : 0, subtext: recentLeads.length > 0 ? "45 this month" : "Waiting for leads" },
    { title: "Click → Lead Rate", value: `${totalStats.avgConversion}%`, icon: Target, color: "success", trend: properties.length > 0 ? 5 : 0, subtext: properties.length > 0 ? "↑ 0.5% improvement" : "N/A" },
    { title: "Occupancy Rate", value: properties.length > 0 ? "78%" : "0%", icon: Activity, color: "info", trend: properties.length > 0 ? 8 : 0, subtext: properties.length > 0 ? "↑ 12% from last quarter" : "No data" }
  ];

  // Weekly Trends Data (Zeroed out)
  const weeklyClicks = [0, 0, 0, 0, 0, 0, 0];
  const weeklyLeads = [0, 0, 0, 0, 0, 0, 0];


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
          <button className="btn-outline-premium btn-sm">View All</button>
        </div>
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Name</th>
                <th>Property</th>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.length > 0 ? (
                recentLeads.map(lead => (
                  <tr key={lead.id}>
                    <td className="small fw-600">{lead.name}</td>
                    <td className="small">{lead.property}</td>
                    <td className="small">{lead.date}</td>
                    <td>
                      <span className={`badge-premium ${lead.type === 'Call' ? 'badge-success' : 'badge-info'}`}>
                        {lead.type === 'Call' ? '📞 Call' : '✉️ Enquiry'}
                      </span>
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
                        <button className="btn-premium btn-sm mt-2">Add Property</button>
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
              <button className="btn-premium me-2">
                <PlusCircle size={16} className="me-1" /> Add Property
              </button>
              <button className="btn-outline-premium">
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