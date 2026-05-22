import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  Calendar, 
  Download, 
  Search, 
  User, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  Eye,
  Building2,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import leadService from '../../services/leadService';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadService.getB2BLeads();
      if (response.success) {
        setLeads(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads
    .filter(lead => filter === 'all' ? true : lead.type === (filter === 'Call' ? 'Call' : 'Enquiry'))
    .filter(lead => statusFilter === 'all' ? true : lead.status === statusFilter)
    .filter(lead => 
      (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.property?.pgName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phone || '').includes(searchTerm)
    );

  const stats = {
    total: leads.length,
    calls: leads.filter(l => l.type === 'Call').length,
    enquiries: leads.filter(l => l.type === 'Enquiry').length,
    new: leads.filter(l => l.status === 'New').length,
    contacted: leads.filter(l => l.status === 'Contacted').length,
    interested: leads.filter(l => l.status === 'Interested' || l.status === 'Qualified').length
  };

  const updateLeadStatus = async (id, newStatus) => {
    try {
      await leadService.updateLeadStatus(id, newStatus);
      const updatedLeads = leads.map(lead => 
        lead._id === id ? { ...lead, status: newStatus } : lead
      );
      setLeads(updatedLeads);
      setOpenDropdown(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Error updating status');
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'New':
        return <span className="badge-premium badge-warning"><Clock size={10} className="me-1" /> New</span>;
      case 'Contacted':
        return <span className="badge-premium badge-info"><MessageCircle size={10} className="me-1" /> Contacted</span>;
      case 'Interested':
        return <span className="badge-premium badge-success"><CheckCircle size={10} className="me-1" /> Interested</span>;
      default:
        return <span className="badge-premium badge-secondary">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <RefreshCw size={32} className="spin text-primary mb-3" />
        <p>Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
     
      {/* Filters and Search */}
      <div className="modern-card mb-2">
        <div className="card-header-modern">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="navbar-search">
                <Search className="search-icon" size={16} />
                <input 
                  type="text" 
                  className="form-control-premium" 
                  placeholder="Search by name, property, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '13px', padding: '8px 12px 8px 36px' }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-control-modern"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ fontSize: '13px', padding: '8px 12px' }}
              >
                <option value="all">All Types</option>
                <option value="Call">Calls</option>
                <option value="Enquiry">Enquiries</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-control-modern"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '13px', padding: '8px 12px' }}
              >
                <option value="all">All Status</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn-outline-premium w-100" onClick={fetchLeads} style={{ padding: '8px 12px', fontSize: '13px' }}>
                <RefreshCw size={14} className="me-1" /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table - List Format */}
      <div className="modern-card">
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Contact Info</th>
                <th>Property of Interest</th>
                <th>Type</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <User size={50} className="text-muted mb-3" />
                    <h6>No leads found</h6>
                    <p className="text-muted small">No leads match your current filters</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '12px' }}>
                          {(lead.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <div className="fw-600 small">{lead.name}</div>
                          <div className="text-muted" style={{ fontSize: '10px' }}>ID: ...{lead._id.substring(lead._id.length - 6)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small">{lead.phone}</div>
                      <div className="text-muted" style={{ fontSize: '10px' }}>{lead.email || 'No email'}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <Building2 size={12} className="text-muted" />
                        <span className="small">{lead.property?.pgName || 'N/A'}</span>
                      </div>
                    </td>
                    <td>{getTypeBadge(lead.type)}</td>
                    <td style={{ position: 'relative' }}>
                      <button 
                        className="status-dropdown-btn"
                        onClick={() => toggleDropdown(lead._id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '20px'
                        }}
                      >
                        {getStatusBadge(lead.status)}
                        <ChevronDown size={12} />
                      </button>
                      {openDropdown === lead._id && (
                        <div className="status-dropdown-menu" style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          zIndex: 100,
                          minWidth: '140px',
                          marginTop: '4px'
                        }}>
                          {['New', 'Contacted', 'Qualified', 'Closed', 'Spam'].map(s => (
                            <div 
                              key={s}
                              className="dropdown-item" 
                              onClick={() => updateLeadStatus(lead._id, s)}
                              style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}
                            >
                              {s === 'New' ? <Clock size={12} /> : s === 'Contacted' ? <MessageCircle size={12} /> : <CheckCircle size={12} />} {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="small">{new Date(lead.createdAt).toLocaleTimeString()}</div>
                      <div className="text-muted" style={{ fontSize: '10px' }}>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <a href={`tel:${lead.phone}`} className="btn-premium" style={{ textDecoration: 'none', padding: '5px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> Call
                        </a>
                        <a href={`https://wa.me/${lead.phone}`} target="_blank" rel="noreferrer" className="btn-outline-premium" style={{ textDecoration: 'none', padding: '5px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageCircle size={12} /> WhatsApp
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leads;