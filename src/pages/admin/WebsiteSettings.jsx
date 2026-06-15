import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  Image as ImageIcon,
  Settings as SettingsIcon,
  RefreshCw,
  CheckCircle,
  Home,
  FileText
} from 'lucide-react';
import settingsService from '../../services/settingsService';
import Compressor from 'compressorjs';

const WebsiteSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Sortify Stays',
    siteTagline: 'India\'s largest PG & Hostel discovery platform',
    siteEmail: 'info@sortifystays.com',
    sitePhone: '+91 98765 43210',
    siteAddress: 'Bangalore, Karnataka, India',
    siteLogo: null,
    favicon: null
  });

  // Social Media Links
  const [socialLinks, setSocialLinks] = useState({
    facebook: 'https://facebook.com/sortifystays',
    twitter: 'https://twitter.com/sortifystays',
    instagram: 'https://instagram.com/sortifystays',
    linkedin: 'https://linkedin.com/company/sortifystays',
    youtube: 'https://youtube.com/sortifystays'
  });

  // Homepage Sections
  const [homepageSections, setHomepageSections] = useState({
    heroTitle: 'Find Your Perfect PG/Hostel',
    heroSubtitle: 'Discover thousands of PGs, hostels, Home Stays and Service Apartments near you',
    showFeatured: true,
    showCities: true,
    showTestimonials: true,
    showHowItWorks: true
  });

  // Legal Pages
  const [legalPages, setLegalPages] = useState({
    terms: 'Terms and conditions content here...',
    privacy: 'Privacy policy content here...',
    refund: 'Refund policy content here...',
    about: 'About us content here...',
    contact: 'Contact us content here...'
  });

  const [loading, setLoading] = useState(true);
  const siteLogoRef = useRef(null);
  const faviconRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsService.getSettings();
        if (response.success && response.data) {
          const data = response.data;
          setGeneralSettings(prev => ({
            ...prev,
            siteName: data.siteName || prev.siteName,
            siteTagline: data.siteTagline || prev.siteTagline,
            siteEmail: data.siteEmail || prev.siteEmail,
            sitePhone: data.sitePhone || prev.sitePhone,
            siteAddress: data.siteAddress || prev.siteAddress,
            siteLogo: data.siteLogo || prev.siteLogo,
            favicon: data.favicon || prev.favicon
          }));
          if (data.socialLinks) setSocialLinks(data.socialLinks);
          if (data.homepageSections) setHomepageSections(data.homepageSections);
          if (data.legalPages) setLegalPages(data.legalPages);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleGeneralChange = (e) => {
    setGeneralSettings({ ...generalSettings, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (e) => {
    setSocialLinks({ ...socialLinks, [e.target.name]: e.target.value });
  };

  const handleHomepageChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setHomepageSections({ ...homepageSections, [e.target.name]: value });
  };

  const handleLegalChange = (e) => {
    setLegalPages({ ...legalPages, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    new Compressor(file, {
      quality: 0.8, // Slightly higher quality for logos
      maxWidth: 800,
      success(result) {
        const imageUrl = URL.createObjectURL(result);
        if (type === 'siteLogo') {
          setLogoFile(result);
          setGeneralSettings(prev => ({ ...prev, siteLogo: imageUrl }));
        } else {
          setFaviconFile(result);
          setGeneralSettings(prev => ({ ...prev, favicon: imageUrl }));
        }
      },
      error(err) {
        console.error('Compression error:', err);
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        siteName: generalSettings.siteName,
        siteTagline: generalSettings.siteTagline,
        siteEmail: generalSettings.siteEmail,
        sitePhone: generalSettings.sitePhone,
        siteAddress: generalSettings.siteAddress,
        socialLinks,
        homepageSections,
        legalPages
      };

      const files = {};
      if (logoFile) files.siteLogo = logoFile;
      if (faviconFile) files.favicon = faviconFile;

      await settingsService.updateSettings(payload, files);
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'social', label: 'Social Media', icon: Globe },
    { id: 'homepage', label: 'Homepage', icon: Home },
    { id: 'legal', label: 'Legal Pages', icon: FileText }
  ];

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h3 className="mb-1">Website Settings</h3>
          <p className="text-muted small mb-0">Manage your website content and configuration</p>
        </div>
        <button 
          className="btn-premium d-flex align-items-center gap-2" 
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '8px 20px' }}
        >
          {saving ? (
            <><RefreshCw size={16} className="spin" /> Saving...</>
          ) : (
            <><Save size={16} /> Save Changes</>
          )}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="alert alert-success mb-4 d-flex align-items-center gap-2" style={{ borderRadius: '12px' }}>
          <CheckCircle size={18} /> {success}
        </div>
      )}

      {/* Tabs */}
      <div className="settings-tabs mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="modern-card">
        <div className="card-body p-4">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <h5 className="mb-3">General Settings</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Site Name</label>
                  <input
                    type="text"
                    name="siteName"
                    className="form-control-modern"
                    value={generalSettings.siteName}
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Site Tagline</label>
                  <input
                    type="text"
                    name="siteTagline"
                    className="form-control-modern"
                    value={generalSettings.siteTagline}
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Site Email</label>
                  <div className="input-icon">
                    <Mail size={16} className="icon" />
                    <input
                      type="email"
                      name="siteEmail"
                      className="form-control-modern"
                      value={generalSettings.siteEmail}
                      onChange={handleGeneralChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Site Phone</label>
                  <div className="input-icon">
                    <Phone size={16} className="icon" />
                    <input
                      type="text"
                      name="sitePhone"
                      className="form-control-modern"
                      value={generalSettings.sitePhone}
                      onChange={handleGeneralChange}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium">Site Address</label>
                  <div className="input-icon">
                    <MapPin size={16} className="icon" />
                    <input
                      type="text"
                      name="siteAddress"
                      className="form-control-modern"
                      value={generalSettings.siteAddress}
                      onChange={handleGeneralChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Site Logo</label>
                  <div 
                    className="border rounded p-3 text-center bg-light" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => siteLogoRef.current?.click()}
                  >
                    {generalSettings.siteLogo ? (
                      <img src={generalSettings.siteLogo} alt="Logo" style={{ maxHeight: '60px', marginBottom: '10px' }} />
                    ) : (
                      <ImageIcon size={32} className="text-muted mb-2" />
                    )}
                    <p className="small text-muted mb-0">Click to upload your site logo</p>
                    <input 
                      type="file" 
                      className="d-none" 
                      ref={siteLogoRef}
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'siteLogo')}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Favicon</label>
                  <div 
                    className="border rounded p-3 text-center bg-light"
                    style={{ cursor: 'pointer' }}
                    onClick={() => faviconRef.current?.click()}
                  >
                    {generalSettings.favicon ? (
                      <img src={generalSettings.favicon} alt="Favicon" style={{ maxHeight: '60px', marginBottom: '10px' }} />
                    ) : (
                      <ImageIcon size={32} className="text-muted mb-2" />
                    )}
                    <p className="small text-muted mb-0">Click to upload favicon (16x16 or 32x32)</p>
                    <input 
                      type="file" 
                      className="d-none" 
                      ref={faviconRef}
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'favicon')}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="settings-section">
              <h5 className="mb-3">Social Media Links</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">📘 Facebook</label>
                  <input
                    type="url"
                    name="facebook"
                    className="form-control-modern"
                    value={socialLinks.facebook}
                    onChange={handleSocialChange}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">🐦 Twitter</label>
                  <input
                    type="url"
                    name="twitter"
                    className="form-control-modern"
                    value={socialLinks.twitter}
                    onChange={handleSocialChange}
                    placeholder="https://twitter.com/yourpage"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">📸 Instagram</label>
                  <input
                    type="url"
                    name="instagram"
                    className="form-control-modern"
                    value={socialLinks.instagram}
                    onChange={handleSocialChange}
                    placeholder="https://instagram.com/yourpage"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">🔗 LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    className="form-control-modern"
                    value={socialLinks.linkedin}
                    onChange={handleSocialChange}
                    placeholder="https://linkedin.com/company/yourpage"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">📺 YouTube</label>
                  <input
                    type="url"
                    name="youtube"
                    className="form-control-modern"
                    value={socialLinks.youtube}
                    onChange={handleSocialChange}
                    placeholder="https://youtube.com/c/yourchannel"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Homepage Settings Tab */}
          {activeTab === 'homepage' && (
            <div className="settings-section">
              <h5 className="mb-3">Homepage Sections</h5>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-medium">Hero Title</label>
                  <input
                    type="text"
                    name="heroTitle"
                    className="form-control-modern"
                    value={homepageSections.heroTitle}
                    onChange={handleHomepageChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium">Hero Subtitle</label>
                  <textarea
                    name="heroSubtitle"
                    className="form-control-modern"
                    rows="2"
                    value={homepageSections.heroSubtitle}
                    onChange={handleHomepageChange}
                  />
                </div>
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="showFeatured"
                      checked={homepageSections.showFeatured}
                      onChange={handleHomepageChange}
                    />
                    <label className="form-check-label">Show Featured Properties</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="showCities"
                      checked={homepageSections.showCities}
                      onChange={handleHomepageChange}
                    />
                    <label className="form-check-label">Show Top Cities</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="showTestimonials"
                      checked={homepageSections.showTestimonials}
                      onChange={handleHomepageChange}
                    />
                    <label className="form-check-label">Show Testimonials</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="showHowItWorks"
                      checked={homepageSections.showHowItWorks}
                      onChange={handleHomepageChange}
                    />
                    <label className="form-check-label">Show How It Works</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legal Pages Tab */}
          {activeTab === 'legal' && (
            <div className="settings-section">
              <h5 className="mb-3">Legal Pages Content</h5>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-medium">Terms & Conditions</label>
                  <textarea
                    name="terms"
                    className="form-control-modern"
                    rows="4"
                    value={legalPages.terms}
                    onChange={handleLegalChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium">Privacy Policy</label>
                  <textarea
                    name="privacy"
                    className="form-control-modern"
                    rows="4"
                    value={legalPages.privacy}
                    onChange={handleLegalChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium">Refund Policy</label>
                  <textarea
                    name="refund"
                    className="form-control-modern"
                    rows="3"
                    value={legalPages.refund}
                    onChange={handleLegalChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium">About Us</label>
                  <textarea
                    name="about"
                    className="form-control-modern"
                    rows="3"
                    value={legalPages.about}
                    onChange={handleLegalChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium">Contact Information</label>
                  <textarea
                    name="contact"
                    className="form-control-modern"
                    rows="3"
                    value={legalPages.contact}
                    onChange={handleLegalChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsiteSettings;