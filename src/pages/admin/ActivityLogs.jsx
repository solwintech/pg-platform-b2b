import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Clock, 
  User, 
  FileText, 
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import adminService from '../../services/adminService';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLog, setExpandedLog] = useState(null);
  const [actionFilter, setActionFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await adminService.getActivityLogs();
      setLogs(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create')) return <span className="badge bg-success bg-opacity-10 text-success">Create</span>;
    if (actionLower.includes('update')) return <span className="badge bg-primary bg-opacity-10 text-primary">Update</span>;
    if (actionLower.includes('delete')) return <span className="badge bg-danger bg-opacity-10 text-danger">Delete</span>;
    if (actionLower.includes('approve')) return <span className="badge bg-info bg-opacity-10 text-info">Approve</span>;
    if (actionLower.includes('reject')) return <span className="badge bg-warning bg-opacity-10 text-warning">Reject</span>;
    return <span className="badge bg-secondary bg-opacity-10 text-secondary">{action}</span>;
  };

  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp);
    
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    const matchesModel = modelFilter === 'all' || log.targetModel === modelFilter;
    const matchesUser = userFilter === 'all' || log.performedBy?._id === userFilter;
    
    const matchesStartDate = !startDate || logDate >= new Date(startDate);
    const matchesEndDate = !endDate || logDate <= new Date(endDate + 'T23:59:59');

    return matchesSearch && matchesAction && matchesModel && matchesUser && matchesStartDate && matchesEndDate;
  });

  // Get unique models and users for filters
  const uniqueModels = [...new Set(logs.map(log => log.targetModel))];
  const uniqueUsers = Array.from(new Map(logs.filter(l => l.performedBy).map(log => [log.performedBy._id, log.performedBy])).values());

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setExpandedLog(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, actionFilter, modelFilter, userFilter, startDate, endDate]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Activity Logs</h4>
          <p className="text-muted small mb-0">System-wide audit trail and activity monitoring</p>
        </div>
        <button className="btn-premium" onClick={fetchLogs}>
          <Clock size={16} className="me-2" /> Refresh Logs
        </button>
      </div>

      {/* Filters Section */}
      <div className="modern-card mb-4">
        <div className="card-header-modern p-4">
          {/* Row 1: Search */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="navbar-search w-100">
                <Search className="search-icon" size={18} />
                <input 
                  type="text" 
                  className="form-control-premium w-100" 
                  placeholder="Search by action, user, model or specific details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '14px', padding: '12px 12px 12px 42px' }}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Category & Date Filters */}
          <div className="row g-3">
            <div className="col-lg-3 col-md-6">
              <label className="form-label x-small fw-bold text-muted text-uppercase mb-1">Action Type</label>
              <select 
                className="form-control-modern"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                style={{ height: '42px' }}
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
              </select>
            </div>
            
            <div className="col-lg-2 col-md-6">
              <label className="form-label x-small fw-bold text-muted text-uppercase mb-1">Target Model</label>
              <select 
                className="form-control-modern"
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                style={{ height: '42px' }}
              >
                <option value="all">All Models</option>
                {uniqueModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div className="col-lg-3 col-md-6">
              <label className="form-label x-small fw-bold text-muted text-uppercase mb-1">Performed By</label>
              <select 
                className="form-control-modern"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                style={{ height: '42px' }}
              >
                <option value="all">All Administrators</option>
                {uniqueUsers.map(user => (
                  <option key={user._id} value={user._id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div className="col-lg-4 col-md-6">
              <label className="form-label x-small fw-bold text-muted text-uppercase mb-1">Date Range</label>
              <div className="d-flex gap-2">
                <div className="position-relative flex-grow-1">
                  <Calendar className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
                  <input 
                    type="date" 
                    className="form-control-modern ps-5" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ height: '42px', fontSize: '12px' }}
                    title="Start Date"
                  />
                </div>
                <div className="position-relative flex-grow-1">
                  <Calendar className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
                  <input 
                    type="date" 
                    className="form-control-modern ps-5" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ height: '42px', fontSize: '12px' }}
                    title="End Date"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="modern-card">
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Timestamp</th>
                <th>Performed By</th>
                <th>Action</th>
                <th>Target Model</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <ClipboardList size={50} className="text-muted mb-3" />
                    <h6>No activity logs found</h6>
                  </td>
                </tr>
              ) : (
                currentLogs.map(log => (
                  <React.Fragment key={log._id}>
                    <tr 
                      className={expandedLog === log._id ? 'bg-light' : ''}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                    >
                      <td>
                        {expandedLog === log._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </td>
                      <td className="small">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-sm" style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                            {log.performedBy?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="small">
                            <div className="fw-600">{log.performedBy?.name}</div>
                            <div className="text-muted x-small">{log.performedBy?.role}</div>
                          </div>
                        </div>
                      </td>
                      <td>{getActionBadge(log.action)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1 small">
                          <FileText size={12} className="text-muted" />
                          {log.targetModel}
                        </div>
                      </td>
                      <td className="small">{log.details}</td>
                    </tr>
                    {expandedLog === log._id && (
                      <tr>
                        <td colSpan="6" className="p-0 border-0">
                          <div className="p-4 bg-light border-bottom">
                            <div className="row">
                              <div className="col-md-6">
                                <h6 className="x-small fw-bold text-muted text-uppercase mb-3">Before Changes</h6>
                                <pre className="p-3 bg-white border rounded x-small mb-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                  {log.before ? JSON.stringify(log.before, null, 2) : 'No prior state'}
                                </pre>
                              </div>
                              <div className="col-md-6">
                                <h6 className="x-small fw-bold text-muted text-uppercase mb-3">After Changes</h6>
                                <pre className="p-3 bg-white border rounded x-small mb-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                  {log.after ? JSON.stringify(log.after, null, 2) : 'No state changes recorded'}
                                </pre>
                              </div>
                            </div>
                            <div className="mt-3 d-flex gap-3">
                              <div className="x-small text-muted">
                                <span className="fw-bold">Target ID:</span> {log.targetId}
                              </div>
                              <div className="x-small text-muted">
                                <span className="fw-bold">IP Address:</span> {log.ipAddress || 'N/A'}
                              </div>
                              <div className="x-small text-muted">
                                <span className="fw-bold">User Agent:</span> {log.userAgent?.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="card-footer-modern p-3 d-flex justify-content-between align-items-center border-top">
            <div className="text-muted x-small">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} logs
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm btn-outline-premium p-1 px-2 d-flex align-items-center"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Show only 5 pages around current page
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button 
                      key={page}
                      className={`btn btn-sm ${currentPage === page ? 'btn-premium' : 'btn-outline-premium'} px-3`}
                      style={{ fontSize: '11px' }}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-muted align-self-center">...</span>;
                }
                return null;
              })}

              <button 
                className="btn btn-sm btn-outline-premium p-1 px-2 d-flex align-items-center"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
