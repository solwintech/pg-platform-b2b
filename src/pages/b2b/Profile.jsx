import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Save, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  Lock,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import authService from '../../services/authService';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    alternatePhone: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const fileInputRef = useRef(null);

  // Base URL for images (strip /api/v1 from the end of the base URL)
  const getBaseImageUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1');
    return apiUrl.replace('/api/v1', '');
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getMe();
      console.log('Profile Load Response:', response);
      
      if (response.success && response.data) {
        const user = response.data;
        setUserData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          alternatePhone: user.alternatePhone || '',
          profileImage: user.profileImage || '',
          createdAt: user.createdAt
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to load user data structure.' });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Error connecting to server.' });
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      let profileImageName = userData.profileImage;

      // 1. Upload image if selected (Deferred upload pattern like StepUploads)
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadRes = await authService.updateProfileImage(formData);
        if (uploadRes.success) {
          // The response.data in authService returns response.data.data from axios
          // And my controller returns { success: true, data: user }
          // So uploadRes here is { success: true, data: user }
          profileImageName = uploadRes.data.profileImage; 
        }
      }

      // 2. Update user details
      const response = await authService.updateDetails({
        name: userData.name,
        phone: userData.phone,
        alternatePhone: userData.alternatePhone,
        profileImage: profileImageName
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setUserData({ ...userData, profileImage: profileImageName });
        setSelectedFile(null);
        setPreviewImage(null);
        // Refresh to sync with Navbar/Sidebar
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      setSaving(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    try {
      const response = await authService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error changing password' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }

    // Show preview immediately using URL.createObjectURL (like StepUploads)
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
    setSelectedFile(file);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const profileImageUrl = previewImage 
    ? previewImage 
    : (userData.profileImage && userData.profileImage.trim() !== '') 
      ? `${getBaseImageUrl()}/uploads/${userData.profileImage}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'U')}&background=4361ee&color=fff&size=256`;

  return (
    <div className="profile-page fade-in-up">
      <div className="row">
        <div className="col-12">
          
          {/* Profile Header */}
          <div className="profile-header-card modern-card mb-4 overflow-hidden">
            <div className="header-cover" style={{ height: '120px', background: 'linear-gradient(135deg, #4361ee, #3f37c9)' }}></div>
            <div className="header-content px-4 pb-4 text-center text-md-start">
              <div className="d-md-flex align-items-end" style={{ marginTop: '-60px' }}>
                <div className="position-relative d-inline-block mx-auto mx-md-0">
                  <div className="profile-avatar-container">
                    <img 
                      src={profileImageUrl} 
                      alt="Profile" 
                      className="profile-avatar shadow-lg border border-4 border-white"
                      style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', backgroundColor: '#f8fafc' }}
                    />
                    <button 
                      className="avatar-edit-btn position-absolute bottom-0 end-0 rounded-circle border-0 shadow-sm"
                      onClick={handleImageClick}
                      title="Update Profile Image"
                    >
                      <Camera size={18} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      className="d-none" 
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className="ms-md-3 mt-2 mt-md-0 flex-grow-1 pb-1">
                  <h4 className="fw-bold mb-1 text-dark">{userData.name}</h4>
                  <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2 align-items-center">
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-semibold" style={{ fontSize: '11px' }}>
                      B2B OWNER
                    </span>
                    <span className="text-muted small d-flex align-items-center">
                      <Shield size={12} className="me-1 text-success" /> Verified Account
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Account Settings */}
            <div className="col-lg-8">
              <div className="modern-card p-3 h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="icon-box-small bg-primary bg-opacity-10 text-primary" style={{ width: '32px', height: '32px' }}>
                    <User size={16} />
                  </div>
                  <h6 className="mb-0 fw-bold">Personal Information</h6>
                </div>

                {message.text && (
                  <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} border-0 shadow-sm py-2 px-3 mb-3 rounded-3 d-flex align-items-center gap-2`} style={{ fontSize: '12px' }}>
                    {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label x-small fw-bold text-muted mb-1">FULL NAME</label>
                      <div className="input-group-modern">
                        <User size={14} className="input-icon" />
                        <input 
                          type="text" 
                          className="form-control-modern" 
                          name="name"
                          value={userData.name}
                          onChange={handleChange}
                          placeholder="Your Name"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label x-small fw-bold text-muted mb-1">EMAIL ADDRESS</label>
                      <div className="input-group-modern disabled">
                        <Mail size={14} className="input-icon" />
                        <input 
                          type="email" 
                          className="form-control-modern" 
                          value={userData.email}
                          readOnly
                          disabled
                        />
                      </div>
                      <small className="text-muted x-small mt-1 d-block">Contact admin to change email address.</small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label x-small fw-bold text-muted mb-1">PHONE NUMBER</label>
                      <div className="input-group-modern">
                        <Phone size={14} className="input-icon" />
                        <input 
                          type="tel" 
                          className="form-control-modern" 
                          name="phone"
                          value={userData.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          maxLength="10"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label x-small fw-bold text-muted mb-1">ALTERNATE PHONE</label>
                      <div className="input-group-modern">
                        <Phone size={14} className="input-icon" />
                        <input 
                          type="tel" 
                          className="form-control-modern" 
                          name="alternatePhone"
                          value={userData.alternatePhone || ''}
                          onChange={handleChange}
                          placeholder="Optional"
                          maxLength="10"
                        />
                      </div>
                    </div>

                    <div className="col-12 mt-3 pt-1">
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100 py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                        disabled={saving}
                        style={{ borderRadius: '10px', background: 'linear-gradient(135deg, #4361ee, #3f37c9)', border: 'none', fontSize: '14px' }}
                      >
                        {saving ? (
                          <>
                            <div className="spinner-border spinner-border-sm" role="status"></div>
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span className="fw-bold">Save All Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="modern-card p-3 mb-3">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="icon-box-small bg-warning bg-opacity-10 text-warning" style={{ width: '32px', height: '32px' }}>
                    <Shield size={16} />
                  </div>
                  <h6 className="mb-0 fw-bold">Account Status</h6>
                </div>
                
                <div className="status-item d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded-3">
                  <div className="x-small fw-semibold text-muted">Verification</div>
                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1" style={{ fontSize: '10px' }}>Verified</span>
                </div>

                <div className="status-item d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded-3">
                  <div className="x-small fw-semibold text-muted">Account Type</div>
                  <span className="text-dark fw-bold x-small">Owner</span>
                </div>

                <div className="status-item d-flex justify-content-between align-items-center p-2 bg-light rounded-3">
                  <div className="x-small fw-semibold text-muted">Joined On</div>
                  <span className="text-dark fw-bold x-small">
                    {new Date(userData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="modern-card p-3 mb-3">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="icon-box-small bg-danger bg-opacity-10 text-danger" style={{ width: '32px', height: '32px' }}>
                    <Lock size={16} />
                  </div>
                  <h6 className="mb-0 fw-bold">Security</h6>
                </div>

                {passwordMessage.text && (
                  <div className={`alert ${passwordMessage.type === 'success' ? 'alert-success' : 'alert-danger'} border-0 shadow-sm py-2 px-3 mb-3 rounded-3 d-flex align-items-center gap-2`} style={{ fontSize: '11px' }}>
                    {passwordMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {passwordMessage.text}
                  </div>
                )}

                <form onSubmit={handlePasswordChange}>
                  <div className="mb-2">
                    <label className="form-label x-small fw-bold text-muted mb-1">CURRENT PASSWORD</label>
                    <div className="input-group-modern">
                      <Key size={14} className="input-icon" />
                      <input 
                        type={showPasswords.current ? "text" : "password"} 
                        className="form-control-modern" 
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        placeholder="••••••••"
                        required
                      />
                      <button 
                        type="button" 
                        className="btn border-0 position-absolute end-0 me-2 text-muted"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        style={{ zIndex: 11 }}
                      >
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label x-small fw-bold text-muted mb-1">NEW PASSWORD</label>
                    <div className="input-group-modern">
                      <Lock size={14} className="input-icon" />
                      <input 
                        type={showPasswords.new ? "text" : "password"} 
                        className="form-control-modern" 
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="New Password"
                        required
                      />
                      <button 
                        type="button" 
                        className="btn border-0 position-absolute end-0 me-2 text-muted"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        style={{ zIndex: 11 }}
                      >
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label x-small fw-bold text-muted mb-1">CONFIRM NEW PASSWORD</label>
                    <div className="input-group-modern">
                      <Shield size={14} className="input-icon" />
                      <input 
                        type={showPasswords.confirm ? "text" : "password"} 
                        className="form-control-modern" 
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="Confirm New Password"
                        required
                      />
                      <button 
                        type="button" 
                        className="btn border-0 position-absolute end-0 me-2 text-muted"
                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        style={{ zIndex: 11 }}
                      >
                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-outline-danger w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                    disabled={saving}
                    style={{ borderRadius: '10px', fontSize: '13px' }}
                  >
                    {saving ? <div className="spinner-border spinner-border-sm"></div> : 'Update Password'}
                  </button>
                </form>
              </div>

              <div className="modern-card p-3 mb-3 bg-primary bg-opacity-10 border-0">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Clock size={16} className="text-primary" />
                  <h6 className="mb-0 fw-bold text-primary" style={{ fontSize: '14px' }}>Need Help?</h6>
                </div>
                <p className="x-small text-muted mb-2">Change primary details via support.</p>
                <a href="mailto:support@sortifystays.com" className="btn btn-white btn-sm w-100 shadow-sm fw-bold x-small">Contact Support</a>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .profile-avatar-container {
          transition: all 0.3s ease;
        }
        .profile-avatar-container:hover .profile-avatar {
          transform: scale(1.02);
        }
        .avatar-edit-btn {
          background: #4361ee;
          color: white;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .avatar-edit-btn:hover {
          background: #3f37c9;
          transform: scale(1.1);
        }
        .input-group-modern {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-group-modern .input-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          z-index: 10;
        }
        .input-group-modern .form-control-modern {
          padding-left: 36px;
          height: 42px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13px;
          transition: all 0.2s ease;
        }
        .input-group-modern .form-control-modern:focus {
          border-color: #4361ee;
          box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.1);
        }
        .input-group-modern.disabled .form-control-modern {
          background-color: #f1f5f9;
          color: #64748b;
        }
        .status-item {
          border: 1px solid #f1f5f9;
        }
      `}} />
    </div>
  );
};

export default Profile;
