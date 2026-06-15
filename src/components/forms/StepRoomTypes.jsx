import React, { useState } from 'react';
import { Plus, Trash2, Home, Bath, Sun, Coffee, Wifi, Wind, Edit2, Save, X, Utensils, Users, Maximize, Sofa, Layout, Camera } from 'lucide-react';

const StepRoomTypes = ({ data, updateData }) => {
  const [roomTypes, setRoomTypes] = useState(data.roomTypes || []);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({
    name: '',
    size: '',
    price: '',
    bedSize: '',
    attachedBathroom: false,
    balcony: false,
    kitchen: false,
    livingRoom: false,
    amenities: [],
    description: '',
    numberOfRooms: '',
    furnishingStatus: 'Semi Finished',
    acType: 'Non AC',
    image: null,
    imageFile: null
  });

  // Dynamic Room Options based on Property Type
  const getRoomOptions = () => {
    const type = data.propertyType;
    if (type === 'PG') {
      return [
        { value: 'Private Room', label: 'Private Room' },
        { value: 'Double Sharing', label: 'Double Sharing' },
        { value: 'Triple Sharing', label: 'Triple Sharing' },
        { value: 'Quad Sharing', label: 'Quad Sharing' },
        { value: 'Five Sharing', label: 'Five Sharing' },
        { value: '1 RK', label: '1 RK' },
        { value: '1 BHK', label: '1 BHK' },
        { value: '2 BHK', label: '2 BHK' },
        { value: 'Hall', label: 'Hall' }
      ];
    } else if (type === 'Hostel') {
      return [
        { value: 'Private Room', label: 'Private Room' },
        { value: 'Double Sharing', label: 'Double Sharing' },
        { value: 'Triple Sharing', label: 'Triple Sharing' },
        { value: 'Quad Sharing', label: 'Quad Sharing' },
        { value: 'Five Sharing', label: 'Five Sharing' },
        { value: '1 RK', label: '1 RK' },
        { value: '1 BHK', label: '1 BHK' },
        { value: 'Hall', label: 'Hall' }
      ];
    } else if (type === 'Home Stay') {
      return [
        { value: 'Private Room', label: 'Private Room' },
        { value: 'Double Sharing', label: 'Double Sharing' },
        { value: 'Triple Sharing', label: 'Triple Sharing' },
        { value: 'Quad Sharing', label: 'Quad Sharing' },
        { value: 'Five Sharing', label: 'Five Sharing' },
        { value: '1 RK', label: '1 RK' },
        { value: '1 BHK', label: '1 BHK' },
        { value: '2 BHK', label: '2 BHK' },
        { value: '3 BHK', label: '3 BHK' },
        { value: '4 BHK', label: '4 BHK' },
        { value: 'Independent House', label: 'Independent House' },
        { value: 'Hall', label: 'Hall' }
      ];
    } else if (type === 'Service Apartment') {
      return [
        { value: '1 BHK', label: '1 BHK' },
        { value: '2 BHK', label: '2 BHK' },
        { value: '3 BHK', label: '3 BHK' },
        { value: '4 BHK', label: '4 BHK' },
        { value: 'Studio Room', label: 'Studio Room' }
      ];
    }
    return [
      { value: 'Single', label: 'Single Room' },
      { value: 'Double', label: 'Double Room' },
      { value: 'Studio', label: 'Studio Room' }
    ];
  };

  const roomAmenities = [
    'AC', 'Fan', 'Heater', 'Study Table', 'Chair', 'Wardrobe', 
    'Bed', 'Mattress', 'Sofa', 'TV', 'Fridge', 'Microwave'
  ];

  const addRoom = () => {
    if (newRoom.name && newRoom.price && newRoom.numberOfRooms) {

      const updated = [...roomTypes, { ...newRoom, id: Date.now() }];
      setRoomTypes(updated);
      updateData({ roomTypes: updated });
      resetRoomForm();
    } else {
      alert('Please enter room type, price and number of rooms');

    }
  };

  const updateRoom = () => {
    if (editingRoom && newRoom.name && newRoom.price && newRoom.numberOfRooms) {

      const updated = roomTypes.map(room => 
        room.id === editingRoom.id ? { ...newRoom, id: room.id } : room
      );
      setRoomTypes(updated);
      updateData({ roomTypes: updated });
      resetRoomForm();
    }
  };

  const resetRoomForm = () => {
    setEditingRoom(null);
    setNewRoom({
      name: '',
      size: '',
      price: '',
      bedSize: '',
      attachedBathroom: false,
      balcony: false,
      kitchen: false,
      livingRoom: false,
      amenities: [],
      description: '',
      numberOfRooms: '',
      furnishingStatus: 'Semi Finished',
      acType: 'Non AC',
      image: null,
      imageFile: null
    });
    setShowRoomForm(false);
  };

  const deleteRoom = (id) => {
    if (window.confirm('Are you sure you want to delete this room type?')) {
      const updated = roomTypes.filter(room => room.id !== id);
      setRoomTypes(updated);
      updateData({ roomTypes: updated });
    }
  };

  const editRoom = (room) => {
    setEditingRoom(room);
    setNewRoom(room);
    setShowRoomForm(true);
  };

  const toggleRoomAmenity = (amenity) => {
    if (newRoom.amenities.includes(amenity)) {
      setNewRoom({
        ...newRoom,
        amenities: newRoom.amenities.filter(a => a !== amenity)
      });
    } else {
      setNewRoom({
        ...newRoom,
        amenities: [...newRoom.amenities, amenity]
      });
    }
  };

  const handleRoomImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewRoom({ ...newRoom, image: imageUrl, imageFile: file });
    }
  };

  return (
    <div className="step-room-types">
      <h5 className="mb-3 fw-semibold">Room & Bed Details</h5>
      <p className="text-muted small mb-4">Add different room types available in your {data.propertyType}</p>

      {roomTypes.length === 0 && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '11px', borderRadius: '8px' }}>
          <span>ℹ️</span>
          <span>Please add new room configurations suitable for a {data.propertyType}.</span>
        </div>
      )}

      {/* Existing Rooms List */}
      {roomTypes.length > 0 && (
        <div className="mb-4">
          {roomTypes.map((room, idx) => (
            <div key={idx} className="room-card mb-3 p-3 border rounded shadow-sm">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="fw-bold mb-1">{room.name}</h6>
                  <div className="text-primary fw-bold">₹{room.price}/month</div>
                </div>
                {room.image && (
                  <div className="mx-3">
                    <img src={room.image} alt={room.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                )}
                <div className="d-flex gap-2 ms-auto">
                  <button className="btn btn-sm btn-light" onClick={() => editRoom(room)}><Edit2 size={14} /></button>
                  <button className="btn btn-sm btn-light text-danger" onClick={() => deleteRoom(room.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="mt-3">
                <div className="small fw-bold text-muted mb-2">Selected Features:</div>
                <div className="d-flex flex-wrap gap-2">
                  {room.bedSize && <span className="badge bg-info bg-opacity-10 text-info">🛏️ {room.bedSize}</span>}
                  {room.size && <span className="badge bg-light text-dark"><Maximize size={10} /> {room.size} sq ft</span>}
                  {room.numberOfRooms && <span className="badge bg-warning bg-opacity-10 text-dark">🏢 {room.numberOfRooms} Rooms</span>}
                  {room.furnishingStatus && <span className="badge bg-secondary bg-opacity-10 text-secondary">🛋️ {room.furnishingStatus}</span>}
                  {room.acType && <span className="badge bg-info bg-opacity-10 text-info"><Wind size={10} /> {room.acType}</span>}
                  
                  {room.attachedBathroom && <span className="badge bg-success bg-opacity-10 text-success"><Bath size={10} /> Attached Bath</span>}
                  {room.livingRoom && <span className="badge bg-primary bg-opacity-10 text-primary"><Layout size={10} /> Living Room</span>}
                  {room.balcony && <span className="badge bg-primary bg-opacity-10 text-primary"><Sun size={10} /> Balcony</span>}
                  {room.kitchen && <span className="badge bg-primary bg-opacity-10 text-primary"><Utensils size={10} /> Kitchen</span>}
                </div>
              </div>
              
              {room.amenities && room.amenities.length > 0 && (
                <div className="mt-2">
                  <div className="small fw-bold text-muted mb-2">Selected Amenities:</div>
                  <div className="d-flex flex-wrap gap-2">
                    {room.amenities.map(amenity => (
                      <span key={amenity} className="badge bg-light text-muted border">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Room Form */}
      {showRoomForm && (
        <div className="room-form-card border p-3 rounded bg-light mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 fw-bold">{editingRoom ? 'Edit Room Type' : 'Add New Room Type'}</h6>
            <button className="btn-close" onClick={resetRoomForm}></button>
          </div>
          
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-medium">Room Type *</label>
              <select 
                className="form-select form-select-sm"
                value={newRoom.name}
                onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
              >
                <option value="">Select room type</option>
                {getRoomOptions().map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-12 mb-2">
              <label className="form-label small fw-medium">Room Image</label>
              <div className="border rounded-2 p-3 text-center bg-white border-dashed" style={{ borderColor: '#cbd5e1' }}>
                {newRoom.image ? (
                  <div className="position-relative d-inline-block">
                    <img
                      src={newRoom.image}
                      alt="Room Preview"
                      style={{ maxWidth: '200px', maxHeight: '120px', objectFit: 'cover' }}
                      className="rounded shadow-sm"
                    />
                    <button
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle"
                      onClick={() => setNewRoom({ ...newRoom, image: null, imageFile: null })}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => document.getElementById('roomImageUpload').click()} style={{ cursor: 'pointer' }}>
                    <Camera className="mx-auto mb-2 text-primary" size={24} />
                    <p className="text-muted small mb-0">Upload 1 photo for this room type</p>
                    <input
                      type="file"
                      className="d-none"
                      id="roomImageUpload"
                      accept="image/*"
                      onChange={handleRoomImageUpload}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-medium">Price (₹ / Month) *</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="Monthly rent"
                value={newRoom.price}
                onChange={(e) => setNewRoom({...newRoom, price: e.target.value})}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-medium">Bed Size</label>
              <select 
                className="form-select form-select-sm"
                value={newRoom.bedSize}
                onChange={(e) => setNewRoom({...newRoom, bedSize: e.target.value})}
              >
                <option value="">Select Bed Size</option>
                <option value="Single Bed">Single Bed</option>
                <option value="Double Bed">Double Bed</option>
                <option value="Queen Size">Queen Size</option>
                <option value="King Size">King Size</option>
                <option value="Bunk Bed">Bunk Bed</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-medium">Room Size (Optional)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. 120 sq ft"
                value={newRoom.size}
                onChange={(e) => setNewRoom({...newRoom, size: e.target.value})}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-medium">Total Rooms of this type *</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="e.g. 5"
                value={newRoom.numberOfRooms}
                onChange={(e) => setNewRoom({...newRoom, numberOfRooms: e.target.value})}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-medium">Furnishing Status</label>
              <select 
                className="form-select form-select-sm"
                value={newRoom.furnishingStatus}
                onChange={(e) => setNewRoom({...newRoom, furnishingStatus: e.target.value})}
              >
                <option value="Semi Finished">Semi Finished</option>
                <option value="Furnished">Furnished</option>
                <option value="Non furnished">Non furnished</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-medium">AC Type</label>
              <div className="d-flex gap-3 mt-1">
                {['AC', 'Non AC'].map((type) => (
                  <div key={type} className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="acType"
                      id={`ac-${type}`}
                      value={type}
                      checked={newRoom.acType === type}
                      onChange={(e) => setNewRoom({...newRoom, acType: e.target.value})}
                    />
                    <label className="form-check-label small" htmlFor={`ac-${type}`}>
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12">
              <label className="form-label small fw-medium">Features</label>
              <div className="d-flex flex-wrap gap-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="bath" checked={newRoom.attachedBathroom} onChange={(e) => setNewRoom({...newRoom, attachedBathroom: e.target.checked})} />
                  <label className="form-check-label small" htmlFor="bath">Attached Bathroom</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="living" checked={newRoom.livingRoom} onChange={(e) => setNewRoom({...newRoom, livingRoom: e.target.checked})} />
                  <label className="form-check-label small" htmlFor="living">Living Room</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="balcony" checked={newRoom.balcony} onChange={(e) => setNewRoom({...newRoom, balcony: e.target.checked})} />
                  <label className="form-check-label small" htmlFor="balcony">Balcony</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="kitchen" checked={newRoom.kitchen} onChange={(e) => setNewRoom({...newRoom, kitchen: e.target.checked})} />
                  <label className="form-check-label small" htmlFor="kitchen">Kitchen</label>
                </div>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label small fw-medium">Room Amenities</label>
              <div className="d-flex flex-wrap gap-2">
                {roomAmenities.map(amenity => (
                  <div key={amenity} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      checked={newRoom.amenities.includes(amenity)}
                      onChange={() => toggleRoomAmenity(amenity)}
                    />
                    <label className="form-check-label small" htmlFor={`amenity-${amenity}`}>
                      {amenity === 'Sofa' ? <Sofa size={12} className="me-1" /> : null}
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12">
              <button className="btn btn-primary w-100 btn-sm py-2" onClick={editingRoom ? updateRoom : addRoom}>
                <Save size={14} className="me-1" /> {editingRoom ? 'Update Room Type' : 'Save Room Type'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showRoomForm && (
        <button className="btn btn-outline-primary w-100 border-dashed py-3" onClick={() => setShowRoomForm(true)}>
          <Plus size={18} className="me-1" /> Add Room Configuration
        </button>
      )}
    </div>
  );
};

export default StepRoomTypes;