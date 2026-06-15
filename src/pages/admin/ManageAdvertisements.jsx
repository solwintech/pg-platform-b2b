import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import api from '../../services/api';
import Compressor from 'compressorjs';

const LOCATION_LABELS = {
  home_hero: 'Home Hero',
  home_mid: 'Home Middle',
  listing_sidebar: 'Listing Sidebar',
  listing_bottom: 'Listing Bottom',
  property_sidebar: 'Property Sidebar',
};

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  imageUrl: '',
  link: '',
  location: 'home_hero',
  status: 'active',
  priority: 1,
};

const ManageAdvertisements = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [useUpload, setUseUpload] = useState(true); // toggle between file upload vs URL
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    setLoading(true);
    try {
      const response = await api.get('/advertisements');
      setAds(response.data.advertisements || []);
    } catch (error) {
      console.error('Failed to load ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (ad = null) => {
    if (ad) {
      setCurrentAd(ad);
      setFormData({ ...EMPTY_FORM, ...ad });
      setImagePreview(ad.imageUrl || '');
      setUseUpload(!ad.imageUrl?.startsWith('http') || false);
    } else {
      setCurrentAd(null);
      setFormData(EMPTY_FORM);
      setImagePreview('');
      setUseUpload(true);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'imageUrl') {
      setImagePreview(value);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    new Compressor(file, {
      quality: 0.6,
      maxWidth: 1920,
      success(result) {
        setImageFile(result);
        setImagePreview(URL.createObjectURL(result));
      },
      error(err) {
        console.error('Compression error:', err.message);
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('subtitle', formData.subtitle || '');
      data.append('link', formData.link || '');
      data.append('location', formData.location);
      data.append('status', formData.status);
      data.append('priority', formData.priority);

      if (useUpload && imageFile) {
        // File upload mode
        data.append('adImage', imageFile);
      } else if (!useUpload && formData.imageUrl) {
        // External URL mode
        data.append('imageUrl', formData.imageUrl);
      } else if (!imageFile && currentAd?.imageUrl) {
        // No change to image — keep existing
        data.append('imageUrl', currentAd.imageUrl);
      }

      if (currentAd) {
        await api.put(`/advertisements/${currentAd._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/advertisements', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setShowModal(false);
      loadAds();
    } catch (error) {
      console.error('Save failed:', error);
      alert(error?.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advertisement?')) return;
    try {
      await api.delete(`/advertisements/${id}`);
      loadAds();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const handleToggleStatus = async (ad) => {
    try {
      const data = new FormData();
      data.append('status', ad.status === 'active' ? 'inactive' : 'active');
      data.append('title', ad.title);
      data.append('location', ad.location);
      data.append('priority', ad.priority);
      await api.put(`/advertisements/${ad._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      loadAds();
    } catch (error) {
      alert('Failed to toggle status');
    }
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 fw-bold text-muted">
          <i className="fas fa-bullhorn me-2 text-primary"></i>
          {ads.length} Advertisement{ads.length !== 1 ? 's' : ''}
        </h6>
        <Button variant="primary" size="sm" onClick={() => handleShowModal()} className="px-3">
          <i className="fas fa-plus me-2"></i>Create New Ad
        </Button>
      </div>

      {loading ? (
        <div className="text-center p-5">
          <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-5 text-muted bg-white rounded shadow-sm">
          <i className="fas fa-bullhorn fa-3x mb-3 opacity-25"></i>
          <p className="mb-0">No advertisements yet. Create your first one!</p>
        </div>
      ) : (
        <div className="bg-white rounded shadow-sm">
          <Table responsive hover className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
            <thead className="bg-light">
              <tr>
                <th className="py-2 ps-3">Advertisement</th>
                <th className="py-2">Placement</th>
                <th className="py-2">Priority</th>
                <th className="py-2">Clicks</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad._id}>
                  <td className="py-2 ps-3">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' }}
                        onError={(e) => { e.target.src = 'https://placehold.co/48x36/f0f0f0/999?text=No+Img'; }}
                      />
                      <div>
                        <div className="fw-semibold" style={{ fontSize: '0.82rem' }}>{ad.title}</div>
                        {ad.subtitle && (
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{ad.subtitle.slice(0, 50)}{ad.subtitle.length > 50 ? '…' : ''}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-2">
                    <Badge bg="info" className="text-uppercase" style={{ fontSize: '0.65rem' }}>
                      {LOCATION_LABELS[ad.location] || ad.location}
                    </Badge>
                  </td>
                  <td className="py-2">{ad.priority}</td>
                  <td className="py-2">
                    <span className="text-muted"><i className="fas fa-mouse-pointer me-1"></i>{ad.clicks || 0}</span>
                  </td>
                  <td className="py-2">
                    <div
                      className="form-check form-switch mb-0"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleStatus(ad)}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        readOnly
                        checked={ad.status === 'active'}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  </td>
                  <td className="py-2 text-end pe-3">
                    <Button variant="link" className="p-0 me-2" title="Edit" onClick={() => handleShowModal(ad)}>
                      <i className="fas fa-edit text-primary" style={{ fontSize: '0.9rem' }}></i>
                    </Button>
                    <Button variant="link" className="p-0" title="Delete" onClick={() => handleDelete(ad._id)}>
                      <i className="fas fa-trash text-danger" style={{ fontSize: '0.9rem' }}></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1rem' }}>
            <i className={`fas fa-${currentAd ? 'edit' : 'plus'} me-2`}></i>
            {currentAd ? 'Edit Advertisement' : 'Create Advertisement'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="row">
              {/* Title */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold small">Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Summer Special Offer"
                    required
                    size="sm"
                  />
                </Form.Group>
              </div>

              {/* Placement */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold small">Placement Location</Form.Label>
                  <Form.Select name="location" value={formData.location} onChange={handleInputChange} size="sm">
                    {Object.entries(LOCATION_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            {/* Subtitle */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Subtitle / Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Short description shown under the title"
                size="sm"
              />
            </Form.Group>

            {/* Image section */}
            <div className="mb-3">
              <Form.Label className="fw-semibold small">
                Advertisement Image <span className="text-danger">*</span>
              </Form.Label>
              {/* Toggle */}
              <div className="d-flex gap-3 mb-2">
                <Form.Check
                  type="radio"
                  label="Upload Image"
                  id="img-upload"
                  checked={useUpload}
                  onChange={() => { setUseUpload(true); setImageFile(null); }}
                  className="small"
                />
                <Form.Check
                  type="radio"
                  label="Use Image URL"
                  id="img-url"
                  checked={!useUpload}
                  onChange={() => { setUseUpload(false); setImageFile(null); }}
                  className="small"
                />
              </div>

              {useUpload ? (
                <div
                  className="border rounded-2 p-3 text-center"
                  style={{ background: '#f9fafb', cursor: 'pointer', borderStyle: 'dashed' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="preview"
                      style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }}
                    />
                  ) : (
                    <div className="text-muted py-2">
                      <i className="fas fa-cloud-upload-alt fa-2x mb-2 d-block"></i>
                      <span className="small">Click to upload image (JPG, PNG, GIF, WebP — max 5 MB)</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <Form.Control
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  size="sm"
                />
              )}
              {imagePreview && !useUpload && (
                <div className="mt-2 text-center">
                  <img
                    src={imagePreview}
                    alt="URL preview"
                    style={{ maxHeight: '100px', borderRadius: '6px', border: '1px solid #ddd' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            <div className="row">
              {/* Link */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold small">Target Link (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="/listings or https://..."
                    size="sm"
                  />
                </Form.Group>
              </div>

              {/* Priority */}
              <div className="col-md-3 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold small">Priority</Form.Label>
                  <Form.Control
                    type="number"
                    name="priority"
                    min={1}
                    value={formData.priority}
                    onChange={handleInputChange}
                    size="sm"
                  />
                </Form.Group>
              </div>

              {/* Status */}
              <div className="col-md-3 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold small">Status</Form.Label>
                  <Form.Select name="status" value={formData.status} onChange={handleInputChange} size="sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? <><i className="fas fa-spinner fa-spin me-1"></i>Saving…</> : (currentAd ? 'Update Ad' : 'Create Ad')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageAdvertisements;
