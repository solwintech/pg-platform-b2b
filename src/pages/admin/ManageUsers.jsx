import React, { useState, useEffect } from 'react';
import { 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle, 
  UserCheck, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  Users,
  TrendingUp,
  Eye,
  Building2,
  UserPlus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import adminService from '../../services/adminService';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUser, setEditUser] = useState({
    _id: null,
    name: '',
    email: '',
    phone: '',
    businessName: '',
    role: 'b2b',
    password: ''
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    role: 'b2b',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers();
      setUsers(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser(prev => ({ ...prev, password }));
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill all required fields');
      return;
    }
    try {
      await adminService.createUser(newUser);
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', phone: '', businessName: '', role: 'b2b', password: '' });
      fetchUsers();
      alert('User created successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating user');
    }
  };

  const openEditUserModal = (user) => {
    setEditUser({
      ...user,
      password: '' // Don't show password
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editUser.name || !editUser.email) {
      alert('Please fill all required fields');
      return;
    }
    try {
      // If password is empty, don't send it
      const dataToUpdate = { ...editUser };
      if (!dataToUpdate.password) delete dataToUpdate.password;

      await adminService.updateUser(editUser._id, dataToUpdate);
      setShowEditUserModal(false);
      fetchUsers();
      alert('User updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating user');
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await adminService.updateUserStatus(id, !currentStatus);
      fetchUsers();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(id);
        fetchUsers();
        alert('User deleted successfully!');
      } catch (error) {
        alert('Error deleting user');
      }
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ? true : (statusFilter === 'active' ? user.active : !user.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getRandomColor = (name) => {
    const colors = ['#4361ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const index = (name?.length || 0) % colors.length;
    return colors[index];
  };

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
        <h3 className="mb-0">Manage Users</h3>
        <button className="btn-premium d-flex align-items-center" onClick={() => setShowAddUserModal(true)}>
          <UserPlus size={18} className="me-2" />
          Add New User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="modern-card mb-4">
        <div className="card-header-modern">
          <div className="row align-items-center g-3">
            <div className="col-md-4">
              <div className="navbar-search">
                <Search className="search-icon" size={18} />
                <input 
                  type="text" 
                  className="form-control-premium" 
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-control-premium"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="b2b">B2B Owners</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-control-premium"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn-outline-premium w-100" onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="modern-card">
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact Info</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="text-center">
                      <Users size={60} className="text-muted mb-3" />
                      <h5 className="mb-2">No users found</h5>
                      <p className="text-muted mb-0">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="user-avatar" 
                          style={{ 
                            width: '45px', 
                            height: '45px',
                            background: getRandomColor(user.name),
                            fontSize: '16px'
                          }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="fw-600">{user.name}</div>
                          <div className="text-xs text-muted">ID: #{user._id.substring(user._id.length - 6)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">{user.email}</div>
                      <div className="text-xs text-muted d-flex align-items-center gap-1 mt-1">
                        <Phone size={12} /> {user.phone || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge-premium ${user.role === 'admin' ? 'badge-danger' : 'badge-info'}`}>
                        {user.role === 'admin' ? <Shield size={12} className="me-1" /> : <Building2 size={12} className="me-1" />}
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-premium ${user.active ? 'badge-success' : 'badge-warning'}`}>
                        {user.active ? <CheckCircle size={12} className="me-1" /> : <Ban size={12} className="me-1" />}
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm">{formatDate(user.createdAt)}</div>
                      <div className="text-xs text-muted d-flex align-items-center gap-1 mt-1">
                        <Calendar size={12} /> Member
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button 
                          className="btn-premium btn-sm"
                          onClick={() => viewUserDetails(user)}
                          title="View Details"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <Eye size={14} className="me-1" /> View
                        </button>
                        <button 
                          className="btn-outline-premium btn-sm"
                          onClick={() => openEditUserModal(user)}
                          title="Edit User"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <Edit size={14} className="me-1" /> Edit
                        </button>
                        <button 
                          className={`btn-sm ${user.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => toggleUserStatus(user._id, user.active)}
                          title={user.active ? 'Deactivate User' : 'Activate User'}
                          style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', border: '1px solid', background: 'transparent' }}
                        >
                          {user.active ? <Ban size={14} className="me-1" /> : <CheckCircle size={14} className="me-1" />}
                          {user.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          className="btn-sm text-danger"
                          onClick={() => deleteUser(user._id)}
                          title="Delete User"
                          style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444' }}
                        >
                          <Trash2 size={14} className="me-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modern-card">
              <div className="modal-header border-0 p-4">
                <h5 className="modal-title">User Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4 pt-0">
                <div className="text-center mb-4">
                  <div 
                    className="user-avatar mx-auto mb-3" 
                    style={{ 
                      width: '80px', 
                      height: '80px',
                      background: getRandomColor(selectedUser.name),
                      fontSize: '32px'
                    }}
                  >
                    {getInitials(selectedUser.name)}
                  </div>
                  <h4 className="mb-1">{selectedUser.name}</h4>
                  <p className="text-muted mb-0">@{selectedUser.role.toUpperCase()}</p>
                </div>

                <div className="border-top pt-3">
                  <div className="row mb-3">
                    <div className="col-4 text-muted">Email:</div>
                    <div className="col-8">
                      <Mail size={14} className="me-1" /> {selectedUser.email}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-4 text-muted">Phone:</div>
                    <div className="col-8">
                      <Phone size={14} className="me-1" /> {selectedUser.phone || 'N/A'}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-4 text-muted">Status:</div>
                    <div className="col-8">
                      <span className={`badge-premium ${selectedUser.active ? 'badge-success' : 'badge-warning'}`}>
                        {selectedUser.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-4 text-muted">Registered:</div>
                    <div className="col-8">
                      <Calendar size={14} className="me-1" /> {formatDate(selectedUser.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button className="btn-outline-premium" onClick={() => setShowModal(false)}>
                  Close
                </button>
                <button 
                  className="btn-premium"
                  onClick={() => {
                    toggleUserStatus(selectedUser._id, selectedUser.active);
                    setShowModal(false);
                  }}
                >
                  {selectedUser.active ? <Ban size={16} className="me-1" /> : <CheckCircle size={16} className="me-1" />}
                  {selectedUser.active ? 'Deactivate User' : 'Activate User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddUserModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modern-card">
              <div className="modal-header border-0 p-4">
                <h5 className="modal-title d-flex align-items-center">
                  <UserPlus size={20} className="me-2 text-primary" /> Create New User
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddUserModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4 pt-0">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small">Role</label>
                    <select 
                      className="form-control-modern" 
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    >
                      <option value="b2b">PG Owner (B2B)</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label small">Full Name *</label>
                    <input 
                      type="text" 
                      className="form-control-modern" 
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small">Email *</label>
                    <input 
                      type="email" 
                      className="form-control-modern" 
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="e.g. rahul@example.com"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small">Phone</label>
                    <input 
                      type="text" 
                      className="form-control-modern" 
                      value={newUser.phone}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>

                  <hr className="my-3"/>
                  
                  <div className="col-12">
                    <label className="form-label small" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      Password *
                      <span 
                        className="text-primary cursor-pointer text-decoration-underline" 
                        onClick={generatePassword}
                        style={{ fontSize: '11px', cursor: 'pointer' }}
                      >
                        Generate Random
                      </span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control-modern" 
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Enter or generate password"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button className="btn-outline-premium" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </button>
                <button className="btn-premium" onClick={handleCreateUser}>
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modern-card">
              <div className="modal-header border-0 p-4">
                <h5 className="modal-title d-flex align-items-center">
                  <Edit size={20} className="me-2 text-primary" /> Edit User & Credentials
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowEditUserModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4 pt-0">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small">Role</label>
                    <select 
                      className="form-control-modern" 
                      value={editUser.role}
                      onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                    >
                      <option value="b2b">PG Owner (B2B)</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label small">Full Name *</label>
                    <input 
                      type="text" 
                      className="form-control-modern" 
                      value={editUser.name}
                      onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small">Email *</label>
                    <input 
                      type="email" 
                      className="form-control-modern" 
                      value={editUser.email}
                      onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small">Phone</label>
                    <input 
                      type="text" 
                      className="form-control-modern" 
                      value={editUser.phone}
                      onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
                    />
                  </div>

                  <hr className="my-3"/>
                  
                  <div className="col-12">
                    <label className="form-label small">New Password (leave blank to keep current)</label>
                    <input 
                      type="text" 
                      className="form-control-modern" 
                      value={editUser.password}
                      onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button className="btn-outline-premium" onClick={() => setShowEditUserModal(false)}>
                  Cancel
                </button>
                <button className="btn-premium" onClick={handleUpdateUser}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;