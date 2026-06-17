import React, { useState } from 'react';
import { Upload, X, Image, Camera, Plus } from 'lucide-react';
import Compressor from 'compressorjs';

const getBaseImageUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1');
  return apiUrl.replace('/api/v1', '');
};

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  const baseUrl = getBaseImageUrl();
  if (url.startsWith('/uploads/')) return `${baseUrl}${url}`;
  if (url.startsWith('uploads/')) return `${baseUrl}/${url}`;
  return `${baseUrl}/${url}`;
};


const StepUploads = ({ data, updateData }) => {
  const [coverImage, setCoverImage] = useState(data.coverImage || null);
  const [galleryImages, setGalleryImages] = useState(data.galleryImages || []);

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      new Compressor(file, {
        quality: 0.6, // Compress to 60% quality
        maxWidth: 1920,
        success(result) {
          const imageUrl = URL.createObjectURL(result);
          setCoverImage(imageUrl);
          updateData({ coverImage: imageUrl, coverImageFile: result });
        },
        error(err) {
          console.error('Cover image compression error:', err.message);
          const imageUrl = URL.createObjectURL(file);
          setCoverImage(imageUrl);
          updateData({ coverImage: imageUrl, coverImageFile: file });
        },
      });
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    const compressPromises = files.map(file => {
      return new Promise((resolve) => {
        new Compressor(file, {
          quality: 0.6,
          maxWidth: 1920,
          success(result) {
            resolve({ url: URL.createObjectURL(result), file: result, tag: '' });
          },
          error(err) {
            console.error('Gallery image compression error:', err.message);
            resolve({ url: URL.createObjectURL(file), file: file, tag: '' });
          }
        });
      });
    });

    const newImages = await Promise.all(compressPromises);
    const combined = [...galleryImages, ...newImages];
    
    let finalGallery = combined;
    if (combined.length > 8) {
      alert("You can only upload up to 8 photos at a time. Extra photos were ignored.");
      finalGallery = combined.slice(0, 8);
    }
    
    setGalleryImages(finalGallery);
    updateData({ galleryImages: finalGallery });
  };

  const removeGalleryImage = (index) => {
    const newGallery = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(newGallery);
    updateData({ galleryImages: newGallery });
  };

  return (
    <div className="step-uploads">
      <h5 className="mb-3 fw-semibold">Media Gallery</h5>
      <p className="text-muted small mb-3">Upload photos and tag them for better organization</p>

      <div className="alert alert-info py-2 mb-4" style={{ fontSize: '0.85rem' }}>
        <i className="fas fa-info-circle me-2"></i>
        <strong>Note:</strong> Only 8 photos can be uploaded at a time. You can upload more photos after property approval.
      </div>

      <div className="mb-4">
        <label className="form-label small fw-bold text-dark">Main Property Photo *</label>
        <div className="border rounded-2 p-3 text-center bg-light border-dashed">
          {coverImage ? (
            <div className="position-relative d-inline-block">
              <img
                src={resolveImageUrl(coverImage)}
                alt="Cover"
                style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
                className="rounded shadow-sm"
              />
              <button
                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle"
                onClick={() => {
                  setCoverImage(null);
                  updateData({ coverImage: null });
                }}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div onClick={() => document.getElementById('coverUpload').click()} style={{ cursor: 'pointer' }}>
              <Camera className="mx-auto mb-2 text-primary" size={32} />
              <p className="text-muted small mb-0">Upload main thumbnail image</p>
              <input
                type="file"
                className="d-none"
                id="coverUpload"
                accept="image/*"
                onChange={handleCoverUpload}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="form-label small fw-bold text-dark">Gallery & Room Photos</label>
        <div className="border rounded-2 p-3 bg-light border-dashed">
          <div className="row g-3">
            {galleryImages.map((imgObj, index) => (
              <div key={index} className="col-md-4">
                <div className="bg-white border rounded p-2 position-relative shadow-sm">
                  <img
                    src={resolveImageUrl(typeof imgObj === 'string' ? imgObj : imgObj.url)}
                    alt={`Gallery ${index + 1}`}
                    style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                    className="rounded mb-2"
                  />
                  <button
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle"
                    onClick={() => removeGalleryImage(index)}
                    style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  >
                    <X size={12} />
                  </button>

                  {/* Tagging System */}
                  <div className="mt-1">
                    <label className="form-label x-small text-muted mb-1">Tag this image:</label>
                    <select
                      className="form-select form-select-sm"
                      style={{ fontSize: '11px' }}
                      value={imgObj.tag || ''}
                      onChange={(e) => {
                        const newGallery = [...galleryImages];
                        newGallery[index] = { ...imgObj, tag: e.target.value };
                        setGalleryImages(newGallery);
                        updateData({ galleryImages: newGallery });
                      }}
                    >
                      <option value="">Select Tag</option>
                      <optgroup label="Property Level">
                        <option value="Building Exterior">Building Exterior</option>
                        <option value="Reception / Entrance">Reception / Entrance</option>
                        <option value="Common Area / Lounge">Common Area / Lounge</option>
                        <option value="Dining Area / Canteen">Dining Area / Canteen</option>
                        {data.amenities?.includes('Kitchen') && <option value="Kitchen Area">Kitchen Area</option>}
                        <option value="Washroom (Common)">Washroom (Common)</option>
                      </optgroup>
                      
                      {data.roomTypes && data.roomTypes.length > 0 && (
                        <optgroup label="Specific Room Types">
                          {data.roomTypes.map((room, rIdx) => (
                            <option key={rIdx} value={`Room: ${room.name}`}>{room.name} View</option>
                          ))}
                        </optgroup>
                      )}

                      <optgroup label="Generic Room Views">
                        <option value="Bedroom General">Bedroom General</option>
                        <option value="Attached Bathroom">Attached Bathroom</option>
                        <option value="Balcony View">Balcony View</option>
                        <option value="Furniture / Study Area">Furniture / Study Area</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {galleryImages.length < 8 && (
              <div className="col-md-4">
                <div
                  className="border rounded d-flex align-items-center justify-content-center bg-white border-dashed"
                  style={{ height: '200px', cursor: 'pointer' }}
                  onClick={() => document.getElementById('galleryUpload').click()}
                >
                  <div className="text-center">
                    <Plus size={32} className="text-primary mb-2" />
                    <p className="text-muted small mb-0">Add More Photos</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <input
            type="file"
            className="d-none"
            id="galleryUpload"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default StepUploads;