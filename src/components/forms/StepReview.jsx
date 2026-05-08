import React from 'react';
import { 
  CheckCircle, MapPin, DollarSign, Home, Users, Wifi, 
  Building2, Phone, Mail, Image as ImageIcon, Navigation,
  ShieldCheck, Clock, Utensils, Zap
} from 'lucide-react';

const StepReview = ({ data }) => {
  const sections = [
    {
      title: "Property & Manager",
      icon: Building2,
      fields: [
        { label: "Property Name", value: data.pgName },
        { label: "Type", value: data.propertyType },
        { label: "Sub-category", value: data.propertySubCategory },
        { label: "Manager", value: data.managerName },
        { label: "Mobile", value: data.managerPhone },
        { label: "Email", value: data.managerEmail || "Not provided" },
        { label: "Posted By", value: data.postedBy === 'Other' ? `Other (${data.postedByName})` : data.postedBy }
      ]
    },
    {
      title: "Location Details",
      icon: MapPin,
      fields: [
        { label: "Area / Sector", value: data.area },
        { label: "Full Address", value: data.address },
        { label: "City", value: data.city },
        { label: "PIN Code", value: data.pinCode },
        { label: "Coordinates", value: (data.latitude && data.longitude) ? `${data.latitude}, ${data.longitude}` : null }
      ]
    },
    {
      title: "Capacity & Rules",
      icon: Users,
      fields: [
        { label: "Gender Allowed", value: data.genderAllowed },
        { label: "Total Beds", value: data.totalBeds },
        { label: "Total Rooms", value: data.totalRooms },
        { label: "Floor details", value: data.floorNumber ? `${data.floorNumber} floor of ${data.totalFloors || '?'} floors` : null },
        { 
          label: "Visiting Availability", 
          value: data.visitingHours?.availableDays?.length > 0 
            ? `${data.visitingHours.availableDays.join(', ')} (${data.visitingHours.startTime} - ${data.visitingHours.endTime})` 
            : "Not specified" 
        }
      ]
    },
    {
      title: "Financials & Terms",
      icon: DollarSign,
      fields: [
        { label: "Deposit Type", value: data.depositType },
        { label: "Deposit Amount", value: data.deposit },
        { label: "Payment Cycle", value: data.paymentCycle },
        { label: "Minimum Locking", value: data.minLocking ? `${data.minLocking} Months` : null },
        { label: "Maintenance", value: data.maintenance ? `₹${data.maintenance}` : "Included" },
        { label: "Electricity", value: data.electricityCharges },
        { label: "Food Option", value: data.foodOption }
      ]
    }
  ];

  return (
    <div className="step-review">
      <h5 className="mb-2 fw-semibold">Final Review</h5>
      <p className="text-muted small mb-4">Please verify all property details before submitting for admin review.</p>
      
      <div className="row g-3">
        {sections.map((section, idx) => ( section.fields.some(f => f.value) && (
          <div key={idx} className="col-md-6">
            <div className="review-card h-100 p-3 rounded-3 border bg-white shadow-sm">
              <h6 className="d-flex align-items-center gap-2 mb-3 text-primary border-bottom pb-2" style={{ fontSize: '14px' }}>
                <section.icon size={16} /> {section.title}
              </h6>
              <div className="review-fields">
                {section.fields.map((field, fIdx) => (
                  field.value && (
                    <div key={fIdx} className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">{field.label}</span>
                      <span className="fw-medium small text-end" style={{ maxWidth: '60%' }}>{field.value}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )))}
      </div>

      {/* Room Types Summary */}
      {data.roomTypes && data.roomTypes.length > 0 && (
        <div className="mt-4">
          <h6 className="d-flex align-items-center gap-2 mb-3 small fw-bold">
            <Home size={16} className="text-primary" /> Room Configurations ({data.roomTypes.length})
          </h6>
          <div className="table-responsive rounded border">
            <table className="table table-sm table-hover mb-0" style={{ fontSize: '12px' }}>
              <thead className="bg-light">
                <tr>
                  <th>Room Type</th>
                  <th>Rooms</th>
                  <th>Rent</th>
                  <th>Features</th>
                </tr>
              </thead>
              <tbody>
                {data.roomTypes.map((room, idx) => (
                  <tr key={idx}>
                    <td className="fw-medium">{room.name}</td>
                    <td>{room.numberOfRooms}</td>
                    <td className="text-primary fw-bold">₹{room.price}</td>
                    <td className="text-muted">
                      {[
                        room.attachedBathroom ? 'Bath' : null,
                        room.balcony ? 'Balcony' : null,
                        room.acType === 'AC' ? 'AC' : 'Non AC',
                        room.furnishingStatus
                      ].filter(Boolean).join(', ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Amenities & Nearby Summary */}
      <div className="row mt-4 g-3">
        {data.amenities && data.amenities.length > 0 && (
          <div className="col-md-6">
            <h6 className="d-flex align-items-center gap-2 mb-3 small fw-bold">
              <Wifi size={16} className="text-primary" /> Common Amenities
            </h6>
            <div className="d-flex flex-wrap gap-2 p-3 border rounded bg-light bg-opacity-25">
              {data.amenities.map((amenity, idx) => (
                <span key={idx} className="badge bg-white text-dark border shadow-xs" style={{ fontSize: '11px', fontWeight: '500' }}>
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.nearbyPlaces && data.nearbyPlaces.length > 0 && (
          <div className="col-md-6">
            <h6 className="d-flex align-items-center gap-2 mb-3 small fw-bold">
              <Navigation size={16} className="text-primary" /> Nearby Places
            </h6>
            <div className="border rounded p-2 bg-light bg-opacity-25">
              {data.nearbyPlaces.map((place, idx) => (
                <div key={idx} className="d-flex justify-content-between align-items-center p-1 border-bottom-dashed last-no-border">
                  <span className="small text-muted">{place.name}</span>
                  <span className="badge bg-info bg-opacity-10 text-info">{place.distance} km</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Media Summary */}
      {data.coverImage && (
        <div className="mt-4 pt-3 border-top">
          <h6 className="d-flex align-items-center gap-2 mb-3 small fw-bold">
            <ImageIcon size={16} className="text-primary" /> Photos Uploaded
          </h6>
          <div className="d-flex gap-3 align-items-end">
            <div className="position-relative">
              <img src={data.coverImage} alt="Main" className="rounded border" style={{ width: '120px', height: '80px', objectFit: 'cover' }} />
              <span className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-75 text-white x-small text-center py-1">Cover Photo</span>
            </div>
            {data.galleryImages && data.galleryImages.length > 0 && (
              <div className="p-3 border rounded bg-light d-flex align-items-center justify-content-center" style={{ width: '120px', height: '80px' }}>
                <div className="text-center">
                  <div className="fw-bold text-primary">{data.galleryImages.length}</div>
                  <div className="x-small text-muted">More Photos</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3">
        <div className="d-flex align-items-start gap-2">
          <ShieldCheck className="text-primary mt-1" size={20} />
          <div>
            <h6 className="mb-1 fw-bold text-primary" style={{ fontSize: '14px' }}>Ready to submit?</h6>
            <p className="mb-0 x-small text-muted">By clicking submit, you confirm that all information provided is accurate. Our team will verify the details and activate your listing within 24-48 hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepReview;